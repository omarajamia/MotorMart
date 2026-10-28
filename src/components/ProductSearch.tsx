
"use client";

import { useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  part_number: string;
  brand: string;
  car_model: string;
  category: string | null;
  price: number;
  stock_quantity: number;
  image_url: string | null;
};

export default function ProductSearch({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("All");
  const [model, setModel] = useState("All");
  const [category, setCategory] = useState("All");
  const [inStockOnly, setInStockOnly] = useState(false);

  const models = useMemo(
    () =>
      [...new Set(
        products
          .filter((p) => brand === "All" || p.brand === brand)
          .map((p) => p.car_model)
      )].sort(),
    [products, brand]
  );

  const categories = useMemo(
    () =>
      [...new Set(
        products
          .map((p) => p.category)
          .filter((c): c is string => Boolean(c))
      )].sort(),
    [products]
  );

  const filteredProducts = products.filter((p) => {
    const term = search.trim().toLowerCase();

    const matchesSearch =
      !term ||
      p.name.toLowerCase().includes(term) ||
      p.part_number.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.car_model.toLowerCase().includes(term) ||
      (p.category ?? "").toLowerCase().includes(term);

    return (
      matchesSearch &&
      (brand === "All" || p.brand === brand) &&
      (model === "All" || p.car_model === model) &&
      (category === "All" || p.category === category) &&
      (!inStockOnly || p.stock_quantity > 0)
    );
  });

  return (
    <div>
      <div className="mt-8 grid gap-4 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or part number..."
          className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
        />

        <select
          value={brand}
          onChange={(e) => {
            setBrand(e.target.value);
            setModel("All");
          }}
          className="rounded-lg border border-gray-300 px-4 py-3"
        >
          <option value="All">All brands</option>
          <option value="Kia">Kia</option>
          <option value="Nissan">Nissan</option>
          <option value="Hyundai">Hyundai</option>
        </select>

        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-3"
        >
          <option value="All">All models</option>
          {models.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-3"
        >
          <option value="All">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
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
          Show in-stock products only
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 lg:col-span-4">
          <p className="text-sm text-gray-600">
            {filteredProducts.length} product(s) found
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
            Clear filters
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <h3 className="text-xl font-semibold">No matching products</h3>
          <p className="mt-2 text-gray-600">
            Try another search or clear your filters.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-400">
                  No image available
                </div>
              )}

              <div className="p-5">
                <p className="text-sm font-medium text-orange-600">
                  {product.brand}
                </p>
                <h3 className="mt-1 text-lg font-bold">{product.name}</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Part number: {product.part_number}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Car model: {product.car_model}
                </p>
                {product.category && (
                  <p className="mt-1 text-sm text-gray-600">
                    Category: {product.category}
                  </p>
                )}

                <div className="mt-5 flex items-center justify-between border-t pt-4">
                  <span className="text-xl font-bold">
                    {Number(product.price).toFixed(2)} JOD
                  </span>
                  <span
                    className={
                      product.stock_quantity > 0
                        ? "text-sm font-medium text-green-700"
                        : "text-sm font-medium text-red-600"
                    }
                  >
                    {product.stock_quantity > 0
                      ? `In stock: ${product.stock_quantity}`
                      : "Out of stock"}
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
