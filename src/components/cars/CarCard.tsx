"use client";

import Image from "next/image";
import Link from "next/link";
import type { Car, CarImage } from "@prisma/client";
import { PriceDisplay } from "./PriceDisplay";
import { CurrencyToggle } from "./CurrencyToggle";
import { useLocale } from "@/lib/locale";

export type CarCardModel = Car & { images: CarImage[] };

function parseTags(tagsJson: string): string[] {
  try {
    const t = JSON.parse(tagsJson) as unknown;
    return Array.isArray(t) ? t.map(String) : [];
  } catch {
    return [];
  }
}

export function CarCard({ car }: { car: CarCardModel }) {
  const img = car.images[0]?.path;
  const tagList = parseTags(car.tagsJson);
  const { t } = useLocale();

  const transmissionLabel =
    car.transmission === "AUTO" ? t.car.auto :
    car.transmission === "MANUAL" ? t.car.manual :
    t.car.variator;

  return (
    <article className="group overflow-hidden rounded-card border border-neutral-200 bg-white shadow-card transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
      <Link href={`/catalog/${car.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {img ? (
            <Image
              src={img}
              alt={`${car.brand} ${car.model}`}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              sizes="(max-width:768px) 100vw, 33vw"
            />
          ) : null}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {car.condition === "NEW" && (
              <span className="rounded-btn bg-primary px-2 py-1 text-xs font-semibold text-white">{t.car.new}</span>
            )}
            {car.condition === "USED" && (
              <span className="rounded-btn border border-neutral-600 bg-neutral-800 px-2 py-1 text-xs font-semibold text-white">{t.car.used}</span>
            )}
            {tagList.includes("Акция") && (
              <span className="rounded-btn border border-white bg-white px-2 py-1 text-xs font-semibold text-black">Акция</span>
            )}
          </div>
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <Link href={`/catalog/${car.slug}`} className="font-heading text-lg font-semibold text-primary hover:underline">
            {car.brand} {car.model} {car.year}
          </Link>
          <div className="mt-1 text-sm text-sub">
            {car.engine} · {transmissionLabel}{" "}
            · {car.mileage ? `${car.mileage.toLocaleString("ru-RU")} ${t.car.km}` : `0 ${t.car.km}`}
          </div>
        </div>
        <div>
          <div className="font-heading text-xl font-bold text-ink">
            <PriceDisplay priceFrom={car.priceFrom} priceOnRequest={car.priceOnRequest} showFrom />
          </div>
          {!car.priceOnRequest && car.priceFrom != null && (
            <div className="mt-1.5">
              <CurrencyToggle />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/catalog/${car.slug}`}
            className="rounded-btn border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-muted"
          >
            {t.more}
          </Link>
          <Link
            href={`/catalog/${car.slug}#request`}
            className="rounded-btn bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            {t.request}
          </Link>
        </div>
      </div>
    </article>
  );
}
