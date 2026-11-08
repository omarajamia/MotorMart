// Text for the customer-facing shop in Arabic and English. The admin area
// stays in English.

import type { Catalog } from "@/lib/catalog";
import type { Product } from "@/lib/types";

export type Lang = "ar" | "en";

export const LANG_COOKIE = "lang";
export const DEFAULT_LANG: Lang = "ar";

// The store's name in each language.
export const SITE_NAME = {
  ar: "السوق الاردني لقطع السيارات",
  en: "Jordan Auto Parts Market",
} as const;

export function isLang(value: unknown): value is Lang {
  return value === "ar" || value === "en";
}

const en = {
  dir: "ltr" as "ltr" | "rtl",
  switchLanguage: "عربي",
  tagline: "Spare parts for your vehicle",
  heroTitle: "Find the right part for your car",
  heroIntro: "Browse spare parts and check prices and stock.",
  loadFailed: "We couldn't load products right now. Please try again shortly.",
  noProductsTitle: "No products yet",
  noProductsBody: "There are no products to show yet. Please check back soon.",
  siteName: SITE_NAME.en as string,
  footer: `${SITE_NAME.en} · Spare parts made easier`,

  // Contact bar and WhatsApp
  contactBar: "Can't find your part? Send us the part and your car model on WhatsApp:",
  askOnWhatsapp: "Ask us on WhatsApp",
  whatsappGeneric:
    `Hi ${SITE_NAME.en}, I'm looking for a part I couldn't find on your website:`,
  whatsappLookingFor: (part: string) =>
    `Hi ${SITE_NAME.en}, I couldn't find this part on your website: ${part}. Do you have it?`,

  // Search and filters
  searchPlaceholder: "Search name or part number...",
  allBrands: "All brands",
  allModels: "All models",
  inStockOnly: "Show in-stock products only",
  found: (count: number) => `${count} product(s) found`,
  clearFilters: "Clear filters",
  noMatchesTitle: "No matching products",
  noMatchesBody:
    "Try another search or clear your filters. Still can't find it? Ask us and we'll check if we can get it for you.",

  // Product card
  noImage: "No image available",
  partNumber: "Part number",
  otherPartNumbers: "Other part numbers",
  carModel: "Car model",
  category: "Category",
  currency: "JOD",
  inStock: (count: number) => `In stock: ${count}`,
  outOfStock: "Out of stock",

  // Product page
  backToProducts: "← Back to products",
  years: "Years",
  yearsRange: (from: number | null, to: number | null) =>
    from && to ? `${from} – ${to}` : from ? `From ${from}` : `Up to ${to}`,
  description: "Description",
  orderOnWhatsapp: "Order on WhatsApp",
  whatsappOrder: (name: string, part: string) =>
    `Hi ${SITE_NAME.en}, I'd like to order: ${name} (part number ${part}). Is it available?`,
  productNotFound: "This product doesn't exist or is no longer available.",
};

export type Messages = typeof en;

const ar: Messages = {
  dir: "rtl",
  switchLanguage: "English",
  tagline: "قطع غيار لسيارتك",
  heroTitle: "ابحث عن القطعة المناسبة لسيارتك",
  heroIntro: "تصفّح قطع الغيار واطّلع على الأسعار والكميات المتوفرة.",
  loadFailed: "تعذّر تحميل المنتجات الآن. حاول مرة أخرى بعد قليل.",
  noProductsTitle: "لا توجد منتجات بعد",
  noProductsBody: "لا توجد منتجات لعرضها حالياً. تفقّدنا قريباً.",
  siteName: SITE_NAME.ar,
  footer: `${SITE_NAME.ar} · قطع الغيار بسهولة`,

  contactBar: "ما لقيت القطعة؟ ابعثلنا اسم القطعة وموديل سيارتك على واتساب:",
  askOnWhatsapp: "اسألنا على واتساب",
  whatsappGeneric: `مرحباً ${SITE_NAME.ar}، أبحث عن قطعة لم أجدها على موقعكم:`,
  whatsappLookingFor: (part) =>
    `مرحباً ${SITE_NAME.ar}، لم أجد هذه القطعة على موقعكم: ${part}. هل هي متوفرة لديكم؟`,

  searchPlaceholder: "ابحث بالاسم أو رقم القطعة...",
  allBrands: "كل الشركات",
  allModels: "كل الموديلات",
  inStockOnly: "إظهار المنتجات المتوفرة فقط",
  found: (count) => `${count} منتج`,
  clearFilters: "مسح الفلاتر",
  noMatchesTitle: "لا توجد منتجات مطابقة",
  noMatchesBody:
    "جرّب بحثاً آخر أو امسح الفلاتر. ما زلت لا تجدها؟ اسألنا ونشوف إذا بنقدر نوفّرها لك.",

  noImage: "لا توجد صورة",
  partNumber: "رقم القطعة",
  otherPartNumbers: "أرقام أخرى للقطعة",
  carModel: "موديل السيارة",
  category: "التصنيف",
  currency: "د.أ",
  inStock: (count) => `متوفر: ${count}`,
  outOfStock: "غير متوفر",

  backToProducts: "→ العودة إلى المنتجات",
  years: "سنوات الصنع",
  yearsRange: (from, to) =>
    from && to ? `${from} – ${to}` : from ? `من ${from}` : `حتى ${to}`,
  description: "الوصف",
  orderOnWhatsapp: "اطلب عبر واتساب",
  whatsappOrder: (name, part) =>
    `مرحباً ${SITE_NAME.ar}، أريد طلب هذه القطعة: ${name} (رقم القطعة ${part}). هل هي متوفرة؟`,
  productNotFound: "هذا المنتج غير موجود أو لم يعد متوفراً.",
};

export const messages: Record<Lang, Messages> = { en, ar };

// A brand, car model or category name in the chosen language, from the
// Catalog lists. Falls back to the English name.
export function catalogName(
  item: { name: string; name_ar: string | null } | undefined,
  fallback: string,
  lang: Lang
) {
  if (!item) return fallback;
  return lang === "ar" ? item.name_ar || item.name : item.name;
}

// A brand or car model name in both languages, the chosen one first, e.g.
// "كيا (Kia)" or "Kia (كيا)". Just the name when there is no Arabic one.
export function bothNames(
  item: { name: string; name_ar: string | null },
  lang: Lang
) {
  if (!item.name_ar) return item.name;
  return lang === "ar"
    ? `${item.name_ar} (${item.name})`
    : `${item.name} (${item.name_ar})`;
}

// A product's text in the chosen language, with the brand, car model and
// category names taken from the Catalog. Arabic falls back to English when
// the Arabic version hasn't been filled in.
export function localize(product: Product, lang: Lang, catalog: Catalog) {
  const brand = catalog.brands.find((b) => b.name === product.brand);
  const model = catalog.models.find(
    (m) => m.brand_id === brand?.id && m.name === product.car_model
  );
  const category = catalog.categories.find((c) => c.name === product.category);

  return {
    name: lang === "ar" ? product.name_ar || product.name : product.name,
    description:
      lang === "ar"
        ? product.description_ar || product.description
        : product.description,
    brand: catalogName(brand, product.brand, lang),
    model: catalogName(model, product.car_model, lang),
    category: product.category
      ? catalogName(category, product.category, lang)
      : null,
    // Both languages, so search works whichever one the visitor types in.
    searchText: [
      product.name,
      product.name_ar,
      product.part_number,
      ...(product.alt_part_numbers ?? []),
      product.brand,
      brand?.name_ar,
      product.car_model,
      model?.name_ar,
      product.category,
      category?.name_ar,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  };
}
