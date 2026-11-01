"use server";

import { refresh } from "next/cache";
import { createLoginAccount } from "@/lib/accounts";
import { requireAccount } from "@/lib/admin";
import { UUID_PATTERN } from "@/lib/products";
import type { ActionState } from "@/lib/types";

const PHONE_PATTERN = /^[0-9+\-\s()]{6,30}$/;

// Creates a shop together with its owner's login in one step. The shop owner
// then signs in at /shop/login with that email and password. If anything
// fails, neither the shop nor the login is kept.
export async function createShopWithAccount(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { isOwner } = await requireAccount();
  if (!isOwner) {
    return { error: "Only the owner can add shops." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const ownerName = String(formData.get("owner_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  // Put the typed details back into the form if something goes wrong.
  const fail = (error: string): ActionState => ({
    error,
    values: { name, owner_name: ownerName, phone, city, email },
  });

  if (!name || name.length > 100) {
    return fail("Enter the shop name (up to 100 characters).");
  }
  if (!ownerName || ownerName.length > 100) {
    return fail("Enter the shop owner's name (up to 100 characters).");
  }
  if (!PHONE_PATTERN.test(phone)) {
    return fail("Enter a valid phone number.");
  }
  if (city.length > 60) {
    return fail("City can be up to 60 characters.");
  }

  const result = await createLoginAccount(
    formData,
    async (adminClient, userId) => {
      const { data: shop, error: shopError } = await adminClient
        .from("shops")
        .insert({ name, owner_name: ownerName, phone, city: city || null })
        .select("id")
        .single();
      if (shopError || !shop) {
        return { error: shopError ?? "no shop returned" };
      }

      const { error: memberError } = await adminClient
        .from("shop_members")
        .insert({ user_id: userId, shop_id: shop.id });
      if (memberError) {
        await adminClient.from("shops").delete().eq("id", shop.id);
        return { error: memberError };
      }
      return { error: null };
    }
  );
  if (result.error) {
    return fail(result.error);
  }

  refresh();
  return {
    success: `${name} created. ${ownerName} can now sign in at /shop/login with ${result.email}.`,
  };
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
