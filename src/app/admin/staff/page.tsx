import { Suspense } from "react";
import NoAccess from "@/components/admin/NoAccess";
import StaffForm from "@/components/admin/StaffForm";
import StaffRow from "@/components/admin/StaffRow";
import { getAdmin } from "@/lib/admin";
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
  const { user, isAdmin, isOwner } = await getAdmin();
  if (!isAdmin) {
    return <NoAccess email={user.email} />;
  }
  if (!isOwner) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white p-5 text-gray-700">
        Only the store owner can manage staff accounts.
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

  const accounts = new Map(
    (usersPage?.users ?? []).map((account) => [
      account.id,
      {
        name: account.user_metadata?.full_name as string | undefined,
        email: account.email,
      },
    ])
  );

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <h2 className="border-b px-5 py-3 text-sm font-medium uppercase text-gray-500">
          Current admins
        </h2>
        <ul className="divide-y">
          {(admins ?? []).map((admin) => (
            <StaffRow
              key={admin.user_id}
              userId={admin.user_id}
              name={accounts.get(admin.user_id)?.name}
              email={accounts.get(admin.user_id)?.email}
              role={admin.role}
              isSelf={admin.user_id === user.id}
            />
          ))}
        </ul>
      </div>

      <StaffForm />
    </div>
  );
}
