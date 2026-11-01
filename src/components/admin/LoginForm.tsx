"use client";

import { useActionState } from "react";
import { adminLogin, shopLogin } from "@/app/admin/actions";
import { messages, type Lang } from "@/lib/i18n";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

export default function LoginForm({
  area,
  lang = "en",
}: {
  area: "admin" | "shop";
  lang?: Lang;
}) {
  const t = messages[lang];
  const [state, formAction, pending] = useActionState(
    area === "shop" ? shopLogin : adminLogin,
    initialState
  );

  return (
    <form
      action={formAction}
      className="mx-auto mt-6 max-w-sm space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <label className="block">
        <span className="text-sm font-medium text-gray-700">{t.email}</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          dir="ltr"
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-orange-500"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">{t.password}</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          dir="ltr"
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
        {pending ? t.signingIn : t.signIn}
      </button>
    </form>
  );
}
