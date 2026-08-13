"use client";

import { useState } from "react";
import type { Car } from "@/types/car";
import type { DeliveryDestination } from "@/types/cart";
import { formatPrice, getClientCarPrice, getClientPriceCny, getTotalPrice } from "@/data/cars";
import { getDeliveryCost, getDeliveryDays, formatDeliveryDays } from "@/lib/delivery/calculate";
import { DeliverySelector } from "@/components/DeliverySelector";
import { CarDetailActions } from "@/components/CarDetailActions";

export function CarDetailPricing({ car }: { car: Car }) {
  const [destination, setDestination] =
    useState<DeliveryDestination>("none");

  const carPrice = getClientCarPrice(car);
  const clientCny = getClientPriceCny(car);
  const base = getTotalPrice(car);
  const delivery = getDeliveryCost(destination, car);
  const total = base + delivery;
  const deliveryDays = getDeliveryDays(destination, car.deliveryDays);

  return (
    <>
      <div className="mt-8 space-y-3 border border-white/10 bg-white/5 p-6">
        <h2 className="text-xs uppercase tracking-[0.2em] text-white/60">
          Ориентировочный расчёт
        </h2>
        <p className="text-xs text-white/40">
          Финальную стоимость менеджер уточнит с вами при оформлении.
        </p>
        {clientCny != null && car.sync && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Цена в юанях</span>
              <span>{clientCny.toLocaleString("ru-RU")} CNY</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Курс</span>
              <span>{car.sync.exchangeRate} ₽/CNY</span>
            </div>
          </>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Цена авто</span>
          <span>{formatPrice(carPrice)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Таможня</span>
          <span>{formatPrice(car.customsCost)}</span>
        </div>
        <DeliverySelector
          destination={destination}
          onChange={setDestination}
          carPriceRub={car.price}
          carType={car.type}
          baseDeliveryDays={car.deliveryDays}
          className="border-t border-white/10 pt-4"
        />
        {delivery > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Доставка</span>
            <span>{formatPrice(delivery)}</span>
          </div>
        )}
        {deliveryDays > 0 && (
          <p className="text-xs text-white/40">
            Срок поставки: до {formatDeliveryDays(deliveryDays)}
          </p>
        )}
        <div className="flex justify-between border-t border-white/10 pt-3 text-base font-medium">
          <span>Итого ориентировочно</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
      <CarDetailActions carId={car.id} totalAmount={total} />
    </>
  );
}
