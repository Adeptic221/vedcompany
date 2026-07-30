"use client";

import type { DeliveryDestination } from "@/types/cart";
import {
  DELIVERY_OPTIONS,
  getDeliveryCost,
} from "@/lib/delivery/calculate";
import { formatPrice } from "@/data/cars";

export function DeliverySelector({
  destination,
  onChange,
  carPriceRub,
  className = "",
}: {
  destination: DeliveryDestination;
  onChange: (value: DeliveryDestination) => void;
  carPriceRub: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/60">
        Доставка
      </p>
      <div className="space-y-2">
        {DELIVERY_OPTIONS.map((opt) => {
          const cost = getDeliveryCost(opt.value, carPriceRub);
          const selected = destination === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-3 border p-3 transition ${
                selected
                  ? "border-white/40 bg-white/10"
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              <input
                type="radio"
                name="delivery"
                value={opt.value}
                checked={selected}
                onChange={() => onChange(opt.value)}
                className="mt-1"
              />
              <span className="flex-1">
                <span className="block text-sm">{opt.label}</span>
                <span className="mt-0.5 block text-xs text-white/50">
                  {opt.hint} · {formatPrice(cost)}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
