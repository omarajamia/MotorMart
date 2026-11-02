"use client";

import { useRouter } from "next/navigation";
import { LANG_COOKIE, messages, type Lang } from "@/lib/i18n";

// Switches the shop between Arabic and English and remembers the choice.
export default function LanguageSwitch({ lang }: { lang: Lang }) {
  const router = useRouter();
  const next: Lang = lang === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      onClick={() => {
        document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
        router.refresh();
      }}
      className="rounded-full border border-slate-600 px-4 py-2 text-sm text-gray-200 hover:bg-slate-800"
    >
      {messages[lang].switchLanguage}
    </button>
  );
}
