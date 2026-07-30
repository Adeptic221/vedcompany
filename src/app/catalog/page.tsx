import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { PageBackground } from "@/components/PageBackground";
import { CarCard } from "@/components/CarCard";
import { CatalogFilters } from "@/components/CatalogFilters";
import { CatalogContactBanner } from "@/components/CatalogContactBanner";
import {
  countActiveFilters,
  filterCars,
  getCatalogFilterMeta,
  sortCars,
  type CatalogSearchParams,
} from "@/data/cars";
import { findAnalogCars } from "@/lib/catalog/analogs";
import { getCarsCatalog } from "@/lib/storage/cars-store";
import { CarCardMini } from "@/components/CarCardMini";

export const metadata: Metadata = {
  title: "Каталог автомобилей",
  description:
    "Каталог автомобилей для импорта под ключ: цены, расчёт таможни, доставка. Фильтры по марке, модели и бюджету.",
  alternates: {
    canonical: "/catalog",
  },
  openGraph: {
    title: "Каталог автомобилей",
    description:
      "Каталог автомобилей для импорта под ключ: цены, расчёт таможни, доставка.",
    url: "/catalog",
  },
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const params = await searchParams;
  const cars = await getCarsCatalog();
  const meta = getCatalogFilterMeta(cars);
  const filtered = sortCars(filterCars(cars, params), params.sort);
  const activeFilters = countActiveFilters(params);

  const filteredIds = new Set(filtered.map((car) => car.id));
  const primaryCar = filtered.length === 1 ? filtered[0] : null;
  const showAnalogs =
    Boolean(primaryCar && params.type && (params.budget || params.priceMax));
  const analogs = showAnalogs
    ? findAnalogCars(cars, {
        type: params.type,
        budget: Number(params.budget || params.priceMax),
        brand: primaryCar!.brandSlug,
        excludeId: primaryCar!.id,
      }).filter((car) => !filteredIds.has(car.id))
    : [];

  return (
    <main className="relative ved-screen bg-ved-navy">
      <PageBackground />
      <Header />
      <div className="relative z-10 mx-auto max-w-7xl px-8 pb-16 md:px-12">
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl font-light uppercase tracking-[0.15em] md:text-3xl">Каталог автомобилей</h1>
          <p className="mt-2 text-sm text-white/50">
            Найдено: <span className="text-white/80">{filtered.length}</span> из {cars.length}
            {activeFilters > 0 && (
              <span className="text-white/40">
                {" "}
                · активных фильтров: {activeFilters}
              </span>
            )}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">
          <Suspense fallback={<div className="h-64 animate-pulse bg-white/5" />}>
            <CatalogFilters meta={meta} />
          </Suspense>

          {filtered.length > 0 ? (
            <div className="space-y-8">
              {primaryCar ? (
                <div className="mx-auto max-w-md space-y-2">
                  <CarCard car={primaryCar} />
                  {analogs.map((car) => (
                    <CarCardMini key={car.id} car={car} />
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="ved-glass flex flex-col items-center justify-center border border-white/10 px-8 py-16 text-center">
              <p className="text-lg font-light tracking-wide text-white/80">
                {activeFilters > 0 || params.q?.trim()
                  ? "По вашим фильтрам ничего не найдено"
                  : "Каталог пока пуст"}
              </p>
              <p className="mt-2 max-w-md text-sm text-white/50">
                {activeFilters > 0 || params.q?.trim()
                  ? "Попробуйте изменить параметры поиска или сбросить фильтры."
                  : "Скоро здесь появятся автомобили. А пока вы можете вернуться на главную."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {(activeFilters > 0 || params.q?.trim()) && (
                  <Link
                    href="/catalog"
                    className="border border-white/30 px-6 py-3 text-xs uppercase tracking-widest transition hover:bg-white hover:text-ved-navy"
                  >
                    Сбросить фильтры
                  </Link>
                )}
                <Link
                  href="/"
                  className="border border-white/30 px-6 py-3 text-xs uppercase tracking-widest transition hover:bg-white hover:text-ved-navy"
                >
                  На главную
                </Link>
              </div>
            </div>
          )}
        </div>

        <CatalogContactBanner />
      </div>
    </main>
  );
}
