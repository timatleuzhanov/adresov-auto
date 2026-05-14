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
      <section className="relative min-h-[88vh] overflow-hidden bg-black text-logo">
        <Image
          src="https://picsum.photos/seed/heroauto/1920/1080"
          alt=""
          fill
          priority
          className="object-cover grayscale opacity-50"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
        <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-4 pb-16 pt-28 md:min-h-[88vh] md:pt-32">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.25em] text-logo/60">Официальный автосалон</p>
            <h1 className="mt-4 max-w-3xl font-heading text-4xl font-bold leading-tight tracking-tight text-logo-bright md:text-5xl">
              Добро пожаловать в ADRESOV AUTO
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-logo/80">{settings?.slogan}</p>
            {(tg || ig) && (
              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                {tg && (
                  <a href={tg} target="_blank" rel="noopener noreferrer" className="border-b border-logo/45 pb-0.5 text-logo/90 hover:border-logo-bright">
                    Telegram
                  </a>
                )}
                {ig && (
                  <a href={ig} target="_blank" rel="noopener noreferrer" className="border-b border-logo/45 pb-0.5 text-logo/90 hover:border-logo-bright">
                    Instagram
                  </a>
                )}
              </div>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="rounded-btn border border-logo bg-logo px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black hover:bg-logo-bright"
              >
                Смотреть каталог
              </Link>
              <Link
                href="/#consultation"
                className="rounded-btn border border-logo px-6 py-3 text-sm font-semibold text-logo hover:bg-logo/10"
              >
                Записаться на консультацию
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-heading text-3xl font-bold text-primary">Популярные модели</h2>
            <p className="mt-2 text-sub">Подборка автомобилей в наличии и на заказ</p>
          </div>
          <Link href="/catalog" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Весь каталог →
          </Link>
        </Reveal>
        <div className="mt-8">
          <PopularSlider cars={featuredRes.items as (Car & { images: CarImage[] })[]} />
        </div>
      </section>

      {promotions.length > 0 && (
        <section className="border-y border-neutral-200 bg-neutral-50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal>
              <h2 className="font-heading text-3xl font-bold text-primary">Акции и спецпредложения</h2>
            </Reveal>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {promotions.map((p) => (
                <Reveal key={p.id}>
                  <article className="overflow-hidden rounded-card border border-neutral-200 bg-white shadow-card">
                    {p.image && (
                      <div className="relative aspect-[21/9]">
                        <Image
                          src={p.image}
                          alt=""
                          fill
                          className="object-cover grayscale"
                          sizes="(max-width:768px) 100vw,50vw"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-heading text-xl font-semibold text-primary">{p.title}</h3>
                      <p className="mt-2 text-sm text-sub">{p.description}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="font-heading text-3xl font-bold text-primary">Наши преимущества</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((a) => (
            <Reveal key={a.title}>
              <div className="h-full rounded-card border border-neutral-200 bg-white p-5 shadow-card">
                <div className="font-heading text-lg font-semibold text-primary">{a.title}</div>
                <p className="mt-2 text-sm text-sub">{a.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50 py-16" id="credit-calc">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="font-heading text-3xl font-bold text-primary">Кредитный калькулятор</h2>
            <p className="mt-2 text-sub">Расчёт на фронтенде по аннуитетной формуле (примерные значения)</p>
          </Reveal>
          <div className="mt-8">
            <CreditCalculator defaultRate={settings?.defaultCreditRate ?? 14.5} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal className="rounded-modal border border-neutral-800 bg-black p-8 text-logo md:p-10">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="font-heading text-2xl font-bold text-logo-bright md:text-3xl">Оставьте заявку — мы перезвоним за 15 минут</h2>
              <p className="mt-3 text-sm text-logo/70">Менеджер уточнит детали и подберёт автомобиль под ваш бюджет.</p>
            </div>
            <div className="rounded-card border border-neutral-200 bg-white p-5 text-ink">
              <LeadForm type={LeadType.CALLBACK} submitLabel="Отправить" />
            </div>
          </div>
        </Reveal>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50 py-16" id="consultation">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="grid gap-8 md:grid-cols-2 md:items-start">
            <div>
              <h2 className="font-heading text-3xl font-bold text-primary">Консультация</h2>
              <p className="mt-3 text-sub">
                Расскажите, какой автомобиль вас интересует: подготовим варианты по комплектациям, кредиту и trade-in.
              </p>
            </div>
            <div className="rounded-card border border-neutral-200 bg-white p-5 shadow-card">
              <LeadForm type={LeadType.CONSULTATION} submitLabel="Получить консультацию" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-heading text-3xl font-bold text-primary">О компании</h2>
            <p className="mt-3 text-sub">
              ADRESOV AUTO — современный автосалон в Алматы: продажа новых и подержанных автомобилей, trade-in, кредит и
              сервис. Мы строим долгосрочные отношения и сопровождаем клиента на всех этапах владения автомобилем.
            </p>
            <Link href="/about" className="mt-4 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline">
              Узнать больше →
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-neutral-200 shadow-card">
            <Image
              src="https://picsum.photos/seed/showroom/1200/900"
              alt="Шоурум"
              fill
              className="object-cover grayscale"
              sizes="(max-width:768px) 100vw,50vw"
            />
          </div>
        </Reveal>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="font-heading text-3xl font-bold text-primary">Контакты и карта</h2>
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
            <div className="mt-6 overflow-hidden rounded-card border border-neutral-200 shadow-card">
              <iframe title="Карта" src={settings.mapEmbedUrl} className="h-[360px] w-full border-0" loading="lazy" />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
