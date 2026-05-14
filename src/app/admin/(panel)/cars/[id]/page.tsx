import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession, canEditCars } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminCarDetailPage({ params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) redirect("/admin/login");
  if (!canEditCars(s.role)) redirect("/admin/dashboard");

  const car = await prisma.car.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { sort: "asc" } }, trims: true },
  });
  if (!car) notFound();

  return (
    <div className="space-y-6">
      <div className="rounded-card bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold text-primary">
              {car.brand} {car.model} {car.year}
            </h1>
            <p className="mt-1 text-sm text-sub">{car.slug}</p>
          </div>
          <Link className="text-sm font-semibold text-primary hover:underline" href={`/catalog/${car.slug}`}>
            Открыть на сайте →
          </Link>
        </div>
        <dl className="mt-6 grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-sub">Статус</dt>
            <dd className="font-medium">{car.status}</dd>
          </div>
          <div>
            <dt className="text-sub">Цена</dt>
            <dd className="font-medium">{car.priceOnRequest ? "По запросу" : car.priceFrom?.toLocaleString("ru-RU")}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sub">Описание</dt>
            <dd className="font-medium">{car.description}</dd>
          </div>
        </dl>
      </div>
      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-heading text-lg font-bold text-primary">Фото ({car.images.length})</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-sub">
          {car.images.map((im) => (
            <li key={im.id}>{im.path}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
