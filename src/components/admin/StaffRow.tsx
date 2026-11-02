"use client";

import { useActionState, useState } from "react";
import {
  deleteStaffAccount,
  updateStaffAccount,
} from "@/app/admin/staff/actions";
import { submitKeepingFields } from "@/lib/form-submit";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500";

export default function StaffRow({
  userId,
  name,
  email,
  role,
  isSelf,
}: {
  userId: string;
  name?: string;
  email?: string;
  role: string;
  isSelf: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [saveState, saveAction, saving] = useActionState(
    updateStaffAccount,
    initialState
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteStaffAccount,
    initialState
  );
  const canDelete = !isSelf && role !== "owner";

  return (
    <li className="px-5 py-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>
          <span className="font-medium text-gray-900">
            {name ?? "No name yet"}
          </span>
          {isSelf && <span className="ml-2 text-xs text-gray-500">(you)</span>}
          <span className="block text-xs text-gray-500">
            {email ?? "Unknown account"}
          </span>
        </span>

        <div className="flex items-center gap-2">
          <span
            className={
              role === "owner"
                ? "rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800"
                : "rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
            }
          >
            {role === "owner" ? "Owner" : "Staff"}
          </span>
          <button
            type="button"
            onClick={() => setEditing((open) => !open)}
            className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100"
          >
            {editing ? "Close" : "Edit"}
          </button>
          {canDelete && (
            <form
              action={deleteAction}
              onSubmit={(event) => {
                if (
                  !window.confirm(
                    `Delete ${name ?? email}? They will no longer be able to sign in. This can't be undone.`
                  )
                ) {
                  event.preventDefault();
                }
              }}
            >
              <input type="hidden" name="user_id" value={userId} />
              <button
                type="submit"
                disabled={deleting}
                className="rounded-md border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </form>
          )}
        </div>
      </div>

      {deleteState.error && (
        <p role="alert" className="mt-2 text-red-600">
          {deleteState.error}
        </p>
      )}

      {editing && (
        <form
          onSubmit={submitKeepingFields(saveAction)}
          className="mt-3 grid gap-3 rounded-lg bg-gray-50 p-4 sm:grid-cols-3"
        >
          <input type="hidden" name="user_id" value={userId} />
          <label className="block">
            <span className="font-medium text-gray-700">Name</span>
            <input
              name="full_name"
              required
              maxLength={100}
              defaultValue={name}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="font-medium text-gray-700">Email</span>
            <input
              type="email"
              name="email"
              required
              defaultValue={email}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="font-medium text-gray-700">New password</span>
            <input
              type="password"
              name="password"
              minLength={12}
              maxLength={72}
              autoComplete="new-password"
              placeholder="Leave empty to keep"
              className={inputClass}
            />
          </label>
          <div className="flex items-center gap-3 sm:col-span-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {saveState.error && (
              <span role="alert" className="text-red-600">
                {saveState.error}
              </span>
            )}
            {saveState.success && (
              <span role="status" className="text-green-700">
                {saveState.success}
              </span>
            )}
          </div>
        </form>
      )}
    </li>
  );
}
