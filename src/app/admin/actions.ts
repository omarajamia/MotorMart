"use server";

// Sign-in and product actions shared by the admin area (/admin, English) and
// the shop area (/shop, Arabic or English).

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getAccount, requireAccount } from "@/lib/admin";
import { messages } from "@/lib/i18n";
import { getShopLang } from "@/lib/i18n-server";
import {
  getImageFile,
  removeProductImage,
  uploadProductImage,
  validateImage,
} from "@/lib/product-images";
import { parseProductForm, UUID_PATTERN } from "@/lib/products";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { ActionState } from "@/lib/types";

type Account = Awaited<ReturnType<typeof requireAccount>>;

// Shop accounts get messages in their chosen language; admins get English.
async function errorsFor(account: Account | null) {
  return account?.shop
    ? messages[await getShopLang()].errors
    : messages.en.errors;
}

// Where an account's product list lives.
function homeFor(account: Account) {
  return account.shop ? "/shop" : "/admin";
}

async function signIn(formData: FormData, area: "admin" | "shop") {
  const errors =
    area === "shop" ? messages[await getShopLang()].errors : messages.en.errors;
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: errors.enterEmailPassword };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: errors.wrongLogin };
  }

  const [{ data: isAdmin, error: adminError }, { data: shopId, error: shopError }] =
    await Promise.all([supabase.rpc("is_admin"), supabase.rpc("my_shop_id")]);
  if (adminError) console.error("Admin check failed:", adminError);
  if (shopError) console.error("Shop membership check failed:", shopError);

  // Shop accounts use the shop login; MotorMart admins use the admin login.
  if (area === "shop" && !shopId) {
    await supabase.auth.signOut();
    return { error: isAdmin === true ? errors.noAccess : errors.notAShop };
  }
  if (area === "admin" && isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: shopId ? errors.useShopLogin : errors.noAccess };
  }

  return null;
}

export async function adminLogin(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const failure = await signIn(formData, "admin");
  if (failure) return failure;
  redirect("/admin");
}

export async function shopLogin(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const failure = await signIn(formData, "shop");
  if (failure) return failure;
  redirect("/shop");
}

export async function logout() {
  const account = await getAccount();
  const loginPage = account?.shop ? "/shop/login" : "/admin/login";
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(loginPage);
}

export async function updatePriceAndStock(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const account = await requireAccount();
  const errors = await errorsFor(account);
  if (!account.hasAccess) {
    return { error: errors.noAccess };
  }

  const id = String(formData.get("id") ?? "");
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock_quantity"));

  if (!UUID_PATTERN.test(id)) {
    return { error: errors.unknownProduct };
  }
  if (!Number.isFinite(price) || price < 0 || price > 1_000_000) {
    return { error: errors.price };
  }
  if (!Number.isInteger(stock) || stock < 0 || stock > 1_000_000) {
    return { error: errors.stock };
  }

  const { data, error } = await account.supabase
    .from("products")
    .update({ price: Math.round(price * 100) / 100, stock_quantity: stock })
    .eq("id", id)
    .select("id");

  if (error || !data?.length) {
    console.error("Failed to update product:", error);
    return { error: errors.saveFailed };
  }

  refresh();
  return {
    success: account.shop
      ? messages[await getShopLang()].saved
      : messages.en.saved,
  };
}

export async function setProductActive(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const account = await requireAccount();
  const errors = await errorsFor(account);
  if (!account.hasAccess) {
    return { error: errors.noAccess };
  }

  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("is_active") === "true";

  if (!UUID_PATTERN.test(id)) {
    return { error: errors.unknownProduct };
  }

  const { data, error } = await account.supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", id)
    .select("id");

  if (error || !data?.length) {
    console.error("Failed to change product visibility:", error);
    return { error: errors.visibilityFailed };
  }

  refresh();
  return {};
}

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
  const errors = await errorsFor(account);
  if (!account.hasAccess) {
    return { error: errors.noAccess };
  }

  const parsed = parseProductForm(formData, errors);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const shopId = await resolveShopId(account, formData);
  if (!shopId) {
    return { error: errors.chooseShop };
  }

  const image = getImageFile(formData);
  const imageError = image && validateImage(image, errors);
  if (imageError) {
    return { error: imageError };
  }

  const imageUrl = image
    ? await uploadProductImage(supabase, shopId, image)
    : null;
  if (image && !imageUrl) {
    return { error: errors.uploadFailed };
  }

  const { error } = await supabase
    .from("products")
    .insert({ ...parsed.data, shop_id: shopId, image_url: imageUrl });
  if (error) {
    console.error("Failed to create product:", error);
    await removeProductImage(supabase, imageUrl);
    return {
      error: error.code === "23505" ? errors.duplicatePart : errors.saveFailed,
    };
  }

  redirect(homeFor(account));
}

export async function updateProduct(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const account = await requireAccount();
  const { supabase } = account;
  const errors = await errorsFor(account);
  if (!account.hasAccess) {
    return { error: errors.noAccess };
  }

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) {
    return { error: errors.unknownProduct };
  }

  const parsed = parseProductForm(formData, errors);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const shopId = await resolveShopId(account, formData);
  if (!shopId) {
    return { error: errors.chooseShop };
  }

  const image = getImageFile(formData);
  const imageError = image && validateImage(image, errors);
  if (imageError) {
    return { error: imageError };
  }

  const { data: current } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .maybeSingle<{ image_url: string | null }>();
  if (!current) {
    return { error: errors.productGone };
  }

  // A new photo replaces the old one; "remove image" clears it; otherwise
  // the current photo is kept.
  let imageUrl = current.image_url;
  if (image) {
    imageUrl = await uploadProductImage(supabase, shopId, image);
    if (!imageUrl) {
      return { error: errors.uploadFailed };
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
    return {
      error: error?.code === "23505" ? errors.duplicatePart : errors.saveFailed,
    };
  }

  if (imageUrl !== current.image_url) {
    await removeProductImage(supabase, current.image_url);
  }

  redirect(homeFor(account));
}

export async function deleteProduct(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const account = await requireAccount();
  const errors = await errorsFor(account);
  if (!account.hasAccess) {
    return { error: errors.noAccess };
  }

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) {
    return { error: errors.unknownProduct };
  }

  const { data, error } = await account.supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select("id, image_url");

  if (error || !data?.length) {
    console.error("Failed to delete product:", error);
    return { error: errors.deleteFailed };
  }

  await removeProductImage(account.supabase, data[0].image_url);

  redirect(homeFor(account));
}
