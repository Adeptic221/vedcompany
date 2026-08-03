"use client";

import type { Car } from "@/types/car";
import { AiAssistantWidget } from "@/components/cabinet/AiAssistantWidget";
import { LoadingSphere } from "@/components/LoadingSphere";

export function AfterSalesTab({ cars }: { cars: Car[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2 text-sm text-white/55">
        <p>
          Послепродажное обслуживание — помощь после покупки и в процессе владения
          автомобилем: ТО, расходники, типичные поломки, аналоги запчастей и общие
          вопросы по эксплуатации.
        </p>
        <p className="text-white/40">
          Ниже — ИИ-ассистент ВЭД. Он отвечает по автомобильной тематике текстом и
          голосом. Для работы нужен пополненный баланс DeepSeek.
        </p>
      </div>

      <div className="flex items-center gap-3 border border-white/10 bg-white/[0.03] px-4 py-3">
        <LoadingSphere size={36} label="" />
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/80">ИИ-помощник</p>
          <p className="mt-1 text-[11px] text-white/40">
            Масло, ТО, аналоги, риски по пробегу — спрашивайте здесь
          </p>
        </div>
      </div>

      <AiAssistantWidget cars={cars} variant="embedded" />
    </div>
  );
}
