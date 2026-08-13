"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Order, OrderStatus } from "@/types/cart";
import { statusLabels, statusSteps } from "@/lib/cabinet/constants";

function AdminOrdersInner() {
  const search = useSearchParams();
  const filterUser = search.get("userId");
  const [orders, setOrders] = useState<Order[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/orders", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Ошибка загрузки");
      return;
    }
    setOrders(data.orders || []);
  }

  useEffect(() => {
    void load();
  }, []);

  const visible = useMemo(
    () => (filterUser ? orders.filter((o) => o.userId === filterUser) : orders),
    [orders, filterUser]
  );

  async function changeStatus(id: string, status: OrderStatus) {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Не удалось обновить статус");
        return;
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? (data.order as Order) : o))
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light uppercase tracking-[0.15em]">Заказы</h1>
        <p className="mt-2 text-sm text-white/50">
          Смена стадий отслеживания для менеджера
        </p>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      {visible.length === 0 ? (
        <p className="text-sm text-white/40">Заказов пока нет</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((order) => (
            <li key={order.id} className="border border-white/10 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-white">
                    {order.userName || order.userEmail || "Клиент"} · {order.carId}
                  </p>
                  <p className="text-xs text-white/40">
                    {order.id} · {new Date(order.createdAt).toLocaleString("ru-RU")}
                  </p>
                  <p className="mt-1 text-xs text-white/50">
                    Сумма {order.totalAmount.toLocaleString("ru-RU")} ₽ · оплачено{" "}
                    {order.paidAmount.toLocaleString("ru-RU")} ₽
                  </p>
                </div>
                <select
                  value={order.status}
                  disabled={busyId === order.id}
                  onChange={(e) =>
                    void changeStatus(order.id, e.target.value as OrderStatus)
                  }
                  className="ved-select max-w-xs"
                >
                  {statusSteps.map((s) => (
                    <option key={s} value={s}>
                      {statusLabels[s]}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<p className="text-white/50">Загрузка...</p>}>
      <AdminOrdersInner />
    </Suspense>
  );
}