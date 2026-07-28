"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { VedLogo } from "./VedLogo";

const links = [
  { href: "/catalog", label: "\u041a\u0430\u0442\u0430\u043b\u043e\u0433" },
  { href: "/about", label: "\u041e \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438" },
  { href: "/cabinet", label: "\u041b\u0438\u0447\u043d\u044b\u0439 \u043a\u0430\u0431\u0438\u043d\u0435\u0442" },
];

export function Header() {
  const { cartCount } = useCart();

  return (
    <header className="relative z-10 flex items-center justify-between px-8 py-6 md:px-12">
      <VedLogo />
      <nav className="flex items-center gap-4 text-xs uppercase tracking-widest text-white/70 md:gap-8">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hidden transition hover:text-white sm:inline"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/cabinet?tab=cart"
          className="relative border border-white/20 px-3 py-2 transition hover:border-white/40 hover:text-white"
        >
          {"\u041a\u043e\u0440\u0437\u0438\u043d\u0430"}
          {cartCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-medium text-ved-navy">
              {cartCount}
            </span>
          )}
        </Link>
        <Link href="/cabinet" className="transition hover:text-white sm:hidden">
          {"\u041b\u041a"}
        </Link>
      </nav>
    </header>
  );
}
