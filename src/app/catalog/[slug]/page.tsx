import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadType, CarStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CarGallery } from "@/components/cars/CarGallery";
import { LeadForm } from "@/components/forms/LeadForm";
import { CarCard } from "@/components/cars/CarCard";
import { Reveal } from "@/components/motion/Reveal";
import { PriceDisplay } from "@/components/cars/PriceDisplay";
import { CurrencyToggle } from "@/components/cars/CurrencyToggle";
import { TrimList } from "@/components/cars/TrimList";

function tags(tagsJson: string): string[] {
  try {
    const t = JSON.parse(tagsJson) as unknown;
    return Array.isArray(t) ? t.map(String) : [];
  } catch {
    return [];
  }
}

function statusLabel(s: CarStatus) {
  if (s === CarStatus.IN_STOCK) return "В наличии";
  if (s === CarStatus.ON_ORDER) return "Под заказ";
  if (s === CarStatus.SOLD) return "Продано";
  return "Архив";
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const car = await prisma.car.findFirst({
    where: { slug: params.slug, status: { not: CarStatus.ARCHIVE } },
    select: { brand: true, model: true, year: true, titleSeo: true, descSeo: true },
  });
  if (!car) return { title: "Не найдено" };
  return {
    title: car.titleSeo ?? `${car.brand} ${car.model} ${car.year} — ADRESOV AUTO`,
    description: car.descSeo ?? `Купить ${car.brand} ${car.model} ${car.year} в Алматы`,
  };
}

export default async function CarPage({ params }: { params: { slug: string } }) {
  const car = await prisma.car.findFirst({
    where: { slug: params.slug, status: { not: CarStatus.ARCHIVE } },
    include: {
      images: { orderBy: { sort: "asc" } },
      trims: { orderBy: { price: "asc" } },
    },
  });
  if (!car) notFound();

  const similar = await prisma.car.findMany({
    where: {
      id: { not: car.id },
      status: { not: CarStatus.ARCHIVE },
      OR: [{ brand: car.brand }, { bodyType: car.bodyType }],
    },
    take: 4,
    include: { images: { orderBy: { sort: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${car.brand} ${car.model}`,
    modelDate: String(car.year),
    brand: { "@type": "Brand", name: car.brand },
    vehicleIdentificationNumber: car.vin ?? undefined,
    color: car.color,
    offers: {
      "@type": "Offer",
      priceCurrency: "KZT",
      price: car.priceOnRequest ? undefined : car.priceFrom ?? undefined,
      availability:
        car.status === CarStatus.IN_STOCK
          ? "https://schema.org/InStock"
          : car.status === CarStatus.SOLD
            ? "https://schema.org/SoldOut"
            : "https://schema.org/PreOrder",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-sm text-sub">
        <Link href="/" className="hover:underline">
          Главная
        </Link>
        <span className="mx-2">/</span>
        <Link href="/catalog" className="hover:underline">
          Каталог
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">
          {car.brand} {car.model}
        </span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <CarGallery images={car.images} alt={`${car.brand} ${car.model}`} />
        </div>
        <div className="lg:col-span-5">
          <h1 className="font-heading text-3xl font-bold text-primary md:text-4xl">
            {car.brand} {car.model} {car.year}
          </h1>
          <p className="mt-2 text-sm text-sub">{statusLabel(car.status)}</p>
          <div className="mt-4">
            <div className="font-heading text-3xl font-bold text-ink">
              <PriceDisplay priceFrom={car.priceFrom} priceOnRequest={car.priceOnRequest} />
            </div>
            {!car.priceOnRequest && car.priceFrom != null && (
              <div className="mt-2">
                <CurrencyToggle />
              </div>
            )}
          </div>
          <p className="mt-4 text-sub">{car.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags(car.tagsJson).map((t) => (
              <span key={t} className="rounded-btn bg-muted px-2 py-1 text-xs font-semibold text-primary">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-heading text-2xl font-bold text-primary">Характеристики</h2>
        <dl className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            ["Двигатель", car.engine],
            ["Коробка передач", car.transmission === "AUTO" ? "Автомат" : car.transmission === "MANUAL" ? "Механика" : "Вариатор"],
            ["Привод", car.drive],
            ["Разгон 0–100", car.acceleration],
            ["Максимальная скорость", car.maxSpeed],
            ["Расход (смешанный)", car.fuelConsumption],
            ["Объём багажника", car.trunkVolume],
            ["Пробег", `${car.mileage.toLocaleString("ru-RU")} км`],
            ["Цвет", car.color],
            ["VIN", car.vin ?? "—"],
          ].map(([k, v]) => (
            <div key={String(k)} className="flex justify-between gap-4 rounded-btn border border-black/10 bg-white px-4 py-3 text-sm">
              <dt className="text-sub">{k}</dt>
              <dd className="text-right font-medium text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-2xl font-bold text-primary">Комплектации</h2>
        <TrimList trims={car.trims} />
      </section>

      <section className="mt-12" id="request">
        <Reveal className="grid gap-6 rounded-card bg-muted p-6 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary">Заявка</h2>
            <p className="mt-2 text-sm text-sub">Тест-драйв, кредит, покупка или вопрос менеджеру.</p>
          </div>
          <LeadForm type={LeadType.PURCHASE} carSlug={car.slug} submitLabel="Отправить заявку" />
        </Reveal>
      </section>

      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-primary">Похожие автомобили</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {similar.map((c) => (
              <CarCard key={c.id} car={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
