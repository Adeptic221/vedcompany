"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Mode = "login" | "register";
type Method = "email" | "sms";

function PasswordField({
  value,
  onChange,
  placeholder,
  autoComplete,
  minLength,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
  minLength?: number;
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
        minLength={minLength}
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

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const search = useSearchParams();
  const { refresh } = useAuth();
  const [method, setMethod] = useState<Method>("email");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [phoneMasked, setPhoneMasked] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";
  const next = search.get("next") || "/cabinet";

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    if (isRegister && password.length < 7) {
      setError("Пароль должен быть не короче 7 символов");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        isRegister ? "/api/auth/register" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isRegister
              ? { name, phone, email, password }
              : { email, password }
          ),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Ошибка запроса");
        return;
      }
      await refresh();
      router.push(next);
      router.refresh();
    } catch {
      setError("Ошибка сети. Проверьте интернет и попробуйте снова.");
    } finally {
      setLoading(false);
    }
  }

  async function sendSmsCode() {
    setLoading(true);
    setError("");
    setInfo("");
    setDevCode("");
    try {
      const res = await fetch("/api/auth/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Не удалось отправить SMS");
        return;
      }
      setCodeSent(true);
      setPhoneMasked(data.phoneMasked || phone);
      if (data.devCode) {
        setDevCode(String(data.devCode));
        setInfo(`Режим разработки: код ${data.devCode}`);
      } else {
        setInfo(`Код отправлен на ${data.phoneMasked || "ваш телефон"}`);
      }
    } catch {
      setError("Ошибка сети при отправке SMS");
    } finally {
      setLoading(false);
    }
  }

  async function onSmsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!codeSent) {
      await sendSmsCode();
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/sms/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          code,
          name: isRegister ? name : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Не удалось войти");
        return;
      }
      await refresh();
      router.push(next);
      router.refresh();
    } catch {
      setError("Ошибка сети при проверке кода");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ved-glass mx-auto flex w-full max-w-md flex-col gap-4 border border-white/10 p-6 md:p-8">
      <h1 className="text-lg font-light uppercase tracking-[0.2em] text-white">
        {isRegister ? "Регистрация" : "Вход"}
      </h1>
      <p className="text-sm text-white/50">
        {isRegister
          ? "Создайте аккаунт по email. SMS — дополнительный способ."
          : "Войдите по email и паролю. SMS — если так удобнее."}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setMethod("email");
            setError("");
            setInfo("");
          }}
          className={`py-2 text-xs uppercase tracking-wider transition ${
            method === "email"
              ? "border border-white bg-white text-ved-navy"
              : "border border-white/20 text-white/70 hover:border-white/50"
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => {
            setMethod("sms");
            setError("");
            setInfo("");
          }}
          className={`py-2 text-xs uppercase tracking-wider transition ${
            method === "sms"
              ? "border border-white bg-white text-ved-navy"
              : "border border-white/20 text-white/70 hover:border-white/50"
          }`}
        >
          SMS
        </button>
      </div>
      <p className="text-[11px] text-white/35">
        Основной способ — email. SMS можно использовать, если так удобнее.
      </p>

      {method === "sms" ? (
        <form onSubmit={onSmsSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Имя (необязательно)"
              className="ved-select"
              autoComplete="name"
            />
          )}
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setCodeSent(false);
              setCode("");
              setDevCode("");
            }}
            placeholder="+7 (___) ___-__-__"
            className="ved-select"
            autoComplete="tel"
            autoFocus
            required
          />

          {codeSent && (
            <>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Код из SMS"
                className="ved-select tracking-[0.3em]"
                autoComplete="one-time-code"
                required
                minLength={6}
                maxLength={6}
              />
              <button
                type="button"
                onClick={sendSmsCode}
                disabled={loading}
                className="text-left text-xs text-white/50 underline-offset-4 hover:text-white hover:underline disabled:opacity-50"
              >
                Отправить код ещё раз {phoneMasked ? `(${phoneMasked})` : ""}
              </button>
            </>
          )}

          {info && <p className="text-sm text-white/60">{info}</p>}
          {devCode && (
            <p className="border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
              Dev-код:{" "}
              <span className="font-medium tracking-widest">{devCode}</span>
            </p>
          )}
          {error && <p className="text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="border border-white px-6 py-3 text-xs uppercase tracking-[0.25em] text-white transition hover:bg-white hover:text-ved-navy disabled:opacity-50"
          >
            {loading
              ? "..."
              : codeSent
                ? "Подтвердить и войти"
                : "Получить код"}
          </button>
        </form>
      ) : (
        <form onSubmit={onEmailSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Имя"
                className="ved-select"
                autoComplete="name"
                required
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Телефон +7..."
                className="ved-select"
                autoComplete="tel"
              />
            </>
          )}

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
          <PasswordField
            value={password}
            onChange={setPassword}
            placeholder={
              isRegister ? "Пароль (минимум 7 символов)" : "Пароль"
            }
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={isRegister ? 7 : undefined}
          />

          {!isRegister && (
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-white/45 underline-offset-4 hover:text-white hover:underline"
              >
                Забыли пароль?
              </Link>
            </div>
          )}

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="border border-white px-6 py-3 text-xs uppercase tracking-[0.25em] text-white transition hover:bg-white hover:text-ved-navy disabled:opacity-50"
          >
            {loading ? "..." : isRegister ? "Создать аккаунт" : "Войти"}
          </button>
        </form>
      )}

      <p className="text-center text-xs text-white/45">
        {isRegister ? (
          <>
            Уже есть аккаунт?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              className="text-white underline-offset-4 hover:underline"
            >
              Войти
            </Link>
          </>
        ) : (
          <>
            Нет аккаунта?{" "}
            <Link
              href={`/register?next=${encodeURIComponent(next)}`}
              className="text-white underline-offset-4 hover:underline"
            >
              Зарегистрироваться
            </Link>
          </>
        )}
      </p>
    </div>
  );
}