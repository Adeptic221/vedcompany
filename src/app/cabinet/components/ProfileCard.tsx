"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export function ProfileCard() {
  const router = useRouter();
  const { user, logout, refresh } = useAuth();
  const { profile, updateProfile } = useCart();
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const nextName = user.name || profile.name;
    const nextPhone = user.phone || profile.phone;
    setName(nextName);
    setPhone(nextPhone);
    if (
      nextName !== profile.name ||
      nextPhone !== profile.phone ||
      (user.email && profile.email !== user.email)
    ) {
      updateProfile({
        name: nextName,
        phone: nextPhone,
        email: user.email,
      });
    }
    // Intentionally sync once when auth user becomes available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    setName(profile.name);
    setPhone(profile.phone);
  }, [profile.name, profile.phone]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Не удалось сохранить");
        return;
      }
      updateProfile({
        name: data.user?.name || name.trim(),
        phone: data.user?.phone || phone.trim(),
        email: data.user?.email || user?.email || profile.email || "",
      });
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Ошибка сети");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  const displayName = (user?.name || profile.name).trim() || "Клиент";
  const displayEmail = user?.email || profile.email || "";

  return (
    <div className="ved-glass border border-white/10 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-lg font-light uppercase text-white/80">
          {displayName.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-light text-white">{displayName}</p>
          <p className="truncate text-xs text-white/40">
            {displayEmail || profile.phone.trim() || "Профиль"}
          </p>
        </div>
      </div>

      <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/40">
        Профиль
      </p>

      <div className="space-y-3">
        {displayEmail && (
          <div>
            <label className="mb-1 block text-xs text-white/50">Email</label>
            <p className="border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
              {displayEmail}
            </p>
          </div>
        )}
        <div>
          <label htmlFor="profile-name" className="mb-1 block text-xs text-white/50">
            Имя
          </label>
          <input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Как к вам обращаться"
            className="w-full border border-white/15 bg-transparent px-3 py-2 text-sm outline-none transition focus:border-white/40"
          />
        </div>
        <div>
          <label htmlFor="profile-phone" className="mb-1 block text-xs text-white/50">
            Телефон
          </label>
          <input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 (___) ___-__-__"
            className="w-full border border-white/15 bg-transparent px-3 py-2 text-sm outline-none transition focus:border-white/40"
          />
        </div>
        {error && <p className="text-xs text-red-300">{error}</p>}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full border border-white/30 py-2.5 text-xs uppercase tracking-wider transition hover:bg-white hover:text-ved-navy disabled:opacity-50"
        >
          {saved ? "Сохранено" : saving ? "..." : "Сохранить"}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full border border-white/15 py-2.5 text-xs uppercase tracking-wider text-white/70 transition hover:border-white/40 hover:text-white"
        >
          Выйти
        </button>
      </div>
    </div>
  );
}
