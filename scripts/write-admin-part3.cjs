const fs = require("fs");
const path = require("path");
function write(rel, content) {
  const full = path.join(__dirname, "..", rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  console.log("wrote", rel);
}

write("src/components/admin/AdminNav.tsx", `"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/cars", label: "Cars" },
  { href: "/admin/leads", label: "Leads" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
      <div className="flex items-center gap-6">
        <Link href="/admin" className="text-sm uppercase tracking-[0.2em] text-white">
          VED Admin
        </Link>
        <nav className="flex gap-3 text-xs uppercase tracking-widest text-white/50">
          {links.map((link) => {
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? "text-white" : "hover:text-white"}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-3 text-xs uppercase tracking-widest">
        <Link href="/" className="text-white/50 hover:text-white">
          Site
        </Link>
        <button
          type="button"
          onClick={logout}
          className="border border-white/20 px-3 py-1.5 text-white/70 hover:border-white/40 hover:text-white"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
`);

write("src/components/admin/LoginForm.tsx", `"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      router.push(search.get("next") || "/admin");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-lg font-light uppercase tracking-[0.2em] text-white">
        Admin login
      </h1>
      <p className="text-sm text-white/50">
        Enter ADMIN_SECRET from environment variables.
      </p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="ved-select"
        autoFocus
        required
      />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="border border-white px-6 py-3 text-xs uppercase tracking-[0.25em] text-white transition hover:bg-white hover:text-ved-navy disabled:opacity-50"
      >
        {loading ? "..." : "Sign in"}
      </button>
    </form>
  );
}
`);

write("src/components/admin/CarEditor.tsx", `"use client";

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
        car ? \`/api/admin/cars/\${encodeURIComponent(car.id)}\` : "/api/admin/cars",
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
`);

write("src/components/admin/CarsAdminTable.tsx", `"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Car } from "@/types/car";
import { formatPrice, getTotalPrice, carTypeLabels } from "@/data/cars";

export function CarsAdminTable({ cars }: { cars: Car[] }) {
  const router = useRouter();

  async function remove(id: string, label: string) {
    if (!confirm(\`Delete \${label}?\`)) return;
    const res = await fetch(\`/api/admin/cars/\${encodeURIComponent(id)}\`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("Delete failed");
      return;
    }
    router.refresh();
  }

  if (cars.length === 0) {
    return <p className="text-white/50">Catalog is empty.</p>;
  }

  return (
    <div className="overflow-x-auto border border-white/10">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-white/10 text-xs uppercase tracking-widest text-white/50">
          <tr>
            <th className="px-3 py-3 font-normal">Car</th>
            <th className="px-3 py-3 font-normal">Type</th>
            <th className="px-3 py-3 font-normal">Year</th>
            <th className="px-3 py-3 font-normal">Total</th>
            <th className="px-3 py-3 font-normal"></th>
          </tr>
        </thead>
        <tbody>
          {cars.map((car) => (
            <tr key={car.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="px-3 py-3">
                <div className="text-white">{car.brand} {car.model}</div>
                <div className="text-xs text-white/40">{car.id}</div>
              </td>
              <td className="px-3 py-3 text-white/70">{carTypeLabels[car.type] || car.type}</td>
              <td className="px-3 py-3 text-white/70">{car.year}</td>
              <td className="px-3 py-3 text-white/90">{formatPrice(getTotalPrice(car))}</td>
              <td className="px-3 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={\`/admin/cars/\${encodeURIComponent(car.id)}\`}
                    className="border border-white/20 px-2 py-1 text-xs uppercase tracking-wider text-white/70 hover:border-white/40 hover:text-white"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(car.id, \`\${car.brand} \${car.model}\`)}
                    className="border border-red-400/30 px-2 py-1 text-xs uppercase tracking-wider text-red-200/80 hover:border-red-300/50"
                  >
                    Del
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`);

write("src/components/admin/LeadsAdminTable.tsx", `import type { LeadRecord } from "@/types/lead";

export function LeadsAdminTable({ leads }: { leads: LeadRecord[] }) {
  if (leads.length === 0) {
    return (
      <p className="text-sm text-white/50">
        No leads yet. On Netlify file storage is ephemeral ? also set Telegram/webhook in env.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-white/10">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-white/10 text-xs uppercase tracking-widest text-white/50">
          <tr>
            <th className="px-3 py-3 font-normal">Date</th>
            <th className="px-3 py-3 font-normal">Name</th>
            <th className="px-3 py-3 font-normal">Phone</th>
            <th className="px-3 py-3 font-normal">Type</th>
            <th className="px-3 py-3 font-normal">Message</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-white/5 align-top hover:bg-white/5">
              <td className="px-3 py-3 text-white/60 whitespace-nowrap">
                {new Date(lead.createdAt).toLocaleString("ru-RU")}
              </td>
              <td className="px-3 py-3 text-white">{lead.name}</td>
              <td className="px-3 py-3 text-white/80">{lead.phone}</td>
              <td className="px-3 py-3 text-white/60">{lead.type}</td>
              <td className="px-3 py-3 text-white/70">
                {lead.carLabel && <div className="mb-1 text-white/90">{lead.carLabel}</div>}
                {lead.message || "?"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`);

console.log("components done");
