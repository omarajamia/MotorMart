import { Suspense, type ReactNode } from "react";
import CatalogAddForm from "@/components/admin/CatalogAddForm";
import CatalogRow from "@/components/admin/CatalogRow";
import NoAccess from "@/components/admin/NoAccess";
import { getAdmin } from "@/lib/admin";
import { loadCatalog } from "@/lib/catalog";

export const instant = false;

export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold">Brands, car models & categories</h1>
      <p className="mt-1 text-sm text-gray-600">
        These lists fill the dropdowns on the product form and the filters in
        the shop. The Arabic names are shown to visitors browsing in Arabic.
      </p>
      <div className="mt-6">
        <Suspense fallback={<p className="text-gray-600">Loading…</p>}>
          <CatalogLists />
        </Suspense>
      </div>
    </div>
  );
}

async function CatalogLists() {
  const { supabase, user, isAdmin } = await getAdmin();
  if (!isAdmin) {
    return <NoAccess email={user.email} />;
  }

  const [catalog, { data: products }] = await Promise.all([
    loadCatalog(supabase),
    supabase.from("products").select("brand, car_model, category"),
  ]);

  // How many products use each name, shown next to it.
  const count = (match: (p: { brand: string; car_model: string; category: string | null }) => boolean) =>
    (products ?? []).filter(match).length;

  return (
    <div className="space-y-8">
      <Section title="Brands" form={<CatalogAddForm kind="brand" />}>
        {catalog.brands.map((brand) => (
          <CatalogRow
            key={brand.id}
            kind="brand"
            id={brand.id}
            name={brand.name}
            nameAr={brand.name_ar}
            productCount={count((p) => p.brand === brand.name)}
          />
        ))}
      </Section>

      <Section
        title="Car models"
        form={<CatalogAddForm kind="model" brands={catalog.brands} />}
      >
        {catalog.brands.map((brand) => {
          const models = catalog.models.filter((m) => m.brand_id === brand.id);
          if (models.length === 0) return null;
          return (
            <li key={brand.id}>
              <p className="bg-gray-50 px-5 py-2 text-xs font-medium uppercase text-gray-500">
                {brand.name}
              </p>
              <ul className="divide-y">
                {models.map((model) => (
                  <CatalogRow
                    key={model.id}
                    kind="model"
                    id={model.id}
                    name={model.name}
                    nameAr={model.name_ar}
                    productCount={count(
                      (p) => p.brand === brand.name && p.car_model === model.name
                    )}
                  />
                ))}
              </ul>
            </li>
          );
        })}
      </Section>

      <Section title="Categories" form={<CatalogAddForm kind="category" />}>
        {catalog.categories.map((category) => (
          <CatalogRow
            key={category.id}
            kind="category"
            id={category.id}
            name={category.name}
            nameAr={category.name_ar}
            productCount={count((p) => p.category === category.name)}
          />
        ))}
      </Section>
    </div>
  );
}

function Section({
  title,
  form,
  children,
}: {
  title: string;
  form: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <h2 className="border-b px-5 py-3 text-sm font-medium uppercase text-gray-500">
        {title}
      </h2>
      <ul className="divide-y">{children}</ul>
      {form}
    </section>
  );
}
