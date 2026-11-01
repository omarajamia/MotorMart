import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import LanguageSwitch from "@/components/shop/LanguageSwitch";
import { messages } from "@/lib/i18n";
import { getShopLang } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "MotorMart – Shop owners",
  robots: { index: false, follow: false },
};

export default function ShopLayout({ children }: LayoutProps<"/shop">) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Suspense fallback={<ShopFrame>{null}</ShopFrame>}>
        <LocalizedShopFrame>{children}</LocalizedShopFrame>
      </Suspense>
    </div>
  );
}

// The language comes from a cookie, so it is read inside a Suspense boundary.
async function LocalizedShopFrame({ children }: { children: ReactNode }) {
  const lang = await getShopLang();
  return (
    <ShopFrame lang={lang}>{children}</ShopFrame>
  );
}

function ShopFrame({
  lang = "ar",
  children,
}: {
  lang?: "ar" | "en";
  children: ReactNode;
}) {
  const t = messages[lang];
  return (
    <div dir={t.dir} lang={lang}>
      <header className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <p className="text-xl font-bold" dir="ltr">
            Motor<span className="text-orange-400">Mart</span>
          </p>
          <nav className="flex items-center gap-4 text-sm text-gray-300">
            <Link href="/" className="hover:text-white">
              {t.viewShop}
            </Link>
            <LanguageSwitch lang={lang} />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
