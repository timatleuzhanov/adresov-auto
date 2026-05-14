import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [cars, leadsNew, leadsToday, promos] = await Promise.all([
    prisma.car.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.promotion.count(),
  ]);

  const byType = await prisma.lead.groupBy({
    by: ["type"],
    _count: { _all: true },
  });

  return (
    <div className="rounded-card bg-white p-6 shadow-card">
      <h1 className="font-heading text-2xl font-bold text-primary">Дашборд</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-card border border-black/10 p-4">
          <div className="text-xs text-sub">Автомобилей в базе</div>
          <div className="mt-2 font-heading text-2xl font-bold">{cars}</div>
        </div>
        <div className="rounded-card border border-black/10 p-4">
          <div className="text-xs text-sub">Новых заявок</div>
          <div className="mt-2 font-heading text-2xl font-bold">{leadsNew}</div>
        </div>
        <div className="rounded-card border border-black/10 p-4">
          <div className="text-xs text-sub">Заявок сегодня</div>
          <div className="mt-2 font-heading text-2xl font-bold">{leadsToday}</div>
        </div>
        <div className="rounded-card border border-black/10 p-4">
          <div className="text-xs text-sub">Акций (всего)</div>
          <div className="mt-2 font-heading text-2xl font-bold">{promos}</div>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="font-heading text-lg font-bold text-primary">Заявки по типам</h2>
        <ul className="mt-3 space-y-2 text-sm text-sub">
          {byType.map((x) => (
            <li key={x.type}>
              {x.type}: {x._count._all}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
