import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import { loadCatalog } from "@/lib/catalog";
import { whatsappLink } from "@/lib/contact";
import { localize, messages } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { UUID_PATTERN } from "@/lib/products";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";

export const instant = false;

type ProductWithYears = Product & {
  year_from: number | null;
  year_to: number | null;
};

export default function ProductPage({ params }: PageProps<"/products/[id]">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <ProductDetails params={params} />
    </Suspense>
  );
}

async function ProductDetails({
  params,
}: {
  params: PageProps<"/products/[id]">["params"];
}) {
  const [{ id }, lang] = await Promise.all([params, getLang()]);
  const t = messages[lang];

  // Only active products are visible to visitors (row-level security).
  const [{ data: product, error }, catalog] = await Promise.all([
    UUID_PATTERN.test(id)
      ? supabase
          .from("products")
          .select(
            "id, name, name_ar, part_number, alt_part_numbers, brand, car_model, year_from, year_to, category, description, description_ar, price, stock_quantity, image_url"
          )
          .eq("id", id)
          .eq("is_active", true)
          .maybeSingle<ProductWithYears>()
      : Promise.resolve({ data: null, error: null }),
    loadCatalog(supabase),
  ]);

  if (error) {
    console.error("Failed to load product:", error);
  }

  const text = product ? localize(product, lang, catalog) : null;

  return (
    <main dir={t.dir} lang={lang} className="min-h-screen bg-gray-50 text-gray-900">
      <SiteHeader lang={lang} />

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <Link href="/" className="text-sm text-orange-700 hover:underline">
          {t.backToProducts}
        </Link>

        {!product || !text ? (
          <p className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">
            {t.productNotFound}
          </p>
        ) : (
          <div className="mt-6 grid gap-8 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 md:grid-cols-2">
            {product.image_url ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={product.image_url}
                  alt={text.name}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-contain"
                  priority
                />
              </div>
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                {t.noImage}
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-orange-600">{text.brand}</p>
              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{text.name}</h2>

              <p className="mt-4 text-3xl font-bold">
                {Number(product.price).toFixed(2)} {t.currency}
              </p>
              <p
                className={
                  product.stock_quantity > 0
                    ? "mt-1 font-medium text-green-700"
                    : "mt-1 font-medium text-red-600"
                }
              >
                {product.stock_quantity > 0
                  ? t.inStock(product.stock_quantity)
                  : t.outOfStock}
              </p>

              <a
                href={whatsappLink(t.whatsappOrder(text.name, product.part_number))}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block w-full rounded-lg bg-green-600 px-5 py-3 text-center font-medium text-white hover:bg-green-700 sm:w-auto"
              >
                {t.orderOnWhatsapp}
              </a>

              <dl className="mt-6 space-y-2 border-t pt-4 text-sm">
                <Detail label={t.partNumber}>
                  <span dir="ltr">{product.part_number}</span>
                </Detail>
                {product.alt_part_numbers?.length > 0 && (
                  <Detail label={t.otherPartNumbers}>
                    <span dir="ltr">{product.alt_part_numbers.join(", ")}</span>
                  </Detail>
                )}
                <Detail label={t.carModel}>{text.model}</Detail>
                {(product.year_from || product.year_to) && (
                  <Detail label={t.years}>
                    {t.yearsRange(product.year_from, product.year_to)}
                  </Detail>
                )}
                {text.category && (
                  <Detail label={t.category}>{text.category}</Detail>
                )}
              </dl>

              {text.description && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-semibold">{t.description}</h3>
                  <p className="mt-2 whitespace-pre-line text-gray-700">
                    {text.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <footer className="border-t bg-white px-6 py-6 text-center text-sm text-gray-500">
        {t.footer}
      </footer>
    </main>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="text-gray-500">{label}:</dt>
      <dd className="font-medium text-gray-900">{children}</dd>
    </div>
  );
}
