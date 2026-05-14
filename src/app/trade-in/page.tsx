import { LeadType } from "@prisma/client";
import { LeadForm } from "@/components/forms/LeadForm";

export const metadata = {
  title: "Trade-in — ADRESOV AUTO",
  description: "Оценка и выкуп вашего автомобиля в зачёт нового",
};

export default function TradeInPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-heading text-3xl font-bold text-primary">Trade-in</h1>
      <p className="mt-3 max-w-3xl text-sub">
        Принимаем ваш автомобиль в зачёт покупки: быстрая оценка, прозрачная сделка и помощь с документами.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-card bg-muted p-6">
          <h2 className="font-heading text-xl font-bold text-primary">Как это работает</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-sub">
            <li>Оставьте заявку с данными автомобиля.</li>
            <li>Менеджер свяжется и назначит осмотр.</li>
            <li>Фиксируем цену выкупа и зачитываем в новый автомобиль.</li>
          </ol>
        </div>
        <div className="rounded-card bg-white p-6 shadow-card">
          <h2 className="font-heading text-xl font-bold text-primary">Оценка авто</h2>
          <div className="mt-4">
            <LeadForm type={LeadType.TRADE_IN} submitLabel="Отправить на оценку" />
          </div>
        </div>
      </div>
    </div>
  );
}
