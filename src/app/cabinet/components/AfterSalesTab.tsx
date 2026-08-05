"use client";

import { ContactButtons } from "@/components/ContactButtons";

export function AfterSalesTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2 text-sm text-white/55">
        <p>
          Послепродажное обслуживание — помощь после покупки и в процессе владения
          автомобилем: ТО, расходники, типичные поломки, аналоги запчастей и общие
          вопросы по эксплуатации.
        </p>
        <p className="text-white/40">
          ИИ-ассистент временно отключён. По вопросам послепродажного обслуживания
          свяжитесь с менеджером ВЭД.
        </p>
      </div>

      <div className="border border-white/10 bg-white/[0.03] px-4 py-4">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/80">
          Связь с менеджером
        </p>
        <ContactButtons size="sm" />
      </div>
    </div>
  );
}