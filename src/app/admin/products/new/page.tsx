import { Suspense } from "react";
import NoAccess from "@/components/admin/NoAccess";
import ProductForm from "@/components/admin/ProductForm";
import { getCategories, getShops, requireAdminAccount } from "@/lib/admin";

export const instant = false;

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Add product</h1>
      <div className="mt-6">
        <Suspense fallback={<p className="text-gray-600">Loading…</p>}>
          <NewProduct />
        </Suspense>
      </div>
    </div>
  );
}

async function NewProduct() {
  const { supabase, user, hasAccess, shop } = await requireAdminAccount();
  if (!hasAccess) {
    return <NoAccess email={user.email} />;
  }

  return (
    <ProductForm
      categories={await getCategories(supabase)}
      shops={shop ? undefined : await getShops(supabase)}
    />
  );
}
