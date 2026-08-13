"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ChatMessage } from "@/types/cart";

type ThreadListItem = {
  userId: string;
  userEmail?: string;
  userName?: string;
  updatedAt: string;
  messages: ChatMessage[];
};

function AdminChatsInner() {
  const search = useSearchParams();
  const initialUser = search.get("userId");
  const [threads, setThreads] = useState<ThreadListItem[]>([]);
  const [selected, setSelected] = useState<string | null>(initialUser);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  async function loadThreads() {
    const res = await fetch("/api/admin/chat", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setThreads(data.threads || []);
  }

  async function loadThread(userId: string) {
    const res = await fetch(
      `/api/admin/chat?userId=${encodeURIComponent(userId)}`,
      { cache: "no-store" }
    );
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.thread) setMessages(data.thread.messages || []);
  }

  useEffect(() => {
    void loadThreads();
  }, []);

  useEffect(() => {
    if (selected) void loadThread(selected);
  }, [selected]);

  async function send() {
    if (!selected || !text.trim()) return;
    setError("");
    const thread = threads.find((t) => t.userId === selected);
    const res = await fetch("/api/admin/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selected,
        text,
        userEmail: thread?.userEmail,
        userName: thread?.userName,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Не удалось отправить");
      return;
    }
    setText("");
    setMessages(data.thread?.messages || []);
    void loadThreads();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light uppercase tracking-[0.15em]">Чат</h1>
        <p className="mt-2 text-sm text-white/50">Переписка менеджера с клиентами</p>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {threads.length === 0 ? (
            <p className="text-sm text-white/40">Пока нет диалогов</p>
          ) : (
            threads.map((t) => (
              <button
                key={t.userId}
                type="button"
                onClick={() => setSelected(t.userId)}
                className={`w-full border px-3 py-2 text-left text-sm ${
                  selected === t.userId
                    ? "border-white/40 bg-white/10"
                    : "border-white/10"
                }`}
              >
                <p>{t.userName || t.userEmail || t.userId}</p>
                <p className="text-[11px] text-white/35">
                  {new Date(t.updatedAt).toLocaleString("ru-RU")}
                </p>
              </button>
            ))
          )}
        </div>
        <div className="border border-white/10 p-4">
          {!selected ? (
            <p className="text-sm text-white/40">Выберите диалог</p>
          ) : (
            <>
              <div className="mb-4 max-h-[50vh] space-y-3 overflow-y-auto">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`text-sm ${
                      m.from === "manager" ? "text-white/90" : "text-white/60"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wider text-white/30">
                      {m.from === "manager" ? "Менеджер" : "Клиент"}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{m.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="ved-select flex-1"
                  placeholder="Ответ клиенту"
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  className="border border-white px-4 py-2 text-xs uppercase tracking-wider"
                >
                  Отправить
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminChatsPage() {
  return (
    <Suspense fallback={<p className="text-white/50">Загрузка...</p>}>
      <AdminChatsInner />
    </Suspense>
  );
}