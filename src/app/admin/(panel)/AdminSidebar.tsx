"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

const ICONS: Record<string, React.ReactNode> = {
  dashboard: <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" /></svg>,
  car: <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M3 10l1.5-4h11L17 10M3 10h14v5H3v-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><circle cx="6" cy="15" r="1.5" fill="currentColor" /><circle cx="14" cy="15" r="1.5" fill="currentColor" /></svg>,
  lead: <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M4 4h12v10H4V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M4 4l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
  promo: <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M3 7h14M3 7v9h14V7M3 7V5a2 2 0 012-2h10a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M10 11v3M8 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
};

const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: "Суперадмин",
  MANAGER: "Менеджер",
  OPERATOR: "Оператор",
};

export function AdminSidebar({
  email,
  role,
  nav,
}: {
  email: string;
  role: string;
  nav: { href: string; label: string; icon: string }[];
}) {
  const pathname = usePathname();

  return (
    <aside className="h-fit rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {/* Шапка */}
      <div className="border-b border-neutral-100 px-5 py-4">
        <div className="text-xs font-bold uppercase tracking-widest text-neutral-400">Admin</div>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
            {email[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-neutral-900">{email}</div>
            <div className="text-xs text-neutral-400">{ROLE_LABELS[role] ?? role}</div>
          </div>
        </div>
      </div>

      {/* Навигация */}
      <nav className="p-3">
        {nav.map((n) => {
          const active = pathname === n.href || (n.href !== "/admin/dashboard" && pathname.startsWith(n.href));
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              <span className={active ? "text-white" : "text-neutral-400"}>{ICONS[n.icon]}</span>
              {n.label}
            </Link>
          );
        })}
      </nav>

      {/* Ссылка на сайт */}
      <div className="border-t border-neutral-100 px-3 pb-3 pt-2">
        <a
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M11 3h6v6M17 3l-8 8M8 5H4v11h11v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Открыть сайт
        </a>
        <div className="mt-1 px-1">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
