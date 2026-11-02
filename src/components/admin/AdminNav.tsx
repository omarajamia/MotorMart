"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  // Signed-out visitors on the login page only get a link back to the shop.
  const isLoginPage = usePathname() === "/admin/login";

  return (
    <nav className="flex items-center gap-5 text-sm text-gray-300">
      {!isLoginPage && (
        <>
          <Link href="/admin" className="hover:text-white">
            Products
          </Link>
          <Link href="/admin/staff" className="hover:text-white">
            Staff
          </Link>
        </>
      )}
      <Link href="/" className="hover:text-white">
        View shop
      </Link>
    </nav>
  );
}
