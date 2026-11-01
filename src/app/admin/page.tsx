import Link from "next/link";
import { Suspense } from "react";
import LogoutButton from "@/components/admin/LogoutButton";
import NoAccess from "@/components/admin/NoAccess";
import ProductRow from "@/components/admin/ProductRow";
import { requireAdminAccount } from "@/lib/admin";
import type { AdminProduct } from "@/lib/types";

export const instant = false;

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="text-gray-600">Loading…</p>}>
      <AdminDashboard />
    </Suspense>
  );
}

async function AdminDashboard() {
  const { supabase, user, hasAccess, shop } = await requireAdminAccount();

  if (!hasAccess) {
    return <NoAccess email={user.email} />;
  }

  // Shop accounts can read other shops' public products, so limit them to
  // their own shop explicitly. MotorMart admins see every shop.
  let query = supabase
    .from("products")
    .select(
      "id, name, part_number, brand, car_model, category, price, stock_quantity, image_url, is_active, shop_id, shop:shops(name, city, phone)"
    )
    .order("name");
  if (shop) {
    query = query.eq("shop_id", shop.id);
  }

  const { data, error } = await query.overrideTypes<
    AdminProduct[],
    { merge: false }
  >();

  if (error) {
    console.error("Failed to load products for admin:", error);
  }

  const products = data ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {shop ? `${shop.name} – Products` : "All shops – Products"}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Signed in as {user.email} · {products.length} product(s)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            + Add product
          </Link>
          <LogoutButton />
        </div>
      </div>

      {error ? (
        <p className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
          Couldn&apos;t load products. Please try again shortly.
        </p>
      ) : products.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">
          No products yet.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium" colSpan={3}>
                  Price &amp; stock
                </th>
                <th className="px-4 py-3 font-medium">Shop visibility</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  showShop={!shop}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
