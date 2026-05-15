"use client";

import { LocaleProvider } from "@/lib/locale";
import { CurrencyProvider } from "@/lib/currency";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <CurrencyProvider>{children}</CurrencyProvider>
    </LocaleProvider>
  );
}
