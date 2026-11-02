import LoginForm from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <div>
      <h1 className="text-center text-2xl font-bold">Admin sign in</h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        Staff only. Accounts are created by the store owner.
      </p>
      <LoginForm />
    </div>
  );
}
