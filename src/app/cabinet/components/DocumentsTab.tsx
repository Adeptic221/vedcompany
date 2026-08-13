"use client";

import { useMemo, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatDateTime } from "@/lib/cabinet/format";
import {
  CLIENT_DOC_SLOTS,
  REQUIRED_DOC_SLOTS,
  countUploadedRequiredDocs,
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

function DocWhyTip({ title, why }: { title: string; why: string }) {
  return (
    <span
      className="group/tip relative inline-flex max-w-full items-center gap-1.5 outline-none"
      tabIndex={0}
    >
      <span className="border-b border-dotted border-white/35 text-sm text-white/90 transition group-hover/tip:border-white/70 group-hover/tip:text-white group-focus-within/tip:border-white/70 group-focus-within/tip:text-white">
        {title}
      </span>
      <span
        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/25 text-[10px] leading-none text-white/55 transition group-hover/tip:border-white/50 group-hover/tip:text-white/85 group-focus-within/tip:border-white/50 group-focus-within/tip:text-white/85"
        aria-hidden
      >
        i
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-30 mt-2 w-[min(20rem,calc(100vw-3rem))] origin-top translate-y-1 scale-[0.98] opacity-0 transition duration-200 group-hover/tip:translate-y-0 group-hover/tip:scale-100 group-hover/tip:opacity-100 group-focus-within/tip:translate-y-0 group-focus-within/tip:scale-100 group-focus-within/tip:opacity-100"
      >
        <span className="block border border-white/15 bg-ved-navy/95 px-3.5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <span className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-white/40">
            Зачем это нужно
          </span>
          <span className="block text-xs leading-relaxed text-white/75">{why}</span>
        </span>
      </span>
    </span>
  );
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
    <li className="border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <DocWhyTip title={slot.title} why={slot.why} />
            <span
              className={`text-[10px] uppercase tracking-wider ${
                done
                  ? "text-emerald-300/90"
                  : slot.optional
                    ? "text-white/35"
                    : "text-amber-200/80"
              }`}
            >
              {done ? "Загружено" : slot.optional ? "Опционально" : "Нужно"}
            </span>
          </div>
          <p className="mt-1 text-xs text-white/40">{slot.hint}</p>
          {doc && (
            <p className="mt-2 truncate text-xs text-white/55">
              {doc.name}
              {doc.size ? ` · ${formatSize(doc.size)}` : ""}
              {` · ${formatDateTime(doc.uploadedAt)}`}
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
              Скачать
            </a>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="border border-white/30 px-3 py-2 text-xs uppercase tracking-wider transition hover:bg-white hover:text-ved-navy disabled:opacity-50"
          >
            {done ? "Заменить" : "Загрузить"}
          </button>
          {doc?.hasFile && (
            <button
              type="button"
              onClick={onOpen}
              className="border border-white/20 px-3 py-2 text-xs uppercase tracking-wider text-white/70 transition hover:border-white/40 hover:text-white"
            >
              Открыть
            </button>
          )}
          {doc && (
            <button
              type="button"
              onClick={onRemove}
              className="border border-white/15 px-3 py-2 text-xs uppercase tracking-wider text-white/45 transition hover:border-red-400/40 hover:text-red-300"
            >
              Удалить
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

  const progress = useMemo(
    () => countUploadedRequiredDocs(byKind.keys()),
    [byKind]
  );

  async function handleUpload(kind: CabinetDocKind, file: File) {
    setError("");
    if (file.size > 12 * 1024 * 1024) {
      setError("Файл слишком большой (макс. 12 МБ).");
      return;
    }
    setBusyKind(kind);
    try {
      await addDocument(file, kind);
    } catch {
      setError("Не удалось сохранить файл. Попробуйте ещё раз.");
    } finally {
      setBusyKind(null);
    }
  }

  const requiredSlots = CLIENT_DOC_SLOTS.filter((s) => !s.optional && s.kind !== "other");
  const optionalSlots = CLIENT_DOC_SLOTS.filter(
    (s) => s.optional && s.kind !== "other"
  );
  const otherSlot = CLIENT_DOC_SLOTS.find((s) => s.kind === "other")!;

  return (
    <div>
      <p className="mb-2 text-sm leading-relaxed text-white/50">
        Загрузите пакет документов для сделки и таможни. Наведите на название
        документа — кратко объясним, зачем он нужен.
      </p>
      <p className="mb-6 text-xs text-white/35">
        Пока файлы хранятся в вашем браузере. Серверное хранилище для менеджера
        подключим следующим шагом.
      </p>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-white/45">
          <span>
            Обязательные: {progress.done} / {progress.total}
          </span>
          <span className="normal-case tracking-normal text-white/30">
            этап «Документы» в отслеживании
          </span>
        </div>
        <div className="h-1 overflow-hidden bg-white/10">
          <div
            className="h-full bg-white/70 transition-all duration-500"
            style={{
              width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}

      <ul className="space-y-3">
        {requiredSlots.map((slot) => (
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

      {optionalSlots.length > 0 && (
        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/45">
            По запросу
          </p>
          <ul className="space-y-3">
            {optionalSlots.map((slot) => (
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
        </div>
      )}

      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/45">
          Прочие файлы
        </p>
        <SlotCard
          slot={otherSlot}
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
                    {doc.size ? ` · ${formatSize(doc.size)}` : ""}
                  </p>
                </div>
                {doc.hasFile && (
                  <button
                    type="button"
                    onClick={() => void openDocument(doc.id)}
                    className="shrink-0 border border-white/20 px-3 py-1.5 text-xs uppercase tracking-wider text-white/60"
                  >
                    Открыть
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void removeDocument(doc.id)}
                  className="shrink-0 border border-white/15 px-3 py-1.5 text-xs uppercase tracking-wider text-white/50 transition hover:border-red-400/40 hover:text-red-300"
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-6 text-[11px] text-white/25">
        Обязательных пунктов в чеклисте: {REQUIRED_DOC_SLOTS.length}. Опциональные
        не блокируют этап «Документы».
      </p>
    </div>
  );
}