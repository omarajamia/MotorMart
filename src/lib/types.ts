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
};
