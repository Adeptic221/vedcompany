"use client";

import { formatPrice } from "@/data/cars";
import { useCart } from "@/context/CartContext";

export function FinanceTab() {
  const { orders } = useCart();

  const totalFinance = orders.reduce((s, o) => s + o.totalAmount, 0);
  const paidFinance = orders.reduce((s, o) => s + o.paidAmount, 0);
  const remaining = totalFinance - paidFinance;
  const paidPercent = totalFinance > 0 ? Math.round((paidFinance / totalFinance) * 100) : 0;

  if (orders.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-white/50">Финансовая сводка появится после первого заказа</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4 border border-white/10 p-6">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Всего по заказам</span>
          <span>{formatPrice(totalFinance)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Оплачено (30%)</span>
          <span className="text-emerald-300">{formatPrice(paidFinance)}</span>
        </div>
        <div className="flex justify-between border-t border-white/10 pt-4 text-base font-medium">
          <span>К оплате</span>
          <span>{formatPrice(remaining)}</span>
        </div>

        <div className="pt-2">
          <div className="mb-2 flex justify-between text-xs text-white/40">
            <span>Прогресс оплаты</span>
            <span>{paidPercent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden bg-white/10">
            <div
              className="h-full bg-emerald-400/80 transition-all"
              style={{ width: `${paidPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
          По заказам
        </p>
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex justify-between border border-white/10 px-4 py-3 text-sm"
          >
            <span className="text-white/60">
              {order.id.replace("ord-", "Заказ #")}
            </span>
            <span>
              {formatPrice(order.paidAmount)} / {formatPrice(order.totalAmount)}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-white/40">
        Частичная оплата 30% при оформлении заказа. Оставшаяся сумма — перед
        передачей автомобиля.
      </p>
    </div>
  );
}
