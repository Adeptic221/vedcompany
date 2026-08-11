import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { HomeCarPicker } from "@/components/HomeCarPicker";
import { ContactButtons } from "@/components/ContactButtons";
import { JsonLd } from "@/components/JsonLd";
import { HomeHeroSketch } from "@/components/HomeHeroSketch";
import { PageBackground } from "@/components/PageBackground";
import { SiteFooter } from "@/components/SiteFooter";
import { getCatalogFilterMeta } from "@/data/cars";
import { getCarsCatalog } from "@/lib/storage/cars-store";
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
  logo: `${SITE_URL}/logo.svg`,
  description: SITE_DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    addressCountry: "RU",
  },
};

export default async function HomePage() {
  const cars = await getCarsCatalog();
  const meta = getCatalogFilterMeta(cars);

  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <main className="relative ved-screen overflow-x-clip overflow-y-visible bg-[#0a1628]">
        <PageBackground />
        <Header />

        <section className="relative z-10 flex min-h-[calc(100vh-88px)] flex-col items-stretch gap-6 px-8 md:flex-row md:items-center md:gap-10 md:px-16 lg:gap-14 lg:px-24">
          <div className="relative z-10 w-full max-w-xl shrink-0 pt-4 md:pt-0">
            <h1 className="mb-6 text-lg font-light uppercase tracking-[0.2em] text-white/90 md:mb-8 md:text-xl">
              Подобрать и купить автомобиль для Ваших целей.
            </h1>

            <div className="relative mb-8 h-48 w-full overflow-hidden md:hidden">
              <HomeHeroSketch />
            </div>

            <HomeCarPicker cars={cars} meta={meta} />

            <div className="mt-10 border-t border-white/10 pt-8">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/50">
                Связь с менеджером
              </p>
              <ContactButtons size="sm" />
            </div>
          </div>

          <div className="relative z-[1] hidden min-h-[70vh] flex-1 self-stretch overflow-visible md:block lg:min-h-[80vh] lg:pt-8">
            <HomeHeroSketch />
          </div>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}