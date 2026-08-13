"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

function PasswordField({
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="ved-select w-full pr-20"
        autoComplete={autoComplete}
        required
        minLength={7}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 px-3 text-[11px] uppercase tracking-wider text-white/45 transition hover:text-white"
        aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
      >
        {visible ? "Скрыть" : "Показать"}
      </button>
    </div>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const search = useSearchParams();
  const { refresh } = useAuth();
  const email = search.get("email") || "";
  const token = search.get("token") || "";
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 7) {
      setError("Пароль должен быть не короче 7 символов");
      return;
    }
    if (password !== password2) {
      setError("Пароли не совпадают");
      return;
    }
    if (!email || !token) {
      setError("Ссылка неполная. Запросите восстановление ещё раз.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Не удалось обновить пароль");
        return;
      }
      await refresh();
      router.push("/cabinet");
      router.refresh();
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ved-glass mx-auto flex w-full max-w-md flex-col gap-4 border border-white/10 p-6 md:p-8">
      <h1 className="text-lg font-light uppercase tracking-[0.2em] text-white">
        Новый пароль
      </h1>
      <p className="text-sm text-white/50">
        Придумайте пароль не короче 7 символов
        {email ? ` для ${email}` : ""}.
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <PasswordField
          value={password}
          onChange={setPassword}
          placeholder="Новый пароль"
          autoComplete="new-password"
        />
        <PasswordField
          value={password2}
          onChange={setPassword2}
          placeholder="Повторите пароль"
          autoComplete="new-password"
        />
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="border border-white px-6 py-3 text-xs uppercase tracking-[0.25em] text-white transition hover:bg-white hover:text-ved-navy disabled:opacity-50"
        >
          {loading ? "..." : "Сохранить и войти"}
        </button>
      </form>

      <p className="text-center text-xs text-white/45">
        <Link
          href="/forgot-password"
          className="text-white underline-offset-4 hover:underline"
        >
          Запросить новую ссылку
        </Link>
      </p>
    </div>
  );
}