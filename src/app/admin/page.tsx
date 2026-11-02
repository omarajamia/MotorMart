import Link from "next/link";
import { Suspense } from "react";
import NoAccess from "@/components/admin/NoAccess";
import ProductRow from "@/components/admin/ProductRow";
import { getAdmin } from "@/lib/admin";
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
  const { supabase, user, isAdmin } = await getAdmin();

  if (!isAdmin) {
    return <NoAccess email={user.email} />;
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, name_ar, part_number, alt_part_numbers, brand, car_model, category, description, description_ar, price, stock_quantity, image_url, is_active"
    )
    .order("name");

  if (error) {
    console.error("Failed to load products for admin:", error);
  }

  const products = (data ?? []) as AdminProduct[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-gray-600">
            Signed in as {user.user_metadata?.full_name ?? user.email} · {products.length} product(s)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            + Add product
          </Link>
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
          {/* On phones each product is a stacked card; from md up, a table. */}
          <table className="block w-full text-left text-sm md:table">
            <thead className="hidden border-b bg-gray-50 text-xs uppercase text-gray-500 md:table-header-group">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium" colSpan={3}>
                  Price &amp; stock
                </th>
                <th className="px-4 py-3 font-medium">Shop visibility</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="block divide-y md:table-row-group">
              {products.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
