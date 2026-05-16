"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

/** Фон первого экрана: `public/images/1.webp` */
export const HOME_HERO_IMAGE = "/images/1.webp";

const easeOut = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.13, delayChildren: 0.18 },
  },
};

const item = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
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
  const router = useRouter();
  const tg = telegramUrl;
  const ig = instagramUrl;

  function handleConsultation(e: React.MouseEvent) {
    e.preventDefault();
    const el = document.getElementById("consultation");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push("/#consultation");
    }
  }

  return (
    <section className="relative min-h-[88vh] overflow-hidden bg-black text-logo">
      {/* Фон */}
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
        {/* Оверлей */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/52 to-black/72" />
        {/* Световой акцент слева */}
        <motion.div
          className="absolute -left-1/4 top-0 h-[70%] w-1/2 skew-x-12 bg-gradient-to-r from-logo/10 to-transparent"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.4, ease: easeOut, delay: 0.1 }}
        />
        {/* Нижняя виньетка */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-4 pb-16 pt-28 md:min-h-[88vh] md:pt-32">
        <motion.div variants={container} initial="hidden" animate="show">
          {/* Подзаголовок */}
          <motion.p
            variants={item}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-logo/60"
          >
            <motion.span
              className="inline-block h-px w-8 bg-logo/40"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: easeOut }}
              style={{ originX: 0 }}
            />
            Официальный автосалон
          </motion.p>

          {/* Заголовок */}
          <motion.h1
            variants={item}
            className="mt-5 max-w-3xl font-heading text-4xl font-bold leading-[1.06] tracking-tight text-logo-bright md:text-5xl lg:text-[3.4rem]"
          >
            Добро пожаловать в{" "}
            <span className="relative inline-block">
              ADRESOV AUTO
              <motion.span
                className="absolute -bottom-1 left-0 h-[2px] w-full bg-logo/30"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.9, ease: easeOut }}
                style={{ originX: 0 }}
              />
            </span>
          </motion.h1>

          {/* Слоган */}
          <motion.p variants={item} className="mt-5 max-w-2xl text-lg text-logo/80 text-balance">
            {slogan?.trim() || "Ваш путь к идеальному автомобилю начинается здесь"}
          </motion.p>

          {/* Соцсети */}
          {(tg || ig) && (
            <motion.div variants={item} className="mt-7 flex flex-wrap gap-5 text-sm">
              {tg && (
                <a
                  href={tg}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b border-logo/35 pb-0.5 text-logo/80 transition-colors hover:border-logo-bright hover:text-logo-bright"
                >
                  Telegram
                </a>
              )}
              {ig && (
                <a
                  href={ig}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b border-logo/35 pb-0.5 text-logo/80 transition-colors hover:border-logo-bright hover:text-logo-bright"
                >
                  Instagram
                </a>
              )}
            </motion.div>
          )}

          {/* Кнопки */}
          <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
            <motion.a
              href="/catalog"
              className="rounded-btn border border-logo bg-logo px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-black shadow-[0_0_28px_rgba(224,224,224,0.18)] transition hover:bg-logo-bright hover:shadow-[0_0_36px_rgba(224,224,224,0.28)]"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              Смотреть каталог
            </motion.a>
            <motion.button
              onClick={handleConsultation}
              className="rounded-btn border border-logo/70 bg-black/30 px-7 py-3.5 text-sm font-semibold text-logo backdrop-blur-sm transition hover:border-logo hover:bg-logo/10"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              Записаться на консультацию
            </motion.button>
          </motion.div>

          {/* Скролл-хинт */}
          <motion.div
            variants={item}
            className="mt-16 hidden items-center gap-2 text-xs text-logo/40 md:flex"
          >
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            >
              ↓
            </motion.span>
            <span className="tracking-widest uppercase">Прокрутите</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
