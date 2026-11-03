"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { createProduct, updateProduct } from "@/app/admin/actions";
import ExtraPhotos from "@/components/admin/ExtraPhotos";
import PhotoPicker from "@/components/admin/PhotoPicker";
import { shrinkPhoto, shrinkPhotosInForm } from "@/lib/compress-image";
import { submitKeepingFields } from "@/lib/form-submit";
import type { Catalog } from "@/lib/catalog";
import type { ActionState, ProductDetails } from "@/lib/types";

const initialState: ActionState = {};

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500";

export default function ProductForm({
  product,
  catalog,
}: {
  product?: ProductDetails;
  catalog: Catalog;
}) {
  // The car model list depends on the chosen brand.
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [model, setModel] = useState(product?.car_model ?? "");
  const brandId = catalog.brands.find((item) => item.name === brand)?.id;
  const models = catalog.models.filter((item) => item.brand_id === brandId);

  const [state, formAction, pending] = useActionState(
    product ? updateProduct : createProduct,
    initialState
  );
  // True while a large photo is being shrunk, before the form is sent.
  const [preparing, setPreparing] = useState(false);
  const busy = pending || preparing;
  // New "more photos", collected over several picks and sent on save.
  const [extraFiles, setExtraFiles] = useState<File[]>([]);

  return (
    <form
      onSubmit={submitKeepingFields(formAction, async (formData) => {
        setPreparing(true);
        try {
          await shrinkPhotosInForm(formData, ["image_camera", "image"]);
          for (const file of extraFiles) {
            formData.append("extra_images", await shrinkPhoto(file));
          }
        } finally {
          setPreparing(false);
        }
      })}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
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

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-gray-700">
            Name in Arabic (optional)
          </span>
          <input
            name="name_ar"
            maxLength={200}
            dir="rtl"
            defaultValue={product?.name_ar ?? ""}
            placeholder="مثال: فحمات فرامل أمامية"
            className={inputClass}
          />
          <span className="mt-1 block text-xs text-gray-500">
            Shown to visitors browsing in Arabic. Leave empty to show the
            English name.
          </span>
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
          <select
            name="category"
            defaultValue={product?.category ?? ""}
            className={inputClass}
          >
            <option value="">No category</option>
            {catalog.categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
                {category.name_ar ? ` – ${category.name_ar}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-gray-700">
            Other part numbers
          </span>
          <textarea
            name="alt_part_numbers"
            rows={2}
            defaultValue={product?.alt_part_numbers?.join("\n") ?? ""}
            placeholder={"One per line or separated by commas, e.g.\n41060-4M490, 05.60.042"}
            className={inputClass}
          />
          <span className="mt-1 block text-xs text-gray-500">
            Other numbers this part is sold under (OEM or other brands). Customers
            can search by any of them.
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Brand *</span>
          <select
            name="brand"
            required
            value={brand}
            onChange={(event) => {
              setBrand(event.target.value);
              setModel("");
            }}
            className={inputClass}
          >
            <option value="" disabled>
              Choose a brand
            </option>
            {catalog.brands.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
                {item.name_ar ? ` – ${item.name_ar}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Car model *
          </span>
          <select
            name="car_model"
            required
            value={model}
            onChange={(event) => setModel(event.target.value)}
            disabled={!brand}
            className={inputClass}
          >
            <option value="" disabled>
              {brand ? "Choose a model" : "Choose a brand first"}
            </option>
            {models.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
                {item.name_ar ? ` – ${item.name_ar}` : ""}
              </option>
            ))}
          </select>
        </label>

        <p className="text-xs text-gray-500 sm:col-span-2">
          Missing a brand, model or category?{" "}
          <Link href="/admin/catalog" className="text-orange-700 hover:underline">
            Add it on the Catalog page
          </Link>{" "}
          first.
        </p>

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
          <span className="text-sm font-medium text-gray-700">Main photo</span>
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
          <PhotoPicker />
          <p className="mt-1 text-xs text-gray-500">
            JPEG, PNG or WebP, up to 5 MB. &quot;Take photo&quot; opens the
            camera on a phone or tablet.
            {product?.image_url && " A new photo replaces the current one."}
          </p>
        </div>

        <ExtraPhotos
          existing={product?.extra_image_urls ?? []}
          files={extraFiles}
          onFilesChange={setExtraFiles}
        />

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

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-gray-700">
            Description in Arabic (optional)
          </span>
          <textarea
            name="description_ar"
            rows={4}
            maxLength={2000}
            dir="rtl"
            defaultValue={product?.description_ar ?? ""}
            placeholder="الوصف بالعربي"
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
          disabled={busy}
          className="rounded-lg bg-orange-500 px-5 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {busy ? "Saving…" : product ? "Save changes" : "Add product"}
        </button>
        <Link href="/admin" className="text-sm text-gray-600 hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
