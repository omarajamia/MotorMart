"use client";

import { useActionState } from "react";
import { deleteProduct } from "@/app/admin/actions";
import { messages, type Lang } from "@/lib/i18n";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

export default function DeleteProductButton({
  id,
  name,
  lang = "en",
}: {
  id: string;
  name: string;
  lang?: Lang;
}) {
  const t = messages[lang];
  const [state, formAction, pending] = useActionState(
    deleteProduct,
    initialState
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(t.deleteConfirm(name))) {
          event.preventDefault();
        }
      }}
      className="rounded-xl border border-red-200 bg-red-50 p-5"
    >
      <input type="hidden" name="id" value={id} />
      <h2 className="font-semibold text-red-800">{t.deleteTitle}</h2>
      <p className="mt-1 text-sm text-red-700">{t.deleteIntro}</p>
      {state.error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
      >
        {pending ? t.deleting : t.deleteButton}
      </button>
    </form>
  );
}
