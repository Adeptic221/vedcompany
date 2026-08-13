"use client";

import { useMemo, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatDateTime } from "@/lib/cabinet/format";
import {
  CLIENT_DOC_SLOTS,
  type CabinetDocKind,
  type DocSlotDef,
} from "@/lib/cabinet/documents";
import type { UploadedDoc } from "@/types/cart";

function formatSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SlotCard({
  slot,
  doc,
  busy,
  onUpload,
  onOpen,
  onRemove,
}: {
  slot: DocSlotDef;
  doc?: UploadedDoc;
  busy: boolean;
  onUpload: (file: File) => void;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const done = Boolean(doc);

  return (
    <li className="border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-white/90">{slot.title}</p>
            <span
              className={`text-[10px] uppercase tracking-wider ${
                done ? "text-emerald-300/90" : "text-amber-200/80"
              }`}
            >
              {done
                ? "\u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043d\u043e"
                : "\u041d\u0443\u0436\u043d\u043e"}
            </span>
          </div>
          <p className="mt-1 text-xs text-white/40">{slot.hint}</p>
          {doc && (
            <p className="mt-2 truncate text-xs text-white/55">
              {doc.name}
              {doc.size ? ` \u00b7 ${formatSize(doc.size)}` : ""}
              {` \u00b7 ${formatDateTime(doc.uploadedAt)}`}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {slot.templateHref && (
            <a
              href={slot.templateHref}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 px-3 py-2 text-xs uppercase tracking-wider text-white/70 transition hover:border-white/40 hover:text-white"
            >
              {"\u0421\u043a\u0430\u0447\u0430\u0442\u044c"}
            </a>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="border border-white/30 px-3 py-2 text-xs uppercase tracking-wider transition hover:bg-white hover:text-ved-navy disabled:opacity-50"
          >
            {done
              ? "\u0417\u0430\u043c\u0435\u043d\u0438\u0442\u044c"
              : "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c"}
          </button>
          {doc?.hasFile && (
            <button
              type="button"
              onClick={onOpen}
              className="border border-white/20 px-3 py-2 text-xs uppercase tracking-wider text-white/70 transition hover:border-white/40 hover:text-white"
            >
              {"\u041e\u0442\u043a\u0440\u044b\u0442\u044c"}
            </button>
          )}
          {doc && (
            <button
              type="button"
              onClick={onRemove}
              className="border border-white/15 px-3 py-2 text-xs uppercase tracking-wider text-white/45 transition hover:border-red-400/40 hover:text-red-300"
            >
              {"\u0423\u0434\u0430\u043b\u0438\u0442\u044c"}
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={slot.accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              if (inputRef.current) inputRef.current.value = "";
            }}
          />
        </div>
      </div>
    </li>
  );
}

export function DocumentsTab() {
  const { documents, addDocument, removeDocument, openDocument } = useCart();
  const [busyKind, setBusyKind] = useState<CabinetDocKind | null>(null);
  const [error, setError] = useState("");

  const byKind = useMemo(() => {
    const map = new Map<CabinetDocKind, UploadedDoc>();
    for (const doc of documents) {
      const kind = doc.kind ?? "other";
      if (kind === "other") continue;
      map.set(kind, doc);
    }
    return map;
  }, [documents]);

  const otherDocs = useMemo(
    () => documents.filter((d) => (d.kind ?? "other") === "other"),
    [documents]
  );

  async function handleUpload(kind: CabinetDocKind, file: File) {
    setError("");
    if (file.size > 12 * 1024 * 1024) {
      setError(
        "\u0424\u0430\u0439\u043b \u0441\u043b\u0438\u0448\u043a\u043e\u043c \u0431\u043e\u043b\u044c\u0448\u043e\u0439 (\u043c\u0430\u043a\u0441. 12 \u041c\u0411)."
      );
      return;
    }
    setBusyKind(kind);
    try {
      await addDocument(file, kind);
    } catch {
      setError(
        "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0444\u0430\u0439\u043b. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437."
      );
    } finally {
      setBusyKind(null);
    }
  }

  const doneCount = CLIENT_DOC_SLOTS.filter(
    (s) => s.kind === "other" || byKind.has(s.kind)
  ).length;

  return (
    <div>
      <p className="mb-2 text-sm leading-relaxed text-white/50">
        {
          "\u0417\u0434\u0435\u0441\u044c \u0432\u044b \u0441\u043a\u0430\u0447\u0438\u0432\u0430\u0435\u0442\u0435 \u0434\u043e\u0433\u043e\u0432\u043e\u0440\u044b VED, \u043f\u043e\u0434\u043f\u0438\u0441\u044b\u0432\u0430\u0435\u0442\u0435 \u0438 \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u0442\u0435 \u043e\u0431\u0440\u0430\u0442\u043d\u043e, \u0430 \u0442\u0430\u043a\u0436\u0435 \u043f\u0440\u0438\u043a\u0440\u0435\u043f\u043b\u044f\u0435\u0442\u0435 \u0441\u043a\u0430\u043d\u044b \u043f\u0430\u0441\u043f\u043e\u0440\u0442\u0430 \u0438 \u043f\u0440\u043e\u043f\u0438\u0441\u043a\u0438."
        }
      </p>
      <p className="mb-6 text-xs text-white/35">
        {
          "\u041f\u043e\u043a\u0430 \u0444\u0430\u0439\u043b\u044b \u0445\u0440\u0430\u043d\u044f\u0442\u0441\u044f \u0432 \u0432\u0430\u0448\u0435\u043c \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435. \u0421\u0435\u0440\u0432\u0435\u0440\u043d\u043e\u0435 \u0445\u0440\u0430\u043d\u0438\u043b\u0438\u0449\u0435 \u0434\u043b\u044f \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u0430 \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u043c \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u043c \u0448\u0430\u0433\u043e\u043c."
        }
      </p>
      <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/45">
        {`\u0413\u043e\u0442\u043e\u0432\u043e: ${Math.min(doneCount, CLIENT_DOC_SLOTS.length - 1)} / ${CLIENT_DOC_SLOTS.length - 1}`}
        {otherDocs.length > 0 ? ` + ${otherDocs.length}` : ""}
      </p>

      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}

      <ul className="space-y-3">
        {CLIENT_DOC_SLOTS.filter((s) => s.kind !== "other").map((slot) => (
          <SlotCard
            key={slot.kind}
            slot={slot}
            doc={byKind.get(slot.kind)}
            busy={busyKind === slot.kind}
            onUpload={(file) => void handleUpload(slot.kind, file)}
            onOpen={() => {
              const doc = byKind.get(slot.kind);
              if (doc) void openDocument(doc.id);
            }}
            onRemove={() => {
              const doc = byKind.get(slot.kind);
              if (doc) void removeDocument(doc.id);
            }}
          />
        ))}
      </ul>

      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/45">
          {"\u041f\u0440\u043e\u0447\u0438\u0435 \u0444\u0430\u0439\u043b\u044b"}
        </p>
        <SlotCard
          slot={CLIENT_DOC_SLOTS.find((s) => s.kind === "other")!}
          busy={busyKind === "other"}
          onUpload={(file) => void handleUpload("other", file)}
          onOpen={() => undefined}
          onRemove={() => undefined}
        />
        {otherDocs.length > 0 && (
          <ul className="mt-3 space-y-2">
            {otherDocs.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center gap-3 border border-white/10 px-4 py-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate">{doc.name}</p>
                  <p className="text-xs text-white/35">
                    {formatDateTime(doc.uploadedAt)}
                    {doc.size ? ` \u00b7 ${formatSize(doc.size)}` : ""}
                  </p>
                </div>
                {doc.hasFile && (
                  <button
                    type="button"
                    onClick={() => void openDocument(doc.id)}
                    className="shrink-0 border border-white/20 px-3 py-1.5 text-xs uppercase tracking-wider text-white/60"
                  >
                    {"\u041e\u0442\u043a\u0440\u044b\u0442\u044c"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void removeDocument(doc.id)}
                  className="shrink-0 border border-white/15 px-3 py-1.5 text-xs uppercase tracking-wider text-white/50 transition hover:border-red-400/40 hover:text-red-300"
                >
                  {"\u0423\u0434\u0430\u043b\u0438\u0442\u044c"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
