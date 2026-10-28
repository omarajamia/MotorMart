
import { supabase } from "@/lib/supabase";
import ProductSearch from "@/components/ProductSearch";
export const instant = false;

type Product = {
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

export default async function Home() {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, part_number, brand, car_model, category, price, stock_quantity, image_url"
    )
    .eq("is_active", true)
    .order("name");

  const products = (data ?? []) as Product[];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">
              Motor<span className="text-orange-400">Mart</span>
            </h1>
            <p className="mt-1 text-sm text-gray-300">
              Spare parts for your vehicle
            </p>
          </div>
          <span className="rounded-full bg-slate-800 px-4 py-2 text-sm">
            Kia · Nissan · Hyundai
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Find the right part for your car
        </h2>
        <p className="mt-3 text-gray-600">
          Browse spare parts and check prices and stock.
        </p>

        {error ? (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
            Could not load products. Check your Supabase connection and table
            permissions.
            <p className="mt-2 text-sm">{error.message}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h3 className="text-xl font-semibold">No products yet</h3>
            <p className="mt-2 text-gray-600">
              Your store is connected, but there are no active products to
              display yet.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-400">
                    No image available
                  </div>
                )}

                <div className="p-5">
                  <p className="text-sm font-medium text-orange-600">
                    {product.brand}
                  </p>
                  <h3 className="mt-1 text-lg font-bold">{product.name}</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Part number: {product.part_number}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Car model: {product.car_model}
                  </p>
                  {product.category && (
                    <p className="mt-1 text-sm text-gray-600">
                      Category: {product.category}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between border-t pt-4">
                    <span className="text-xl font-bold">
                      {Number(product.price).toFixed(2)} JOD
                    </span>
                    <span
                      className={
                        product.stock_quantity > 0
                          ? "text-sm font-medium text-green-700"
                          : "text-sm font-medium text-red-600"
                      }
                    >
                      {product.stock_quantity > 0
                        ? `In stock: ${product.stock_quantity}`
                        : "Out of stock"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t bg-white px-6 py-6 text-center text-sm text-gray-500">
        MotorMart · Spare parts made easier
      </footer>
    </main>
  );
}
