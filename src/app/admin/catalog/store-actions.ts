"use server";

// Add, edit and delete stores (where a product comes from). Admin only.
// Products point to a store by id, so renaming needs no product updates;
// a delete is refused while products still use the store.

import { refresh } from "next/cache";
import { getAdmin } from "@/lib/admin";
import { UUID_PATTERN } from "@/lib/products";
import type { ActionState } from "@/lib/types";

function readStore(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();
  if (!name || name.length > 100) {
    return { error: "Enter the store name (up to 100 characters)." };
  }
  if (details.length > 200) {
    return { error: "Phone / location can be up to 200 characters." };
  }
  return { name, details: details || null };
}

const DUPLICATE = "A store with that name already exists.";

export async function createStore(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, isAdmin } = await getAdmin();
  if (!isAdmin) return { error: "You don't have admin access." };

  const store = readStore(formData);
  if ("error" in store) return { error: store.error };

  const { error } = await supabase.from("stores").insert(store);
  if (error) {
    console.error("Failed to add store:", error);
    return {
      error: error.code === "23505" ? DUPLICATE : "Couldn't add it. Please try again.",
    };
  }

  refresh();
  return { success: `${store.name} added.` };
}

export async function updateStore(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, isAdmin } = await getAdmin();
  if (!isAdmin) return { error: "You don't have admin access." };

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) return { error: "Unknown store." };

  const store = readStore(formData);
  if ("error" in store) return { error: store.error };

  const { data, error } = await supabase
    .from("stores")
    .update(store)
    .eq("id", id)
    .select("id");
  if (error || !data?.length) {
    console.error("Failed to update store:", error);
    return {
      error: error?.code === "23505" ? DUPLICATE : "Couldn't save. Please try again.",
    };
  }

  refresh();
  return { success: "Saved" };
}

export async function deleteStore(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, isAdmin } = await getAdmin();
  if (!isAdmin) return { error: "You don't have admin access." };

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) return { error: "Unknown store." };

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("store_id", id);
  if (count) {
    return {
      error: `${count} product(s) still come from this store. Change or delete them first.`,
    };
  }

  const { error } = await supabase.from("stores").delete().eq("id", id);
  if (error) {
    console.error("Failed to delete store:", error);
    return { error: "Couldn't delete. Please try again." };
  }

  refresh();
  return {};
}
