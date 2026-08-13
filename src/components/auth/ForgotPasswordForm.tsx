"use client";

import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setDevResetUrl("");
    try {
      const res = await fetch("/api/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Не удалось отправить письмо");
        return;
      }
      setMessage(data.message || "Проверьте почту — мы отправили ссылку.");
      if (data.devResetUrl) setDevResetUrl(String(data.devResetUrl));
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ved-glass mx-auto flex w-full max-w-md flex-col gap-4 border border-white/10 p-6 md:p-8">
      <h1 className="text-lg font-light uppercase tracking-[0.2em] text-white">
        Восстановление пароля
      </h1>
      <p className="text-sm text-white/50">
        Укажите email аккаунта — пришлём ссылку для нового пароля. Восстановление
        по SMS подключим позже.
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="ved-select"
          autoComplete="email"
          autoFocus
          required
        />
        {error && <p className="text-sm text-red-300">{error}</p>}
        {message && <p className="text-sm text-white/70">{message}</p>}
        {devResetUrl && (
          <p className="border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100 break-all">
            Dev-ссылка:{" "}
            <a href={devResetUrl} className="underline underline-offset-2">
              {devResetUrl}
            </a>
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="border border-white px-6 py-3 text-xs uppercase tracking-[0.25em] text-white transition hover:bg-white hover:text-ved-navy disabled:opacity-50"
        >
          {loading ? "..." : "Отправить ссылку"}
        </button>
      </form>

      <p className="text-center text-xs text-white/45">
        Вспомнили пароль?{" "}
        <Link
          href="/login"
          className="text-white underline-offset-4 hover:underline"
        >
          Войти
        </Link>
      </p>
    </div>
  );
}