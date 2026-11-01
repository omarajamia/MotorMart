"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccount } from "@/lib/admin";
import {
  getImageFile,
  removeProductImage,
  uploadProductImage,
  validateImage,
} from "@/lib/product-images";
import { parseProductForm, UUID_PATTERN } from "@/lib/products";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { ActionState } from "@/lib/types";

export async function login(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "Wrong email or password." };
  }

  // Only MotorMart admins and shop accounts may stay signed in.
  const [{ data: isAdmin, error: adminError }, { data: shopId, error: shopError }] =
    await Promise.all([supabase.rpc("is_admin"), supabase.rpc("my_shop_id")]);
  if (adminError) console.error("Admin check failed:", adminError);
  if (shopError) console.error("Shop membership check failed:", shopError);

  if (isAdmin !== true && !shopId) {
    await supabase.auth.signOut();
    return { error: "This account doesn't have access." };
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function updatePriceAndStock(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, hasAccess } = await requireAccount();
  if (!hasAccess) {
    return { error: "You don't have access." };
  }

  const id = String(formData.get("id") ?? "");
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock_quantity"));

  if (!UUID_PATTERN.test(id)) {
    return { error: "Unknown product." };
  }
  if (!Number.isFinite(price) || price < 0 || price > 1_000_000) {
    return { error: "Price must be a number of 0 or more." };
  }
  if (!Number.isInteger(stock) || stock < 0 || stock > 1_000_000) {
    return { error: "Stock must be a whole number of 0 or more." };
  }

  const { data, error } = await supabase
    .from("products")
    .update({ price: Math.round(price * 100) / 100, stock_quantity: stock })
    .eq("id", id)
    .select("id");

  if (error || !data?.length) {
    console.error("Failed to update product:", error);
    return { error: "Couldn't save. Please try again." };
  }

  refresh();
  return { success: "Saved" };
}

export async function setProductActive(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, hasAccess } = await requireAccount();
  if (!hasAccess) {
    return { error: "You don't have access." };
  }

  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("is_active") === "true";

  if (!UUID_PATTERN.test(id)) {
    return { error: "Unknown product." };
  }

  const { data, error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", id)
    .select("id");

  if (error || !data?.length) {
    console.error("Failed to change product visibility:", error);
    return { error: "Couldn't change visibility. Please try again." };
  }

  refresh();
  return {};
}

function saveErrorMessage(error: { code?: string } | null) {
  return error?.code === "23505"
    ? "This shop already has a product with this part number."
    : "Couldn't save. Please try again.";
}

type Account = Awaited<ReturnType<typeof requireAccount>>;

// Which shop a product belongs to. Shop accounts always use their own shop;
// MotorMart admins pick one in the form.
async function resolveShopId(account: Account, formData: FormData) {
  if (account.shop) {
    return account.shop.id;
  }

  const shopId = String(formData.get("shop_id") ?? "");
  if (!UUID_PATTERN.test(shopId)) {
    return null;
  }
  const { data } = await account.supabase
    .from("shops")
    .select("id")
    .eq("id", shopId)
    .maybeSingle();
  return data ? shopId : null;
}

export async function createProduct(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const account = await requireAccount();
  const { supabase } = account;
  if (!account.hasAccess) {
    return { error: "You don't have access." };
  }

  const parsed = parseProductForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const shopId = await resolveShopId(account, formData);
  if (!shopId) {
    return { error: "Choose a shop." };
  }

  const image = getImageFile(formData);
  const imageError = image && validateImage(image);
  if (imageError) {
    return { error: imageError };
  }

  const imageUrl = image
    ? await uploadProductImage(supabase, shopId, image)
    : null;
  if (image && !imageUrl) {
    return { error: "Couldn't upload the image. Please try again." };
  }

  const { error } = await supabase
    .from("products")
    .insert({ ...parsed.data, shop_id: shopId, image_url: imageUrl });
  if (error) {
    console.error("Failed to create product:", error);
    await removeProductImage(supabase, imageUrl);
    return { error: saveErrorMessage(error) };
  }

  redirect("/admin");
}

export async function updateProduct(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const account = await requireAccount();
  const { supabase } = account;
  if (!account.hasAccess) {
    return { error: "You don't have access." };
  }

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) {
    return { error: "Unknown product." };
  }

  const parsed = parseProductForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const shopId = await resolveShopId(account, formData);
  if (!shopId) {
    return { error: "Choose a shop." };
  }

  const image = getImageFile(formData);
  const imageError = image && validateImage(image);
  if (imageError) {
    return { error: imageError };
  }

  const { data: current } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .maybeSingle<{ image_url: string | null }>();
  if (!current) {
    return { error: "This product no longer exists." };
  }

  // A new photo replaces the old one; "remove image" clears it; otherwise
  // the current photo is kept.
  let imageUrl = current.image_url;
  if (image) {
    imageUrl = await uploadProductImage(supabase, shopId, image);
    if (!imageUrl) {
      return { error: "Couldn't upload the image. Please try again." };
    }
  } else if (formData.get("remove_image") === "on") {
    imageUrl = null;
  }

  const { data, error } = await supabase
    .from("products")
    .update({ ...parsed.data, shop_id: shopId, image_url: imageUrl })
    .eq("id", id)
    .select("id");

  if (error || !data?.length) {
    console.error("Failed to update product:", error);
    if (image) {
      await removeProductImage(supabase, imageUrl);
    }
    return { error: saveErrorMessage(error) };
  }

  if (imageUrl !== current.image_url) {
    await removeProductImage(supabase, current.image_url);
  }

  redirect("/admin");
}

export async function deleteProduct(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, hasAccess } = await requireAccount();
  if (!hasAccess) {
    return { error: "You don't have access." };
  }

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) {
    return { error: "Unknown product." };
  }

  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select("id, image_url");

  if (error || !data?.length) {
    console.error("Failed to delete product:", error);
    return { error: "Couldn't delete. Please try again." };
  }

  await removeProductImage(supabase, data[0].image_url);

  redirect("/admin");
}
