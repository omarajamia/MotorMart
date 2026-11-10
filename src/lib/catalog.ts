// The admin-managed lists of brands, car models, categories and origins.

import type { SupabaseClient } from "@supabase/supabase-js";

export type Brand = { id: string; name: string; name_ar: string | null };
export type CarModel = {
  id: string;
  brand_id: string;
  name: string;
  name_ar: string | null;
};
export type Category = { id: string; name: string; name_ar: string | null };
// Where a part is made (صناعة), e.g. Korean OEM or Chinese.
export type Origin = { id: string; name: string; name_ar: string | null };

export type Catalog = {
  brands: Brand[];
  models: CarModel[];
  categories: Category[];
  origins: Origin[];
};

// Loads all the lists, sorted by name. Anyone may read them.
export async function loadCatalog(supabase: SupabaseClient): Promise<Catalog> {
  const [brands, models, categories, origins] = await Promise.all([
    supabase.from("brands").select("id, name, name_ar").order("name"),
    supabase.from("car_models").select("id, brand_id, name, name_ar").order("name"),
    supabase.from("categories").select("id, name, name_ar").order("name"),
    supabase.from("origins").select("id, name, name_ar").order("name"),
  ]);

  for (const result of [brands, models, categories, origins]) {
    if (result.error) console.error("Failed to load catalog:", result.error);
  }

  return {
    brands: (brands.data ?? []) as Brand[],
    models: (models.data ?? []) as CarModel[],
    categories: (categories.data ?? []) as Category[],
    origins: (origins.data ?? []) as Origin[],
  };
}

// Where a product comes from. Admin only: visitors can't read stores.
export type Store = { id: string; name: string; details: string | null };

export async function loadStores(supabase: SupabaseClient): Promise<Store[]> {
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, details")
    .order("name");
  if (error) console.error("Failed to load stores:", error);
  return (data ?? []) as Store[];
}
