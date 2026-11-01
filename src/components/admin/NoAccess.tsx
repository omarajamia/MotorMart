import LogoutButton from "@/components/admin/LogoutButton";

export default function NoAccess({ email }: { email?: string }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <h1 className="text-xl font-semibold text-red-800">No access</h1>
      <p className="mt-2 text-sm text-red-700">
        {email} is signed in but doesn&apos;t have access to MotorMart admin.
      </p>
      <div className="mt-4 flex justify-center">
        <LogoutButton />
      </div>
    </div>
  );
}
