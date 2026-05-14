"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

/** Unsplash — ночной снимок спорткара (демо). */
export const HOME_HERO_IMAGE =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1920&q=86";

const easeOut = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: easeOut },
  },
};

export function HomeHero({
  slogan,
  telegramUrl,
  instagramUrl,
}: {
  slogan: string | null | undefined;
  telegramUrl?: string | null;
  instagramUrl?: string | null;
}) {
  const tg = telegramUrl;
  const ig = instagramUrl;

  return (
    <section className="relative min-h-[88vh] overflow-hidden bg-black text-logo">
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-kenburns absolute inset-[-8%]">
          <Image
            src={HOME_HERO_IMAGE}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/82 to-black/95" />
        <motion.div
          className="absolute -left-1/4 top-0 h-[70%] w-1/2 skew-x-12 bg-gradient-to-r from-logo/12 to-transparent"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: easeOut, delay: 0.2 }}
        />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-4 pb-16 pt-28 md:min-h-[88vh] md:pt-32">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.p variants={item} className="text-xs uppercase tracking-[0.28em] text-logo/65">
            Официальный автосалон
          </motion.p>
          <motion.h1
            variants={item}
            className="mt-4 max-w-3xl font-heading text-4xl font-bold leading-[1.08] tracking-tight text-logo-bright md:text-5xl lg:text-[3.25rem]"
          >
            Добро пожаловать в ADRESOV AUTO
          </motion.h1>
          <motion.p variants={item} className="mt-4 max-w-2xl text-lg text-logo/85 text-balance">
            {slogan?.trim() || "Ваш путь к идеальному автомобилю начинается здесь"}
          </motion.p>
          {(tg || ig) && (
            <motion.div variants={item} className="mt-6 flex flex-wrap gap-4 text-sm">
              {tg && (
                <a
                  href={tg}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b border-logo/45 pb-0.5 text-logo/90 transition-colors hover:border-logo-bright hover:text-logo-bright"
                >
                  Telegram
                </a>
              )}
              {ig && (
                <a
                  href={ig}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b border-logo/45 pb-0.5 text-logo/90 transition-colors hover:border-logo-bright hover:text-logo-bright"
                >
                  Instagram
                </a>
              )}
            </motion.div>
          )}
          <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="rounded-btn border border-logo bg-logo px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black shadow-[0_0_24px_rgba(224,224,224,0.15)] transition hover:bg-logo-bright hover:shadow-[0_0_28px_rgba(224,224,224,0.22)]"
            >
              Смотреть каталог
            </Link>
            <Link
              href="/#consultation"
              className="rounded-btn border border-logo/80 bg-black/30 px-6 py-3 text-sm font-semibold text-logo backdrop-blur-sm transition hover:border-logo hover:bg-logo/10"
            >
              Записаться на консультацию
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
