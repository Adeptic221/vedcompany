"use client";
import { useContactModal } from "@/context/ContactModalContext";
import { ContactButtons } from "@/components/ContactButtons";

export function CatalogContactBanner() {
  const { openContactModal } = useContactModal();
  return (
    <section className="mt-12 ved-glass border border-white/10 p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm uppercase tracking-[0.2em] text-white/80">{"\u041d\u0443\u0436\u043d\u0430 \u043f\u043e\u043c\u043e\u0449\u044c \u0441 \u0432\u044b\u0431\u043e\u0440\u043e\u043c?"}</h2>
          <p className="mt-2 max-w-md text-sm text-white/50">{"\u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440 \u043f\u043e\u0434\u0431\u0435\u0440\u0451\u0442 \u0430\u0432\u0442\u043e \u043f\u043e\u0434 \u0432\u0430\u0448 \u0431\u044e\u0434\u0436\u0435\u0442 \u0438 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0435\u0442 \u043f\u043e\u043b\u043d\u0443\u044e \u0441\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c \u0441 \u0442\u0430\u043c\u043e\u0436\u043d\u0435\u0439"}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
          <button type="button" onClick={openContactModal} className="border border-white bg-white px-6 py-3 text-xs uppercase tracking-widest text-ved-navy transition hover:bg-white/90">{"\u0421\u0432\u044f\u0437\u0430\u0442\u044c\u0441\u044f \u0441 \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u043e\u043c"}</button>
          <ContactButtons size="sm" className="sm:w-auto" />
        </div>
      </div>
    </section>
  );
}