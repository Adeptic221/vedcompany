"use client";

import { useState } from "react";
import type { Car } from "@/types/car";
import type { DeliveryDestination } from "@/types/cart";
import { formatPrice, getClientCarPrice, getClientPriceCny, getVedServicesFee, getTotalPrice } from "@/data/cars";
import { getDeliveryCost, getDeliveryDays, formatDeliveryDays } from "@/lib/delivery/calculate";
import { DeliverySelector } from "@/components/DeliverySelector";
import { CarDetailActions } from "@/components/CarDetailActions";

export function CarDetailPricing({ car }: { car: Car }) {
  const [destination, setDestination] =
    useState<DeliveryDestination>("none");

  const carPrice = getClientCarPrice(car);
  const clientCny = getClientPriceCny(car);
  const services = getVedServicesFee(car);
  const base = getTotalPrice(car);
  const delivery = getDeliveryCost(destination, car);
  const total = base + delivery;
  const deliveryDays = getDeliveryDays(destination, car.deliveryDays);

  return (
    <>
      <div className="mt-8 space-y-3 border border-white/10 bg-white/5 p-6">
        <h2 className="text-xs uppercase tracking-[0.2em] text-white/60">
          {"\u041e\u0440\u0438\u0435\u043d\u0442\u0438\u0440\u043e\u0432\u043e\u0447\u043d\u044b\u0439 \u0440\u0430\u0441\u0447\u0451\u0442"}
        </h2>
        <p className="text-xs text-white/40">
          {
            "\u0424\u0438\u043d\u0430\u043b\u044c\u043d\u0443\u044e \u0441\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440 \u0443\u0442\u043e\u0447\u043d\u0438\u0442 \u0441 \u0432\u0430\u043c\u0438 \u043f\u0440\u0438 \u043e\u0444\u043e\u0440\u043c\u043b\u0435\u043d\u0438\u0438."
          }
        </p>
        {clientCny != null && car.sync && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">
                {"\u0426\u0435\u043d\u0430 \u0432 \u044e\u0430\u043d\u044f\u0445"}
              </span>
              <span>{clientCny.toLocaleString("ru-RU")} CNY</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">{"\u041a\u0443\u0440\u0441"}</span>
              <span>{car.sync.exchangeRate} {"\u20bd"}/CNY</span>
            </div>
          </>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-white/60">{"\u0426\u0435\u043d\u0430 \u0430\u0432\u0442\u043e"}</span>
          <span>{formatPrice(carPrice)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">{"\u0422\u0430\u043c\u043e\u0436\u043d\u044f"}</span>
          <span>{formatPrice(car.customsCost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">
            {"\u0423\u0441\u043b\u0443\u0433\u0438 VED"}
          </span>
          <span>{formatPrice(services)}</span>
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
            <span className="text-white/60">{"\u0414\u043e\u0441\u0442\u0430\u0432\u043a\u0430"}</span>
            <span>{formatPrice(delivery)}</span>
          </div>
        )}
        {deliveryDays > 0 && (
          <p className="text-xs text-white/40">
            {"\u0421\u0440\u043e\u043a \u043f\u043e\u0441\u0442\u0430\u0432\u043a\u0438: \u0434\u043e "}
            {formatDeliveryDays(deliveryDays)}
          </p>
        )}
        <div className="flex justify-between border-t border-white/10 pt-3 text-base font-medium">
          <span>
            {
              "\u0418\u0442\u043e\u0433\u043e \u043e\u0440\u0438\u0435\u043d\u0442\u0438\u0440\u043e\u0432\u043e\u0447\u043d\u043e"
            }
          </span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
      <CarDetailActions carId={car.id} totalAmount={total} />
    </>
  );
}
