import Link from "next/link";
import { Suspense } from "react";
import LogoutButton from "@/components/admin/LogoutButton";
import NoAccess from "@/components/admin/NoAccess";
import ProductRow from "@/components/admin/ProductRow";
import { requireShopAccount } from "@/lib/admin";
import { messages } from "@/lib/i18n";
import { getShopLang } from "@/lib/i18n-server";
import type { AdminProduct } from "@/lib/types";

export const instant = false;

export default function ShopDashboardPage() {
  return (
    <Suspense fallback={null}>
      <ShopDashboard />
    </Suspense>
  );
}

async function ShopDashboard() {
  const [{ supabase, user, shop }, lang] = await Promise.all([
    requireShopAccount(),
    getShopLang(),
  ]);
  const t = messages[lang];

  if (!shop) {
    return <NoAccess email={user.email} lang={lang} />;
  }

  // Shop accounts can also read other shops' public products, so filter to
  // this shop explicitly.
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, part_number, brand, car_model, category, price, stock_quantity, image_url, is_active, shop_id, shop:shops(name, city, phone)"
    )
    .eq("shop_id", shop.id)
    .order("name")
    .overrideTypes<AdminProduct[], { merge: false }>();

  if (error) {
    console.error("Failed to load shop products:", error);
  }

  const products = data ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t.shopProducts(shop.name)}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {t.signedInAs(user.email ?? "", products.length)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/shop/products/new"
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            {t.addProduct}
          </Link>
          <LogoutButton lang={lang} />
        </div>
      </div>

      {error ? (
        <p className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
          {t.loadFailed}
        </p>
      ) : products.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">
          {t.noProducts}
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-start text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-start font-medium">
                  {t.productColumn}
                </th>
                <th className="px-4 py-3 text-start font-medium" colSpan={3}>
                  {t.priceStockColumn}
                </th>
                <th className="px-4 py-3 text-start font-medium">
                  {t.visibilityColumn}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  showShop={false}
                  basePath="/shop"
                  lang={lang}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
