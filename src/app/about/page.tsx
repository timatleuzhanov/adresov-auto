import { Reveal } from "@/components/motion/Reveal";

export const metadata = {
  title: "О компании — ADRESOV AUTO",
  description: "История, преимущества и команда автосалона ADRESOV AUTO в Алматы",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-heading text-3xl font-bold text-primary">О компании</h1>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <Reveal>
          <h2 className="font-heading text-xl font-bold text-primary">История</h2>
          <p className="mt-3 text-sub">
            ADRESOV AUTO развивается как современный дилерский центр с акцентом на сервис и честные условия сделки. Мы
            объединяем продажи новых и подержанных автомобилей, trade-in и собственный сервис.
          </p>
        </Reveal>
        <Reveal>
          <h2 className="font-heading text-xl font-bold text-primary">Преимущества</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sub">
            <li>Прозрачная проверка юридической чистоты</li>
            <li>Гибкие программы кредитования</li>
            <li>Сопровождение сделки «под ключ»</li>
          </ul>
        </Reveal>
      </div>
      <Reveal className="mt-10 rounded-card bg-muted p-6">
        <h2 className="font-heading text-xl font-bold text-primary">Лицензии</h2>
        <p className="mt-3 text-sm text-sub">Реквизиты и лицензии предоставляются по запросу в дилерском центре.</p>
      </Reveal>
    </div>
  );
}
