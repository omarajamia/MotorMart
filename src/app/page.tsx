import { supabase } from "@/lib/supabase";
import LanguageSwitch from "@/components/LanguageSwitch";
import ProductSearch from "@/components/ProductSearch";
import {
  CONTACT_PHONE_DISPLAY,
  partRequestMessage,
  whatsappLink,
} from "@/lib/contact";
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
        "id, name, name_ar, part_number, alt_part_numbers, brand, car_model, category, description, description_ar, price, stock_quantity, image_url"
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
      <div className="bg-green-700 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6 py-2 text-sm">
          <p>
            {t.contactBar}{" "}
            <span dir="ltr" className="font-semibold">
              {CONTACT_PHONE_DISPLAY}
            </span>
          </p>
          <a
            href={whatsappLink(partRequestMessage(lang))}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white px-4 py-1 font-medium text-green-800 hover:bg-green-50"
          >
            {t.askOnWhatsapp}
          </a>
        </div>
      </div>

      <header className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-orange-400">
              {t.siteName}
            </h1>
            <p className="mt-1 text-sm text-gray-300">{t.tagline}</p>
          </div>
          <LanguageSwitch lang={lang} />
        </div>
      </header>

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

      <footer className="border-t bg-white px-6 py-6 text-center text-sm text-gray-500">
        {t.footer}
      </footer>
    </main>
  );
}
