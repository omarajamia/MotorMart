// Text for the shop area (Arabic and English) and the admin area (English).
// Shop pages pick the language from the "lang" cookie; admin pages use "en".

export type Lang = "ar" | "en";

export const LANG_COOKIE = "lang";
export const DEFAULT_SHOP_LANG: Lang = "ar";

export function isLang(value: unknown): value is Lang {
  return value === "ar" || value === "en";
}

const en = {
  dir: "ltr" as "ltr" | "rtl",
  switchLanguage: "عربي",

  // Sign in
  shopSignInTitle: "Shop owner sign in",
  shopSignInIntro: "Sign in to manage your shop's products.",
  adminSignInTitle: "Admin sign in",
  adminSignInIntro: "MotorMart team only. Shop owners sign in at the shop login.",
  shopLoginLink: "Shop owners: sign in here",
  email: "Email",
  password: "Password",
  signIn: "Sign in",
  signingIn: "Signing in…",
  logOut: "Log out",
  viewShop: "View shop",

  // Product list
  products: "Products",
  shopProducts: (shop: string) => `${shop} – Products`,
  allShopsProducts: "All shops – Products",
  signedInAs: (email: string, count: number) =>
    `Signed in as ${email} · ${count} product(s)`,
  addProduct: "+ Add product",
  productColumn: "Product",
  priceStockColumn: "Price & stock",
  visibilityColumn: "Shop visibility",
  noProducts: "No products yet.",
  loadFailed: "Couldn't load products. Please try again shortly.",
  currency: "JOD",
  inStock: "in stock",
  save: "Save",
  saving: "Saving…",
  saved: "Saved",
  visible: "Visible",
  hidden: "Hidden",
  hide: "Hide",
  show: "Show",

  // Product form
  addProductTitle: "Add product",
  editProductTitle: "Edit product",
  loading: "Loading…",
  shop: "Shop *",
  chooseShop: "Choose a shop",
  name: "Name *",
  namePlaceholder: "e.g. Front brake pads",
  partNumber: "Part number *",
  category: "Category",
  categoryPlaceholder: "e.g. Brakes",
  brand: "Brand *",
  chooseBrand: "Choose a brand",
  carModel: "Car model *",
  carModelPlaceholder: "e.g. Cerato",
  yearFrom: "Year from",
  yearTo: "Year to",
  price: "Price (JOD) *",
  stock: "Stock quantity *",
  photo: "Photo",
  removePhoto: "Remove current photo",
  photoHint: "JPEG, PNG or WebP, up to 5 MB.",
  photoReplaceHint: " Choosing a new photo replaces the current one.",
  description: "Description",
  descriptionPlaceholder:
    "What the part is, what it fits, any notes for customers",
  showInShop: "Show this product in the shop",
  saveChanges: "Save changes",
  cancel: "Cancel",
  productMissing: "This product doesn't exist (it may have been deleted).",

  // Delete
  deleteTitle: "Delete product",
  deleteIntro:
    'Removes it from the database permanently. To take it off the shop temporarily, untick "Show this product in the shop" instead.',
  deleteConfirm: (name: string) =>
    `Permanently delete "${name}"? This can't be undone.\n\nTip: use "Hide" instead if you might sell it again.`,
  deleteButton: "Delete permanently",
  deleting: "Deleting…",

  // Access
  noAccessTitle: "No access",
  noAccessBody: (email: string) =>
    `${email} is signed in but doesn't have access here.`,

  // Messages from the server
  errors: {
    enterEmailPassword: "Enter your email and password.",
    wrongLogin: "Wrong email or password.",
    noAccess: "You don't have access.",
    notAShop: "This account isn't linked to a shop.",
    useShopLogin: "Shop accounts sign in at the shop login page.",
    unknownProduct: "Unknown product.",
    productGone: "This product no longer exists.",
    chooseShop: "Choose a shop.",
    duplicatePart: "This shop already has a product with this part number.",
    saveFailed: "Couldn't save. Please try again.",
    deleteFailed: "Couldn't delete. Please try again.",
    visibilityFailed: "Couldn't change visibility. Please try again.",
    uploadFailed: "Couldn't upload the image. Please try again.",
    imageType: "Image must be a JPEG, PNG or WebP file.",
    imageSize: "Image must be 5 MB or smaller.",
    name: "Enter a product name (up to 200 characters).",
    partNumber: "Enter a part number (up to 100 characters).",
    brand: "Choose a brand.",
    carModel: "Enter the car model (up to 100 characters).",
    years: (min: number, max: number) =>
      `Years must be between ${min} and ${max}.`,
    yearOrder: "“Year from” can't be after “Year to”.",
    category: "Category can be up to 100 characters.",
    description: "Description can be up to 2000 characters.",
    price: "Price must be a number of 0 or more.",
    stock: "Stock must be a whole number of 0 or more.",
  },
};

export type Messages = typeof en;
export type ErrorMessages = Messages["errors"];

const ar: Messages = {
  dir: "rtl",
  switchLanguage: "English",

  shopSignInTitle: "دخول أصحاب المحلات",
  shopSignInIntro: "سجّل دخولك لإدارة منتجات محلك.",
  adminSignInTitle: "دخول الإدارة",
  adminSignInIntro: "لفريق MotorMart فقط. أصحاب المحلات يدخلون من صفحة دخول المحلات.",
  shopLoginLink: "أصحاب المحلات: سجّلوا الدخول من هنا",
  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  signIn: "تسجيل الدخول",
  signingIn: "جارٍ تسجيل الدخول…",
  logOut: "تسجيل الخروج",
  viewShop: "عرض الموقع",

  products: "المنتجات",
  shopProducts: (shop) => `${shop} – المنتجات`,
  allShopsProducts: "كل المحلات – المنتجات",
  signedInAs: (email, count) => `مسجّل الدخول باسم ${email} · ${count} منتج`,
  addProduct: "+ إضافة منتج",
  productColumn: "المنتج",
  priceStockColumn: "السعر والكمية",
  visibilityColumn: "الظهور في الموقع",
  noProducts: "لا توجد منتجات بعد.",
  loadFailed: "تعذّر تحميل المنتجات. حاول مرة أخرى بعد قليل.",
  currency: "د.أ",
  inStock: "متوفر",
  save: "حفظ",
  saving: "جارٍ الحفظ…",
  saved: "تم الحفظ",
  visible: "ظاهر",
  hidden: "مخفي",
  hide: "إخفاء",
  show: "إظهار",

  addProductTitle: "إضافة منتج",
  editProductTitle: "تعديل المنتج",
  loading: "جارٍ التحميل…",
  shop: "المحل *",
  chooseShop: "اختر المحل",
  name: "اسم المنتج *",
  namePlaceholder: "مثال: فحمات فرامل أمامية",
  partNumber: "رقم القطعة *",
  category: "التصنيف",
  categoryPlaceholder: "مثال: فرامل",
  brand: "الشركة *",
  chooseBrand: "اختر الشركة",
  carModel: "موديل السيارة *",
  carModelPlaceholder: "مثال: سيراتو",
  yearFrom: "من سنة",
  yearTo: "إلى سنة",
  price: "السعر (د.أ) *",
  stock: "الكمية المتوفرة *",
  photo: "الصورة",
  removePhoto: "حذف الصورة الحالية",
  photoHint: "JPEG أو PNG أو WebP، بحد أقصى 5 ميغابايت.",
  photoReplaceHint: " اختيار صورة جديدة يستبدل الصورة الحالية.",
  description: "الوصف",
  descriptionPlaceholder: "ما هي القطعة، ولأي سيارة تناسب، وأي ملاحظات للزبائن",
  showInShop: "إظهار هذا المنتج في الموقع",
  saveChanges: "حفظ التعديلات",
  cancel: "إلغاء",
  productMissing: "هذا المنتج غير موجود (ربما تم حذفه).",

  deleteTitle: "حذف المنتج",
  deleteIntro:
    "يحذف المنتج من قاعدة البيانات نهائياً. لإخفائه مؤقتاً، ألغِ تحديد «إظهار هذا المنتج في الموقع» بدلاً من ذلك.",
  deleteConfirm: (name) =>
    `حذف «${name}» نهائياً؟ لا يمكن التراجع عن ذلك.\n\nنصيحة: استخدم «إخفاء» إذا كنت قد تبيعه مرة أخرى.`,
  deleteButton: "حذف نهائياً",
  deleting: "جارٍ الحذف…",

  noAccessTitle: "لا توجد صلاحية",
  noAccessBody: (email) => `${email} مسجّل الدخول لكن ليس لديه صلاحية هنا.`,

  errors: {
    enterEmailPassword: "أدخل البريد الإلكتروني وكلمة المرور.",
    wrongLogin: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    noAccess: "ليس لديك صلاحية.",
    notAShop: "هذا الحساب غير مرتبط بأي محل.",
    useShopLogin: "حسابات المحلات تسجّل الدخول من صفحة دخول المحلات.",
    unknownProduct: "منتج غير معروف.",
    productGone: "هذا المنتج لم يعد موجوداً.",
    chooseShop: "اختر المحل.",
    duplicatePart: "لدى هذا المحل منتج آخر بنفس رقم القطعة.",
    saveFailed: "تعذّر الحفظ. حاول مرة أخرى.",
    deleteFailed: "تعذّر الحذف. حاول مرة أخرى.",
    visibilityFailed: "تعذّر تغيير الظهور. حاول مرة أخرى.",
    uploadFailed: "تعذّر رفع الصورة. حاول مرة أخرى.",
    imageType: "يجب أن تكون الصورة بصيغة JPEG أو PNG أو WebP.",
    imageSize: "يجب ألا يتجاوز حجم الصورة 5 ميغابايت.",
    name: "أدخل اسم المنتج (حتى 200 حرف).",
    partNumber: "أدخل رقم القطعة (حتى 100 حرف).",
    brand: "اختر الشركة.",
    carModel: "أدخل موديل السيارة (حتى 100 حرف).",
    years: (min, max) => `يجب أن تكون السنوات بين ${min} و ${max}.`,
    yearOrder: "«من سنة» لا يمكن أن تكون بعد «إلى سنة».",
    category: "التصنيف حتى 100 حرف.",
    description: "الوصف حتى 2000 حرف.",
    price: "يجب أن يكون السعر رقماً يساوي 0 أو أكثر.",
    stock: "يجب أن تكون الكمية عدداً صحيحاً يساوي 0 أو أكثر.",
  },
};

export const messages: Record<Lang, Messages> = { en, ar };
