import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { PageBackground } from "@/components/PageBackground";
import { CarDetailPricing } from "@/components/CarDetailPricing";
import { CarRequestSection } from "@/components/CarRequestSection";
import { CarPhoto } from "@/components/CarPhoto";
import { carTypeLabels, getTotalPrice } from "@/data/cars";
import { findAnalogCars } from "@/lib/catalog/analogs";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo/site";
import { getCarsCatalog } from "@/lib/storage/cars-store";
import { normalizeCarPhotoUrl } from "@/lib/catalog/photo-url";
import { SimilarCars } from "@/components/SimilarCars";

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
  const photo = normalizeCarPhotoUrl(car.sync?.photos?.[0]) ?? car.sync?.photos?.[0];
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
  const similarCars = findAnalogCars(cars, {
    type: car.type,
    budget: baseTotal,
    brand: car.brandSlug,
    model: car.model,
    excludeId: car.id,
  });
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
    image: photo
      ? [normalizeCarPhotoUrl(photo) ?? photo]
      : [`${SITE_URL}${DEFAULT_OG_IMAGE}`],
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
          <Link
            href="/catalog"
            className="mb-8 inline-block text-xs uppercase tracking-widest text-white/50 transition hover:text-white"
          >
            {"\u2190 \u041d\u0430\u0437\u0430\u0434 \u0432 \u043a\u0430\u0442\u0430\u043b\u043e\u0433"}
          </Link>
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="relative flex h-72 items-center justify-center overflow-hidden lg:h-96">
              <CarPhoto
                src={photo}
                alt={`${car.brand} ${car.model}`}
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
                priority
                fallbackColor={car.imageColor}
                fallbackLabel={car.brand}
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-white/50">
                {carTypeLabels[car.type]} · {car.country}
              </p>
              <h1 className="mt-2 text-3xl font-light tracking-wide md:text-4xl">
                {car.brand} {car.model} {car.year}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-white/60">{car.description}</p>
              <CarDetailPricing car={car} />
              <CarRequestSection
                carId={car.id}
                carLabel={`${car.brand} ${car.model} ${car.year}`}
              />
            </div>
          </div>

          <SimilarCars cars={similarCars} />
        </div>
        <SiteFooter />
      </main>
    </>
  );
}