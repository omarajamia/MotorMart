import { logout } from "@/app/admin/actions";
import { messages, type Lang } from "@/lib/i18n";

export default function LogoutButton({ lang = "en" }: { lang?: Lang }) {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
      >
        {messages[lang].logOut}
      </button>
    </form>
  );
}
