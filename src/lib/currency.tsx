"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Currency = "KZT" | "USD" | "RUB";

const STORAGE_KEY = "adresov_currency";

// Примерные курсы (KZT как база), май 2026
const RATES: Record<Currency, number> = {
  KZT: 1,
  USD: 1 / 510,
  RUB: 1 / 5.6,
};

export function convertPrice(kzt: number, currency: Currency): string {
  const value = kzt * RATES[currency];
  if (currency === "KZT") return `${Math.round(value).toLocaleString("ru-RU")} ₸`;
  if (currency === "USD") return `$${Math.round(value).toLocaleString("en-US")}`;
  return `${Math.round(value).toLocaleString("ru-RU")} ₽`;
}

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  fmt: (kzt: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "KZT",
  setCurrency: () => {},
  fmt: (kzt) => `${Math.round(kzt).toLocaleString("ru-RU")} ₸`,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("KZT");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "KZT" || saved === "USD" || saved === "RUB") {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, c);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, fmt: (kzt) => convertPrice(kzt, currency) }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
