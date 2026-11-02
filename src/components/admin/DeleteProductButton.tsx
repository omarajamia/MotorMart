"use client";

import { useActionState } from "react";
import { deleteProduct } from "@/app/admin/actions";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

export default function DeleteProductButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [state, formAction, pending] = useActionState(
    deleteProduct,
    initialState
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Permanently delete "${name}"? This can't be undone.\n\nTip: use "Hide" instead if you might sell it again.`
        );
        if (!confirmed) {
          event.preventDefault();
        }
      }}
      className="rounded-xl border border-red-200 bg-red-50 p-5"
    >
      <input type="hidden" name="id" value={id} />
      <h2 className="font-semibold text-red-800">Delete product</h2>
      <p className="mt-1 text-sm text-red-700">
        Removes it from the database permanently. To take it off the shop
        temporarily, untick &quot;Show this product in the shop&quot; instead.
      </p>
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
        {pending ? "Deleting…" : "Delete permanently"}
      </button>
    </form>
  );
}
