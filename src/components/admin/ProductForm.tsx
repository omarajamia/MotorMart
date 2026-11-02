"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { createProduct, updateProduct } from "@/app/admin/actions";
import { BRANDS } from "@/lib/products";
import type { ActionState, ProductDetails } from "@/lib/types";

const initialState: ActionState = {};

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500";

export default function ProductForm({
  product,
  categories,
  shops,
}: {
  product?: ProductDetails;
  categories: string[];
  // Only passed for MotorMart admins; shop accounts always use their shop.
  shops?: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    product ? updateProduct : createProduct,
    initialState
  );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        {shops && (
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-gray-700">Shop *</span>
            <select
              name="shop_id"
              required
              defaultValue={product?.shop_id ?? ""}
              className={inputClass}
            >
              <option value="" disabled>
                Choose a shop
              </option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-gray-700">Name *</span>
          <input
            name="name"
            required
            maxLength={200}
            defaultValue={product?.name}
            placeholder="e.g. Front brake pads"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Part number *
          </span>
          <input
            name="part_number"
            required
            maxLength={100}
            defaultValue={product?.part_number}
            placeholder="e.g. KIA-BP-002"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Category</span>
          <input
            name="category"
            list="category-options"
            maxLength={100}
            defaultValue={product?.category ?? ""}
            placeholder="e.g. Brakes"
            className={inputClass}
          />
          <datalist id="category-options">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Brand *</span>
          <select
            name="brand"
            required
            defaultValue={product?.brand ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Choose a brand
            </option>
            {BRANDS.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Car model *
          </span>
          <input
            name="car_model"
            required
            maxLength={100}
            defaultValue={product?.car_model}
            placeholder="e.g. Cerato"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Year from</span>
          <input
            type="number"
            name="year_from"
            min="1950"
            step="1"
            defaultValue={product?.year_from ?? ""}
            placeholder="e.g. 2014"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Year to</span>
          <input
            type="number"
            name="year_to"
            min="1950"
            step="1"
            defaultValue={product?.year_to ?? ""}
            placeholder="e.g. 2018"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Price (JOD) *
          </span>
          <input
            type="number"
            name="price"
            required
            min="0"
            step="0.01"
            defaultValue={
              product ? Number(product.price).toFixed(2) : undefined
            }
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Stock quantity *
          </span>
          <input
            type="number"
            name="stock_quantity"
            required
            min="0"
            step="1"
            defaultValue={product?.stock_quantity ?? 0}
            className={inputClass}
          />
        </label>

        <div className="sm:col-span-2">
          <span className="text-sm font-medium text-gray-700">Photo</span>
          {product?.image_url && (
            <div className="mt-2 flex items-center gap-4">
              <div className="relative h-24 w-32 overflow-hidden rounded-lg border border-gray-200">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="remove_image"
                  className="h-4 w-4 accent-orange-500"
                />
                Remove current photo
              </label>
            </div>
          )}
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp"
            className="mt-2 block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
          />
          <p className="mt-1 text-xs text-gray-500">
            JPEG, PNG or WebP, up to 5 MB.
            {product?.image_url && " Choosing a new photo replaces the current one."}
          </p>
        </div>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-gray-700">
            Description
          </span>
          <textarea
            name="description"
            rows={4}
            maxLength={2000}
            defaultValue={product?.description ?? ""}
            placeholder="What the part is, what it fits, any notes for customers"
            className={inputClass}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={product?.is_active ?? true}
            className="h-4 w-4 accent-orange-500"
          />
          Show this product in the shop
        </label>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-orange-500 px-5 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {pending ? "Saving…" : product ? "Save changes" : "Add product"}
        </button>
        <Link href="/admin" className="text-sm text-gray-600 hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
