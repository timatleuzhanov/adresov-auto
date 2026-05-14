import Image from "next/image";
import Link from "next/link";
import type { Car, CarImage } from "@prisma/client";
import { formatPriceFrom } from "@/lib/format";

export type CarCardModel = Car & { images: CarImage[] };

function tags(tagsJson: string): string[] {
  try {
    const t = JSON.parse(tagsJson) as unknown;
    return Array.isArray(t) ? t.map(String) : [];
  } catch {
    return [];
  }
}

export function CarCard({ car }: { car: CarCardModel }) {
  const img = car.images[0]?.path;
  const tagList = tags(car.tagsJson);
  return (
    <article className="overflow-hidden rounded-card border border-neutral-200 bg-white shadow-card">
      <Link href={`/catalog/${car.slug}`} className="block">
        <div className="relative aspect-[16/9] bg-muted">
          {img ? (
            <Image
              src={img}
              alt={`${car.brand} ${car.model}`}
              fill
              className="object-cover grayscale"
              sizes="(max-width:768px) 100vw, 33vw"
            />
          ) : null}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {car.condition === "NEW" && (
              <span className="rounded-btn bg-primary px-2 py-1 text-xs font-semibold text-white">Новый</span>
            )}
            {car.condition === "USED" && (
              <span className="rounded-btn border border-neutral-600 bg-neutral-800 px-2 py-1 text-xs font-semibold text-white">С пробегом</span>
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
            {car.engine} · {car.transmission === "AUTO" ? "Автомат" : car.transmission === "MANUAL" ? "Механика" : "Вариатор"}{" "}
            · {car.mileage ? `${car.mileage.toLocaleString("ru-RU")} км` : "0 км"}
          </div>
        </div>
        <div className="font-heading text-xl font-bold text-ink">{formatPriceFrom(car.priceFrom, car.priceOnRequest)}</div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/catalog/${car.slug}`}
            className="rounded-btn border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-muted"
          >
            Подробнее
          </Link>
          <Link
            href={`/catalog/${car.slug}#request`}
            className="rounded-btn bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Заявка
          </Link>
        </div>
      </div>
    </article>
  );
}
