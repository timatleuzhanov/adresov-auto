"use client";

import { useCurrency, type Currency } from "@/lib/currency";

const CURRENCIES: Currency[] = ["KZT", "USD", "RUB"];

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex gap-1">
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
            currency === c
              ? "bg-neutral-900 text-white"
              : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
