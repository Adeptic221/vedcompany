"use client";

import type { Order } from "@/types/cart";
import type { Car } from "@/types/car";
import { formatPrice } from "@/data/cars";
import { formatDate } from "@/lib/cabinet/format";
import {
  statusLabels,
  statusDescriptions,
  statusBadgeStyles,
} from "@/lib/cabinet/constants";

interface OrderDetailModalProps {
  order: Order;
  car: Car | undefined;
  onClose: () => void;
  onTrack: () => void;
}

export function OrderDetailModal({
  order,
  car,
  onClose,
  onTrack,
}: OrderDetailModalProps) {
  const badge = statusBadgeStyles[order.status];
  const remaining = order.totalAmount - order.paidAmount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="ved-glass max-h-[85vh] w-full max-w-lg overflow-y-auto border border-white/15 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              Заказ {order.id.replace("ord-", "#")}
            </p>
            <h3 id="order-detail-title" className="mt-1 text-xl font-light">
              {car ? `${car.brand} ${car.model} ${car.year}` : order.carId}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 border border-white/20 p-2 text-white/50 transition hover:border-white/40 hover:text-white"
            aria-label="Закрыть"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${badge.bg} ${badge.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
          {statusLabels[order.status]}
        </span>
        <p className="mt-3 text-sm text-white/50">{statusDescriptions[order.status]}</p>

        <dl className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm">
          <div className="flex justify-between">
            <dt className="text-white/50">Дата оформления</dt>
            <dd>{formatDate(order.createdAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/50">Сумма заказа</dt>
            <dd>{formatPrice(order.totalAmount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/50">Оплачено (30%)</dt>
            <dd className="text-emerald-300">{formatPrice(order.paidAmount)}</dd>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-3 font-medium">
            <dt>К оплате</dt>
            <dd>{formatPrice(remaining)}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onTrack}
            className="flex-1 border border-white bg-white py-3 text-xs uppercase tracking-wider text-ved-navy"
          >
            Отследить доставку
          </button>
          {car && (
            <a
              href={`/catalog/${car.id}`}
              className="flex-1 border border-white/30 py-3 text-center text-xs uppercase tracking-wider transition hover:bg-white/10"
            >
              Карточка авто
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
