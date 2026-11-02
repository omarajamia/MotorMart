"use client";

import Link from "next/link";
import { useActionState } from "react";
import { setProductActive, updatePriceAndStock } from "@/app/admin/actions";
import { submitKeepingFields } from "@/lib/form-submit";
import type { ActionState, AdminProduct } from "@/lib/types";

const initialState: ActionState = {};

export default function ProductRow({ product }: { product: AdminProduct }) {
  const [saveState, saveAction, saving] = useActionState(
    updatePriceAndStock,
    initialState
  );
  const [visibilityState, visibilityAction, changingVisibility] =
    useActionState(setProductActive, initialState);

  const message = saveState.error ?? visibilityState.error ?? saveState.success;
  const isError = Boolean(saveState.error ?? visibilityState.error);

  return (
    <tr className={product.is_active ? "" : "bg-gray-50 text-gray-500"}>
      <td className="px-4 py-3">
        <Link
          href={`/admin/products/${product.id}/edit`}
          className="font-medium text-gray-900 hover:text-orange-600 hover:underline"
        >
          {product.name}
        </Link>
        <p className="text-xs text-gray-500">
          {[product.part_number, ...(product.alt_part_numbers ?? [])].join(" / ")}{" "}
          · {product.brand} {product.car_model}
          {product.category ? ` · ${product.category}` : ""}
        </p>
      </td>

      <td className="px-4 py-3" colSpan={3}>
        <form
          onSubmit={submitKeepingFields(saveAction)}
          className="flex flex-wrap items-center gap-2"
        >
          <input type="hidden" name="id" value={product.id} />
          <label className="flex items-center gap-1 text-sm">
            <span className="sr-only">Price (JOD)</span>
            <input
              type="number"
              name="price"
              step="0.01"
              min="0"
              required
              defaultValue={Number(product.price).toFixed(2)}
              className="w-24 rounded-md border border-gray-300 px-2 py-1"
            />
            <span className="text-xs text-gray-500">JOD</span>
          </label>
          <label className="flex items-center gap-1 text-sm">
            <span className="sr-only">Stock</span>
            <input
              type="number"
              name="stock_quantity"
              step="1"
              min="0"
              required
              defaultValue={product.stock_quantity}
              className="w-20 rounded-md border border-gray-300 px-2 py-1"
            />
            <span className="text-xs text-gray-500">in stock</span>
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-slate-900 px-3 py-1 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {message && (
            <span
              role={isError ? "alert" : "status"}
              className={isError ? "text-sm text-red-600" : "text-sm text-green-700"}
            >
              {message}
            </span>
          )}
        </form>
      </td>

      <td className="px-4 py-3">
        <form action={visibilityAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={product.id} />
          <input
            type="hidden"
            name="is_active"
            value={product.is_active ? "false" : "true"}
          />
          <span
            className={
              product.is_active
                ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                : "rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700"
            }
          >
            {product.is_active ? "Visible" : "Hidden"}
          </span>
          <button
            type="submit"
            disabled={changingVisibility}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-60"
          >
            {product.is_active ? "Hide" : "Show"}
          </button>
        </form>
      </td>

      <td className="px-4 py-3">
        <Link
          href={`/admin/products/${product.id}/edit`}
          className="inline-block rounded-md bg-orange-500 px-3 py-1 text-sm font-medium text-white hover:bg-orange-600"
        >
          Edit
        </Link>
      </td>
    </tr>
  );
}
