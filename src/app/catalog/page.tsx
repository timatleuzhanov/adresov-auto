import Link from "next/link";
import {
  BodyType,
  FuelType,
  TransmissionType,
} from "@prisma/client";
import { parseCatalogSearchParams, queryCars, getCarAggregates, getDistinctBrands, PAGE_SIZE } from "@/lib/car-query";
import { CarCard } from "@/components/cars/CarCard";

function toSearchParams(input: Record<string, string | string[] | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(input)) {
    if (typeof v === "string" && v.length) sp.set(k, v);
    if (Array.isArray(v)) v.forEach((x) => sp.append(k, x));
  }
  return sp;
}

const bodyLabels: Record<BodyType, string> = {
  SEDAN: "Седан",
  SUV: "SUV",
  HATCHBACK: "Хэтчбек",
  CROSSOVER: "Кроссовер",
  MINIVAN: "Минивэн",
};

const fuelLabels: Record<FuelType, string> = {
  PETROL: "Бензин",
  DIESEL: "Дизель",
  HYBRID: "Гибрид",
  ELECTRIC: "Электро",
};

const transLabels: Record<TransmissionType, string> = {
  AUTO: "Автомат",
  MANUAL: "Механика",
  VARIATOR: "Вариатор",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const sp = toSearchParams(searchParams);
  if (!sp.get("page")) sp.set("page", "1");
  const q = parseCatalogSearchParams(sp);
  const [{ items, total, page }, agg, brands] = await Promise.all([
    queryCars(q),
    getCarAggregates(),
    getDistinctBrands(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const withParam = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === "") next.delete(k);
      else next.set(k, v);
    }
    return `/catalog?${next.toString()}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-heading text-3xl font-bold text-primary">Каталог автомобилей</h1>
      <p className="mt-2 text-sub">Фильтры, сортировка и пагинация (12 авто на страницу)</p>

      <form className="mt-8 grid gap-4 rounded-card bg-muted p-4 md:grid-cols-12" method="get">
        <div className="md:col-span-3">
          <label className="text-xs text-sub">Марка</label>
          <select name="brand" defaultValue={sp.get("brand") ?? ""} className="mt-1 w-full rounded-btn border border-black/10 bg-white px-3 py-2 text-sm">
            <option value="">Все</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="text-xs text-sub">Состояние</label>
          <select name="condition" defaultValue={sp.get("condition") ?? ""} className="mt-1 w-full rounded-btn border border-black/10 bg-white px-3 py-2 text-sm">
            <option value="">Все</option>
            <option value="NEW">Новые</option>
            <option value="USED">С пробегом</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="text-xs text-sub">Сортировка</label>
          <select name="sort" defaultValue={sp.get("sort") ?? "newest"} className="mt-1 w-full rounded-btn border border-black/10 bg-white px-3 py-2 text-sm">
            <option value="newest">По новизне</option>
            <option value="price_asc">Цена ↑</option>
            <option value="price_desc">Цена ↓</option>
          </select>
        </div>
        <div className="flex items-end md:col-span-3">
          <button className="w-full rounded-btn bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800" type="submit">
            Применить
          </button>
        </div>

        <div className="md:col-span-6">
          <label className="text-xs text-sub">Год от / до</label>
          <div className="mt-1 flex gap-2">
            <input name="minYear" defaultValue={sp.get("minYear") ?? String(agg.minYear)} type="number" className="w-full rounded-btn border border-black/10 bg-white px-3 py-2 text-sm" />
            <input name="maxYear" defaultValue={sp.get("maxYear") ?? String(agg.maxYear)} type="number" className="w-full rounded-btn border border-black/10 bg-white px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="md:col-span-6">
          <label className="text-xs text-sub">Цена от / до (₸)</label>
          <div className="mt-1 flex gap-2">
            <input name="minPrice" defaultValue={sp.get("minPrice") ?? String(agg.minPrice)} type="number" className="w-full rounded-btn border border-black/10 bg-white px-3 py-2 text-sm" />
            <input name="maxPrice" defaultValue={sp.get("maxPrice") ?? String(agg.maxPrice)} type="number" className="w-full rounded-btn border border-black/10 bg-white px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="md:col-span-12">
          <div className="text-xs text-sub">Тип кузова</div>
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            {(Object.keys(bodyLabels) as BodyType[]).map((bt) => {
              const selected = sp.getAll("bodyTypes").includes(bt);
              return (
                <label key={bt} className="inline-flex items-center gap-2">
                  <input type="checkbox" name="bodyTypes" value={bt} defaultChecked={selected} />
                  {bodyLabels[bt]}
                </label>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-12">
          <div className="text-xs text-sub">Топливо</div>
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            {(Object.keys(fuelLabels) as FuelType[]).map((f) => {
              const selected = sp.getAll("fuels").includes(f);
              return (
                <label key={f} className="inline-flex items-center gap-2">
                  <input type="checkbox" name="fuels" value={f} defaultChecked={selected} />
                  {fuelLabels[f]}
                </label>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-12">
          <div className="text-xs text-sub">Коробка</div>
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            {(Object.keys(transLabels) as TransmissionType[]).map((t) => {
              const selected = sp.getAll("transmissions").includes(t);
              return (
                <label key={t} className="inline-flex items-center gap-2">
                  <input type="checkbox" name="transmissions" value={t} defaultChecked={selected} />
                  {transLabels[t]}
                </label>
              );
            })}
          </div>
        </div>

        <input type="hidden" name="page" value="1" />
      </form>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>

      {items.length === 0 && <p className="mt-10 text-center text-sub">По выбранным фильтрам ничего не найдено.</p>}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <Link
            key={p}
            href={withParam({ page: String(p) })}
            className={`rounded-btn border px-3 py-1 text-sm ${p === page ? "border-primary bg-primary text-white" : "border-black/10"}`}
          >
            {p}
          </Link>
        ))}
      </div>
    </div>
  );
}
