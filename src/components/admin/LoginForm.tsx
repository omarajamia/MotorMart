"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form
      action={formAction}
      className="mx-auto mt-6 max-w-sm space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-orange-500"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-orange-500"
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
