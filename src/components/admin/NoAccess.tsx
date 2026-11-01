import LogoutButton from "@/components/admin/LogoutButton";
import { messages, type Lang } from "@/lib/i18n";

export default function NoAccess({
  email,
  lang = "en",
}: {
  email?: string;
  lang?: Lang;
}) {
  const t = messages[lang];
  return (
    <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <h1 className="text-xl font-semibold text-red-800">{t.noAccessTitle}</h1>
      <p className="mt-2 text-sm text-red-700">{t.noAccessBody(email ?? "")}</p>
      <div className="mt-4 flex justify-center">
        <LogoutButton lang={lang} />
      </div>
    </div>
  );
}
