"use client";

import Link from "next/link";
import Image from "next/image";
import type { Car } from "@/types/car";
import { formatPrice, getTotalPrice } from "@/data/cars";
import { useCart } from "@/context/CartContext";

export function FavoritesTab({ cars }: { cars: Car[] }) {
  const { favorites, removeFavorite, addToCart, isInCart } = useCart();

  const favoriteCars = favorites
    .map((f) => {
      const car = cars.find((c) => c.id === f.carId);
      return car ? { car, addedAt: f.addedAt } : null;
    })
    .filter(Boolean);

  if (favoriteCars.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <svg className="h-7 w-7 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </div>
        <p className="text-white/50">Избранных автомобилей пока нет</p>
        <p className="mt-2 text-sm text-white/30">
          Добавляйте понравившиеся авто из каталога
        </p>
        <Link
          href="/catalog"
          className="mt-6 inline-block border border-white/30 px-6 py-3 text-xs uppercase tracking-widest transition hover:bg-white hover:text-ved-navy"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {favoriteCars.map((entry) => {
        if (!entry) return null;
        const { car, addedAt } = entry;
        const total = getTotalPrice(car);
        const photo = car.sync?.photos?.[0];
        const inCart = isInCart(car.id);

        return (
          <div
            key={car.id}
            className="flex flex-col gap-4 border border-white/10 p-4 sm:flex-row sm:items-center"
          >
            <Link href={`/catalog/${car.id}`} className="flex min-w-0 flex-1 items-center gap-4">
              <div
                className="relative h-16 w-24 shrink-0 overflow-hidden"
                style={{
                  background: photo
                    ? undefined
                    : `linear-gradient(135deg, ${car.imageColor}, #0a1628)`,
                }}
              >
                {photo && (
                  <Image
                    src={photo}
                    alt={`${car.brand} ${car.model}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-light">
                  {car.brand} {car.model} {car.year}
                </p>
                <p className="mt-1 text-sm text-white/50">{formatPrice(total)}</p>
                <p className="mt-0.5 text-xs text-white/30">
                  Добавлено {new Date(addedAt).toLocaleDateString("ru-RU")}
                </p>
              </div>
            </Link>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => !inCart && addToCart(car.id)}
                disabled={inCart}
                className="border border-white bg-white px-4 py-2 text-xs uppercase tracking-wider text-ved-navy disabled:cursor-default disabled:opacity-50"
              >
                {inCart ? "В корзине" : "В корзину"}
              </button>
              <button
                type="button"
                onClick={() => removeFavorite(car.id)}
                className="border border-white/20 px-4 py-2 text-xs uppercase tracking-wider text-white/60 hover:border-white/40"
              >
                Удалить
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
