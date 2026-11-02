"use client";

import { useActionState } from "react";
import { createCatalogItem } from "@/app/admin/catalog/actions";
import type { Brand } from "@/lib/catalog";
import { submitKeepingFields } from "@/lib/form-submit";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500";

const PLACEHOLDERS = {
  brand: ["e.g. Toyota", "مثال: تويوتا"],
  model: ["e.g. Corolla", "مثال: كورولا"],
  category: ["e.g. Brakes", "مثال: فرامل"],
};

// "Add" form for a brand, car model (needs a brand) or category.
export default function CatalogAddForm({
  kind,
  brands = [],
}: {
  kind: "brand" | "model" | "category";
  brands?: Brand[];
}) {
  const [state, formAction, pending] = useActionState(
    createCatalogItem,
    initialState
  );
  const [placeholder, placeholderAr] = PLACEHOLDERS[kind];

  return (
    <form
      // Start empty again after each item is added.
      key={state.success}
      onSubmit={submitKeepingFields(formAction)}
      className="grid gap-3 border-t bg-gray-50 px-5 py-4 text-sm sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]"
    >
      <input type="hidden" name="kind" value={kind} />
      {kind === "model" && (
        <label className="block">
          <span className="font-medium text-gray-700">Brand</span>
          <select name="brand_id" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Choose a brand
            </option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="block">
        <span className="font-medium text-gray-700">Name (English)</span>
        <input
          name="name"
          required
          placeholder={placeholder}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="font-medium text-gray-700">Name (Arabic)</span>
        <input
          name="name_ar"
          dir="rtl"
          placeholder={placeholderAr}
          className={inputClass}
        />
      </label>
      <div className="flex items-end gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </div>
      {(state.error || state.success) && (
        <p
          role={state.error ? "alert" : "status"}
          className={`sm:col-span-full ${state.error ? "text-red-600" : "text-green-700"}`}
        >
          {state.error ?? state.success}
        </p>
      )}
    </form>
  );
}
