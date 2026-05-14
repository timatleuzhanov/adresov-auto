import { LeadType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { LeadForm } from "@/components/forms/LeadForm";

export const metadata = {
  title: "Контакты — ADRESOV AUTO",
  description: "Адрес, телефон, карта и форма обратного звонка",
};

export default async function ContactsPage() {
  const s = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-heading text-3xl font-bold text-primary">Контакты</h1>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <p className="text-sub">{s?.address}</p>
          <p className="mt-3 text-sm text-sub">{s?.workHours}</p>
          <p className="mt-4">
            <a className="text-lg font-semibold text-primary hover:underline" href={`tel:${s?.phone?.replace(/\s/g, "")}`}>
              {s?.phone}
            </a>
          </p>
          <p className="mt-2">
            <a className="text-sm font-semibold text-primary hover:underline" href={`mailto:${s?.email}`}>
              {s?.email}
            </a>
          </p>
          {s?.whatsapp && (
            <p className="mt-4">
              <a
                className="rounded-btn bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
                href={`https://wa.me/${s.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                Написать в WhatsApp
              </a>
            </p>
          )}
          {s?.mapEmbedUrl && (
            <div className="mt-6 overflow-hidden rounded-card shadow-card">
              <iframe title="Карта" src={s.mapEmbedUrl} className="h-[360px] w-full border-0" loading="lazy" />
            </div>
          )}
        </div>
        <div className="rounded-card bg-white p-6 shadow-card">
          <h2 className="font-heading text-xl font-bold text-primary">Обратный звонок</h2>
          <div className="mt-4">
            <LeadForm type={LeadType.CALLBACK} submitLabel="Жду звонка" />
          </div>
        </div>
      </div>
    </div>
  );
}
