"use client";

import { useState } from "react";
import type { Car } from "@/types/car";
import type { Order } from "@/types/cart";
import type { CabinetTab } from "@/lib/cabinet/constants";
import { formatPrice } from "@/data/cars";
import { formatDate } from "@/lib/cabinet/format";
import { statusLabels, statusBadgeStyles } from "@/lib/cabinet/constants";
import { useCart } from "@/context/CartContext";
import { OrderDetailModal } from "./OrderDetailModal";

interface OrdersTabProps {
  cars: Car[];
  onTabChange: (tab: CabinetTab) => void;
  onHighlightOrder: (orderId: string) => void;
}

export function OrdersTab({ cars, onTabChange, onHighlightOrder }: OrdersTabProps) {
  const { orders } = useCart();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (orders.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-white/50">Заказов пока нет</p>
        <p className="mt-2 text-sm text-white/30">
          Оформите заказ из корзины — он появится здесь
        </p>
      </div>
    );
  }

  const selectedCar = selectedOrder
    ? cars.find((c) => c.id === selectedOrder.carId)
    : undefined;

  return (
    <>
      <div className="space-y-3">
        {orders.map((order) => {
          const car = cars.find((c) => c.id === order.carId);
          const badge = statusBadgeStyles[order.status];

          return (
            <button
              key={order.id}
              type="button"
              onClick={() => setSelectedOrder(order)}
              className="w-full border border-white/10 p-4 text-left transition hover:border-white/25 hover:bg-white/5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-light">
                    {car ? `${car.brand} ${car.model}` : order.carId}
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    {formatDate(order.createdAt)} · {formatPrice(order.totalAmount)}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs ${badge.bg} ${badge.text}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                  {statusLabels[order.status]}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          car={selectedCar}
          onClose={() => setSelectedOrder(null)}
          onTrack={() => {
            setSelectedOrder(null);
            onHighlightOrder(selectedOrder.id);
            onTabChange("tracking");
          }}
        />
      )}
    </>
  );
}
