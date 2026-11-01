import { Suspense } from "react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import NoAccess from "@/components/admin/NoAccess";
import ProductForm from "@/components/admin/ProductForm";
import { getCategories, requireShopAccount } from "@/lib/admin";
import { messages } from "@/lib/i18n";
import { getShopLang } from "@/lib/i18n-server";
import { UUID_PATTERN } from "@/lib/products";
import type { ProductDetails } from "@/lib/types";

export const instant = false;

export default function ShopEditProductPage({
  params,
}: PageProps<"/shop/products/[id]/edit">) {
  return (
    <Suspense fallback={null}>
      <EditShopProduct params={params} />
    </Suspense>
  );
}

async function EditShopProduct({
  params,
}: {
  params: PageProps<"/shop/products/[id]/edit">["params"];
}) {
  const [{ id }, { supabase, user, shop }, lang] = await Promise.all([
    params,
    requireShopAccount(),
    getShopLang(),
  ]);
  const t = messages[lang];
  if (!shop) {
    return <NoAccess email={user.email} lang={lang} />;
  }

  // Only this shop's products can be edited here.
  const { data: product, error } = UUID_PATTERN.test(id)
    ? await supabase
        .from("products")
        .select(
          "id, name, part_number, brand, car_model, year_from, year_to, category, description, price, stock_quantity, image_url, is_active, shop_id"
        )
        .eq("id", id)
        .eq("shop_id", shop.id)
        .maybeSingle<ProductDetails>()
    : { data: null, error: null };

  if (error) {
    console.error("Failed to load product for editing:", error);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">{t.editProductTitle}</h1>
      <div className="mt-6">
        {product ? (
          <div className="space-y-8">
            <ProductForm
              product={product}
              categories={await getCategories(supabase)}
              basePath="/shop"
              lang={lang}
            />
            <DeleteProductButton
              id={product.id}
              name={product.name}
              lang={lang}
            />
          </div>
        ) : (
          <p className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600">
            {t.productMissing}
          </p>
        )}
      </div>
    </div>
  );
}
