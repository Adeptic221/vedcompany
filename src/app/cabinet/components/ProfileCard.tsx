"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";

export function ProfileCard() {
  const { profile, updateProfile } = useCart();
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setPhone(profile.phone);
  }, [profile.name, profile.phone]);

  const handleSave = () => {
    updateProfile({ name: name.trim(), phone: phone.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const displayName = profile.name.trim() || "Гость";

  return (
    <div className="ved-glass border border-white/10 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-lg font-light uppercase text-white/80">
          {displayName.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-light text-white">{displayName}</p>
          <p className="truncate text-xs text-white/40">
            {profile.phone.trim() || "Телефон не указан"}
          </p>
        </div>
      </div>

      <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/40">
        Профиль
      </p>

      <div className="space-y-3">
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
        <button
          type="button"
          onClick={handleSave}
          className="w-full border border-white/30 py-2.5 text-xs uppercase tracking-wider transition hover:bg-white hover:text-ved-navy"
        >
          {saved ? "Сохранено" : "Сохранить"}
        </button>
      </div>
    </div>
  );
}
