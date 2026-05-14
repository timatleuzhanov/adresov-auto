import { LeadType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CreditCalculator } from "@/components/credit/CreditCalculator";
import { LeadForm } from "@/components/forms/LeadForm";

export const metadata = {
  title: "Кредит и лизинг — ADRESOV AUTO",
  description: "Кредитный калькулятор и заявка на кредит в Алматы",
};

export const dynamic = "force-dynamic";

export default async function CreditPage() {
  const s = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-heading text-3xl font-bold text-primary">Кредит и лизинг</h1>
      <p className="mt-3 max-w-3xl text-sub">
        Поможем подобрать программу банков-партнёров: классический кредит, рассрочка и лизинг для юридических лиц. Оставьте
        заявку — менеджер свяжется и подготовит расчёт.
      </p>
      <div className="mt-8">
        <CreditCalculator defaultRate={s?.defaultCreditRate ?? 14.5} />
      </div>
      <div className="mt-10 grid gap-6 rounded-card bg-muted p-6 md:grid-cols-2">
        <div>
          <h2 className="font-heading text-xl font-bold text-primary">Заявка на кредит</h2>
          <p className="mt-2 text-sm text-sub">Укажите первый взнос и срок — менеджер уточнит ставку по вашему профилю.</p>
        </div>
        <div className="rounded-card bg-white p-5 shadow-card">
          <LeadForm type={LeadType.CREDIT} submitLabel="Оформить заявку" />
        </div>
      </div>
    </div>
  );
}
