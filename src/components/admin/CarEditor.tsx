"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Car, CarType } from "@/types/car";
import { CAR_TYPES } from "@/lib/admin/car-form";
import { carTypeLabels } from "@/data/cars";

export function CarEditor({ car }: { car?: Car }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    brand: car?.brand || "",
    brandSlug: car?.brandSlug || "",
    model: car?.model || "",
    year: String(car?.year || new Date().getFullYear()),
    type: (car?.type || "sedan") as CarType,
    price: String(car?.price || ""),
    customsCost: String(car?.customsCost || ""),
    deliveryDays: String(car?.deliveryDays || 45),
    country: car?.country || "China",
    description: car?.description || "",
    photoUrl: car?.sync?.photos?.[0] || "",
    engine: car?.specs.engine || "",
    power: car?.specs.power || "",
    transmission: car?.specs.transmission || "Auto",
    drive: car?.specs.drive || "FWD",
    fuel: car?.specs.fuel || "Petrol",
    consumption: car?.specs.consumption || "",
  });

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      year: Number(form.year),
      price: Number(form.price),
      customsCost: Number(form.customsCost),
      deliveryDays: Number(form.deliveryDays),
    };
    try {
      const res = await fetch(
        car ? `/api/admin/cars/${encodeURIComponent(car.id)}` : "/api/admin/cars",
        {
          method: car ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      router.push("/admin/cars");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  const fieldClass = "ved-select";

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={fieldClass} placeholder="Brand" value={form.brand} onChange={(e) => setField("brand", e.target.value)} required />
        <input className={fieldClass} placeholder="Model" value={form.model} onChange={(e) => setField("model", e.target.value)} required />
        <input className={fieldClass} placeholder="Brand slug" value={form.brandSlug} onChange={(e) => setField("brandSlug", e.target.value)} />
        <input className={fieldClass} type="number" placeholder="Year" value={form.year} onChange={(e) => setField("year", e.target.value)} required />
        <select className={fieldClass} value={form.type} onChange={(e) => setField("type", e.target.value)}>
          {CAR_TYPES.map((t) => (
            <option key={t} value={t}>{carTypeLabels[t] || t}</option>
          ))}
        </select>
        <input className={fieldClass} placeholder="Country" value={form.country} onChange={(e) => setField("country", e.target.value)} />
        <input className={fieldClass} type="number" placeholder="Price RUB" value={form.price} onChange={(e) => setField("price", e.target.value)} required />
        <input className={fieldClass} type="number" placeholder="Customs RUB" value={form.customsCost} onChange={(e) => setField("customsCost", e.target.value)} />
        <input className={fieldClass} type="number" placeholder="Delivery days" value={form.deliveryDays} onChange={(e) => setField("deliveryDays", e.target.value)} />
        <input className={fieldClass} placeholder="Photo URL" value={form.photoUrl} onChange={(e) => setField("photoUrl", e.target.value)} />
        <input className={fieldClass} placeholder="Engine" value={form.engine} onChange={(e) => setField("engine", e.target.value)} />
        <input className={fieldClass} placeholder="Power" value={form.power} onChange={(e) => setField("power", e.target.value)} />
        <input className={fieldClass} placeholder="Transmission" value={form.transmission} onChange={(e) => setField("transmission", e.target.value)} />
        <input className={fieldClass} placeholder="Drive" value={form.drive} onChange={(e) => setField("drive", e.target.value)} />
        <input className={fieldClass} placeholder="Fuel" value={form.fuel} onChange={(e) => setField("fuel", e.target.value)} />
        <input className={fieldClass} placeholder="Consumption" value={form.consumption} onChange={(e) => setField("consumption", e.target.value)} />
      </div>
      <textarea
        className="ved-select min-h-24"
        placeholder="Description"
        value={form.description}
        onChange={(e) => setField("description", e.target.value)}
      />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="border border-white px-6 py-3 text-xs uppercase tracking-[0.25em] text-white hover:bg-white hover:text-ved-navy disabled:opacity-50"
        >
          {saving ? "..." : car ? "Save" : "Create"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/cars")}
          className="border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.25em] text-white/70 hover:border-white/40"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
