"use client";

import { useCurrency, type Currency, convertPrice } from "@/lib/currency";
import { useLocale } from "@/lib/locale";

interface Props {
  priceFrom: number | null;
  priceUsd?: number | null;
  priceRub?: number | null;
  priceOnRequest: boolean;
  showFrom?: boolean;
  className?: string;
}

export function PriceDisplay({ priceFrom, priceUsd, priceRub, priceOnRequest, showFrom = false, className }: Props) {
  const { currency, fmt } = useCurrency();
  const { t } = useLocale();

  if (priceOnRequest) return <span className={className}>{t.car.price_on_request}</span>;
  if (priceFrom == null) return <span className={className}>{t.car.clarify}</span>;

  // Если заданы явные цены — используем их; иначе пересчитываем из KZT
  function formatExplicit(explicit: number | null | undefined, cur: Currency): string {
    if (explicit != null) {
      if (cur === "USD") return `$${explicit.toLocaleString("en-US")}`;
      if (cur === "RUB") return `${explicit.toLocaleString("ru-RU")} ₽`;
      return `${explicit.toLocaleString("ru-RU")} ₸`;
    }
    return convertPrice(priceFrom!, cur);
  }

  const displayed =
    currency === "USD" ? formatExplicit(priceUsd, "USD") :
    currency === "RUB" ? formatExplicit(priceRub, "RUB") :
    fmt(priceFrom);

  return (
    <span className={className}>
      {showFrom ? `${t.car.from} ` : ""}
      {displayed}
    </span>
  );
}
