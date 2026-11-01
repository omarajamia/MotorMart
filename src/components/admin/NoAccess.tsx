import LogoutButton from "@/components/admin/LogoutButton";

export default function NoAccess({ email }: { email?: string }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <h1 className="text-xl font-semibold text-red-800">No admin access</h1>
      <p className="mt-2 text-sm text-red-700">
        {email} is signed in but isn&apos;t on the admin list.
      </p>
      <div className="mt-4 flex justify-center">
        <LogoutButton />
      </div>
    </div>
  );
}
