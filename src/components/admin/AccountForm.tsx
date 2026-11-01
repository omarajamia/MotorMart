"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500";

// Email + password form for creating a login (MotorMart staff or a shop
// account). `shopId` is sent along when the account belongs to a shop.
export default function AccountForm({
  action,
  title,
  description,
  shopId,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  title: string;
  description: string;
  shopId?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form
      // Clear the fields after each successful account.
      key={state.success}
      action={formAction}
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {shopId && <input type="hidden" name="shop_id" value={shopId} />}
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="off"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">
          Password (at least 12 characters)
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
          Confirm password
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
        {pending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}
