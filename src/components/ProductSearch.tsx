"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { partRequestMessage, whatsappLink } from "@/lib/contact";
import type { Catalog } from "@/lib/catalog";
import { catalogName, localize, messages, type Lang } from "@/lib/i18n";
import type { Product } from "@/lib/types";

export default function ProductSearch({
  products,
  catalog,
  lang,
}: {
  products: Product[];
  catalog: Catalog;
  lang: Lang;
}) {
  const t = messages[lang];
  const [search, setSearch] = useState("");
  // Filters hold the English names stored on products; options and cards
  // show the names in the chosen language.
  const [brand, setBrand] = useState("All");
  const [model, setModel] = useState("All");
  const [category, setCategory] = useState("All");
  const [inStockOnly, setInStockOnly] = useState(false);

  const shown = useMemo(
    () => products.map((p) => ({ ...p, text: localize(p, lang, catalog) })),
    [products, lang, catalog]
  );

  // Only offer brands, models and categories that have products.
  const brandOptions = useMemo(
    () => catalog.brands.filter((b) => products.some((p) => p.brand === b.name)),
    [catalog, products]
  );
  const modelOptions = useMemo(() => {
    const brandIds = new Set(
      catalog.brands
        .filter((b) => brand === "All" || b.name === brand)
        .map((b) => b.id)
    );
    return catalog.models.filter(
      (m) =>
        brandIds.has(m.brand_id) &&
        products.some(
          (p) =>
            p.car_model === m.name &&
            catalog.brands.find((b) => b.name === p.brand)?.id === m.brand_id
        )
    );
  }, [catalog, products, brand]);
  const categoryOptions = useMemo(
    () =>
      catalog.categories.filter((c) =>
        products.some((p) => p.category === c.name)
      ),
    [catalog, products]
  );

  // What the customer was searching for, sent along in the WhatsApp message.
  const lookingFor = [
    search.trim(),
    brand !== "All" &&
      catalogName(catalog.brands.find((b) => b.name === brand), brand, lang),
    model !== "All" &&
      catalogName(modelOptions.find((m) => m.name === model), model, lang),
    category !== "All" &&
      catalogName(
        catalog.categories.find((c) => c.name === category),
        category,
        lang
      ),
  ]
    .filter(Boolean)
    .join(" ");

  const term = search.trim().toLowerCase();
  const filteredProducts = shown.filter(
    (p) =>
      // Search matches both the Arabic and English text.
      (!term || p.text.searchText.includes(term)) &&
      (brand === "All" || p.brand === brand) &&
      (model === "All" || p.car_model === model) &&
      (category === "All" || p.category === category) &&
      (!inStockOnly || p.stock_quantity > 0)
  );

  return (
    <div>
      <div className="mt-8 grid gap-4 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="search"
          aria-label={t.searchPlaceholder}
          placeholder={t.searchPlaceholder}
          className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
        />

        <select
          aria-label={t.allBrands}
          value={brand}
          onChange={(e) => {
            setBrand(e.target.value);
            setModel("All");
          }}
          className="rounded-lg border border-gray-300 px-4 py-3"
        >
          <option value="All">{t.allBrands}</option>
          {brandOptions.map((item) => (
            <option key={item.id} value={item.name}>
              {catalogName(item, item.name, lang)}
            </option>
          ))}
        </select>

        <select
          aria-label={t.allModels}
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-3"
        >
          <option value="All">{t.allModels}</option>
          {/* The same model name can exist under two brands; list it once. */}
          {[...new Map(modelOptions.map((m) => [m.name, m])).values()].map(
            (item) => (
              <option key={item.id} value={item.name}>
                {catalogName(item, item.name, lang)}
              </option>
            )
          )}
        </select>

        <select
          aria-label={t.allCategories}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-3"
        >
          <option value="All">{t.allCategories}</option>
          {categoryOptions.map((item) => (
            <option key={item.id} value={item.name}>
              {catalogName(item, item.name, lang)}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2 lg:col-span-4">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="h-4 w-4 accent-orange-500"
          />
          {t.inStockOnly}
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 lg:col-span-4">
          <p className="text-sm text-gray-600">
            {t.found(filteredProducts.length)}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setBrand("All");
              setModel("All");
              setCategory("All");
              setInStockOnly(false);
            }}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium hover:bg-slate-200"
          >
            {t.clearFilters}
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <h3 className="text-xl font-semibold">{t.noMatchesTitle}</h3>
          <p className="mt-2 text-gray-600">{t.noMatchesBody}</p>
          <a
            href={whatsappLink(partRequestMessage(lang, lookingFor))}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white hover:bg-green-700"
          >
            {t.askOnWhatsapp}
          </a>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              {product.image_url ? (
                <div className="relative h-48 w-full">
                  <Image
                    src={product.image_url}
                    alt={product.text.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-400">
                  {t.noImage}
                </div>
              )}

              <div className="p-5">
                <p className="text-sm font-medium text-orange-600">
                  {product.text.brand}
                </p>
                <h3 className="mt-1 text-lg font-bold">{product.text.name}</h3>
                {product.text.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-gray-700">
                    {product.text.description}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-600">
                  {t.partNumber}:{" "}
                  <span dir="ltr">{product.part_number}</span>
                </p>
                {product.alt_part_numbers?.length > 0 && (
                  <p className="mt-1 text-sm text-gray-600">
                    {t.otherPartNumbers}:{" "}
                    <span dir="ltr">{product.alt_part_numbers.join(", ")}</span>
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-600">
                  {t.carModel}: {product.text.model}
                </p>
                {product.text.category && (
                  <p className="mt-1 text-sm text-gray-600">
                    {t.category}: {product.text.category}
                  </p>
                )}

                <div className="mt-5 flex items-center justify-between border-t pt-4">
                  <span className="text-xl font-bold">
                    {Number(product.price).toFixed(2)} {t.currency}
                  </span>
                  <span
                    className={
                      product.stock_quantity > 0
                        ? "text-sm font-medium text-green-700"
                        : "text-sm font-medium text-red-600"
                    }
                  >
                    {product.stock_quantity > 0
                      ? t.inStock(product.stock_quantity)
                      : t.outOfStock}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
