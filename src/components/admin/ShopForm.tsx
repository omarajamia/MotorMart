"use client";

import { useActionState } from "react";
import { createShopWithAccount } from "@/app/admin/shops/actions";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500";

// One form for a new shop and its owner's login.
export default function ShopForm() {
  const [state, formAction, pending] = useActionState(
    createShopWithAccount,
    initialState
  );
  // After an error the form is reset, so refill what was typed (not passwords).
  const values = state.values ?? {};

  return (
    <form
      key={state.success ?? JSON.stringify(values)}
      action={formAction}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-semibold">Add a new shop</h2>
        <p className="mt-1 text-sm text-gray-600">
          Creates the shop and its owner&apos;s login together. The owner then
          signs in at <span className="font-mono">/shop/login</span> with this
          email and password. Share the password with them privately.
        </p>
      </div>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-xs font-medium uppercase text-gray-500">
          Shop details
        </legend>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Shop name *</span>
          <input
            name="name"
            required
            maxLength={100}
            defaultValue={values.name}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Owner&apos;s name *
          </span>
          <input
            name="owner_name"
            required
            maxLength={100}
            defaultValue={values.owner_name}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Phone *</span>
          <input
            type="tel"
            name="phone"
            required
            maxLength={30}
            dir="ltr"
            placeholder="e.g. 0791234567"
            defaultValue={values.phone}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">City</span>
          <input
            name="city"
            maxLength={60}
            defaultValue={values.city}
            className={inputClass}
          />
        </label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-2 text-xs font-medium uppercase text-gray-500">
          Owner&apos;s login
        </legend>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Email *</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="off"
            dir="ltr"
            defaultValue={values.email}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Password * (12+ characters)
          </span>
          <input
            type="password"
            name="password"
            required
            minLength={12}
            maxLength={72}
            autoComplete="new-password"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Confirm password *
          </span>
          <input
            type="password"
            name="confirm_password"
            required
            minLength={12}
            maxLength={72}
            autoComplete="new-password"
            className={inputClass}
          />
        </label>
      </fieldset>

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
        {pending ? "Creating…" : "Create shop and login"}
      </button>
    </form>
  );
}
