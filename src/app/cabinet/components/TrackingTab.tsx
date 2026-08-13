"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Car } from "@/types/car";
import { useCart } from "@/context/CartContext";
import { statusLabels, statusSteps } from "@/lib/cabinet/constants";
import { countUploadedRequiredDocs } from "@/lib/cabinet/documents";

interface TrackingTabProps {
  cars: Car[];
  highlightOrderId: string | null;
  onGoToDocuments?: () => void;
}

export function TrackingTab({
  cars,
  highlightOrderId,
  onGoToDocuments,
}: TrackingTabProps) {
  const { orders, documents } = useCart();
  const highlightRef = useRef<HTMLDivElement>(null);

  const docsProgress = useMemo(
    () => countUploadedRequiredDocs(documents.map((d) => d.kind)),
    [documents]
  );

  useEffect(() => {
    if (highlightOrderId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightOrderId]);

  if (orders.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-white/50">Оформите заказ, чтобы отслеживать статус</p>
        <p className="mt-2 text-sm text-white/30">
          После оформления здесь появится пошаговый маршрут доставки
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {orders.map((order) => {
        const car = cars.find((c) => c.id === order.carId);
        const stepIndex = statusSteps.indexOf(order.status);
        const isHighlighted = order.id === highlightOrderId;

        return (
          <div
            key={order.id}
            ref={isHighlighted ? highlightRef : undefined}
            className={`border p-5 transition ${
              isHighlighted
                ? "border-white/40 bg-white/5 ring-1 ring-white/20"
                : "border-white/10"
            }`}
          >
            <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-light text-lg">
                {car ? `${car.brand} ${car.model}` : order.carId}
              </p>
              <p className="text-xs text-white/40">
                Заказ {order.id.replace("ord-", "#")}
              </p>
            </div>

            <div className="relative">
              {statusSteps.map((step, i) => {
                const isDone = i < stepIndex;
                const isCurrent = i === stepIndex;
                const isLast = i === statusSteps.length - 1;
                const showDocsProgress =
                  step === "documents" && (isCurrent || isDone || stepIndex < i);

                return (
                  <div key={step} className="relative flex gap-4 pb-8 last:pb-0">
                    {!isLast && (
                      <div
                        className={`absolute left-[11px] top-6 h-[calc(100%-12px)] w-px ${
                          i < stepIndex ? "bg-white/50" : "bg-white/15"
                        }`}
                      />
                    )}
                    <div className="relative z-10 shrink-0">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                          isCurrent
                            ? "border-white bg-white text-ved-navy"
                            : isDone
                              ? "border-white/60 bg-white/20 text-white"
                              : "border-white/20 bg-transparent text-white/30"
                        }`}
                      >
                        {isDone ? (
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                        ) : (
                          <span className="text-[10px] font-medium">{i + 1}</span>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p
                        className={`text-sm ${
                          isCurrent
                            ? "font-medium text-white"
                            : isDone
                              ? "text-white/80"
                              : "text-white/35"
                        }`}
                      >
                        {statusLabels[step]}
                      </p>
                      {isCurrent && (
                        <p className="mt-1 text-xs text-white/45">Текущий этап</p>
                      )}
                      {step === "documents" && (
                        <div
                          className={`mt-2 max-w-sm ${
                            isCurrent || isDone ? "opacity-100" : "opacity-50"
                          }`}
                        >
                          <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] text-white/45">
                            <span>
                              Пакет документов: {docsProgress.done} /{" "}
                              {docsProgress.total}
                            </span>
                            {docsProgress.done >= docsProgress.total ? (
                              <span className="text-emerald-300/80">готов</span>
                            ) : (
                              <span className="text-amber-200/70">в работе</span>
                            )}
                          </div>
                          <div className="h-0.5 overflow-hidden bg-white/10">
                            <div
                              className="h-full bg-white/65 transition-all"
                              style={{
                                width: `${
                                  docsProgress.total
                                    ? (docsProgress.done / docsProgress.total) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          {onGoToDocuments && (isCurrent || showDocsProgress) && (
                            <button
                              type="button"
                              onClick={onGoToDocuments}
                              className="mt-2 text-[11px] uppercase tracking-wider text-white/55 underline-offset-2 transition hover:text-white hover:underline"
                            >
                              Перейти к документам
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}