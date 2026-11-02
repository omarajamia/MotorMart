import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// Checks the signed-in user on the server. Use it in every admin page and
// Server Action; never trust the browser to say who is an admin.
export async function getAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [{ data: isAdmin, error }, { data: adminRow, error: roleError }] =
    await Promise.all([
      supabase.rpc("is_admin"),
      supabase
        .from("admins")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle<{ role: string }>(),
    ]);

  if (error) {
    console.error("Admin check failed:", error);
  }
  if (roleError) {
    console.error("Admin role check failed:", roleError);
  }

  return {
    supabase,
    user,
    isAdmin: isAdmin === true,
    // Only the owner may create staff accounts.
    isOwner: isAdmin === true && adminRow?.role === "owner",
  };
}

type AdminSupabase = Awaited<ReturnType<typeof getAdmin>>["supabase"];

// Existing categories, offered as suggestions in the product form.
export async function getCategories(supabase: AdminSupabase) {
  const { data } = await supabase
    .from("products")
    .select("category")
    .not("category", "is", null);

  return [
    ...new Set((data ?? []).map((row) => row.category as string)),
  ].sort();
}
