import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { VedLogoMark } from "@/components/VedLogo";
import { PageBackground } from "@/components/PageBackground";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "О компании",
  description:
    "VED — импорт автомобилей из Китая и Азии под ключ: подбор, проверка, таможня и доставка по России.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "О компании VED",
    description:
      "VED — импорт автомобилей из Китая и Азии под ключ: подбор, проверка, таможня и доставка по России.",
    url: "/about",
  },
};

const steps = [
  {
    title: "Подбор",
    text: "Помогаем выбрать марку, модель и бюджет — с учётом ваших задач и условий эксплуатации в РФ.",
  },
  {
    title: "Проверка и расчёт",
    text: "Считаем стоимость авто, таможни и доставки заранее, чтобы вы видели полную картину до сделки.",
  },
  {
    title: "Сопровождение",
    text: "Ведём сделку от согласования комплектации до прибытия автомобиля в нужный город.",
  },
  {
    title: "Доставка",
    text: "Организуем логистику во Владивосток и далее по России — сроки и маршрут прозрачны на каждом этапе.",
  },
];

export default function AboutPage() {
  return (
    <main className="relative ved-screen bg-ved-navy">
      <PageBackground />
      <Header />
      <div className="relative z-10 mx-auto max-w-3xl px-8 py-12 md:px-12">
        <VedLogoMark className="mb-8 h-16 w-auto md:h-20" />

        <h1 className="text-3xl font-light uppercase tracking-[0.15em]">О компании</h1>
        <p className="mt-3 text-sm uppercase tracking-[0.2em] text-white/45">
          VED · vedcompany.ru
        </p>

        <p className="mt-8 text-lg font-light leading-relaxed text-white/85">
          VED — сервис импорта автомобилей под ключ. Мы помогаем привезти машину из Китая и других
          азиатских рынков в Россию без лишней бюрократии и сюрпризов по цене.
        </p>

        <p className="mt-5 leading-relaxed text-white/65">
          Наша задача — сделать покупку авто за рубежом понятной: от первого запроса до вручения
          ключей. Вы выбираете автомобиль и бюджет, мы берём на себя подбор, расчёты, оформление и
          логистику.
        </p>

        <p className="mt-5 leading-relaxed text-white/65">
          На сайте vedcompany.ru можно подобрать авто из каталога, сравнить аналоги по типу кузова и
          бюджету, оставить заявку менеджеру и отслеживать заказ в личном кабинете.
        </p>

        <h2 className="mt-14 text-xs uppercase tracking-[0.2em] text-white/50">Как мы работаем</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="border border-white/10 bg-white/[0.03] p-5"
            >
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">
                0{index + 1}
              </p>
              <h3 className="mt-2 text-sm uppercase tracking-[0.15em] text-white/90">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{step.text}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-14 text-xs uppercase tracking-[0.2em] text-white/50">Почему VED</h2>
        <ul className="mt-5 space-y-3 text-sm leading-relaxed text-white/65">
          <li className="border-l border-white/20 pl-4">
            Прозрачный расчёт: цена авто, таможня и доставка — до начала работы.
          </li>
          <li className="border-l border-white/20 pl-4">
            Сопровождение на каждом этапе, а не «просто ссылка на объявление».
          </li>
          <li className="border-l border-white/20 pl-4">
            Каталог и подбор аналогов — чтобы быстрее найти подходящий вариант.
          </li>
          <li className="border-l border-white/20 pl-4">
            Связь с менеджером онлайн: заявка на сайте, мессенджеры, личный кабинет.
          </li>
        </ul>

        <div className="mt-14 border border-white/10 bg-white/[0.03] p-6 text-sm leading-relaxed text-white/50">
          <h2 className="text-xs uppercase tracking-[0.2em] text-white/55">Важно знать</h2>
          <p className="mt-3">
            Сведения об автомобилях на сайте носят ознакомительный характер. Итоговая цена,
            комплектация и сроки зависят от рынка, курса валют и выбранной схемы поставки.
          </p>
          <p className="mt-3">
            Материалы сайта не являются публичной офертой. Актуальные условия покупки и импорта
            подтверждает менеджер VED после обращения.
          </p>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
