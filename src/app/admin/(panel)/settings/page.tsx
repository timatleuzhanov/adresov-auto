import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession, canManageSettings } from "@/lib/auth";
import { SettingsForm } from "./SettingsForm";

export default async function AdminSettingsPage() {
  const s = await getAdminSession();
  if (!s) redirect("/admin/login");
  if (!canManageSettings(s.role)) redirect("/admin/dashboard");

  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (!settings) return <div>Нет настроек</div>;

  return (
    <div className="rounded-card bg-white p-6 shadow-card">
      <h1 className="font-heading text-2xl font-bold text-primary">Настройки сайта</h1>
      <p className="mt-2 text-sm text-sub">Контакты, ставка калькулятора, SEO-поля.</p>
      <div className="mt-6">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
