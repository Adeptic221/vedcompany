"use client";
import { useState } from "react";
import { LeadForm } from "@/components/LeadForm";
import { ContactButtons } from "@/components/ContactButtons";

export function CarRequestSection({ carId, carLabel }: { carId: string; carLabel: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!expanded) {
    return (
      <div className="mt-6 space-y-3">
        <button type="button" onClick={() => setExpanded(true)} className="w-full border border-white/30 px-6 py-3 text-xs uppercase tracking-widest transition hover:border-white hover:bg-white/10">
          {"\u0417\u0430\u044f\u0432\u043a\u0430 \u043d\u0430 \u0430\u0432\u0442\u043e"}
        </button>
        <ContactButtons size="sm" />
      </div>
    );
  }
  return (
    <div className="mt-6 ved-glass border border-white/10 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-[0.2em] text-white/60">{"\u0417\u0430\u044f\u0432\u043a\u0430 \u043d\u0430 \u0430\u0432\u0442\u043e"}</h3>
        <button type="button" onClick={() => setExpanded(false)} className="text-[10px] uppercase tracking-widest text-white/40 transition hover:text-white">{"\u0421\u0432\u0435\u0440\u043d\u0443\u0442\u044c"}</button>
      </div>
      <LeadForm type="car_request" carId={carId} carLabel={carLabel} source="car_detail" submitLabel={"\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0437\u0430\u044f\u0432\u043a\u0443"} compact />
      <div className="mt-4"><ContactButtons size="sm" /></div>
    </div>
  );
}