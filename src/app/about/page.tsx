import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/Header";
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
        <Image
          src="/logo.png"
          alt="VED"
          width={160}
          height={64}
          className="mb-8 h-16 w-auto md:h-20"
          sizes="160px"
        />
        <h1 className="text-3xl font-light uppercase tracking-[0.15em]">О компании ВЭД</h1>
        <p className="mt-6 leading-relaxed text-white/70">
          ВЭД — онлайн-автосалон для импорта автомобилей под ключ. Мы сопровождаем клиента от
          выбора авто до таможни и доставки в РФ.
        </p>
        <p className="mt-4 leading-relaxed text-white/70">
          Сайт vedcompany.ru — личный кабинет, чат с менеджером и отслеживание заказа.
        </p>
      </div>
    </main>
  );
}
