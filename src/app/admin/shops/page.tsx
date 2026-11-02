import { Suspense } from "react";
import { createShopAccount } from "@/app/admin/shops/actions";
import AccountForm from "@/components/admin/AccountForm";
import NoAccess from "@/components/admin/NoAccess";
import ShopForm from "@/components/admin/ShopForm";
import ShopStatusButton from "@/components/admin/ShopStatusButton";
import { requireAccount } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const instant = false;

type ShopRow = {
  id: string;
  name: string;
  phone: string | null;
  city: string | null;
  is_active: boolean;
};

export default function ShopsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold">Shops</h1>
      <p className="mt-1 text-sm text-gray-600">
        Each shop manages only its own products. Hiding a shop hides all of
        its products from the public site.
      </p>
      <div className="mt-6">
        <Suspense fallback={<p className="text-gray-600">Loading…</p>}>
          <Shops />
        </Suspense>
      </div>
    </div>
  );
}

async function Shops() {
  const { supabase, user, hasAccess, isOwner } = await requireAccount();
  if (!hasAccess) {
    return <NoAccess email={user.email} />;
  }
  if (!isOwner) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white p-5 text-gray-700">
        Only the MotorMart owner can manage shops.
      </p>
    );
  }

  let adminClient;
  try {
    adminClient = createSupabaseAdminClient();
  } catch {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-800">
        Shop accounts aren&apos;t set up yet. Add{" "}
        <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> to{" "}
        <code className="font-mono">.env.local</code>, then restart the app.
      </p>
    );
  }

  const [{ data: shops, error }, { data: products }, { data: members }, { data: usersPage }] =
    await Promise.all([
      supabase.from("shops").select("id, name, phone, city, is_active").order("name"),
      supabase.from("products").select("shop_id"),
      adminClient.from("shop_members").select("user_id, shop_id"),
      adminClient.auth.admin.listUsers({ perPage: 1000 }),
    ]);

  if (error) {
    console.error("Failed to load shops:", error);
  }

  const productCounts = new Map<string, number>();
  for (const product of products ?? []) {
    productCounts.set(product.shop_id, (productCounts.get(product.shop_id) ?? 0) + 1);
  }
  const emails = new Map(
    (usersPage?.users ?? []).map((account) => [account.id, account.email])
  );

  return (
    <div className="space-y-8">
      <ShopForm />

      {((shops ?? []) as ShopRow[]).map((shop) => {
        const accounts = (members ?? []).filter((m) => m.shop_id === shop.id);
        return (
          <section
            key={shop.id}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{shop.name}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {[shop.city, shop.phone].filter(Boolean).join(" · ") ||
                    "No city or phone yet"}
                  {" · "}
                  {productCounts.get(shop.id) ?? 0} product(s)
                </p>
              </div>
              <ShopStatusButton shopId={shop.id} isActive={shop.is_active} />
            </div>

            <h3 className="mt-5 text-xs font-medium uppercase text-gray-500">
              Accounts
            </h3>
            {accounts.length === 0 ? (
              <p className="mt-1 text-sm text-gray-600">No accounts yet.</p>
            ) : (
              <ul className="mt-1 space-y-1 text-sm">
                {accounts.map((account) => (
                  <li key={account.user_id}>
                    {emails.get(account.user_id) ?? "Unknown account"}
                  </li>
                ))}
              </ul>
            )}

            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-orange-700 hover:underline">
                Add an account for {shop.name}
              </summary>
              <div className="mt-3">
                <AccountForm
                  action={createShopAccount}
                  shopId={shop.id}
                  title={`New account for ${shop.name}`}
                  description="This account can sign in straight away and manage only this shop's products. Share the password with them privately."
                />
              </div>
            </details>
          </section>
        );
      })}
    </div>
  );
}
