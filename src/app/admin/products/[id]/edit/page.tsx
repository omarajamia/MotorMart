import { Suspense } from "react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import NoAccess from "@/components/admin/NoAccess";
import ProductForm from "@/components/admin/ProductForm";
import { getCategories, getShops, requireAccount } from "@/lib/admin";
import { UUID_PATTERN } from "@/lib/products";
import type { ProductDetails } from "@/lib/types";

export const instant = false;

export default function EditProductPage({
  params,
}: PageProps<"/admin/products/[id]/edit">) {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Edit product</h1>
      <div className="mt-6">
        <Suspense fallback={<p className="text-gray-600">Loading…</p>}>
          <EditProduct params={params} />
        </Suspense>
      </div>
    </div>
  );
}

async function EditProduct({
  params,
}: {
  params: PageProps<"/admin/products/[id]/edit">["params"];
}) {
  const { id } = await params;
  const { supabase, user, hasAccess, shop } = await requireAccount();
  if (!hasAccess) {
    return <NoAccess email={user.email} />;
  }

  // Shop accounts can read other shops' public products, so limit them to
  // their own shop explicitly.
  let query = supabase
    .from("products")
    .select(
      "id, name, part_number, brand, car_model, year_from, year_to, category, description, price, stock_quantity, image_url, is_active, shop_id"
    )
    .eq("id", id);
  if (shop) {
    query = query.eq("shop_id", shop.id);
  }

  const { data: product, error } = UUID_PATTERN.test(id)
    ? await query.maybeSingle<ProductDetails>()
    : { data: null, error: null };

  if (error) {
    console.error("Failed to load product for editing:", error);
  }
  if (!product) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600">
        This product doesn&apos;t exist (it may have been deleted).
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <ProductForm
        product={product}
        categories={await getCategories(supabase)}
        shops={shop ? undefined : await getShops(supabase)}
      />
      <DeleteProductButton id={product.id} name={product.name} />
    </div>
  );
}
