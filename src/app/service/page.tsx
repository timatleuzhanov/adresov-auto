import { LeadType } from "@prisma/client";
import { LeadForm } from "@/components/forms/LeadForm";

export const metadata = {
  title: "Сервис — ADRESOV AUTO",
  description: "Техническое обслуживание и ремонт, запись на сервис",
};

export default function ServicePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-heading text-3xl font-bold text-primary">Сервис</h1>
      <p className="mt-3 max-w-3xl text-sub">
        Диагностика, ТО, шиномонтаж и мелкий ремонт. Работаем по регламентам производителей и используем оригинальные и
        проверенные аналоги запчастей.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-card bg-muted p-6">
          <h2 className="font-heading text-xl font-bold text-primary">Услуги</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-sub">
            <li>Регламентное ТО</li>
            <li>Диагностика ходовой и электрики</li>
            <li>Кондиционирование и отопление</li>
            <li>Предпродажная подготовка</li>
          </ul>
        </div>
        <div className="rounded-card bg-white p-6 shadow-card">
          <h2 className="font-heading text-xl font-bold text-primary">Запись на сервис</h2>
          <div className="mt-4">
            <LeadForm type={LeadType.SERVICE} submitLabel="Записаться" />
          </div>
        </div>
      </div>
    </div>
  );
}
