import "server-only";

import { cookies } from "next/headers";
import { DEFAULT_SHOP_LANG, isLang, LANG_COOKIE, type Lang } from "@/lib/i18n";

// The shop area's language, chosen with the language switch.
export async function getShopLang(): Promise<Lang> {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(value) ? value : DEFAULT_SHOP_LANG;
}
