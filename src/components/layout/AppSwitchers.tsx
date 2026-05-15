"use client";

import { useLocale, type Locale } from "@/lib/locale";
import { useCurrency, type Currency } from "@/lib/currency";

const LANG_LABELS: Record<Locale, string> = { ru: "РУ", en: "EN", kz: "ҚАЗ" };
const CURRENCIES: Currency[] = ["KZT", "USD", "RUB"];
const LOCALES: Locale[] = ["ru", "en", "kz"];

export function AppSwitchers({ dark = false }: { dark?: boolean }) {
  const { locale, setLocale } = useLocale();
  const { currency, setCurrency } = useCurrency();

  const base = dark
    ? "text-logo/55 hover:text-logo transition"
    : "text-neutral-500 hover:text-neutral-900 transition";
  const activeClass = dark
    ? "text-logo-bright font-semibold"
    : "text-neutral-900 font-semibold";
  const divider = dark ? "text-logo/25" : "text-neutral-300";

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={locale === l ? activeClass : base}
        >
          {LANG_LABELS[l]}
        </button>
      ))}
      <span className={divider}>|</span>
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          className={currency === c ? activeClass : base}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
