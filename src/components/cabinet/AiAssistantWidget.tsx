"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LoadingSphere } from "@/components/LoadingSphere";
import { useCart } from "@/context/CartContext";
import type { Car } from "@/types/car";

type ChatRole = "user" | "assistant";

type UiMessage = {
  id: string;
  role: ChatRole;
  content: string;
  imagePreview?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

const STORAGE_KEY = "ved-cabinet-ai-chat-v2";

function loadHistory(): UiMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UiMessage[];
    return Array.isArray(parsed) ? parsed.slice(-40) : [];
  } catch {
    return [];
  }
}

function speakText(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ru-RU";
  const voices = window.speechSynthesis.getVoices();
  const ru = voices.find((v) => v.lang.toLowerCase().startsWith("ru"));
  if (ru) utter.voice = ru;
  window.speechSynthesis.speak(utter);
}

export function AiAssistantWidget({
  cars = [],
  variant = "floating",
}: {
  cars?: Car[];
  variant?: "floating" | "embedded";
}) {
  const embedded = variant === "embedded";
  const { items, favorites } = useCart();
  const [open, setOpen] = useState(variant === "embedded");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceOut, setVoiceOut] = useState(true);
  const [listening, setListening] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setMessages(loadHistory());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, busy]);

  const contextCars = useMemo(() => {
    const ids = [...new Set([...items.map((i) => i.carId), ...favorites.map((f) => f.carId)])];
    return ids
      .map((id) => cars.find((c) => c.id === id))
      .filter(Boolean)
      .slice(0, 8)
      .map((c) => ({
        brand: c!.brand,
        model: c!.model,
        year: c!.year,
        type: c!.type,
      }));
  }, [cars, items, favorites]);

  const send = useCallback(async () => {
    const text = input.trim();
    if ((!text && !pendingImage) || busy) return;

    const userText = text || "Посмотри фото и дай рекомендации по автомобилю.";
    const userMsg: UiMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: userText,
      imagePreview: pendingImage || undefined,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setError(null);
    setBusy(true);

    const imageBase64 = pendingImage;
    setPendingImage(null);

    try {
      const res = await fetch("/api/cabinet/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({ role: m.role, content: m.content })),
          imageBase64: imageBase64 || undefined,
          contextCars,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        throw new Error(data.error || "Не удалось получить ответ");
      }
      const assistantMsg: UiMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.reply,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (voiceOut) speakText(data.reply);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка запроса");
    } finally {
      setBusy(false);
    }
  }, [input, pendingImage, busy, messages, contextCars, voiceOut]);

  const toggleListen = useCallback(() => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) {
      setError("Голосовой ввод не поддерживается в этом браузере. Используйте Chrome.");
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new Ctor();
    recognition.lang = "ru-RU";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    setError(null);
    recognition.start();
  }, [listening]);

  const onPickImage = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Нужен файл изображения");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Фото больше 4 МБ");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (result) {
        setPendingImage(result);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearChat = () => {
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("ved-cabinet-ai-chat");
      } catch {
        /* ignore */
      }
    }
    setMessages([]);
    setInput("");
    setPendingImage(null);
    setError(null);
  };

  const panel = (
    <div
      className={
        embedded
          ? "flex h-[min(70vh,640px)] w-full flex-col overflow-hidden border border-white/15 bg-[#0a1628]/60"
          : "fixed bottom-32 right-12 z-[90] flex h-[min(70vh,560px)] w-[min(92vw,380px)] flex-col overflow-hidden border border-white/15 bg-[#0a1628]/98 shadow-2xl backdrop-blur-md"
      }
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-white/90">ИИ по автомобилям</p>
          <p className="mt-0.5 text-[10px] text-white/40">Техника, аналоги, ТО, голос</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              className="text-[10px] uppercase tracking-wider text-white/40 hover:text-white/80"
            >
              Очистить
            </button>
          )}
          <label className="flex cursor-pointer items-center gap-2 text-[10px] uppercase tracking-wider text-white/50">
            <input
              type="checkbox"
              checked={voiceOut}
              onChange={(e) => setVoiceOut(e.target.checked)}
              className="accent-[#d4af37]"
            />
            Голос
          </label>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {messages.length === 0 && (
          <p className="text-sm text-white/40">
            Спросите про масло, аналоги, типичные поломки по пробегу. Фото DeepSeek пока не читает — опишите текстом.
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[90%] rounded px-3 py-2 text-sm ${
              msg.role === "user"
                ? "ml-auto bg-white text-[#0a1628]"
                : "mr-auto border border-white/15 bg-white/5 text-white/90"
            }`}
          >
            {msg.imagePreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={msg.imagePreview}
                alt="Вложение"
                className="mb-2 max-h-32 w-full rounded object-cover"
              />
            )}
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        {busy && <p className="text-xs text-white/40">ИИ думает…</p>}
      </div>

      {pendingImage && (
        <div className="flex items-center gap-2 border-t border-white/10 px-3 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pendingImage} alt="К отправке" className="h-12 w-12 rounded object-cover" />
          <button
            type="button"
            className="text-[10px] uppercase tracking-wider text-white/50 hover:text-white"
            onClick={() => setPendingImage(null)}
          >
            Убрать фото
          </button>
        </div>
      )}

      {error && <p className="px-3 pb-1 text-xs text-red-300">{error}</p>}

      <div className="border-t border-white/10 p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            placeholder="Вопрос об автомобиле…"
            className="ved-input min-h-[64px] flex-1 resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleListen}
            className={`border px-3 py-2 text-[10px] uppercase tracking-wider ${
              listening
                ? "border-[#d4af37] text-[#d4af37]"
                : "border-white/30 text-white/70 hover:border-white/60"
            }`}
          >
            {listening ? "Стоп" : "Микрофон"}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="border border-white/30 px-3 py-2 text-[10px] uppercase tracking-wider text-white/70 hover:border-white/60"
          >
            Фото
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPickImage(e.target.files?.[0] || null)}
          />
          <button
            type="button"
            disabled={busy || (!input.trim() && !pendingImage)}
            onClick={() => void send()}
            className="ml-auto border border-white bg-white px-4 py-2 text-[10px] uppercase tracking-wider text-[#0a1628] disabled:opacity-40"
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return panel;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-14 right-12 z-[90] flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-[#0a1628]/95 shadow-lg shadow-black/40 transition hover:border-[#d4af37]/60"
        aria-label={open ? "Закрыть ИИ-ассистента" : "Открыть ИИ-ассистента"}
      >
        <LoadingSphere size={40} label="" />
      </button>

      {open ? panel : null}
    </>
  );
}
