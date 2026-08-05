"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Header } from "@/components/Header";
import { PageBackground } from "@/components/PageBackground";
import { useCart } from "@/context/CartContext";
import type { Car } from "@/types/car";
import type { CabinetTab } from "@/lib/cabinet/constants";
import { cabinetTabs } from "@/lib/cabinet/constants";
import { ProfileCard } from "./components/ProfileCard";
import { CabinetNav } from "./components/CabinetNav";
import { FavoritesTab } from "./components/FavoritesTab";
import { CartTab } from "./components/CartTab";
import { OrdersTab } from "./components/OrdersTab";
import { ChatTab } from "./components/ChatTab";
import { DocumentsTab } from "./components/DocumentsTab";
import { TrackingTab } from "./components/TrackingTab";
import { FinanceTab } from "./components/FinanceTab";
import { AfterSalesTab } from "./components/AfterSalesTab";

const tabTitles: Record<CabinetTab, string> = {
  favorites: "Избранное",
  cart: "Корзина",
  orders: "Мои заказы",
  chat: "Чат с менеджером",
  documents: "Документы для таможни",
  tracking: "Отслеживание автомобиля",
  finance: "Финансовая сводка",
  aftersales: "Послепродажное обслуживание",
};

function CabinetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as CabinetTab | null;
  const [tab, setTab] = useState<CabinetTab>(tabParam || "cart");
  const [cars, setCars] = useState<Car[]>([]);
  const [highlightOrderId, setHighlightOrderId] = useState<string | null>(null);

  const { cartCount, favoritesCount } = useCart();

  useEffect(() => {
    fetch("/api/cars")
      .then((r) => r.json())
      .then(setCars)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (tabParam && cabinetTabs.some((t) => t.id === tabParam)) {
      setTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (next: CabinetTab) => {
    setTab(next);
    if (next !== "tracking") setHighlightOrderId(null);
    router.replace(`/cabinet?tab=${next}`, { scroll: false });
  };

  return (
    <main className="relative ved-screen bg-ved-navy">
      <PageBackground />
      <Header />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 md:px-12">
        <h1 className="text-2xl font-light uppercase tracking-[0.15em] md:text-3xl">
          Личный кабинет
        </h1>
        <p className="mt-2 text-sm text-white/40">
          Управление заказами, документами и избранными автомобилями
        </p>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:gap-8">
          <aside className="flex flex-col gap-4 lg:w-72 lg:shrink-0">
            <ProfileCard />
            <CabinetNav
              tab={tab}
              onTabChange={handleTabChange}
              cartCount={cartCount}
              favoritesCount={favoritesCount}
            />
          </aside>

          <div className="ved-glass min-w-0 flex-1 border border-white/10 p-5 md:p-6">
            <h2 className="mb-6 text-xs uppercase tracking-[0.2em] text-white/60">
              {tabTitles[tab]}
            </h2>

            {tab === "favorites" && <FavoritesTab cars={cars} />}
            {tab === "cart" && <CartTab cars={cars} />}
            {tab === "orders" && (
              <OrdersTab
                cars={cars}
                onTabChange={handleTabChange}
                onHighlightOrder={setHighlightOrderId}
              />
            )}
            {tab === "chat" && <ChatTab />}
            {tab === "documents" && <DocumentsTab />}
            {tab === "tracking" && (
              <TrackingTab cars={cars} highlightOrderId={highlightOrderId} />
            )}
            {tab === "finance" && <FinanceTab />}
            {tab === "aftersales" && <AfterSalesTab />}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CabinetPage() {
  return (
    <Suspense fallback={<div className="ved-screen bg-ved-navy" />}>
      <CabinetContent />
    </Suspense>
  );
}
