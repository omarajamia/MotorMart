// How customers reach the store, e.g. to ask about a part that isn't listed.

import { messages, type Lang } from "@/lib/i18n";

// Jordanian mobile 0788578089 in international format (no + or leading 0),
// as WhatsApp links require.
const WHATSAPP_NUMBER = "962788578089";

export const CONTACT_PHONE_DISPLAY = "0788578089";

// A link that opens a WhatsApp chat with the store, with `message` typed in.
export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// The pre-filled message, in the visitor's language, for a customer asking
// about a part we don't list.
export function partRequestMessage(lang: Lang, lookingFor = "") {
  const t = messages[lang];
  return lookingFor ? t.whatsappLookingFor(lookingFor) : t.whatsappGeneric;
}
