import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PromotionsPage() {
  const now = new Date();
  const items = await prisma.promotion.findMany({
    where: { startDate: { lte: now }, endDate: { gte: now } },
    orderBy: { endDate: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-heading text-3xl font-bold text-primary">Акции и спецпредложения</h1>
      <p className="mt-2 text-sub">Актуальные предложения с датой окончания</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map((p) => (
          <article key={p.id} className="rounded-card bg-white p-6 shadow-card">
            <h2 className="font-heading text-xl font-semibold text-primary">{p.title}</h2>
            <p className="mt-2 text-sm text-sub">{p.description}</p>
            <p className="mt-3 text-xs text-sub">
              До {p.endDate.toLocaleDateString("ru-RU")}
            </p>
          </article>
        ))}
      </div>
      {items.length === 0 && <p className="mt-8 text-sub">Сейчас нет активных акций.</p>}
      <div className="mt-10">
        <Link href="/catalog" className="text-sm font-semibold text-primary hover:underline">
          Перейти в каталог →
        </Link>
      </div>
    </div>
  );
}
