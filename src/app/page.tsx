import { supabase } from "@/lib/supabase";
import ProductSearch from "@/components/ProductSearch";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { loadCatalog } from "@/lib/catalog";
import { messages } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import type { Product } from "@/lib/types";
export const instant = false;

export default async function Home() {
  const [{ data, error }, catalog, lang] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, name_ar, part_number, alt_part_numbers, brand, car_model, category, origin, variant_group, description, description_ar, price, stock_quantity, image_url"
      )
      .eq("is_active", true)
      .order("name"),
    loadCatalog(supabase),
    getLang(),
  ]);
  const t = messages[lang];

  if (error) {
    console.error("Failed to load products:", error);
  }

  const products = (data ?? []) as Product[];

  return (
    <main
      dir={t.dir}
      lang={lang}
      className="min-h-screen bg-gray-50 text-gray-900"
    >
      <SiteHeader lang={lang} />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-3xl font-bold sm:text-4xl">{t.heroTitle}</h2>
        <p className="mt-3 text-gray-600">{t.heroIntro}</p>

        {error ? (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
            {t.loadFailed}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h3 className="text-xl font-semibold">{t.noProductsTitle}</h3>
            <p className="mt-2 text-gray-600">{t.noProductsBody}</p>
          </div>
        ) : (
          <ProductSearch products={products} catalog={catalog} lang={lang} />
        )}
      </section>

      <SiteFooter lang={lang} />
    </main>
  );
}
