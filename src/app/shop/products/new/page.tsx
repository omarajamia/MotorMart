import { Suspense } from "react";
import NoAccess from "@/components/admin/NoAccess";
import ProductForm from "@/components/admin/ProductForm";
import { getCategories, requireShopAccount } from "@/lib/admin";
import { messages } from "@/lib/i18n";
import { getShopLang } from "@/lib/i18n-server";

export const instant = false;

export default function ShopNewProductPage() {
  return (
    <Suspense fallback={null}>
      <NewShopProduct />
    </Suspense>
  );
}

async function NewShopProduct() {
  const [{ supabase, user, shop }, lang] = await Promise.all([
    requireShopAccount(),
    getShopLang(),
  ]);
  if (!shop) {
    return <NoAccess email={user.email} lang={lang} />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">{messages[lang].addProductTitle}</h1>
      <div className="mt-6">
        <ProductForm
          categories={await getCategories(supabase)}
          basePath="/shop"
          lang={lang}
        />
      </div>
    </div>
  );
}
