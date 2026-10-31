
import { supabase } from "@/lib/supabase";
import ProductSearch from "@/components/ProductSearch";
import type { Product } from "@/lib/types";
export const instant = false;

export default async function Home() {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, part_number, brand, car_model, category, price, stock_quantity, image_url"
    )
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("Failed to load products:", error);
  }

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
            We couldn&apos;t load products right now. Please try again
            shortly.
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
          <ProductSearch products={products} />
        )}
      </section>

      <footer className="border-t bg-white px-6 py-6 text-center text-sm text-gray-500">
        MotorMart · Spare parts made easier
      </footer>
    </main>
  );
}
