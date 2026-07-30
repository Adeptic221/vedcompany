"use client";

import { useRef } from "react";
import { useCart } from "@/context/CartContext";
import { formatDateTime } from "@/lib/cabinet/format";

export function DocumentsTab() {
  const { documents, addDocument, removeDocument } = useCart();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <p className="mb-6 text-sm leading-relaxed text-white/50">
        Загрузите паспорт, водительское удостоверение и другие документы для
        ввоза авто в РФ. Файлы сохраняются локально в браузере до подключения
        серверной загрузки.
      </p>

      <label className="inline-flex cursor-pointer items-center gap-2 border border-white/30 px-6 py-3 text-xs uppercase tracking-widest transition hover:bg-white hover:text-ved-navy">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        Выбрать файл
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) addDocument(file.name);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
      </label>

      {documents.length === 0 ? (
        <div className="mt-10 rounded border border-dashed border-white/15 px-6 py-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <svg className="h-6 w-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-white/50">Документы ещё не загружены</p>
          <p className="mt-2 text-sm text-white/30">
            Поддерживаются PDF, JPG, PNG и другие форматы
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center gap-3 border border-white/10 px-4 py-3 text-sm"
            >
              <svg className="h-5 w-5 shrink-0 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="truncate">{doc.name}</p>
                <p className="text-xs text-white/35">{formatDateTime(doc.uploadedAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeDocument(doc.id)}
                className="shrink-0 border border-white/15 px-3 py-1.5 text-xs uppercase tracking-wider text-white/50 transition hover:border-red-400/40 hover:text-red-300"
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
