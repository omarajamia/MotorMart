"use client";

import { useActionState, useState } from "react";
import {
  deleteCatalogItem,
  updateCatalogItem,
} from "@/app/admin/catalog/actions";
import { deleteStore, updateStore } from "@/app/admin/catalog/store-actions";
import { submitKeepingFields } from "@/lib/form-submit";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500";

// One brand, car model, category or store, with inline Edit and Delete.
// Stores have a "Phone / location" note instead of an Arabic name.
export default function CatalogRow({
  kind,
  id,
  name,
  nameAr,
  productCount,
}: {
  kind: "brand" | "model" | "category" | "store";
  id: string;
  name: string;
  nameAr: string | null;
  productCount: number;
}) {
  const isStore = kind === "store";
  const [editing, setEditing] = useState(false);
  const [saveState, saveAction, saving] = useActionState(
    kind === "store" ? updateStore : updateCatalogItem,
    initialState
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    kind === "store" ? deleteStore : deleteCatalogItem,
    initialState
  );

  return (
    <li className="px-5 py-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>
          <span className="font-medium text-gray-900">{name}</span>
          {nameAr && (
            <span className="ml-2 text-gray-600" dir={isStore ? "auto" : "rtl"}>
              {nameAr}
            </span>
          )}
          <span className="ml-2 text-xs text-gray-500">
            {productCount} product(s)
          </span>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing((open) => !open)}
            className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100"
          >
            {editing ? "Close" : "Edit"}
          </button>
          <form
            action={deleteAction}
            onSubmit={(event) => {
              if (!window.confirm(`Delete ${name}?`)) event.preventDefault();
            }}
          >
            <input type="hidden" name="kind" value={kind} />
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              disabled={deleting}
              className="rounded-md border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </form>
        </div>
      </div>

      {deleteState.error && (
        <p role="alert" className="mt-2 text-red-600">
          {deleteState.error}
        </p>
      )}

      {editing && (
        <form
          onSubmit={submitKeepingFields(saveAction)}
          className="mt-3 grid gap-3 rounded-lg bg-gray-50 p-4 sm:grid-cols-2"
        >
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="id" value={id} />
          <label className="block">
            <span className="font-medium text-gray-700">
              {isStore ? "Name" : "Name (English)"}
            </span>
            <input
              name="name"
              required
              defaultValue={name}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="font-medium text-gray-700">
              {isStore ? "Phone / location" : "Name (Arabic)"}
            </span>
            <input
              name={isStore ? "details" : "name_ar"}
              dir={isStore ? "auto" : "rtl"}
              defaultValue={nameAr ?? ""}
              className={inputClass}
            />
          </label>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {productCount > 0 && !isStore && (
              <span className="text-xs text-gray-500">
                Renaming also updates its {productCount} product(s).
              </span>
            )}
            {saveState.error && (
              <span role="alert" className="text-red-600">
                {saveState.error}
              </span>
            )}
            {saveState.success && (
              <span role="status" className="text-green-700">
                {saveState.success}
              </span>
            )}
          </div>
        </form>
      )}
    </li>
  );
}
