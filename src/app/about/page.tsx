import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { VedLogoMark } from "@/components/VedLogo";
import { PageBackground } from "@/components/PageBackground";

export const metadata: Metadata = {
  title: "О компании",
  description:
    "ВЭД — онлайн-автосалон для импорта автомобилей под ключ. Сопровождение от выбора авто до таможни и доставки в РФ.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "О компании ВЭД",
    description:
      "ВЭД — онлайн-автосалон для импорта автомобилей под ключ. Сопровождение от выбора авто до таможни и доставки в РФ.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <main className="relative ved-screen bg-ved-navy">
      <PageBackground />
      <Header />
      <div className="relative z-10 mx-auto max-w-3xl px-8 py-12 md:px-12">
        <VedLogoMark className="mb-8 h-16 w-auto md:h-20" />
        <h1 className="text-3xl font-light uppercase tracking-[0.15em]">О компании ВЭД</h1>
        <p className="mt-6 leading-relaxed text-white/70">
          ВЭД — онлайн-автосалон для импорта автомобилей под ключ. Мы сопровождаем клиента от
          выбора авто до таможни и доставки в РФ.
        </p>
        <p className="mt-4 leading-relaxed text-white/70">
          Сайт vedcompany.ru — личный кабинет, чат с менеджером и отслеживание заказа.
        </p>
        <div className="mt-10 border border-white/10 bg-white/5 p-6 text-sm leading-relaxed text-white/55">
          <h2 className="text-xs uppercase tracking-[0.2em] text-white/60">Источники данных</h2>
          <p className="mt-3">
            VED (vedcompany.ru) не является официальным партнёром, дилером или представителем Autohome
            (汽车之家) и других зарубежных площадок. Мы не используем их товарные знаки в рекламных целях.
          </p>
          <p className="mt-3">
            Сведения об автомобилях публикуются в справочных целях на основе лицензированных API-партнёров
            или демонстрационных данных. Цены и комплектация не являются публичной офертой.
            Актуальные условие покупки и импорта уточняйте у менеджера.
          </p>
          <p className="mt-3 text-white/40">
            Прямой парсинг и копирование контента Autohome без разрешения правообладателя не применяется.
          </p>
        </div>
      </div>
    </main>
  );
}
