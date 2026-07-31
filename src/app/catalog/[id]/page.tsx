import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { PageBackground } from "@/components/PageBackground";
import { CarDetailPricing } from "@/components/CarDetailPricing";
import { CarRequestSection } from "@/components/CarRequestSection";
import { carTypeLabels, getTotalPrice } from "@/data/cars";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo/site";
import { getCarsCatalog } from "@/lib/storage/cars-store";

const specLabels: Record<string, string> = { engine: "\u0414\u0432\u0438\u0433\u0430\u0442\u0435\u043b\u044c", power: "\u041c\u043e\u0449\u043d\u043e\u0441\u0442\u044c", transmission: "\u041a\u041f\u041f", drive: "\u041f\u0440\u0438\u0432\u043e\u0434", fuel: "\u0422\u043e\u043f\u043b\u0438\u0432\u043e", consumption: "\u0420\u0430\u0441\u0445\u043e\u0434" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cars = await getCarsCatalog();
  const car = cars.find((item) => item.id === id);

  if (!car) {
    return {
      title: "Автомобиль не найден",
    };
  }

  const title = `${car.brand} ${car.model} ${car.year}`;
  const description =
    car.description ||
    `${car.brand} ${car.model} ${car.year} — импорт под ключ с расчётом таможни и доставкой.`;
  const photo = car.sync?.photos?.[0];
  const ogImage = photo ?? DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: {
      canonical: `/catalog/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `/catalog/${id}`,
      type: "website",
      images: [
        {
          url: ogImage,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cars = await getCarsCatalog();
  const car = cars.find((item) => item.id === id);
  if (!car) notFound();
  const photo = car.sync?.photos?.[0];
  const baseTotal = getTotalPrice(car);
  const carJsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${car.brand} ${car.model} ${car.year}`,
    brand: {
      "@type": "Brand",
      name: car.brand,
    },
    model: car.model,
    vehicleModelDate: String(car.year),
    description: car.description,
    image: photo ? [photo] : [`${SITE_URL}${DEFAULT_OG_IMAGE}`],
    offers: {
      "@type": "Offer",
      price: baseTotal,
      priceCurrency: "RUB",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/catalog/${car.id}`,
    },
  };

  return (
    <>
      <JsonLd data={carJsonLd} />
    <main className="relative ved-screen bg-ved-navy">
      <PageBackground />
      <Header />
      <div className="relative z-10 mx-auto max-w-6xl px-8 pb-16 md:px-12">
        <Link href="/catalog" className="mb-8 inline-block text-xs uppercase tracking-widest text-white/50 transition hover:text-white">{"\u2190 \u041d\u0430\u0437\u0430\u0434 \u0432 \u043a\u0430\u0442\u0430\u043b\u043e\u0433"}</Link>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="relative flex h-72 items-center justify-center overflow-hidden lg:h-96" style={{ background: photo ? undefined : `linear-gradient(135deg, ${car.imageColor}, #0a1628)` }}>
            {photo ? <Image src={photo} alt={car.brand + " " + car.model} fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" /> : <span className="text-5xl font-light tracking-widest text-white/20">{car.brand}</span>}
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/50">{carTypeLabels[car.type]} · {car.country}</p>
            <h1 className="mt-2 text-3xl font-light tracking-wide md:text-4xl">{car.brand} {car.model} {car.year}</h1>
            <p className="mt-4 text-sm leading-relaxed text-white/60">{car.description}</p>
            <CarDetailPricing car={car} />
            <CarRequestSection carId={car.id} carLabel={`${car.brand} ${car.model} ${car.year}`} />
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
    </>
  );
}