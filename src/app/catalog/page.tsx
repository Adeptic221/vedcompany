import { Suspense } from "react";
import { Header } from "@/components/Header";
import { PageBackground } from "@/components/PageBackground";
import { CarCard } from "@/components/CarCard";
import { CatalogFilters } from "@/components/CatalogFilters";
import { filterCars } from "@/data/cars";
import { getCarsCatalog } from "@/lib/storage/cars-store";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; model?: string; year?: string; budget?: string; type?: string }>;
}) {
  const params = await searchParams;
  const cars = await getCarsCatalog();
  const filtered = filterCars(cars, params);

  return (
    <main className="relative min-h-screen bg-ved-navy">
      <PageBackground />
      <Header />
      <div className="relative z-10 mx-auto max-w-7xl px-8 pb-16 md:px-12">
        <div className="mb-10">
          <h1 className="text-2xl font-light uppercase tracking-[0.15em] md:text-3xl">Каталог автомобилей</h1>
          <p className="mt-2 text-sm text-white/50">Найдено: {filtered.length} из {cars.length}</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <Suspense fallback={<div className="h-64 animate-pulse bg-white/5" />}>
            <CatalogFilters />
          </Suspense>
          {filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((car) => (<CarCard key={car.id} car={car} />))}
            </div>
          ) : (
            <div className="flex items-center justify-center border border-white/10 bg-white/5 p-16 text-white/50">
              По вашим фильтрам ничего не найдено
            </div>
          )}
        </div>
      </div>
    </main>
  );
}