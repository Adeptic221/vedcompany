"use client";

import { useState } from "react";
import type { Car } from "@/types/car";
import type { DeliveryDestination } from "@/types/cart";
import { formatPrice, getTotalPrice } from "@/data/cars";
import { getDeliveryCost } from "@/lib/delivery/calculate";
import { DeliverySelector } from "@/components/DeliverySelector";
import { CarDetailActions } from "@/components/CarDetailActions";

export function CarDetailPricing({ car }: { car: Car }) {
  const [destination, setDestination] =
    useState<DeliveryDestination>("vladivostok");

  const base = getTotalPrice(car);
  const delivery = getDeliveryCost(destination, car.price);
  const total = base + delivery;

  return (
    <>
      <div className="mt-8 space-y-3 border border-white/10 bg-white/5 p-6">
        <h2 className="text-xs uppercase tracking-[0.2em] text-white/60">
          Расчёт стоимости
        </h2>
        {car.sync && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Цена в юанях</span>
              <span>{car.sync.priceCny.toLocaleString("ru-RU")} CNY</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Курс ВТБ</span>
              <span>
                {car.sync.exchangeRate} ₽/CNY
              </span>
            </div>
          </>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Цена авто</span>
          <span>{formatPrice(car.price)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Таможня</span>
          <span>{formatPrice(car.customsCost)}</span>
        </div>
        <DeliverySelector
          destination={destination}
          onChange={setDestination}
          carPriceRub={car.price}
          className="border-t border-white/10 pt-4"
        />
        {delivery > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Доставка</span>
            <span>{formatPrice(delivery)}</span>
          </div>
        )}
        {car.deliveryDays > 0 && (
          <p className="text-xs text-white/40">
            Срок доставки: ~{car.deliveryDays} дней
          </p>
        )}
        <div className="flex justify-between border-t border-white/10 pt-3 text-base font-medium">
          <span>Итого</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
      <CarDetailActions carId={car.id} totalAmount={total} />
    </>
  );
}
