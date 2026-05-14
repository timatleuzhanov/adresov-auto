import Image from "next/image";
import Link from "next/link";
import type { Car, CarImage } from "@prisma/client";
import { LeadType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { queryCars, parseCatalogSearchParams } from "@/lib/car-query";
import { Reveal } from "@/components/motion/Reveal";
import { PopularSlider } from "@/components/cars/PopularSlider";
import { CreditCalculator } from "@/components/credit/CreditCalculator";
import { LeadForm } from "@/components/forms/LeadForm";
import { HomeHero } from "@/components/home/HomeHero";
import { LANDING_SHOWROOM_IMAGE } from "@/lib/landing-stock-images";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  const now = new Date();

  const [featuredRes, promotions] = await Promise.all([
    queryCars(parseCatalogSearchParams(new URLSearchParams({ featured: "1", limit: "6", page: "1" }))),
    prisma.promotion.findMany({
      where: { startDate: { lte: now }, endDate: { gte: now } },
      orderBy: { endDate: "asc" },
      take: 4,
    }),
  ]);

  const advantages = [
    { title: "Официальный дилер", text: "Прозрачная история и гарантия качества." },
    { title: "Кредит от 0%", text: "Партнёрские программы банков на выгодных условиях." },
    { title: "Trade-in", text: "Оценка и выкуп вашего авто за один визит." },
    { title: "Гарантия", text: "Юридически чистые сделки и поддержка." },
    { title: "Консультация", text: "Подберём комплектацию и финансовую программу под ваши задачи." },
    { title: "Сервис", text: "Собственная станция технического обслуживания." },
  ];

  const tg = settings?.telegramUrl;
  const ig = settings?.instagramUrl;

  return (
    <div className="bg-white text-neutral-900">
      <HomeHero slogan={settings?.slogan} telegramUrl={tg} instagramUrl={ig} />

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-heading text-3xl font-bold text-primary md:text-4xl">Популярные модели</h2>
            <p className="mt-2 max-w-xl text-sub">Подборка автомобилей в наличии и на заказ</p>
          </div>
          <Link
            href="/catalog"
            className="shrink-0 text-sm font-semibold text-primary underline-offset-4 transition hover:underline"
          >
            Весь каталог →
          </Link>
        </Reveal>
        <div className="mt-10">
          <PopularSlider cars={featuredRes.items as (Car & { images: CarImage[] })[]} />
        </div>
      </section>

      {promotions.length > 0 && (
        <section className="border-y border-neutral-200 bg-gradient-to-b from-neutral-50 to-white py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal>
              <h2 className="font-heading text-3xl font-bold text-primary md:text-4xl">Акции и спецпредложения</h2>
            </Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {promotions.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.08}>
                  <article className="group overflow-hidden rounded-card border border-neutral-200/80 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
                    {p.image && (
                      <div className="relative aspect-[21/9] overflow-hidden">
                        <Image
                          src={p.image}
                          alt=""
                          fill
                          className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
                          sizes="(max-width:768px) 100vw,50vw"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition group-hover:opacity-100" />
                      </div>
                    )}
                    <div className="p-5 md:p-6">
                      <h3 className="font-heading text-xl font-semibold text-primary">{p.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-sub">{p.description}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <Reveal>
          <h2 className="font-heading text-3xl font-bold text-primary md:text-4xl">Наши преимущества</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.06}>
              <div className="h-full rounded-card border border-neutral-200 bg-white p-5 shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)]">
                <div className="font-heading text-lg font-semibold text-primary">{a.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-sub">{a.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50 py-16 md:py-20" id="credit-calc">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="font-heading text-3xl font-bold text-primary md:text-4xl">Кредитный калькулятор</h2>
            <p className="mt-2 text-sub">Расчёт на фронтенде по аннуитетной формуле (примерные значения)</p>
          </Reveal>
          <div className="mt-10">
            <CreditCalculator defaultRate={settings?.defaultCreditRate ?? 14.5} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <Reveal className="rounded-modal border border-neutral-800 bg-gradient-to-br from-neutral-950 via-black to-neutral-900 p-8 text-logo shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-10">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="font-heading text-2xl font-bold text-logo-bright md:text-3xl">
                Оставьте заявку — мы перезвоним за 15 минут
              </h2>
              <p className="mt-3 text-sm text-logo/70">Менеджер уточнит детали и подберёт автомобиль под ваш бюджет.</p>
            </div>
            <div className="rounded-card border border-white/10 bg-white p-5 text-ink shadow-lg">
              <LeadForm type={LeadType.CALLBACK} submitLabel="Отправить" />
            </div>
          </div>
        </Reveal>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50 py-16 md:py-20" id="consultation">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            <Reveal>
              <h2 className="font-heading text-3xl font-bold text-primary md:text-4xl">Консультация</h2>
              <p className="mt-3 text-sub leading-relaxed">
                Расскажите, какой автомобиль вас интересует: подготовим варианты по комплектациям, кредиту и trade-in.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-card border border-neutral-200 bg-white p-5 shadow-card md:p-6">
                <LeadForm type={LeadType.CONSULTATION} submitLabel="Получить консультацию" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <Reveal>
            <h2 className="font-heading text-3xl font-bold text-primary md:text-4xl">О компании</h2>
            <p className="mt-3 text-sub leading-relaxed">
              ADRESOV AUTO — современный автосалон в Алматы: продажа новых и подержанных автомобилей, trade-in, кредит и
              сервис. Мы строим долгосрочные отношения и сопровождаем клиента на всех этапах владения автомобилем.
            </p>
            <Link
              href="/about"
              className="mt-5 inline-block text-sm font-semibold text-primary underline-offset-4 transition hover:underline"
            >
              Узнать больше →
            </Link>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="group relative aspect-[4/3] overflow-hidden rounded-card border border-neutral-200 shadow-card">
              <Image
                src={LANDING_SHOWROOM_IMAGE}
                alt="Автосалон"
                fill
                className="object-cover transition duration-[1.1s] ease-out group-hover:scale-105"
                sizes="(max-width:768px) 100vw,50vw"
              />
              <div className="pointer-events-none absolute inset-0 rounded-card ring-1 ring-inset ring-black/5" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="font-heading text-3xl font-bold text-primary md:text-4xl">Контакты и карта</h2>
            <p className="mt-2 text-sub">{settings?.address}</p>
            <p className="mt-1 text-sm text-sub">{settings?.workHours}</p>
            <p className="mt-2">
              <a className="font-semibold text-primary hover:underline" href={`tel:${settings?.phone?.replace(/\s/g, "")}`}>
                {settings?.phone}
              </a>
            </p>
            {(tg || ig) && (
              <p className="mt-4 flex flex-wrap gap-4 text-sm">
                {tg && (
                  <a href={tg} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                    Telegram
                  </a>
                )}
                {ig && (
                  <a href={ig} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                    Instagram
                  </a>
                )}
              </p>
            )}
          </Reveal>
          {settings?.mapEmbedUrl && (
            <Reveal delay={0.08} className="mt-6">
              <div className="overflow-hidden rounded-card border border-neutral-200 shadow-card">
                <iframe title="Карта" src={settings.mapEmbedUrl} className="h-[360px] w-full border-0" loading="lazy" />
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </div>
  );
}
