import Link from "next/link";
import { ReactNode } from "react";
import type { UserRole } from "@prisma/client";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

const allNav = [
  { href: "/admin/dashboard", label: "Дашборд" },
  { href: "/admin/cars", label: "Автомобили" },
  { href: "/admin/leads", label: "Заявки" },
  { href: "/admin/promotions", label: "Акции" },
  { href: "/admin/settings", label: "Настройки" },
];

function navFor(role: UserRole) {
  if (role === "OPERATOR") {
    return allNav.filter((n) => n.href === "/admin/dashboard" || n.href === "/admin/leads");
  }
  if (role === "MANAGER") {
    return allNav.filter((n) => n.href !== "/admin/settings");
  }
  return allNav;
}

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const s = await getAdminSession();
  if (!s) redirect("/admin/login");

  const nav = navFor(s.role);

  return (
    <div className="mx-auto grid min-h-screen max-w-6xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-card bg-white p-4 shadow-card">
        <div className="font-heading text-sm font-bold text-primary">ADRESOV</div>
        <p className="mt-1 text-xs text-sub">{s.email}</p>
        <p className="mt-1 text-xs text-sub">Роль: {s.role}</p>
        <nav className="mt-4 space-y-2 text-sm">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="block rounded-btn px-2 py-2 hover:bg-muted">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4">
          <LogoutButton />
        </div>
      </aside>
      <section>{children}</section>
    </div>
  );
}
