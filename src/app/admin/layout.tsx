import type { Metadata } from "next";
import AdminNav from "@/components/admin/AdminNav";
import { SITE_NAME } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `Admin – ${SITE_NAME.en}`,
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-slate-950 text-white">
        {/* On phones the name sits above the links; on wider screens they
            share one row. */}
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between md:py-4">
          <p className="font-bold">
            <span className="text-lg text-orange-400 sm:text-xl">
              {SITE_NAME.en}
            </span>{" "}
            <span className="text-sm font-medium text-gray-300">Admin</span>
          </p>
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
