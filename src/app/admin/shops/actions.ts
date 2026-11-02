"use server";

import { refresh } from "next/cache";
import { createLoginAccount } from "@/lib/accounts";
import { requireAccount } from "@/lib/admin";
import { UUID_PATTERN } from "@/lib/products";
import type { ActionState } from "@/lib/types";

const PHONE_PATTERN = /^[0-9+\-\s()]{6,30}$/;

export async function createShop(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, isOwner } = await requireAccount();
  if (!isOwner) {
    return { error: "Only the owner can add shops." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();

  if (!name || name.length > 100) {
    return { error: "Enter the shop name (up to 100 characters)." };
  }
  if (phone && !PHONE_PATTERN.test(phone)) {
    return { error: "Enter a valid phone number." };
  }
  if (city.length > 60) {
    return { error: "City can be up to 60 characters." };
  }

  const { error } = await supabase
    .from("shops")
    .insert({ name, phone: phone || null, city: city || null });
  if (error) {
    console.error("Failed to create shop:", error);
    return { error: "Couldn't add the shop. Please try again." };
  }

  refresh();
  return { success: `${name} added.` };
}

// Hiding a shop hides all its products from the public shop.
export async function setShopActive(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, isOwner } = await requireAccount();
  if (!isOwner) {
    return { error: "Only the owner can change shops." };
  }

  const shopId = String(formData.get("shop_id") ?? "");
  const isActive = formData.get("is_active") === "true";
  if (!UUID_PATTERN.test(shopId)) {
    return { error: "Unknown shop." };
  }

  const { data, error } = await supabase
    .from("shops")
    .update({ is_active: isActive })
    .eq("id", shopId)
    .select("id");
  if (error || !data?.length) {
    console.error("Failed to change shop status:", error);
    return { error: "Couldn't change the shop. Please try again." };
  }

  refresh();
  return {};
}

// Creates a login that can only manage the given shop's products.
export async function createShopAccount(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, isOwner } = await requireAccount();
  if (!isOwner) {
    return { error: "Only the owner can create shop accounts." };
  }

  const shopId = String(formData.get("shop_id") ?? "");
  const { data: shop } = UUID_PATTERN.test(shopId)
    ? await supabase.from("shops").select("id").eq("id", shopId).maybeSingle()
    : { data: null };
  if (!shop) {
    return { error: "Unknown shop." };
  }

  const result = await createLoginAccount(formData, (adminClient, userId) =>
    adminClient.from("shop_members").insert({ user_id: userId, shop_id: shopId })
  );
  if (result.error) {
    return { error: result.error };
  }

  refresh();
  return { success: `Account created for ${result.email}.` };
}
