import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession, canEditCars } from "@/lib/auth";
import { CarForm, type CarFormInitial } from "@/components/cars/CarForm";

export default async function AdminCarDetailPage({ params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) redirect("/admin/login");
  if (!canEditCars(s.role)) redirect("/admin/dashboard");

  const car = await prisma.car.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { sort: "asc" } }, trims: { orderBy: { price: "asc" } } },
  });
  if (!car) notFound();

  const initial: CarFormInitial = {
    brand: car.brand,
    model: car.model,
    year: car.year,
    slug: car.slug,
    bodyType: car.bodyType,
    fuel: car.fuel,
    transmission: car.transmission,
    condition: car.condition,
    status: car.status,
    featured: car.featured,
    priceFrom: car.priceFrom,
    priceUsd: (car as { priceUsd?: number | null }).priceUsd ?? null,
    priceRub: (car as { priceRub?: number | null }).priceRub ?? null,
    priceOnRequest: car.priceOnRequest,
    mileage: car.mileage,
    engine: car.engine,
    drive: car.drive,
    acceleration: car.acceleration,
    maxSpeed: car.maxSpeed,
    fuelConsumption: car.fuelConsumption,
    trunkVolume: car.trunkVolume,
    color: car.color,
    vin: car.vin,
    description: car.description,
    titleSeo: car.titleSeo,
    descSeo: car.descSeo,
    images: car.images.map((im) => im.path),
    trims: car.trims.map((t) => ({ name: t.name, price: t.price, optionsJson: t.optionsJson })),
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/cars" className="text-sm text-neutral-500 hover:underline">
          ← Все автомобили
        </Link>
        <Link
          href={`/catalog/${car.slug}`}
          target="_blank"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Открыть на сайте →
        </Link>
      </div>
      <CarForm initial={initial} carId={car.id} />
    </div>
  );
}
