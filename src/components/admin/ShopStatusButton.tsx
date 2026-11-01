"use client";

import { useActionState } from "react";
import { setShopActive } from "@/app/admin/shops/actions";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

export default function ShopStatusButton({
  shopId,
  isActive,
}: {
  shopId: string;
  isActive: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    setShopActive,
    initialState
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="shop_id" value={shopId} />
      <input type="hidden" name="is_active" value={isActive ? "false" : "true"} />
      <span
        className={
          isActive
            ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
            : "rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700"
        }
      >
        {isActive ? "Active" : "Hidden"}
      </span>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-60"
      >
        {isActive ? "Hide shop" : "Show shop"}
      </button>
      {state.error && (
        <span role="alert" className="text-sm text-red-600">
          {state.error}
        </span>
      )}
    </form>
  );
}
