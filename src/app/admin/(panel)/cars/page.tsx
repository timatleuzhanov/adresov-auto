import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAdminSession, canEditCars } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DeleteCarButton } from "./DeleteCarButton";

export default async function AdminCarsPage() {
  const s = await getAdminSession();
  if (!s) redirect("/admin/login");
  if (!canEditCars(s.role)) redirect("/admin/dashboard");

  const cars = await prisma.car.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: { images: { orderBy: { sort: "asc" }, take: 1 } },
  });

  return (
    <div className="rounded-card bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-primary">Автомобили</h1>
        <Link href="/admin/cars/new" className="rounded-btn bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800">
          Добавить
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs text-sub">
            <tr>
              <th className="py-2">Авто</th>
              <th className="py-2">Статус</th>
              <th className="py-2">Цена</th>
              <th className="py-2 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {cars.map((c) => (
              <tr key={c.id} className="border-t border-black/10">
                <td className="py-3">
                  <Link className="font-semibold text-primary hover:underline" href={`/admin/cars/${c.id}`}>
                    {c.brand} {c.model} {c.year}
                  </Link>
                  <div className="text-xs text-sub">{c.slug}</div>
                </td>
                <td className="py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    c.status === "IN_STOCK" ? "bg-green-100 text-green-700" :
                    c.status === "ON_ORDER" ? "bg-blue-100 text-blue-700" :
                    c.status === "SOLD" ? "bg-neutral-100 text-neutral-500" :
                    "bg-red-100 text-red-500"
                  }`}>
                    {c.status === "IN_STOCK" ? "В наличии" :
                     c.status === "ON_ORDER" ? "Под заказ" :
                     c.status === "SOLD" ? "Продано" : "Архив"}
                  </span>
                </td>
                <td className="py-3">{c.priceOnRequest ? "По запросу" : c.priceFrom?.toLocaleString("ru-RU")}</td>
                <td className="py-3">
                  <DeleteCarButton carId={c.id} carName={`${c.brand} ${c.model} ${c.year}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
