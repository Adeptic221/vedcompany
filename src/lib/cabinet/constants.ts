import type { OrderStatus } from "@/types/cart";

export type CabinetTab =
  | "favorites"
  | "cart"
  | "orders"
  | "chat"
  | "documents"
  | "tracking"
  | "finance";

export const cabinetTabs: { id: CabinetTab; label: string }[] = [
  { id: "favorites", label: "Избранное" },
  { id: "cart", label: "Корзина" },
  { id: "orders", label: "Мои заказы" },
  { id: "chat", label: "Чат с менеджером" },
  { id: "documents", label: "Документы" },
  { id: "tracking", label: "Отслеживание" },
  { id: "finance", label: "Финансы" },
];

export const statusLabels: Record<OrderStatus, string> = {
  new: "Новый заказ",
  manager: "Связь с менеджером",
  documents: "Документы",
  customs: "Таможня",
  shipping: "Доставка",
  done: "Завершён",
};

export const statusDescriptions: Record<OrderStatus, string> = {
  new: "Заказ принят в обработку",
  manager: "Менеджер свяжется с вами для уточнения деталей",
  documents: "Сбор и проверка документов для таможни",
  customs: "Таможенное оформление автомобиля",
  shipping: "Автомобиль в пути к месту доставки",
  done: "Автомобиль передан клиенту",
};

export const statusSteps: OrderStatus[] = [
  "new",
  "manager",
  "documents",
  "customs",
  "shipping",
  "done",
];

export const statusBadgeStyles: Record<
  OrderStatus,
  { bg: string; text: string; dot: string }
> = {
  new: { bg: "bg-blue-500/20", text: "text-blue-200", dot: "bg-blue-400" },
  manager: { bg: "bg-purple-500/20", text: "text-purple-200", dot: "bg-purple-400" },
  documents: { bg: "bg-amber-500/20", text: "text-amber-200", dot: "bg-amber-400" },
  customs: { bg: "bg-orange-500/20", text: "text-orange-200", dot: "bg-orange-400" },
  shipping: { bg: "bg-cyan-500/20", text: "text-cyan-200", dot: "bg-cyan-400" },
  done: { bg: "bg-emerald-500/20", text: "text-emerald-200", dot: "bg-emerald-400" },
};
