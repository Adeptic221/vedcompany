"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatChatTime } from "@/lib/cabinet/format";

export function ChatTab() {
  const { messages, sendMessage } = useCart();
  const [chatInput, setChatInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-[min(520px,70vh)] flex-col">
      <p className="mb-4 text-sm text-white/40">
        Черновик переписки в браузере. Для срочной связи лучше кнопка «Связаться» в шапке —
        заявка сразу уйдёт менеджеру.
      </p>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto border border-white/10 bg-white/[0.02] p-4"
      >
        {messages.map((msg, index) => {
          const isClient = msg.from === "client";
          const prev = messages[index - 1];
          const showDate =
            !prev ||
            new Date(msg.createdAt).toDateString() !==
              new Date(prev.createdAt).toDateString();

          return (
            <div key={msg.id}>
              {showDate && (
                <p className="mb-3 text-center text-[10px] uppercase tracking-wider text-white/30">
                  {new Date(msg.createdAt).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              )}
              <div className={`flex ${isClient ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${isClient ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <span className="px-1 text-[10px] uppercase tracking-wider text-white/35">
                    {isClient ? "Вы" : "Менеджер ВЭД"}
                  </span>
                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed ${
                      isClient
                        ? "rounded-tl-lg rounded-bl-lg rounded-br-lg bg-white text-ved-navy"
                        : "rounded-tr-lg rounded-bl-lg rounded-br-lg border border-white/10 bg-white/10 text-white/90"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="px-1 text-[10px] text-white/30">
                    {formatChatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!chatInput.trim()) return;
          sendMessage(chatInput);
          setChatInput("");
        }}
      >
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Напишите сообщение..."
          className="flex-1 border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
        />
        <button
          type="submit"
          disabled={!chatInput.trim()}
          className="border border-white px-4 py-3 text-xs uppercase tracking-wider transition hover:bg-white hover:text-ved-navy disabled:cursor-not-allowed disabled:opacity-40"
        >
          Отправить
        </button>
      </form>
    </div>
  );
}
