
export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ProductInput = {
  name: string;
  name_ar: string | null;
  part_number: string;
  alt_part_numbers: string[];
  brand: string;
  store_id: string;
  car_model: string;
  year_from: number | null;
  year_to: number | null;
  category: string | null;
  description: string | null;
  description_ar: string | null;
  price: number;
  stock_quantity: number;
  is_active: boolean;
};

const MIN_YEAR = 1950;
const MAX_ALT_PART_NUMBERS = 20;

// Next year, worked out when a form is submitted (not when this file loads,
// which Next.js doesn't allow while preparing pages).
function maxYear() {
  return new Date().getFullYear() + 1;
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

// "Other part numbers" box: one per line or comma separated. Removes blanks,
// repeats and the main part number.
function altPartNumbers(value: string, mainPartNumber: string) {
  const seen = new Set([mainPartNumber.toLowerCase()]);
  return value
    .split(/[\n,]/)
    .map((number) => number.trim())
    .filter((number) => {
      const key = number.toLowerCase();
      if (!number || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function optionalYear(value: string) {
  if (!value) return null;
  const year = Number(value);
  return Number.isInteger(year) && year >= MIN_YEAR && year <= maxYear()
    ? year
    : undefined;
}

// Validates the add/edit product form on the server. Returns either the
// cleaned values or a message to show the admin.
export function parseProductForm(
  formData: FormData
): { data: ProductInput } | { error: string } {
  const name = text(formData, "name");
  const nameAr = text(formData, "name_ar");
  const descriptionAr = text(formData, "description_ar");
  const partNumber = text(formData, "part_number");
  const otherPartNumbers = altPartNumbers(
    text(formData, "alt_part_numbers"),
    partNumber
  );
  const brand = text(formData, "brand");
  const storeId = text(formData, "store_id");
  const carModel = text(formData, "car_model");
  const category = text(formData, "category");
  const description = text(formData, "description");
  const price = Number(text(formData, "price"));
  const stock = Number(text(formData, "stock_quantity"));
  const yearFrom = optionalYear(text(formData, "year_from"));
  const yearTo = optionalYear(text(formData, "year_to"));

  if (!name || name.length > 200) {
    return { error: "Enter a product name (up to 200 characters)." };
  }
  if (nameAr.length > 200) {
    return { error: "Arabic name can be up to 200 characters." };
  }
  if (!partNumber || partNumber.length > 100) {
    return { error: "Enter a part number (up to 100 characters)." };
  }
  if (otherPartNumbers.length > MAX_ALT_PART_NUMBERS) {
    return {
      error: `You can add up to ${MAX_ALT_PART_NUMBERS} other part numbers.`,
    };
  }
  if (otherPartNumbers.some((number) => number.length > 100)) {
    return { error: "Each part number can be up to 100 characters." };
  }
  if (!brand || brand.length > 60) {
    return { error: "Choose a brand." };
  }
  if (!UUID_PATTERN.test(storeId)) {
    return { error: "Choose the store this product comes from." };
  }
  if (!carModel || carModel.length > 100) {
    return { error: "Enter the car model (up to 100 characters)." };
  }
  if (yearFrom === undefined || yearTo === undefined) {
    return { error: `Years must be between ${MIN_YEAR} and ${maxYear()}.` };
  }
  if (yearFrom !== null && yearTo !== null && yearFrom > yearTo) {
    return { error: "“Year from” can't be after “Year to”." };
  }
  if (category.length > 100) {
    return { error: "Category can be up to 100 characters." };
  }
  if (description.length > 2000) {
    return { error: "Description can be up to 2000 characters." };
  }
  if (descriptionAr.length > 2000) {
    return { error: "Arabic description can be up to 2000 characters." };
  }
  if (!Number.isFinite(price) || price < 0 || price > 1_000_000) {
    return { error: "Price must be a number of 0 or more." };
  }
  if (!Number.isInteger(stock) || stock < 0 || stock > 1_000_000) {
    return { error: "Stock must be a whole number of 0 or more." };
  }

  return {
    data: {
      name,
      name_ar: nameAr || null,
      part_number: partNumber,
      alt_part_numbers: otherPartNumbers,
      brand,
      store_id: storeId,
      car_model: carModel,
      year_from: yearFrom,
      year_to: yearTo,
      category: category || null,
      description: description || null,
      description_ar: descriptionAr || null,
      price: Math.round(price * 100) / 100,
      stock_quantity: stock,
      is_active: formData.get("is_active") === "on",
    },
  };
}
