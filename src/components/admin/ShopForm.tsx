"use client";

import { useActionState } from "react";
import { createShop } from "@/app/admin/shops/actions";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500";

export default function ShopForm() {
  const [state, formAction, pending] = useActionState(createShop, initialState);

  return (
    <form
      // Clear the fields after each new shop.
      key={state.success}
      action={formAction}
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold">Add shop</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Shop name *</span>
          <input name="name" required maxLength={100} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Phone</span>
          <input
            type="tel"
            name="phone"
            maxLength={30}
            placeholder="e.g. 0791234567"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">City</span>
          <input name="city" maxLength={60} className={inputClass} />
        </label>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-green-700">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-orange-500 px-5 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add shop"}
      </button>
    </form>
  );
}
