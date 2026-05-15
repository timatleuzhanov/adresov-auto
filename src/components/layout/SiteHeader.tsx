"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/locale";
import { AppSwitchers } from "./AppSwitchers";

type SiteJson = {
  telegramUrl?: string | null;
  instagramUrl?: string | null;
};

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [social, setSocial] = useState<SiteJson>({});
  const { t } = useLocale();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    fetch("/api/site")
      .then((r) => r.json())
      .then((d: SiteJson) => setSocial({ telegramUrl: d.telegramUrl, instagramUrl: d.instagramUrl }))
      .catch(() => {});
  }, []);

  if (isAdmin) return null;

  const tg = social.telegramUrl || process.env.NEXT_PUBLIC_TELEGRAM_URL;
  const ig = social.instagramUrl || process.env.NEXT_PUBLIC_INSTAGRAM_URL;

  const links = [
    { href: "/catalog", label: t.nav.models },
    { href: "/promotions", label: t.nav.promotions },
    { href: "/credit", label: t.nav.credit },
    { href: "/trade-in", label: t.nav.trade_in },
    { href: "/service", label: t.nav.service },
    { href: "/about", label: t.nav.about },
    { href: "/contacts", label: t.nav.contacts },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-logo/20 bg-black text-logo">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="ADRESOV AUTO"
            width={320}
            height={64}
            className="h-12 w-auto max-w-[min(52vw,280px)] object-contain object-left md:h-16 md:max-w-[min(40vw,360px)]"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-logo/90 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "transition hover:text-logo-bright",
                pathname === l.href || pathname.startsWith(l.href + "/") ? "text-logo-bright" : "text-logo/70"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <AppSwitchers dark />
          {tg && (
            <a href={tg} target="_blank" rel="noopener noreferrer" className="opacity-75 transition hover:opacity-100" aria-label="Telegram">
              <Image src="/images/tg.png" alt="Telegram" width={22} height={22} className="h-[22px] w-[22px] object-contain" />
            </a>
          )}
          {ig && (
            <a href={ig} target="_blank" rel="noopener noreferrer" className="opacity-75 transition hover:opacity-100" aria-label="Instagram">
              <Image src="/images/inst.png" alt="Instagram" width={22} height={22} className="h-[22px] w-[22px] object-contain" />
            </a>
          )}
          <Link
            href="/catalog"
            className="rounded border border-logo bg-logo px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black hover:bg-logo-bright"
          >
            {t.catalog}
          </Link>
        </div>
        <button
          type="button"
          className="inline-flex rounded border border-logo/35 px-3 py-2 text-sm text-logo md:hidden"
          aria-expanded={open}
          aria-label="Меню"
          onClick={() => setOpen((v) => !v)}
        >
          Меню
        </button>
      </div>
      {open && (
        <div className="border-t border-logo/20 bg-black px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3 text-sm">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="py-1 text-logo/90">
                {l.label}
              </Link>
            ))}
            <div className="flex gap-4 pt-2">
              {tg && (
                <a href={tg} target="_blank" rel="noreferrer" className="opacity-75 transition hover:opacity-100" aria-label="Telegram">
                  <Image src="/images/tg.png" alt="Telegram" width={24} height={24} className="h-6 w-6 object-contain" />
                </a>
              )}
              {ig && (
                <a href={ig} target="_blank" rel="noreferrer" className="opacity-75 transition hover:opacity-100" aria-label="Instagram">
                  <Image src="/images/inst.png" alt="Instagram" width={24} height={24} className="h-6 w-6 object-contain" />
                </a>
              )}
            </div>
            <div className="pt-1">
              <AppSwitchers dark />
            </div>
            <Link href="/catalog" className="rounded border border-logo bg-logo py-2 text-center text-sm font-semibold text-black hover:bg-logo-bright">
              {t.catalog}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
