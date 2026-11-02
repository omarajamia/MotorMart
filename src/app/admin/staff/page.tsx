import { Suspense } from "react";
import NoAccess from "@/components/admin/NoAccess";
import { createStaffAccount } from "@/app/admin/staff/actions";
import AccountForm from "@/components/admin/AccountForm";
import { requireAccount } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const instant = false;

export default function StaffPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Staff accounts</h1>
      <div className="mt-6">
        <Suspense fallback={<p className="text-gray-600">Loading…</p>}>
          <Staff />
        </Suspense>
      </div>
    </div>
  );
}

async function Staff() {
  const { user, hasAccess, isOwner } = await requireAccount();
  if (!hasAccess) {
    return <NoAccess email={user.email} />;
  }
  if (!isOwner) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white p-5 text-gray-700">
        Only the MotorMart owner can manage staff accounts.
      </p>
    );
  }

  let adminClient;
  try {
    adminClient = createSupabaseAdminClient();
  } catch {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-800">
        Staff accounts aren&apos;t set up yet. Add{" "}
        <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> to{" "}
        <code className="font-mono">.env.local</code> on the server, then
        restart the app.
      </p>
    );
  }

  const [{ data: admins, error }, { data: usersPage }] = await Promise.all([
    adminClient
      .from("admins")
      .select("user_id, role, created_at")
      .order("created_at"),
    adminClient.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  if (error) {
    console.error("Failed to load staff list:", error);
  }

  const emails = new Map(
    (usersPage?.users ?? []).map((account) => [account.id, account.email])
  );

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <h2 className="border-b px-5 py-3 text-sm font-medium uppercase text-gray-500">
          Current admins
        </h2>
        <ul className="divide-y">
          {(admins ?? []).map((admin) => (
            <li
              key={admin.user_id}
              className="flex items-center justify-between px-5 py-3 text-sm"
            >
              <span>
                {emails.get(admin.user_id) ?? "Unknown account"}
                {admin.user_id === user.id && (
                  <span className="ml-2 text-xs text-gray-500">(you)</span>
                )}
              </span>
              <span
                className={
                  admin.role === "owner"
                    ? "rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800"
                    : "rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                }
              >
                {admin.role === "owner" ? "Owner" : "Staff"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <AccountForm
        action={createStaffAccount}
        title="Add staff account"
        description="For MotorMart team members. They can sign in straight away and manage every shop's products. Share the password with them privately."
      />
    </div>
  );
}
