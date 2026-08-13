"use client";

import type { CarType } from "@/types/car";
import type { DeliveryDestination } from "@/types/cart";
import {
  DELIVERY_DESTINATIONS,
  getDeliveryCost,
  getDeliveryOptionMeta,
} from "@/lib/delivery/calculate";
import { formatPrice } from "@/data/cars";

export function DeliverySelector({
  destination,
  onChange,
  carPriceRub,
  carType,
  baseDeliveryDays,
  className = "",
}: {
  destination: DeliveryDestination;
  onChange: (value: DeliveryDestination) => void;
  carPriceRub: number;
  carType: CarType;
  baseDeliveryDays: number;
  className?: string;
}) {
  const car = { price: carPriceRub, type: carType };

  return (
    <div className={className}>
      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/60">
        Получение
      </p>
      <div className="space-y-2">
        {DELIVERY_DESTINATIONS.map((value) => {
          const meta = getDeliveryOptionMeta(value, baseDeliveryDays);
          const cost = getDeliveryCost(value, car);
          const selected = destination === value;
          return (
            <label
              key={value}
              className={`flex cursor-pointer items-start gap-3 border p-3 transition ${
                selected
                  ? "border-white/40 bg-white/10"
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              <input
                type="radio"
                name="delivery"
                value={value}
                checked={selected}
                onChange={() => onChange(value)}
                className="mt-1"
              />
              <span className="flex-1">
                <span className="block text-sm">{meta.label}</span>
                <span className="mt-0.5 block text-xs text-white/50">
                  {meta.hint} · {formatPrice(cost)}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
