import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function loadAccount() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [
    { data: isAdmin, error },
    { data: adminRow, error: roleError },
    { data: membership, error: shopError },
  ] = await Promise.all([
    supabase.rpc("is_admin"),
    supabase
      .from("admins")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle<{ role: string }>(),
    supabase
      .from("shop_members")
      .select("shop_id, shops(name)")
      .eq("user_id", user.id)
      .maybeSingle<{ shop_id: string; shops: { name: string } | null }>(),
  ]);

  if (error) console.error("Admin check failed:", error);
  if (roleError) console.error("Admin role check failed:", roleError);
  if (shopError) console.error("Shop membership check failed:", shopError);

  const shop = membership
    ? { id: membership.shop_id, name: membership.shops?.name ?? "" }
    : null;

  return {
    supabase,
    user,
    // MotorMart team: can manage every shop's products.
    isAdmin: isAdmin === true,
    // Only the owner may create shops and accounts.
    isOwner: isAdmin === true && adminRow?.role === "owner",
    // A shop account: can only manage its own shop's products.
    shop,
    hasAccess: isAdmin === true || shop !== null,
  };
}

// The signed-in account, or null when nobody is signed in.
export async function getAccount() {
  return loadAccount();
}

// Checks the signed-in account on the server. Use it in every admin page and
// Server Action; never trust the browser to say who someone is.
export async function requireAccount(loginPath = "/admin/login") {
  const account = await loadAccount();
  if (!account) {
    redirect(loginPath);
  }
  return account;
}

// For /shop pages: the signed-in shop account. MotorMart admins without a
// shop are sent to /admin; anyone else gets `shop: null` (no access).
export async function requireShopAccount() {
  const account = await requireAccount("/shop/login");
  if (!account.shop && account.isAdmin) {
    redirect("/admin");
  }
  return account;
}

// For /admin pages: shop accounts belong in /shop.
export async function requireAdminAccount() {
  const account = await requireAccount();
  if (account.shop && !account.isAdmin) {
    redirect("/shop");
  }
  return account;
}

type AccountSupabase = Awaited<ReturnType<typeof requireAccount>>["supabase"];

// Existing categories, offered as suggestions in the product form.
export async function getCategories(supabase: AccountSupabase) {
  const { data } = await supabase
    .from("products")
    .select("category")
    .not("category", "is", null);

  return [
    ...new Set((data ?? []).map((row) => row.category as string)),
  ].sort();
}

// Shops an admin can assign products to.
export async function getShops(supabase: AccountSupabase) {
  const { data } = await supabase
    .from("shops")
    .select("id, name, is_active")
    .order("name");

  return (data ?? []) as { id: string; name: string; is_active: boolean }[];
}
