"use client";

import Link from "next/link";
import type { Car } from "@/types/car";
import { formatPrice, getTotalPrice } from "@/data/cars";
import { useCart } from "@/context/CartContext";

export function CartTab({ cars }: { cars: Car[] }) {
  const { items, removeFromCart, checkout } = useCart();

  const cartCars = items
    .map((item) => cars.find((c) => c.id === item.carId))
    .filter(Boolean);

  if (cartCars.length === 0) {
    return (
      <div className="py-12 text-center text-white/50">
        <p>Корзина пуста</p>
        <p className="mt-2 text-sm text-white/30">
          Добавьте автомобиль из каталога или избранного
        </p>
        <Link
          href="/catalog"
          className="mt-4 inline-block border border-white/30 px-6 py-3 text-xs uppercase tracking-widest transition hover:bg-white hover:text-ved-navy"
        >
          В каталог
        </Link>
      </div>
    );
  }

  const grandTotal = cartCars.reduce((sum, car) => {
    if (!car) return sum;
    return sum + getTotalPrice(car);
  }, 0);

  return (
    <div>
      <div className="space-y-4">
        {cartCars.map((car) => {
          if (!car) return null;
          const total = getTotalPrice(car);
          return (
            <div
              key={car.id}
              className="flex flex-col gap-4 border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <Link
                  href={`/catalog/${car.id}`}
                  className="font-light transition hover:text-white/80"
                >
                  {car.brand} {car.model} {car.year}
                </Link>
                <p className="mt-1 text-sm text-white/50">{formatPrice(total)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => checkout(car.id, total)}
                  className="border border-white bg-white px-4 py-2 text-xs uppercase tracking-wider text-ved-navy"
                >
                  Оформить
                </button>
                <button
                  type="button"
                  onClick={() => removeFromCart(car.id)}
                  className="border border-white/20 px-4 py-2 text-xs uppercase tracking-wider text-white/60"
                >
                  Удалить
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-sm text-white/60">Итого в корзине</span>
        <span className="text-lg font-light">{formatPrice(grandTotal)}</span>
      </div>
    </div>
  );
}
