"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addProductOrigin } from "@/app/admin/actions";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

// On the edit page: the other origins (صناعات) of the same part, and a button
// to add one more.
export default function ProductOrigins({
  productId,
  siblings,
}: {
  productId: string;
  siblings: {
    id: string;
    origin: string | null;
    price: number;
    stock_quantity: number;
    is_active: boolean;
  }[];
}) {
  const [state, formAction, pending] = useActionState(
    addProductOrigin,
    initialState
  );

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Origins of this part (صناعات)</h2>
      <p className="mt-1 text-sm text-gray-600">
        Each origin has its own photos, price, stock, cost and store. In the
        shop, the product page lets customers switch between them.
      </p>

      {siblings.length > 0 && (
        <ul className="mt-3 divide-y rounded-lg border text-sm">
          {siblings.map((sibling) => (
            <li key={sibling.id}>
              <Link
                href={`/admin/products/${sibling.id}/edit`}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 hover:bg-gray-50"
              >
                <span className="font-medium text-orange-700">
                  {sibling.origin ?? "Origin not set"}
                </span>
                <span className="text-gray-600">
                  {Number(sibling.price).toFixed(2)} JOD · {sibling.stock_quantity} in
                  stock{sibling.is_active ? "" : " · hidden"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="mt-4">
        <input type="hidden" name="id" value={productId} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-800 hover:bg-orange-100 disabled:opacity-60"
        >
          {pending ? "Copying…" : "+ Add another origin of this part"}
        </button>
        <p className="mt-1 text-xs text-gray-500">
          Copies this part&apos;s details into a new product (hidden from the
          shop) so you only set its origin, photos, price and stock.
        </p>
        {state.error && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {state.error}
          </p>
        )}
      </form>
    </section>
  );
}
