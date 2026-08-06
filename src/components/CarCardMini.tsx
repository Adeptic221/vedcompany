import Link from "next/link";
import type { Car } from "@/types/car";
import { carTypeLabels, formatPrice, getTotalPrice } from "@/data/cars";
import { CarPhoto } from "@/components/CarPhoto";

export function CarCardMini({
  car,
  highlight = false,
}: {
  car: Car;
  highlight?: boolean;
}) {
  const total = getTotalPrice(car);
  const photo = car.sync?.photos?.[0];

  return (
    <Link
      href={`/catalog/${car.id}`}
      className={`group flex min-w-[240px] shrink-0 gap-3 border p-3 transition sm:min-w-0 ${
        highlight
          ? "border-white/35 bg-white/10 hover:border-white/45 hover:bg-white/15"
          : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
      }`}
    >
      <div className="relative h-16 w-20 shrink-0 overflow-hidden">
        <CarPhoto
          src={photo}
          alt={`${car.brand} ${car.model}`}
          className="object-cover transition group-hover:scale-105"
          sizes="80px"
          fallbackColor={car.imageColor}
          fallbackLabel={car.brand.slice(0, 2)}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-light tracking-wide">
          {car.brand} {car.model}
        </p>
        <p className="mt-0.5 text-xs text-white/50">
          {car.year} · {carTypeLabels[car.type]}
        </p>
        <p className="mt-1 text-sm text-white/90">{formatPrice(total)}</p>
      </div>
    </Link>
  );
}
