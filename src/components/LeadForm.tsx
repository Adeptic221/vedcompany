"use client";
import { useState, useCallback, type FormEvent } from "react";
import type { LeadPayload, LeadType } from "@/types/lead";
import { saveLeadLocally } from "@/lib/leads/client-backup";
import { isValidName, isValidPhone } from "@/lib/leads/validation";

interface LeadFormProps {
  type: LeadType;
  carId?: string;
  carLabel?: string;
  source?: string;
  submitLabel?: string;
  onSuccess?: (leadId: string) => void;
  compact?: boolean;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

export function LeadForm({ type, carId, carLabel, source, submitLabel, onSuccess, compact = false }: LeadFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState("");
  const [leadId, setLeadId] = useState("");

  const reset = useCallback(() => {
    setName(""); setPhone(""); setMessage(""); setStatus("idle"); setError(""); setLeadId("");
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!isValidName(name)) { setError("\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u0438\u043c\u044f (\u043c\u0438\u043d\u0438\u043c\u0443\u043c 2 \u0441\u0438\u043c\u0432\u043e\u043b\u0430)"); return; }
    if (!isValidPhone(phone)) { setError("\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u043d\u044b\u0439 \u043d\u043e\u043c\u0435\u0440 \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0430"); return; }
    setStatus("submitting");
    const payload: LeadPayload = { type, name: name.trim(), phone: phone.trim(), message: message.trim() || undefined, carId, carLabel, source };
    try {
      const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json() as { success?: boolean; id?: string; error?: string };
      if (!res.ok || !data.success) throw new Error(data.error || "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0437\u0430\u044f\u0432\u043a\u0443");
      const id = data.id || `local-${Date.now()}`;
      setLeadId(id); setStatus("success");
      saveLeadLocally({ ...payload, id, createdAt: new Date().toISOString() });
      onSuccess?.(id);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "\u041e\u0448\u0438\u0431\u043a\u0430 \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0438");
    }
  }

  if (status === "success") {
    const shortId = leadId.slice(-8).toUpperCase();
    return (
      <div className="ved-glass border border-white/20 p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10">
          <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <p className="text-sm font-medium tracking-wide text-white">{"\u0417\u0430\u044f\u0432\u043a\u0430 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0430"}</p>
        <p className="mt-2 text-xs text-white/60">{"\u041d\u043e\u043c\u0435\u0440 \u0437\u0430\u044f\u0432\u043a\u0438:"} <span className="font-mono text-white/80">{shortId}</span></p>
        <p className="mt-3 text-xs leading-relaxed text-white/50">{"\u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440 \u0441\u0432\u044f\u0436\u0435\u0442\u0441\u044f \u0441 \u0432\u0430\u043c\u0438 \u0432 \u0431\u043b\u0438\u0436\u0430\u0439\u0448\u0435\u0435 \u0432\u0440\u0435\u043c\u044f"}</p>
        <button type="button" onClick={reset} className="mt-5 text-xs uppercase tracking-widest text-white/50 transition hover:text-white">{"\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0435\u0449\u0451"}</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-3" : "space-y-4"} noValidate>
      {carLabel && (
        <div className="border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-white/40">{"\u0410\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044c"}</p>
          <p className="mt-1 text-sm text-white/90">{carLabel}</p>
        </div>
      )}
      <div>
        <label htmlFor={`lead-name-${type}`} className="mb-1.5 block text-[10px] uppercase tracking-widest text-white/50">{"\u0412\u0430\u0448\u0435 \u0438\u043c\u044f *"}</label>
        <input id={`lead-name-${type}`} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={"\u0418\u0432\u0430\u043d"} className="ved-input" autoComplete="name" required disabled={status === "submitting"} />
      </div>
      <div>
        <label htmlFor={`lead-phone-${type}`} className="mb-1.5 block text-[10px] uppercase tracking-widest text-white/50">{"\u0422\u0435\u043b\u0435\u0444\u043e\u043d *"}</label>
        <input id={`lead-phone-${type}`} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (999) 123-45-67" className="ved-input" autoComplete="tel" inputMode="tel" required disabled={status === "submitting"} />
      </div>
      <div>
        <label htmlFor={`lead-message-${type}`} className="mb-1.5 block text-[10px] uppercase tracking-widest text-white/50">{"\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439"}</label>
        <textarea id={`lead-message-${type}`} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={type === "car_request" ? "\u0423\u0434\u043e\u0431\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f \u0434\u043b\u044f \u0437\u0432\u043e\u043d\u043a\u0430..." : "\u0427\u0435\u043c \u043c\u043e\u0436\u0435\u043c \u043f\u043e\u043c\u043e\u0447\u044c?"} className="ved-input min-h-[88px] resize-y" rows={compact ? 2 : 3} disabled={status === "submitting"} />
      </div>
      {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
      <button type="submit" disabled={status === "submitting"} className="w-full border border-white bg-white px-6 py-3.5 text-xs uppercase tracking-[0.2em] text-ved-navy transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60">
        {status === "submitting" ? "\u041e\u0442\u043f\u0440\u0430\u0432\u043a\u0430..." : submitLabel || (type === "car_request" ? "\u041e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0437\u0430\u044f\u0432\u043a\u0443" : "\u041f\u0435\u0440\u0435\u0437\u0432\u043e\u043d\u0438\u0442\u0435 \u043c\u043d\u0435")}
      </button>
      <p className="text-[10px] leading-relaxed text-white/35">{"\u041d\u0430\u0436\u0438\u043c\u0430\u044f \u043a\u043d\u043e\u043f\u043a\u0443, \u0432\u044b \u0441\u043e\u0433\u043b\u0430\u0448\u0430\u0435\u0442\u0435\u0441\u044c \u043d\u0430 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0443 \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u044c\u043d\u044b\u0445 \u0434\u0430\u043d\u043d\u044b\u0445"}</p>
    </form>
  );
}