import { Suspense } from "react";
import NoAccess from "@/components/admin/NoAccess";
import ProductForm from "@/components/admin/ProductForm";
import { getAdmin } from "@/lib/admin";
import { loadCatalog } from "@/lib/catalog";

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
  const { supabase, user, isAdmin } = await getAdmin();
  if (!isAdmin) {
    return <NoAccess email={user.email} />;
  }

  return <ProductForm catalog={await loadCatalog(supabase)} />;
}
