import type { Car } from "@/types/car";
import { carTypeLabels, formatPrice, getTotalPrice } from "@/data/cars";
import { CarPhoto } from "@/components/CarPhoto";
import Link from "next/link";

export function SimilarCars({ cars }: { cars: Car[] }) {
  if (cars.length === 0) return null;

  return (
    <section
      className="mt-14 border-t border-white/10 pt-10"
      aria-labelledby="similar-cars-heading"
    >
      <h2
        id="similar-cars-heading"
        className="text-xs uppercase tracking-[0.2em] text-white/50"
      >
        {"\u041f\u043e\u0445\u043e\u0436\u0438\u0435 \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u0438"}
      </h2>
      <p className="mt-2 text-sm text-white/40">
        {"\u0410\u043d\u0430\u043b\u043e\u0433\u0438 \u043f\u043e \u0442\u0438\u043f\u0443 \u043a\u0443\u0437\u043e\u0432\u0430 \u0438 \u0431\u044e\u0434\u0436\u0435\u0442\u0443"}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cars.map((car) => {
          const total = getTotalPrice(car);
          const photo = car.sync?.photos?.[0];
          return (
            <Link
              key={car.id}
              href={`/catalog/${car.id}`}
              className="group flex flex-col overflow-hidden border border-white/10 bg-white/[0.03] transition hover:border-white/30 hover:bg-white/[0.06]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <CarPhoto
                  src={photo}
                  alt={`${car.brand} ${car.model}`}
                  className="object-cover transition duration-300 group-hover:scale-105"
                  sizes="(max-width:640px) 45vw, (max-width:1024px) 30vw, 18vw"
                  fallbackColor={car.imageColor}
                  fallbackLabel={car.brand.slice(0, 2)}
                />
                <span className="absolute bottom-1.5 left-1.5 bg-black/55 px-1.5 py-0.5 text-[10px] tracking-wide text-white/90">
                  {car.year}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-3">
                <p className="truncate text-sm font-light tracking-wide text-white/90">
                  {car.brand} {car.model}
                </p>
                <p className="mt-0.5 text-[11px] text-white/45">
                  {carTypeLabels[car.type]}
                </p>
                <p className="mt-2 text-sm text-white/85">{formatPrice(total)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
