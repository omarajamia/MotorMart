import { Suspense } from "react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import NoAccess from "@/components/admin/NoAccess";
import ProductForm from "@/components/admin/ProductForm";
import { getAdmin, getCategories } from "@/lib/admin";
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
  const { supabase, user, isAdmin } = await getAdmin();
  if (!isAdmin) {
    return <NoAccess email={user.email} />;
  }

  const { data: product, error } = UUID_PATTERN.test(id)
    ? await supabase
        .from("products")
        .select(
          "id, name, part_number, brand, car_model, year_from, year_to, category, description, price, stock_quantity, image_url, is_active"
        )
        .eq("id", id)
        .maybeSingle<ProductDetails>()
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
      />
      <DeleteProductButton id={product.id} name={product.name} />
    </div>
  );
}
