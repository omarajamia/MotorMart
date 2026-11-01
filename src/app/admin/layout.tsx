import type { Metadata } from "next";
import { Suspense } from "react";
import AdminNav from "@/components/admin/AdminNav";
import { getAccount } from "@/lib/admin";

export const metadata: Metadata = {
  title: "MotorMart Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <p className="text-xl font-bold">
            Motor<span className="text-orange-400">Mart</span>{" "}
            <span className="text-base font-medium text-gray-300">Admin</span>
          </p>
          <Suspense fallback={<AdminNav isOwner={false} />}>
            <AccountNav />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}

// Shops and Staff links are only shown to the owner (the pages check again).
async function AccountNav() {
  const account = await getAccount();
  return <AdminNav isOwner={account?.isOwner ?? false} />;
}
