export function formatPriceTenge(value: number | null | undefined, onRequest?: boolean) {
  if (onRequest) return "Цена по запросу";
  if (value == null) return "Уточнить цену";
  return `${value.toLocaleString("ru-RU")} ₸`;
}

export function formatPriceFrom(value: number | null | undefined, onRequest?: boolean) {
  if (onRequest) return "Цена по запросу";
  if (value == null) return "Уточнить цену";
  return `от ${value.toLocaleString("ru-RU")} ₸`;
}
