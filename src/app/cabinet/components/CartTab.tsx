"use client";

import Link from "next/link";
import type { Car } from "@/types/car";
import type { DeliveryDestination } from "@/types/cart";
import { formatPrice, getTotalPrice } from "@/data/cars";
import { getDeliveryCost } from "@/lib/delivery/calculate";
import { DeliverySelector } from "@/components/DeliverySelector";
import { useCart } from "@/context/CartContext";

export function CartTab({ cars }: { cars: Car[] }) {
  const { items, removeFromCart, checkout, updateCartDelivery } = useCart();

  const cartRows = items
    .map((item) => {
      const car = cars.find((c) => c.id === item.carId);
      if (!car) return null;
      return { item, car };
    })
    .filter(Boolean) as { item: (typeof items)[0]; car: Car }[];

  if (cartRows.length === 0) {
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

  const grandTotal = cartRows.reduce((sum, { item, car }) => {
    const dest = item.deliveryDestination ?? "none";
    const delivery =
      dest === "none" ? 0 : getDeliveryCost(dest, car.price);
    return sum + getTotalPrice(car) + delivery;
  }, 0);

  return (
    <div>
      <div className="space-y-6">
        {cartRows.map(({ item, car }) => {
          const destination: DeliveryDestination =
            item.deliveryDestination === "none" || !item.deliveryDestination
              ? "vladivostok"
              : item.deliveryDestination;
          const base = getTotalPrice(car);
          const delivery = getDeliveryCost(destination, car.price);
          const total = base + delivery;

          return (
            <div
              key={car.id}
              className="flex flex-col gap-4 border border-white/10 p-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Link
                    href={`/catalog/${car.id}`}
                    className="font-light transition hover:text-white/80"
                  >
                    {car.brand} {car.model} {car.year}
                  </Link>
                  <p className="mt-1 text-sm text-white/50">
                    {formatPrice(total)}
                    {delivery > 0 && (
                      <span className="text-white/30">
                        {" "}
                        (в т.ч. доставка {formatPrice(delivery)})
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
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
              <DeliverySelector
                destination={destination}
                onChange={(dest) => updateCartDelivery(car.id, dest)}
                carPriceRub={car.price}
              />
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
