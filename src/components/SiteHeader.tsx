import Link from "next/link";
import LanguageSwitch from "@/components/LanguageSwitch";
import {
  CONTACT_PHONE_DISPLAY,
  partRequestMessage,
  whatsappLink,
} from "@/lib/contact";
import { messages, type Lang } from "@/lib/i18n";

// The WhatsApp contact bar and store header shown on every shop page.
export default function SiteHeader({ lang }: { lang: Lang }) {
  const t = messages[lang];

  return (
    <>
      <div className="bg-green-700 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6 py-2 text-sm">
          <p>
            {t.contactBar}{" "}
            <span dir="ltr" className="font-semibold">
              {CONTACT_PHONE_DISPLAY}
            </span>
          </p>
          <a
            href={whatsappLink(partRequestMessage(lang))}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white px-4 py-1 font-medium text-green-800 hover:bg-green-50"
          >
            {t.askOnWhatsapp}
          </a>
        </div>
      </div>

      <header className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link href="/">
            <h1 className="text-2xl font-bold text-orange-400">{t.siteName}</h1>
            <p className="mt-1 text-sm text-gray-300">{t.tagline}</p>
          </Link>
          <LanguageSwitch lang={lang} />
        </div>
      </header>
    </>
  );
}
