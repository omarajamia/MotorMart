"use client";

import { useActionState } from "react";
import { createStaffAccount } from "@/app/admin/staff/actions";
import { submitKeepingFields } from "@/lib/form-submit";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500";

export default function StaffForm() {
  const [state, formAction, pending] = useActionState(
    createStaffAccount,
    initialState
  );

  return (
    <form
      // Clear the fields after each successful account.
      key={state.success}
      onSubmit={submitKeepingFields(formAction)}
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold">Add staff account</h2>
      <p className="text-sm text-gray-600">
        The new account can sign in straight away and has full admin access.
        Share the password with them privately.
      </p>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Name</span>
        <input
          name="full_name"
          required
          maxLength={100}
          autoComplete="off"
          className={inputClass}
        />
      </label>

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
