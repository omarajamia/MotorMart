"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import {
  getExtraImageFiles,
  getImageFile,
  MAX_EXTRA_IMAGES,
  removeProductImage,
  removeProductImages,
  uploadProductImage,
  uploadProductImages,
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

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || isAdmin !== true) {
    if (adminError) {
      console.error("Admin check failed:", adminError);
    }
    await supabase.auth.signOut();
    return { error: "This account doesn't have admin access." };
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
  const { supabase, isAdmin } = await getAdmin();
  if (!isAdmin) {
    return { error: "You don't have admin access." };
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
  const { supabase, isAdmin } = await getAdmin();
  if (!isAdmin) {
    return { error: "You don't have admin access." };
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

type AdminSupabase = Awaited<ReturnType<typeof getAdmin>>["supabase"];

// The store, brand, car model and category must be ones from the Catalog.
async function checkCatalog(
  supabase: AdminSupabase,
  product: {
    store_id: string;
    brand: string;
    car_model: string;
    category: string | null;
    origin: string | null;
  }
) {
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("id", product.store_id)
    .maybeSingle();
  if (!store) {
    return "Choose a store from the list.";
  }

  const { data: brand } = await supabase
    .from("brands")
    .select("id")
    .eq("name", product.brand)
    .maybeSingle<{ id: string }>();
  if (!brand) {
    return "Choose a brand from the list.";
  }

  const { data: model } = await supabase
    .from("car_models")
    .select("id")
    .eq("brand_id", brand.id)
    .eq("name", product.car_model)
    .maybeSingle();
  if (!model) {
    return "Choose a car model from the list for this brand.";
  }

  if (product.category) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("name", product.category)
      .maybeSingle();
    if (!category) {
      return "Choose a category from the list.";
    }
  }

  if (product.origin) {
    const { data: origin } = await supabase
      .from("origins")
      .select("id")
      .eq("name", product.origin)
      .maybeSingle();
    if (!origin) {
      return "Choose an origin from the list.";
    }
  }

  return null;
}

function saveErrorMessage(error: { code?: string } | null) {
  return error?.code === "23505"
    ? "A product with this part number already exists."
    : "Couldn't save. Please try again.";
}

// Checks the main photo and any extra photos in the form. Returns an error
// message, or the files to upload.
function readPhotos(formData: FormData, keptExtraCount = 0) {
  const image = getImageFile(formData);
  const extras = getExtraImageFiles(formData);

  for (const file of [image, ...extras]) {
    const error = file && validateImage(file);
    if (error) return { error };
  }
  if (keptExtraCount + extras.length > MAX_EXTRA_IMAGES) {
    return {
      error: `A product can have up to ${MAX_EXTRA_IMAGES} extra photos.`,
    };
  }
  return { image, extras };
}

// The optional "Cost price" field: what the product costs us (admins only).
function readCostPrice(formData: FormData) {
  const text = String(formData.get("cost_price") ?? "").trim();
  if (!text) return { value: null };
  const value = Number(text);
  if (!Number.isFinite(value) || value < 0 || value > 1_000_000) {
    return { error: "Cost price must be a number of 0 or more." };
  }
  return { value: Math.round(value * 100) / 100 };
}

// Costs live in their own admin-only table. An empty cost removes it.
async function saveCostPrice(
  supabase: AdminSupabase,
  productId: string,
  cost: number | null
) {
  const { error } =
    cost === null
      ? await supabase.from("product_costs").delete().eq("product_id", productId)
      : await supabase.from("product_costs").upsert({
          product_id: productId,
          cost_price: cost,
          updated_at: new Date().toISOString(),
        });
  if (error) {
    console.error("Failed to save cost price:", error);
    return false;
  }
  return true;
}

export async function createProduct(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, isAdmin } = await getAdmin();
  if (!isAdmin) {
    return { error: "You don't have admin access." };
  }

  const parsed = parseProductForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const catalogError = await checkCatalog(supabase, parsed.data);
  if (catalogError) {
    return { error: catalogError };
  }

  const cost = readCostPrice(formData);
  if ("error" in cost) {
    return { error: cost.error };
  }

  const photos = readPhotos(formData);
  if ("error" in photos) {
    return { error: photos.error };
  }

  const imageUrl = photos.image
    ? await uploadProductImage(supabase, photos.image)
    : null;
  if (photos.image && !imageUrl) {
    return { error: "Couldn't upload the image. Please try again." };
  }
  const extraUrls = await uploadProductImages(supabase, photos.extras);
  if (!extraUrls) {
    await removeProductImage(supabase, imageUrl);
    return { error: "Couldn't upload the photos. Please try again." };
  }

  const { data: created, error } = await supabase
    .from("products")
    .insert({
      ...parsed.data,
      image_url: imageUrl,
      extra_image_urls: extraUrls,
    })
    .select("id")
    .single<{ id: string }>();
  if (error || !created) {
    console.error("Failed to create product:", error);
    await removeProductImages(supabase, [imageUrl, ...extraUrls]);
    return { error: saveErrorMessage(error) };
  }

  if (!(await saveCostPrice(supabase, created.id, cost.value))) {
    return {
      error:
        "The product was saved, but its cost price wasn't. Open it from the Products list to add the cost again.",
    };
  }

  redirect("/admin");
}

export async function updateProduct(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, isAdmin } = await getAdmin();
  if (!isAdmin) {
    return { error: "You don't have admin access." };
  }

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) {
    return { error: "Unknown product." };
  }

  const parsed = parseProductForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const catalogError = await checkCatalog(supabase, parsed.data);
  if (catalogError) {
    return { error: catalogError };
  }

  const cost = readCostPrice(formData);
  if ("error" in cost) {
    return { error: cost.error };
  }

  const { data: current } = await supabase
    .from("products")
    .select("image_url, extra_image_urls")
    .eq("id", id)
    .maybeSingle<{ image_url: string | null; extra_image_urls: string[] }>();
  if (!current) {
    return { error: "This product no longer exists." };
  }

  // Extra photos ticked for removal; only ones the product really has.
  const removing = new Set(
    formData
      .getAll("remove_extra")
      .map(String)
      .filter((url) => current.extra_image_urls.includes(url))
  );
  const keptExtras = current.extra_image_urls.filter((url) => !removing.has(url));

  const photos = readPhotos(formData, keptExtras.length);
  if ("error" in photos) {
    return { error: photos.error };
  }

  // A new main photo replaces the old one; "remove image" clears it;
  // otherwise the current main photo is kept.
  let imageUrl = current.image_url;
  if (photos.image) {
    imageUrl = await uploadProductImage(supabase, photos.image);
    if (!imageUrl) {
      return { error: "Couldn't upload the image. Please try again." };
    }
  } else if (formData.get("remove_image") === "on") {
    imageUrl = null;
  }
  const newImage = photos.image ? imageUrl : null;

  const newExtras = await uploadProductImages(supabase, photos.extras);
  if (!newExtras) {
    await removeProductImage(supabase, newImage);
    return { error: "Couldn't upload the photos. Please try again." };
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      ...parsed.data,
      image_url: imageUrl,
      extra_image_urls: [...keptExtras, ...newExtras],
    })
    .eq("id", id)
    .select("id");

  if (error || !data?.length) {
    console.error("Failed to update product:", error);
    await removeProductImages(supabase, [newImage, ...newExtras]);
    return { error: saveErrorMessage(error) };
  }

  // Saved: delete the photos that were replaced or removed.
  const removed: (string | null)[] = [...removing];
  if (imageUrl !== current.image_url) removed.push(current.image_url);
  await removeProductImages(supabase, removed);

  if (!(await saveCostPrice(supabase, id, cost.value))) {
    return {
      error: "The product was saved, but its cost price wasn't. Please try again.",
    };
  }

  redirect("/admin");
}

export async function deleteProduct(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, isAdmin } = await getAdmin();
  if (!isAdmin) {
    return { error: "You don't have admin access." };
  }

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) {
    return { error: "Unknown product." };
  }

  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select("id, image_url, extra_image_urls");

  if (error || !data?.length) {
    console.error("Failed to delete product:", error);
    return { error: "Couldn't delete. Please try again." };
  }

  await removeProductImages(supabase, [
    data[0].image_url,
    ...(data[0].extra_image_urls ?? []),
  ]);

  redirect("/admin");
}

// "Add another origin of this part": copies the product's details into a new
// product of the same group, without photos, origin, stock or cost, hidden
// from the shop until it's filled in, then opens it for editing.
export async function addProductOrigin(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, isAdmin } = await getAdmin();
  if (!isAdmin) {
    return { error: "You don't have admin access." };
  }

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) {
    return { error: "Unknown product." };
  }

  const { data: product } = await supabase
    .from("products")
    .select(
      "name, name_ar, part_number, alt_part_numbers, brand, car_model, year_from, year_to, category, description, description_ar, price, store_id, variant_group"
    )
    .eq("id", id)
    .maybeSingle<Record<string, unknown> & { variant_group: string | null }>();
  if (!product) {
    return { error: "This product no longer exists." };
  }

  // The first copy starts the group, named after the original product.
  const group = product.variant_group ?? id;
  if (!product.variant_group) {
    const { error } = await supabase
      .from("products")
      .update({ variant_group: group })
      .eq("id", id);
    if (error) {
      console.error("Failed to start origin group:", error);
      return { error: "Couldn't add another origin. Please try again." };
    }
  }

  const { data: copy, error } = await supabase
    .from("products")
    .insert({
      ...product,
      variant_group: group,
      origin: null,
      stock_quantity: 0,
      image_url: null,
      extra_image_urls: [],
      is_active: false,
    })
    .select("id")
    .single<{ id: string }>();
  if (error || !copy) {
    console.error("Failed to copy product for another origin:", error);
    return { error: "Couldn't add another origin. Please try again." };
  }

  redirect(`/admin/products/${copy.id}/edit`);
}
