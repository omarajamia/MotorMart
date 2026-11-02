export const BRANDS = ["Kia", "Hyundai", "Nissan"] as const;

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ProductInput = {
  name: string;
  part_number: string;
  brand: (typeof BRANDS)[number];
  car_model: string;
  year_from: number | null;
  year_to: number | null;
  category: string | null;
  description: string | null;
  price: number;
  stock_quantity: number;
  is_active: boolean;
};

const MIN_YEAR = 1950;
const MAX_YEAR = new Date().getFullYear() + 1;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalYear(value: string) {
  if (!value) return null;
  const year = Number(value);
  return Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR
    ? year
    : undefined;
}

// Validates the add/edit product form on the server. Returns either the
// cleaned values or a message to show the admin.
export function parseProductForm(
  formData: FormData
): { data: ProductInput } | { error: string } {
  const name = text(formData, "name");
  const partNumber = text(formData, "part_number");
  const brand = text(formData, "brand");
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
  if (!partNumber || partNumber.length > 100) {
    return { error: "Enter a part number (up to 100 characters)." };
  }
  if (!BRANDS.includes(brand as ProductInput["brand"])) {
    return { error: "Choose a brand." };
  }
  if (!carModel || carModel.length > 100) {
    return { error: "Enter the car model (up to 100 characters)." };
  }
  if (yearFrom === undefined || yearTo === undefined) {
    return { error: `Years must be between ${MIN_YEAR} and ${MAX_YEAR}.` };
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
  if (!Number.isFinite(price) || price < 0 || price > 1_000_000) {
    return { error: "Price must be a number of 0 or more." };
  }
  if (!Number.isInteger(stock) || stock < 0 || stock > 1_000_000) {
    return { error: "Stock must be a whole number of 0 or more." };
  }

  return {
    data: {
      name,
      part_number: partNumber,
      brand: brand as ProductInput["brand"],
      car_model: carModel,
      year_from: yearFrom,
      year_to: yearTo,
      category: category || null,
      description: description || null,
      price: Math.round(price * 100) / 100,
      stock_quantity: stock,
      is_active: formData.get("is_active") === "on",
    },
  };
}
