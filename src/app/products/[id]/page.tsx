import Link from "next/link";
import { Suspense } from "react";
import ProductGallery from "@/components/ProductGallery";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { loadCatalog } from "@/lib/catalog";
import { whatsappLink } from "@/lib/contact";
import { catalogName, localize, messages } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { UUID_PATTERN } from "@/lib/products";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";

export const instant = false;

type ProductWithYears = Product & {
  year_from: number | null;
  year_to: number | null;
  extra_image_urls: string[];
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
            "id, name, name_ar, part_number, alt_part_numbers, brand, car_model, year_from, year_to, category, origin, variant_group, description, description_ar, price, stock_quantity, image_url, extra_image_urls"
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

  // Other origins (صناعات) of the same part that are on sale.
  const { data: variants } = product?.variant_group
    ? await supabase
        .from("products")
        .select("id, origin, price")
        .eq("variant_group", product.variant_group)
        .eq("is_active", true)
        .order("price")
    : { data: null };
  const originName = (name: string | null) =>
    name
      ? catalogName(catalog.origins.find((o) => o.name === name), name, lang)
      : t.origin;

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
            <ProductGallery
              images={[product.image_url, ...(product.extra_image_urls ?? [])].filter(
                (url): url is string => Boolean(url)
              )}
              alt={text.name}
              noImageText={t.noImage}
            />

            <div>
              <p className="text-sm font-medium text-orange-600">{text.brand}</p>
              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{text.name}</h2>

              {variants && variants.length > 1 ? (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">{t.origin}:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {variants.map((variant) => (
                      <Link
                        key={variant.id}
                        href={`/products/${variant.id}`}
                        aria-current={variant.id === product.id ? "page" : undefined}
                        className={`rounded-lg border px-3 py-2 text-sm ${
                          variant.id === product.id
                            ? "border-orange-500 bg-orange-50 font-semibold text-orange-800"
                            : "border-gray-300 hover:border-orange-400"
                        }`}
                      >
                        {originName(variant.origin)}
                        <span className="ms-2 text-gray-500">
                          {Number(variant.price).toFixed(2)} {t.currency}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                text.origin && (
                  <p className="mt-2 text-sm text-gray-700">
                    {t.origin}: <span className="font-medium">{text.origin}</span>
                  </p>
                )
              )}

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
                  ? t.inStock
                  : t.outOfStock}
              </p>

              <a
                href={whatsappLink(
                  t.whatsappOrder(
                    text.origin ? `${text.name} – ${text.origin}` : text.name,
                    product.part_number,
                    // The car the part fits, e.g. "نيسان صني 2002 – 2012".
                    [
                      text.brand,
                      text.model,
                      (product.year_from || product.year_to) &&
                        t.yearsRange(product.year_from, product.year_to),
                    ]
                      .filter(Boolean)
                      .join(" ")
                  )
                )}
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

      <SiteFooter lang={lang} />
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
