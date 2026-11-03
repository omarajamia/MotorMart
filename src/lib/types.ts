export type Product = {
  id: string;
  name: string;
  part_number: string;
  // Other numbers the same part is sold under.
  alt_part_numbers: string[];
  brand: string;
  car_model: string;
  category: string | null;
  description: string | null;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  // Arabic versions, shown to visitors browsing in Arabic when filled in.
  name_ar: string | null;
  description_ar: string | null;
};

export type AdminProduct = Product & {
  is_active: boolean;
};

export type ProductDetails = AdminProduct & {
  year_from: number | null;
  year_to: number | null;
  extra_image_urls: string[];
};

// Result of an admin form submission, shown next to the form.
export type ActionState = {
  error?: string;
  success?: string;
};
