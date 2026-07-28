import Link from "next/link";
import Image from "next/image";
import type { Car } from "@/types/car";
import { carTypeLabels, formatPrice, getTotalPrice } from "@/data/cars";
import { AddToCartButton } from "@/components/AddToCartButton";

export function CarCard({ car }: { car: Car }) {
  const total = getTotalPrice(car);
  const photo = car.sync?.photos?.[0];
  return (
    <article className="group flex flex-col overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm transition hover:border-white/25 hover:bg-white/10">
      <Link href={"/catalog/" + car.id} className="block">
        <div className="relative flex h-44 items-center justify-center overflow-hidden" style={{ background: photo ? undefined : "linear-gradient(135deg, " + car.imageColor + ", #0a1628)" }}>
          {photo ? <Image src={photo} alt={car.brand} fill className="object-cover transition group-hover:scale-105" sizes="400px" /> : <span className="text-4xl font-light tracking-widest text-white/20">{car.brand}</span>}
          <span className="absolute bottom-3 left-3 rounded bg-black/40 px-2 py-1 text-xs text-white/80">{carTypeLabels[car.type]}</span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link href={"/catalog/" + car.id}><h3 className="text-lg font-light tracking-wide">{car.brand} {car.model}</h3><p className="mt-1 text-sm text-white/50">{car.year} · {car.country}</p></Link>
        <div className="mt-4 space-y-1 text-sm">
          <p className="text-white/70">{"\u0426\u0435\u043d\u0430:"} <span className="text-white">{formatPrice(car.price)}</span></p>
          <p className="text-white/70">{"\u0421 \u0442\u0430\u043c\u043e\u0436\u043d\u0435\u0439:"} <span className="font-medium text-white">{formatPrice(total)}</span></p>
        </div>
        <div className="mt-auto flex gap-2 pt-5">
          <Link href={"/catalog/" + car.id} className="flex-1 border border-white/30 px-3 py-2 text-center text-xs uppercase tracking-wider transition hover:bg-white hover:text-ved-navy">{"\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u0435\u0435"}</Link>
          <AddToCartButton carId={car.id} />
        </div>
      </div>
    </article>
  );
}