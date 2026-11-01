export type Product = {
  id: string;
  name: string;
  part_number: string;
  brand: string;
  car_model: string;
  category: string | null;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  shop: Shop | null;
};

export type Shop = {
  name: string;
  city: string | null;
  phone: string | null;
};

export type AdminProduct = Product & {
  is_active: boolean;
  shop_id: string;
};

export type ProductDetails = AdminProduct & {
  year_from: number | null;
  year_to: number | null;
  description: string | null;
};

// Result of an admin form submission, shown next to the form.
export type ActionState = {
  error?: string;
  success?: string;
  // Typed values to put back into the form after an error.
  values?: Record<string, string>;
};
