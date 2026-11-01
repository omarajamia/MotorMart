import { Suspense } from "react";
import LoginForm from "@/components/admin/LoginForm";
import { messages } from "@/lib/i18n";
import { getShopLang } from "@/lib/i18n-server";

export default function ShopLoginPage() {
  return (
    <Suspense fallback={null}>
      <ShopLogin />
    </Suspense>
  );
}

async function ShopLogin() {
  const lang = await getShopLang();
  const t = messages[lang];
  return (
    <div>
      <h1 className="text-center text-2xl font-bold">{t.shopSignInTitle}</h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        {t.shopSignInIntro}
      </p>
      <LoginForm area="shop" lang={lang} />
    </div>
  );
}
