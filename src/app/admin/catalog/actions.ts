"use server";

// Add, rename and delete brands, car models and categories. Products store
// these names as text, so a rename also updates every product that uses the
// old name, and a delete is refused while products still use it.

import { refresh } from "next/cache";
import { getAdmin } from "@/lib/admin";
import { UUID_PATTERN } from "@/lib/products";
import type { ActionState } from "@/lib/types";

type Kind = "brand" | "model" | "category";

const TABLES: Record<Kind, string> = {
  brand: "brands",
  model: "car_models",
  category: "categories",
};
const MAX_LENGTH: Record<Kind, number> = { brand: 60, model: 100, category: 100 };
const LABEL: Record<Kind, string> = {
  brand: "brand",
  model: "car model",
  category: "category",
};

function readKind(formData: FormData): Kind | null {
  const kind = String(formData.get("kind") ?? "");
  return kind === "brand" || kind === "model" || kind === "category"
    ? kind
    : null;
}

function readNames(formData: FormData, kind: Kind) {
  const name = String(formData.get("name") ?? "").trim();
  const nameAr = String(formData.get("name_ar") ?? "").trim();
  const max = MAX_LENGTH[kind];
  if (!name || name.length > max) {
    return { error: `Enter the ${LABEL[kind]} name (up to ${max} characters).` };
  }
  if (nameAr.length > max) {
    return { error: `The Arabic name can be up to ${max} characters.` };
  }
  return { name, nameAr: nameAr || null };
}

function duplicateMessage(kind: Kind) {
  return kind === "model"
    ? "This brand already has a model with that name."
    : `A ${LABEL[kind]} with that name already exists.`;
}

export async function createCatalogItem(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, isAdmin } = await getAdmin();
  if (!isAdmin) return { error: "You don't have admin access." };

  const kind = readKind(formData);
  if (!kind) return { error: "Unknown list." };

  const names = readNames(formData, kind);
  if ("error" in names) return { error: names.error };

  const row: Record<string, string | null> = {
    name: names.name,
    name_ar: names.nameAr,
  };
  if (kind === "model") {
    const brandId = String(formData.get("brand_id") ?? "");
    if (!UUID_PATTERN.test(brandId)) return { error: "Choose a brand." };
    row.brand_id = brandId;
  }

  const { error } = await supabase.from(TABLES[kind]).insert(row);
  if (error) {
    console.error(`Failed to add ${kind}:`, error);
    return {
      error:
        error.code === "23505"
          ? duplicateMessage(kind)
          : "Couldn't add it. Please try again.",
    };
  }

  refresh();
  return { success: `${names.name} added.` };
}

export async function updateCatalogItem(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, isAdmin } = await getAdmin();
  if (!isAdmin) return { error: "You don't have admin access." };

  const kind = readKind(formData);
  const id = String(formData.get("id") ?? "");
  if (!kind || !UUID_PATTERN.test(id)) return { error: "Unknown item." };

  const names = readNames(formData, kind);
  if ("error" in names) return { error: names.error };

  const { data: current } = await supabase
    .from(TABLES[kind])
    .select(kind === "model" ? "name, brands(name)" : "name")
    .eq("id", id)
    .maybeSingle<{ name: string; brands?: { name: string } | null }>();
  if (!current) return { error: "This item no longer exists." };

  const { error } = await supabase
    .from(TABLES[kind])
    .update({ name: names.name, name_ar: names.nameAr })
    .eq("id", id);
  if (error) {
    console.error(`Failed to update ${kind}:`, error);
    return {
      error:
        error.code === "23505"
          ? duplicateMessage(kind)
          : "Couldn't save. Please try again.",
    };
  }

  // Keep the products that use the old name in step.
  if (names.name !== current.name) {
    let products = supabase.from("products").update(
      kind === "brand"
        ? { brand: names.name }
        : kind === "model"
          ? { car_model: names.name }
          : { category: names.name }
    );
    if (kind === "brand") products = products.eq("brand", current.name);
    if (kind === "category") products = products.eq("category", current.name);
    if (kind === "model") {
      products = products
        .eq("car_model", current.name)
        .eq("brand", current.brands?.name ?? "");
    }

    const { error: productsError } = await products;
    if (productsError) {
      console.error(`Failed to rename ${kind} on products:`, productsError);
      // Put the old name back so the list and the products still match.
      await supabase
        .from(TABLES[kind])
        .update({ name: current.name })
        .eq("id", id);
      return { error: "Couldn't update the products. Please try again." };
    }
  }

  refresh();
  return { success: "Saved" };
}

export async function deleteCatalogItem(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, isAdmin } = await getAdmin();
  if (!isAdmin) return { error: "You don't have admin access." };

  const kind = readKind(formData);
  const id = String(formData.get("id") ?? "");
  if (!kind || !UUID_PATTERN.test(id)) return { error: "Unknown item." };

  const { data: current } = await supabase
    .from(TABLES[kind])
    .select(kind === "model" ? "name, brands(name)" : "name")
    .eq("id", id)
    .maybeSingle<{ name: string; brands?: { name: string } | null }>();
  if (!current) return { error: "This item no longer exists." };

  // Refuse while products (or, for a brand, car models) still use it.
  let usage = supabase
    .from("products")
    .select("id", { count: "exact", head: true });
  if (kind === "brand") usage = usage.eq("brand", current.name);
  if (kind === "category") usage = usage.eq("category", current.name);
  if (kind === "model") {
    usage = usage
      .eq("car_model", current.name)
      .eq("brand", current.brands?.name ?? "");
  }
  const { count } = await usage;
  if (count) {
    return {
      error: `${count} product(s) still use ${current.name}. Change or delete them first.`,
    };
  }
  if (kind === "brand") {
    const { count: models } = await supabase
      .from("car_models")
      .select("id", { count: "exact", head: true })
      .eq("brand_id", id);
    if (models) {
      return {
        error: `${current.name} still has ${models} car model(s). Delete them first.`,
      };
    }
  }

  const { error } = await supabase.from(TABLES[kind]).delete().eq("id", id);
  if (error) {
    console.error(`Failed to delete ${kind}:`, error);
    return { error: "Couldn't delete. Please try again." };
  }

  refresh();
  return {};
}
