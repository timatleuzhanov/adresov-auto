"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, type Locale } from "@/lib/locale";

const LANG_FULL: Record<Locale, string> = { ru: "Русский", en: "English", kz: "Қазақша" };
const LANG_SHORT: Record<Locale, string> = { ru: "РУ", en: "EN", kz: "ҚАЗ" };
const LOCALES: Locale[] = ["ru", "en", "kz"];

export function AppSwitchers({ dark = false }: { dark?: boolean }) {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const triggerClass = dark
    ? "flex items-center gap-1 rounded-full border border-logo/25 px-2.5 py-1 text-xs font-medium text-logo/80 hover:border-logo/50 hover:text-logo transition-colors"
    : "flex items-center gap-1 rounded-full border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 transition-colors";

  const dropBg = dark ? "bg-neutral-900 border-logo/20" : "bg-white border-neutral-200";
  const itemBase = dark
    ? "flex w-full items-center gap-2.5 px-3 py-2 text-sm text-logo/70 hover:bg-white/8 hover:text-logo transition-colors"
    : "flex w-full items-center gap-2.5 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors";
  const itemActive = dark
    ? "flex w-full items-center gap-2.5 px-3 py-2 text-sm text-logo font-semibold bg-white/6"
    : "flex w-full items-center gap-2.5 px-3 py-2 text-sm text-neutral-900 font-semibold bg-neutral-50";

  return (
    <div ref={ref} className="relative">
      <button type="button" className={triggerClass} onClick={() => setOpen((v) => !v)} aria-label="Выбор языка">
        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" className="shrink-0 opacity-70">
          <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.4" />
          <ellipse cx="10" cy="10" rx="3.5" ry="8.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M1.5 7h17M1.5 13h17" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        <span>{LANG_SHORT[locale]}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute right-0 top-full z-50 mt-1.5 w-36 rounded-xl border shadow-lg ${dropBg}`}
        >
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              className={`${locale === l ? itemActive : itemBase} ${l === "ru" ? "rounded-t-xl" : ""} ${l === "kz" ? "rounded-b-xl" : ""}`}
              onClick={() => { setLocale(l); setOpen(false); }}
            >
              <span className="w-6 text-xs font-bold opacity-50">{LANG_SHORT[l]}</span>
              <span>{LANG_FULL[l]}</span>
              {locale === l && (
                <svg className="ml-auto shrink-0" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
