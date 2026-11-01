import Link from "next/link";
import LoginForm from "@/components/admin/LoginForm";
import { messages } from "@/lib/i18n";

const t = messages.en;

export default function AdminLoginPage() {
  return (
    <div>
      <h1 className="text-center text-2xl font-bold">{t.adminSignInTitle}</h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        {t.adminSignInIntro}
      </p>
      <LoginForm area="admin" />
      <p className="mt-4 text-center text-sm">
        <Link href="/shop/login" className="text-orange-700 hover:underline">
          {t.shopLoginLink}
        </Link>
      </p>
    </div>
  );
}
