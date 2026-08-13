"use client";

import Link from "next/link";
import { useState } from "react";
import type { Car } from "@/types/car";
import type { DeliveryDestination } from "@/types/cart";
import { formatPrice, getTotalPrice } from "@/data/cars";
import { getDeliveryCost, getDeliveryDays, formatDeliveryDays } from "@/lib/delivery/calculate";
import { DeliverySelector } from "@/components/DeliverySelector";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

interface CartTabProps {
  cars: Car[];
  onOrdered?: () => void;
}

export function CartTab({ cars, onOrdered }: CartTabProps) {
  const { user } = useAuth();
  const { items, removeFromCart, checkout, updateCartDelivery, profile } =
    useCart();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

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
      dest === "none" ? 0 : getDeliveryCost(dest, car);
    return sum + getTotalPrice(car) + delivery;
  }, 0);

  async function handleCheckout(car: Car, total: number) {
    setError("");
    setInfo("");
    const name = (user?.name || profile.name || "").trim();
    const phone = (user?.phone || profile.phone || "").trim();
    if (name.length < 2 || phone.replace(/\D/g, "").length < 10) {
      setError("Заполните имя и телефон в профиле слева — так менеджер свяжется с вами.");
      return;
    }

    setBusyId(car.id);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "car_request",
          name,
          phone,
          carId: car.id,
          carLabel: `${car.brand} ${car.model} ${car.year}`,
          message: `Заявка из личного кабинета. Ориентир по сумме: ${formatPrice(total)}.`,
          source: "cabinet_checkout",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Не удалось отправить заявку");
        return;
      }
      checkout(car.id, total);
      setInfo("Заявка отправлена менеджеру. Заказ появился во вкладке «Мои заказы».");
      onOrdered?.();
    } catch {
      setError("Ошибка сети. Проверьте интернет и попробуйте снова.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <p className="mb-4 text-sm text-white/45">
        «Оформить» создаёт заказ в кабинете и отправляет заявку менеджеру VED.
      </p>
      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
      {info && <p className="mb-4 text-sm text-emerald-300/90">{info}</p>}

      <div className="space-y-6">
        {cartRows.map(({ item, car }) => {
          const destination: DeliveryDestination =
            item.deliveryDestination === "none" || !item.deliveryDestination
              ? "vladivostok"
              : item.deliveryDestination;
          const base = getTotalPrice(car);
          const delivery = getDeliveryCost(destination, car);
          const total = base + delivery;
          const deliveryDays = getDeliveryDays(destination, car.deliveryDays);

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
                  <p className="mt-1 text-xs text-white/35">
                    Срок: ~{formatDeliveryDays(deliveryDays)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    disabled={busyId === car.id}
                    onClick={() => void handleCheckout(car, total)}
                    className="border border-white bg-white px-4 py-2 text-xs uppercase tracking-wider text-ved-navy disabled:opacity-50"
                  >
                    {busyId === car.id ? "..." : "Оформить"}
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
                carType={car.type}
                baseDeliveryDays={car.deliveryDays}
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
