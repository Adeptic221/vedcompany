import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { HomeCarPicker } from "@/components/HomeCarPicker";
import { ContactButtons } from "@/components/ContactButtons";
import { JsonLd } from "@/components/JsonLd";
import { PageBackground } from "@/components/PageBackground";
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
  logo: `${SITE_URL}/logo.png`,
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
      <main className="relative ved-screen overflow-hidden bg-ved-navy">
        <PageBackground />
        <Header />

        <section className="relative z-10 flex min-h-[calc(100vh-88px)] items-center px-8 md:px-16 lg:px-24">
          <div className="w-full max-w-xl">
            <h1 className="mb-8 text-lg font-light uppercase tracking-[0.2em] text-white/90 md:text-xl">
              Подберите автомобиль
              <br />
              <span className="text-white/60">для вашего рынка</span>
            </h1>

            <HomeCarPicker cars={cars} meta={meta} />

            <div className="mt-10 border-t border-white/10 pt-8">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/50">
                Связь с менеджером
              </p>
              <ContactButtons size="sm" />
            </div>
          </div>
        </section>

        <footer className="relative z-10 px-8 pb-6 text-xs text-white/40 md:px-12">
          © {new Date().getFullYear()} ВЭД · vedcompany.ru
        </footer>
      </main>
    </>
  );
}
