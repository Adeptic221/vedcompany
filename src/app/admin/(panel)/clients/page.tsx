"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CLIENT_DOC_SLOTS } from "@/lib/cabinet/documents";

type ClientRow = {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
  ordersCount: number;
  docsCount: number;
  docsDone: number;
  docsTotal: number;
  chatUpdatedAt: string | null;
};

type DocRow = {
  id: string;
  name: string;
  kind?: string;
  uploadedAt: string;
  size?: number;
};

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/admin/clients")
      .then((r) => r.json())
      .then((d) => setClients(d.clients || []))
      .catch(() => setError("Не удалось загрузить клиентов"));
  }, []);

  useEffect(() => {
    if (!selected) {
      setDocs([]);
      return;
    }
    void fetch(`/api/admin/docs?userId=${encodeURIComponent(selected)}`)
      .then((r) => r.json())
      .then((d) => setDocs(d.documents || []))
      .catch(() => setDocs([]));
  }, [selected]);

  const selectedClient = clients.find((c) => c.id === selected) || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light uppercase tracking-[0.15em]">Клиенты</h1>
        <p className="mt-2 text-sm text-white/50">
          Зарегистрированные аккаунты, документы и прогресс пакета
        </p>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          {clients.length === 0 ? (
            <p className="text-sm text-white/40">Пока нет клиентов</p>
          ) : (
            clients.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c.id)}
                className={`w-full border px-4 py-3 text-left transition ${
                  selected === c.id
                    ? "border-white/40 bg-white/10"
                    : "border-white/10 hover:border-white/25"
                }`}
              >
                <p className="text-sm text-white">{c.name || "Без имени"}</p>
                <p className="text-xs text-white/45">{c.email}</p>
                <p className="mt-1 text-[11px] text-white/35">
                  Документы {c.docsDone}/{c.docsTotal} · заказы {c.ordersCount}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="border border-white/10 p-4">
          {!selectedClient ? (
            <p className="text-sm text-white/40">Выберите клиента</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-lg font-light">{selectedClient.name}</p>
                <p className="text-sm text-white/50">{selectedClient.email}</p>
                <p className="text-sm text-white/40">{selectedClient.phone || "—"}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Link
                  href={`/admin/orders?userId=${selectedClient.id}`}
                  className="border border-white/20 px-3 py-1.5 text-white/70 hover:text-white"
                >
                  Заказы
                </Link>
                <Link
                  href={`/admin/chats?userId=${selectedClient.id}`}
                  className="border border-white/20 px-3 py-1.5 text-white/70 hover:text-white"
                >
                  Чат
                </Link>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-widest text-white/45">
                  Документы
                </p>
                <ul className="space-y-2">
                  {CLIENT_DOC_SLOTS.filter((s) => s.kind !== "other").map((slot) => {
                    const doc = docs.find((d) => d.kind === slot.kind);
                    return (
                      <li
                        key={slot.kind}
                        className="flex items-center justify-between gap-3 border border-white/10 px-3 py-2 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-white/85">{slot.title}</p>
                          <p className="text-[11px] text-white/35">
                            {doc ? doc.name : "не загружено"}
                          </p>
                        </div>
                        {doc ? (
                          <a
                            href={`/api/cabinet/docs/${doc.id}/file`}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 text-xs uppercase tracking-wider text-white/60 hover:text-white"
                          >
                            Открыть
                          </a>
                        ) : (
                          <span className="text-[11px] text-amber-200/70">нужно</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}