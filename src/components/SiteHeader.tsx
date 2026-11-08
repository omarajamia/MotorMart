import Link from "next/link";
import LanguageSwitch from "@/components/LanguageSwitch";
import {
  CONTACT_PHONE_DISPLAY,
  partRequestMessage,
  whatsappLink,
} from "@/lib/contact";
import { messages, type Lang } from "@/lib/i18n";

// The store header shown on every shop page, plus a WhatsApp button that
// floats in the corner so customers can always reach us without it being
// the first thing on the page.
export default function SiteHeader({ lang }: { lang: Lang }) {
  const t = messages[lang];

  return (
    <>
      <header className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link href="/">
            <h1 className="text-2xl font-bold text-orange-400">{t.siteName}</h1>
            <p className="mt-1 text-sm text-gray-300">{t.tagline}</p>
          </Link>
          <LanguageSwitch lang={lang} />
        </div>
      </header>

      <a
        href={whatsappLink(partRequestMessage(lang))}
        target="_blank"
        rel="noopener noreferrer"
        title={`${t.contactBar} ${CONTACT_PHONE_DISPLAY}`}
        className="fixed bottom-5 end-5 z-50 flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 font-medium text-white shadow-lg hover:bg-green-700"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-current"
        >
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
        </svg>
        {t.askOnWhatsapp}
      </a>
    </>
  );
}
