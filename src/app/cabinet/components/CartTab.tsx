"use client";

import Link from "next/link";
import { useState } from "react";
import type { Car } from "@/types/car";
import type { DeliveryDestination } from "@/types/cart";
import { formatPrice, getClientCarPrice, getVedServicesFee, getTotalPrice } from "@/data/cars";
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
        <p>{"\u041a\u043e\u0440\u0437\u0438\u043d\u0430 \u043f\u0443\u0441\u0442\u0430"}</p>
        <p className="mt-2 text-sm text-white/30">
          {
            "\u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044c \u0438\u0437 \u043a\u0430\u0442\u0430\u043b\u043e\u0433\u0430 \u0438\u043b\u0438 \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u0433\u043e"
          }
        </p>
        <Link
          href="/catalog"
          className="mt-4 inline-block border border-white/30 px-6 py-3 text-xs uppercase tracking-widest transition hover:bg-white hover:text-ved-navy"
        >
          {"\u0412 \u043a\u0430\u0442\u0430\u043b\u043e\u0433"}
        </Link>
      </div>
    );
  }

  const grandTotal = cartRows.reduce((sum, { item, car }) => {
    const dest: DeliveryDestination =
      item.deliveryDestination === "moscow" ? "moscow" : "none";
    return sum + getTotalPrice(car) + getDeliveryCost(dest, car);
  }, 0);

  async function handleCheckout(car: Car, total: number) {
    setError("");
    setInfo("");
    const name = (user?.name || profile.name || "").trim();
    const phone = (user?.phone || profile.phone || "").trim();
    if (name.length < 2 || phone.replace(/\D/g, "").length < 10) {
      setError(
        "\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u0438\u043c\u044f \u0438 \u0442\u0435\u043b\u0435\u0444\u043e\u043d \u0432 \u043f\u0440\u043e\u0444\u0438\u043b\u0435 \u0441\u043b\u0435\u0432\u0430 \u2014 \u0442\u0430\u043a \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440 \u0441\u0432\u044f\u0436\u0435\u0442\u0441\u044f \u0441 \u0432\u0430\u043c\u0438."
      );
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
          message: `\u0417\u0430\u044f\u0432\u043a\u0430 \u0438\u0437 \u043b\u0438\u0447\u043d\u043e\u0433\u043e \u043a\u0430\u0431\u0438\u043d\u0435\u0442\u0430. \u041e\u0440\u0438\u0435\u043d\u0442\u0438\u0440 \u043f\u043e \u0441\u0443\u043c\u043c\u0435: ${formatPrice(total)}.`,
          source: "cabinet_checkout",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0437\u0430\u044f\u0432\u043a\u0443");
        return;
      }
      void checkout(car.id, total);
      setInfo(
        "\u0417\u0430\u044f\u0432\u043a\u0430 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0430 \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u0443. \u0417\u0430\u043a\u0430\u0437 \u043f\u043e\u044f\u0432\u0438\u043b\u0441\u044f \u0432\u043e \u0432\u043a\u043b\u0430\u0434\u043a\u0435 \u00ab\u041c\u043e\u0438 \u0437\u0430\u043a\u0430\u0437\u044b\u00bb."
      );
      onOrdered?.();
    } catch {
      setError(
        "\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0442\u0438. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0438\u043d\u0442\u0435\u0440\u043d\u0435\u0442 \u0438 \u043f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0441\u043d\u043e\u0432\u0430."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <p className="mb-4 text-sm text-white/45">
        {
          "\u0421\u0443\u043c\u043c\u044b \u043e\u0440\u0438\u0435\u043d\u0442\u0438\u0440\u043e\u0432\u043e\u0447\u043d\u044b\u0435 \u2014 \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440 \u0443\u0442\u043e\u0447\u043d\u0438\u0442 \u043f\u0440\u0438 \u043e\u0444\u043e\u0440\u043c\u043b\u0435\u043d\u0438\u0438. \u0412 \u0438\u0442\u043e\u0433\u043e \u0432\u0445\u043e\u0434\u044f\u0442 \u0443\u0441\u043b\u0443\u0433\u0438 VED."
        }
      </p>
      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
      {info && <p className="mb-4 text-sm text-emerald-300/90">{info}</p>}

      <div className="space-y-6">
        {cartRows.map(({ item, car }) => {
          const destination: DeliveryDestination =
            item.deliveryDestination === "moscow" ? "moscow" : "none";
          const carPrice = getClientCarPrice(car);
          const services = getVedServicesFee(car);
          const delivery = getDeliveryCost(destination, car);
          const total = getTotalPrice(car) + delivery;
          const deliveryDays = getDeliveryDays(destination, car.deliveryDays);

          return (
            <div
              key={car.id}
              className="flex flex-col gap-4 border border-white/10 p-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/catalog/${car.id}`}
                    className="font-light transition hover:text-white/80"
                  >
                    {car.brand} {car.model} {car.year}
                  </Link>
                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between gap-4 text-white/55">
                      <span>{"\u0426\u0435\u043d\u0430 \u0430\u0432\u0442\u043e"}</span>
                      <span className="text-white/80">{formatPrice(carPrice)}</span>
                    </div>
                    <div className="flex justify-between gap-4 text-white/55">
                      <span>{"\u0422\u0430\u043c\u043e\u0436\u043d\u044f"}</span>
                      <span className="text-white/80">
                        {formatPrice(car.customsCost)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 text-white/55">
                      <span>{"\u0423\u0441\u043b\u0443\u0433\u0438 VED"}</span>
                      <span className="text-white/80">{formatPrice(services)}</span>
                    </div>
                    {delivery > 0 && (
                      <div className="flex justify-between gap-4 text-white/55">
                        <span>{"\u0414\u043e\u0441\u0442\u0430\u0432\u043a\u0430"}</span>
                        <span className="text-white/80">
                          {formatPrice(delivery)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between gap-4 border-t border-white/10 pt-2 font-medium text-white">
                      <span>{"\u0418\u0442\u043e\u0433\u043e"}</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-white/35">
                    {"\u0421\u0440\u043e\u043a: \u0434\u043e "}
                    {formatDeliveryDays(deliveryDays)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    disabled={busyId === car.id}
                    onClick={() => void handleCheckout(car, total)}
                    className="border border-white bg-white px-4 py-2 text-xs uppercase tracking-wider text-ved-navy disabled:opacity-50"
                  >
                    {busyId === car.id ? "..." : "\u041e\u0444\u043e\u0440\u043c\u0438\u0442\u044c"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromCart(car.id)}
                    className="border border-white/20 px-4 py-2 text-xs uppercase tracking-wider text-white/60"
                  >
                    {"\u0423\u0434\u0430\u043b\u0438\u0442\u044c"}
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
        <span className="text-sm text-white/60">
          {
            "\u0418\u0442\u043e\u0433\u043e \u043e\u0440\u0438\u0435\u043d\u0442\u0438\u0440\u043e\u0432\u043e\u0447\u043d\u043e"
          }
        </span>
        <span className="text-lg font-light">{formatPrice(grandTotal)}</span>
      </div>
    </div>
  );
}
