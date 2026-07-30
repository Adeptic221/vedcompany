import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { PageBackground } from "@/components/PageBackground";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: SITE_DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    addressCountry: "RU",
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd} />
    <main className="relative ved-screen overflow-hidden bg-ved-navy">
      <PageBackground />
      <Header />

      <section className="relative z-10 flex min-h-[calc(100vh-88px)] items-center px-8 md:px-16 lg:px-24">
        <div className="w-full max-w-sm">
          <h1 className="mb-8 text-lg font-light uppercase tracking-[0.2em] text-white/90 md:text-xl">
            Подберите автомобиль
            <br />
            <span className="text-white/60">для вашего рынка</span>
          </h1>

          <form className="flex flex-col gap-3" action="/catalog" method="get">
            <select id="brand" name="brand" className="ved-select" defaultValue="">
              <option value="" disabled>Выберите марку</option>
              <option value="toyota">Toyota</option>
              <option value="bmw">BMW</option>
              <option value="mercedes">Mercedes-Benz</option>
              <option value="audi">Audi</option>
              <option value="lexus">Lexus</option>
              <option value="porsche">Porsche</option>
            </select>

            <select id="model" name="model" className="ved-select" defaultValue="">
              <option value="" disabled>Выберите модель</option>
              <option value="any">Любая модель</option>
            </select>

            <select id="year" name="year" className="ved-select" defaultValue="">
              <option value="" disabled>Год выпуска</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>

            <select id="budget" name="budget" className="ved-select" defaultValue="">
              <option value="" disabled>Бюджет, ₽</option>
              <option value="2000000">до 2 000 000</option>
              <option value="4000000">до 4 000 000</option>
              <option value="6000000">до 6 000 000</option>
              <option value="10000000">до 10 000 000</option>
            </select>

            <button
              type="submit"
              className="mt-4 border border-white bg-transparent px-6 py-3.5 text-xs uppercase tracking-[0.25em] text-white transition hover:bg-white hover:text-ved-navy"
            >
              Смотреть каталог
            </button>
          </form>
        </div>
      </section>

      <footer className="relative z-10 px-8 pb-6 text-xs text-white/40 md:px-12">
        © {new Date().getFullYear()} ВЭД · vedcompany.ru
      </footer>
    </main>
    </>
  );
}
