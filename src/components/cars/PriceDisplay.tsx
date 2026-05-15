"use client";

import { useCurrency } from "@/lib/currency";
import { useLocale } from "@/lib/locale";

interface Props {
  priceFrom: number | null;
  priceOnRequest: boolean;
  showFrom?: boolean;
  className?: string;
}

export function PriceDisplay({ priceFrom, priceOnRequest, showFrom = false, className }: Props) {
  const { fmt } = useCurrency();
  const { t } = useLocale();

  if (priceOnRequest) return <span className={className}>{t.car.price_on_request}</span>;
  if (priceFrom == null) return <span className={className}>{t.car.clarify}</span>;

  return (
    <span className={className}>
      {showFrom ? `${t.car.from} ` : ""}
      {fmt(priceFrom)}
    </span>
  );
}
