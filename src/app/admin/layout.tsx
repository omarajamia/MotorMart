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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <p className="text-xl font-bold">
            <span className="text-orange-400">{SITE_NAME.en}</span>{" "}
            <span className="text-base font-medium text-gray-300">Admin</span>
          </p>
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
