"use client";

import { useState } from "react";
import ProductRow from "@/components/admin/ProductRow";
import type { AdminProduct } from "@/lib/types";

// The admin product list with a search box to quickly find a part to edit.
export default function AdminProductList({
  products,
}: {
  products: AdminProduct[];
}) {
  const [search, setSearch] = useState("");
  const term = search.trim().toLowerCase();

  const shown = term
    ? products.filter((p) =>
        [
          p.name,
          p.name_ar,
          p.part_number,
          ...(p.alt_part_numbers ?? []),
          p.brand,
          p.car_model,
          p.category,
          p.store?.name,
        ].some((value) => (value ?? "").toLowerCase().includes(term))
      )
    : products;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search products"
          placeholder="Search by name, part number, brand, model or store…"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none focus:border-orange-500 sm:max-w-md"
        />
        {term && (
          <span className="text-sm text-gray-600">
            {shown.length} of {products.length} product(s)
          </span>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          No products match &quot;{search.trim()}&quot;.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* On phones each product is a stacked card; from md up, a table. */}
          <table className="block w-full text-left text-sm md:table">
            <thead className="hidden border-b bg-gray-50 text-xs uppercase text-gray-500 md:table-header-group">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium" colSpan={3}>
                  Price &amp; stock
                </th>
                <th className="px-4 py-3 font-medium">Shop visibility</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="block divide-y md:table-row-group">
              {shown.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
