"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { LeadForm } from "@/components/LeadForm";
import { ContactButtons } from "@/components/ContactButtons";

interface ContactModalContextValue {
  openContactModal: () => void;
  closeContactModal: () => void;
  isOpen: boolean;
}

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

export function useContactModal() {
  const ctx = useContext(ContactModalContext);
  if (!ctx) {
    throw new Error("useContactModal must be used within ContactModalProvider");
  }
  return ctx;
}

export function ContactModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openContactModal = useCallback(() => setIsOpen(true), []);
  const closeContactModal = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeContactModal();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeContactModal]);

  return (
    <ContactModalContext.Provider value={{ openContactModal, closeContactModal, isOpen }}>
      {children}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeContactModal}
            aria-label="Close"
          />
          <div className="relative z-10 max-h-[92dvh] w-full max-w-md overflow-y-auto border border-white/15 bg-ved-navy p-6 shadow-2xl sm:rounded-none">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 id="contact-modal-title" className="text-lg font-light tracking-wide">
                  {"\u0421\u0432\u044f\u0437\u0430\u0442\u044c\u0441\u044f \u0441 \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u043e\u043c"}
                </h2>
                <p className="mt-1 text-xs text-white/50">
                  {"\u041e\u0441\u0442\u0430\u0432\u044c\u0442\u0435 \u0437\u0430\u044f\u0432\u043a\u0443 \u2014 \u043f\u0435\u0440\u0435\u0437\u0432\u043e\u043d\u0438\u043c \u0432 \u0440\u0430\u0431\u043e\u0447\u0435\u0435 \u0432\u0440\u0435\u043c\u044f"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeContactModal}
                className="shrink-0 border border-white/20 p-2 text-white/60 transition hover:border-white/40 hover:text-white"
                aria-label="Close"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <LeadForm type="callback" source="modal" submitLabel={"\u041f\u0435\u0440\u0435\u0437\u0432\u043e\u043d\u0438\u0442\u0435 \u043c\u043d\u0435"} compact />

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] uppercase tracking-widest text-white/30">{"\u0438\u043b\u0438"}</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <ContactButtons layout="row" size="sm" />
          </div>
        </div>
      )}
    </ContactModalContext.Provider>
  );
}