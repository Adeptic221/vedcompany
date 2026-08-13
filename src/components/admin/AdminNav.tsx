"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/clients", label: "Клиенты" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/chats", label: "Чат" },
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
      <div className="flex flex-wrap items-center gap-6">
        <Link href="/admin" className="text-sm uppercase tracking-[0.2em] text-white">
          VED Admin
        </Link>
        <nav className="flex flex-wrap gap-3 text-xs uppercase tracking-widest text-white/50">
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