import Link from "next/link";
import { ReactNode } from "react";
import type { UserRole } from "@prisma/client";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";

const allNav = [
  { href: "/admin/dashboard", label: "Дашборд", icon: "dashboard" },
  { href: "/admin/cars", label: "Автомобили", icon: "car" },
  { href: "/admin/leads", label: "Заявки", icon: "lead" },
  { href: "/admin/promotions", label: "Акции", icon: "promo" },
  { href: "/admin/settings", label: "Настройки", icon: "settings" },
];

function navFor(role: UserRole) {
  if (role === "OPERATOR") return allNav.filter((n) => n.href === "/admin/dashboard" || n.href === "/admin/leads");
  if (role === "MANAGER") return allNav.filter((n) => n.href !== "/admin/settings");
  return allNav;
}

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const s = await getAdminSession();
  if (!s) redirect("/admin/login");
  const nav = navFor(s.role);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[240px_1fr]">
        <AdminSidebar email={s.email} role={s.role} nav={nav} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
