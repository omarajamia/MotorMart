// The admin-managed lists of brands, car models and categories.

import type { SupabaseClient } from "@supabase/supabase-js";

export type Brand = { id: string; name: string; name_ar: string | null };
export type CarModel = {
  id: string;
  brand_id: string;
  name: string;
  name_ar: string | null;
};
export type Category = { id: string; name: string; name_ar: string | null };

export type Catalog = {
  brands: Brand[];
  models: CarModel[];
  categories: Category[];
};

// Loads all three lists, sorted by name. Anyone may read them.
export async function loadCatalog(supabase: SupabaseClient): Promise<Catalog> {
  const [brands, models, categories] = await Promise.all([
    supabase.from("brands").select("id, name, name_ar").order("name"),
    supabase.from("car_models").select("id, brand_id, name, name_ar").order("name"),
    supabase.from("categories").select("id, name, name_ar").order("name"),
  ]);

  for (const result of [brands, models, categories]) {
    if (result.error) console.error("Failed to load catalog:", result.error);
  }

  return {
    brands: (brands.data ?? []) as Brand[],
    models: (models.data ?? []) as CarModel[],
    categories: (categories.data ?? []) as Category[],
  };
}
