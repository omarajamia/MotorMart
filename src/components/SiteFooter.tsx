import { CONTACT_PHONE_DISPLAY } from "@/lib/contact";
import { messages, type Lang } from "@/lib/i18n";

// Footer of the shop pages, with the WhatsApp number. Extra space at the
// bottom keeps it clear of the floating WhatsApp button.
export default function SiteFooter({ lang }: { lang: Lang }) {
  const t = messages[lang];

  return (
    <footer className="border-t bg-white px-6 pb-24 pt-6 text-center text-sm text-gray-500">
      <p>
        {t.contactBar}{" "}
        <span dir="ltr" className="font-semibold text-gray-700">
          {CONTACT_PHONE_DISPLAY}
        </span>
      </p>
      <p className="mt-2">{t.footer}</p>
    </footer>
  );
}
