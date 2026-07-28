"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { PageBackground } from "@/components/PageBackground";
import { useCart } from "@/context/CartContext";
import { formatPrice, getTotalPrice } from "@/data/cars";
import type { Car } from "@/types/car";
import type { OrderStatus } from "@/types/cart";

type Tab = "cart" | "orders" | "chat" | "documents" | "tracking" | "finance";

const tabs: { id: Tab; label: string }[] = [
  { id: "cart", label: "\u041a\u043e\u0440\u0437\u0438\u043d\u0430" },
  { id: "orders", label: "\u041c\u043e\u0438 \u0437\u0430\u043a\u0430\u0437\u044b" },
  { id: "chat", label: "\u0427\u0430\u0442 \u0441 \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u043e\u043c" },
  { id: "documents", label: "\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b" },
  { id: "tracking", label: "\u041e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u043d\u0438\u0435" },
  { id: "finance", label: "\u0424\u0438\u043d\u0430\u043d\u0441\u044b" },
];

const statusLabels: Record<OrderStatus, string> = {
  new: "\u041d\u043e\u0432\u044b\u0439 \u0437\u0430\u043a\u0430\u0437",
  manager: "\u0421\u0432\u044f\u0437\u044c \u0441 \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u043e\u043c",
  documents: "\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b",
  customs: "\u0422\u0430\u043c\u043e\u0436\u043d\u044f",
  shipping: "\u0414\u043e\u0441\u0442\u0430\u0432\u043a\u0430",
  done: "\u0417\u0430\u0432\u0435\u0440\u0448\u0451\u043d",
};

const statusSteps: OrderStatus[] = [
  "new",
  "manager",
  "documents",
  "customs",
  "shipping",
  "done",
];

function CabinetContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;
  const [tab, setTab] = useState<Tab>(tabParam || "cart");
  const [chatInput, setChatInput] = useState("");
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    fetch("/api/cars")
      .then((r) => r.json())
      .then(setCars)
      .catch(() => {});
  }, []);

  const {
    items,
    orders,
    messages,
    documents,
    removeFromCart,
    checkout,
    sendMessage,
    addDocument,
  } = useCart();

  useEffect(() => {
    if (tabParam && tabs.some((t) => t.id === tabParam)) {
      setTab(tabParam);
    }
  }, [tabParam]);

  const cartCars = items
    .map((item) => cars.find((c) => c.id === item.carId))
    .filter(Boolean);

  const totalFinance = orders.reduce((s, o) => s + o.totalAmount, 0);
  const paidFinance = orders.reduce((s, o) => s + o.paidAmount, 0);

  return (
    <main className="relative min-h-screen bg-ved-navy">
      <PageBackground />
      <Header />

      <div className="relative z-10 mx-auto max-w-6xl px-8 pb-16 md:px-12">
        <h1 className="text-3xl font-light uppercase tracking-[0.15em]">
          {"\u041b\u0438\u0447\u043d\u044b\u0439 \u043a\u0430\u0431\u0438\u043d\u0435\u0442"}
        </h1>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <nav className="flex shrink-0 flex-row gap-2 overflow-x-auto lg:w-56 lg:flex-col">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`whitespace-nowrap border px-4 py-3 text-left text-xs uppercase tracking-wider transition ${
                  tab === t.id
                    ? "border-white bg-white/10 text-white"
                    : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                }`}
              >
                {t.label}
                {t.id === "cart" && items.length > 0 && (
                  <span className="ml-2 text-white/60">({items.length})</span>
                )}
              </button>
            ))}
          </nav>

          <div className="min-w-0 flex-1 border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            {tab === "cart" && (
              <div>
                <h2 className="mb-6 text-xs uppercase tracking-[0.2em] text-white/60">
                  {"\u041a\u043e\u0440\u0437\u0438\u043d\u0430"}
                </h2>
                {cartCars.length === 0 ? (
                  <div className="py-12 text-center text-white/50">
                    <p>{"\u041a\u043e\u0440\u0437\u0438\u043d\u0430 \u043f\u0443\u0441\u0442\u0430"}</p>
                    <Link href="/catalog" className="mt-4 inline-block border border-white/30 px-6 py-3 text-xs uppercase tracking-widest transition hover:bg-white hover:text-ved-navy">
                      {"\u0412 \u043a\u0430\u0442\u0430\u043b\u043e\u0433"}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartCars.map((car) => {
                      if (!car) return null;
                      const total = getTotalPrice(car);
                      return (
                        <div key={car.id} className="flex flex-col gap-4 border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-light">{car.brand} {car.model} {car.year}</p>
                            <p className="mt-1 text-sm text-white/50">{formatPrice(total)}</p>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => checkout(car.id, total)} className="border border-white bg-white px-4 py-2 text-xs uppercase tracking-wider text-ved-navy">
                              {"\u041e\u0444\u043e\u0440\u043c\u0438\u0442\u044c"}
                            </button>
                            <button type="button" onClick={() => removeFromCart(car.id)} className="border border-white/20 px-4 py-2 text-xs uppercase tracking-wider text-white/60">
                              {"\u0423\u0434\u0430\u043b\u0438\u0442\u044c"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === "orders" && (
              <div>
                <h2 className="mb-6 text-xs uppercase tracking-[0.2em] text-white/60">
                  {"\u041c\u043e\u0438 \u0437\u0430\u043a\u0430\u0437\u044b"}
                </h2>
                {orders.length === 0 ? (
                  <p className="text-white/50">{"\u0417\u0430\u043a\u0430\u0437\u043e\u0432 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442"}</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const car = cars.find((c) => c.id === order.carId);
                      return (
                        <div key={order.id} className="border border-white/10 p-4">
                          <p className="font-light">{car ? `${car.brand} ${car.model}` : order.carId}</p>
                          <p className="mt-1 text-sm text-white/50">{statusLabels[order.status]}</p>
                          <p className="mt-2 text-sm">{formatPrice(order.totalAmount)}</p>
                          <p className="text-xs text-white/40">
                            {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === "chat" && (
              <div className="flex h-[480px] flex-col">
                <h2 className="mb-4 text-xs uppercase tracking-[0.2em] text-white/60">
                  {"\u0427\u0430\u0442 \u0441 \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u043e\u043c"}
                </h2>
                <div className="flex-1 space-y-3 overflow-y-auto border border-white/10 p-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.from === "client" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] px-4 py-2 text-sm ${msg.from === "client" ? "bg-white text-ved-navy" : "bg-white/10 text-white/90"}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <form
                  className="mt-4 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage(chatInput);
                    setChatInput("");
                  }}
                >
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={"\u041d\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435..."}
                    className="flex-1 border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                  />
                  <button type="submit" className="border border-white px-4 py-3 text-xs uppercase tracking-wider hover:bg-white hover:text-ved-navy">
                    {"\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c"}
                  </button>
                </form>
              </div>
            )}

            {tab === "documents" && (
              <div>
                <h2 className="mb-4 text-xs uppercase tracking-[0.2em] text-white/60">
                  {"\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b \u0434\u043b\u044f \u0442\u0430\u043c\u043e\u0436\u043d\u0438"}
                </h2>
                <p className="mb-6 text-sm text-white/50">
                  {"\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u043f\u0430\u0441\u043f\u043e\u0440\u0442, \u0414\u041a\u041f \u0438 \u0434\u0440\u0443\u0433\u0438\u0435 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b \u0434\u043b\u044f \u0432\u0432\u043e\u0437\u0430 \u0430\u0432\u0442\u043e \u0432 \u0420\u0424"}
                </p>
                <label className="inline-block cursor-pointer border border-white/30 px-6 py-3 text-xs uppercase tracking-widest transition hover:bg-white hover:text-ved-navy">
                  {"\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u0444\u0430\u0439\u043b"}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) addDocument(file.name);
                    }}
                  />
                </label>
                {documents.length > 0 && (
                  <ul className="mt-6 space-y-2">
                    {documents.map((doc) => (
                      <li key={doc.id} className="flex items-center justify-between border border-white/10 px-4 py-3 text-sm">
                        <span>{doc.name}</span>
                        <span className="text-xs text-white/40">
                          {new Date(doc.uploadedAt).toLocaleDateString("ru-RU")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {tab === "tracking" && (
              <div>
                <h2 className="mb-6 text-xs uppercase tracking-[0.2em] text-white/60">
                  {"\u041e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u043d\u0438\u0435 \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044f"}
                </h2>
                {orders.length === 0 ? (
                  <p className="text-white/50">{"\u041e\u0444\u043e\u0440\u043c\u0438\u0442\u0435 \u0437\u0430\u043a\u0430\u0437, \u0447\u0442\u043e\u0431\u044b \u043e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u0442\u044c \u0441\u0442\u0430\u0442\u0443\u0441"}</p>
                ) : (
                  orders.map((order) => {
                    const car = cars.find((c) => c.id === order.carId);
                    const stepIndex = statusSteps.indexOf(order.status);
                    return (
                      <div key={order.id} className="mb-8 border border-white/10 p-4">
                        <p className="mb-4 font-light">{car ? `${car.brand} ${car.model}` : order.carId}</p>
                        <div className="space-y-3">
                          {statusSteps.map((step, i) => (
                            <div key={step} className="flex items-center gap-3">
                              <div className={`h-2 w-2 rounded-full ${i <= stepIndex ? "bg-white" : "bg-white/20"}`} />
                              <span className={i <= stepIndex ? "text-white" : "text-white/40"}>{statusLabels[step]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {tab === "finance" && (
              <div>
                <h2 className="mb-6 text-xs uppercase tracking-[0.2em] text-white/60">
                  {"\u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u0430\u044f \u0441\u0432\u043e\u0434\u043a\u0430"}
                </h2>
                <div className="space-y-4 border border-white/10 p-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">{"\u0412\u0441\u0435\u0433\u043e \u043f\u043e \u0437\u0430\u043a\u0430\u0437\u0430\u043c"}</span>
                    <span>{formatPrice(totalFinance)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">{"\u041e\u043f\u043b\u0430\u0447\u0435\u043d\u043e (30%)"}</span>
                    <span className="text-green-300">{formatPrice(paidFinance)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-4 text-base font-medium">
                    <span>{"\u041a \u043e\u043f\u043b\u0430\u0442\u0435"}</span>
                    <span>{formatPrice(totalFinance - paidFinance)}</span>
                  </div>
                </div>
                <p className="mt-4 text-xs text-white/40">
                  {"\u0427\u0430\u0441\u0442\u0438\u0447\u043d\u0430\u044f \u043e\u043f\u043b\u0430\u0442\u0430 30% \u043f\u0440\u0438 \u043e\u0444\u043e\u0440\u043c\u043b\u0435\u043d\u0438\u0438 \u0437\u0430\u043a\u0430\u0437\u0430"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CabinetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ved-navy" />}>
      <CabinetContent />
    </Suspense>
  );
}
