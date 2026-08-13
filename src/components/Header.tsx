"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useContactModal } from "@/context/ContactModalContext";
import { VedLogo } from "./VedLogo";

const links = [
  { href: "/catalog", label: "Каталог" },
  { href: "/about", label: "О компании" },
];

export function Header() {
  const { cartCount } = useCart();
  const { user } = useAuth();
  const { openContactModal } = useContactModal();
  const cabinetHref = user ? "/cabinet" : "/login?next=/cabinet";
  const cabinetLabel = "Личный кабинет";

  return (
    <header className="relative z-50 flex items-center justify-between bg-[#0a1628]/95 px-8 py-6 backdrop-blur-sm md:px-12">
      <VedLogo />
      <nav className="flex items-center gap-3 text-xs uppercase tracking-widest text-white md:gap-6">
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
          href={cabinetHref}
          className="hidden transition hover:text-white sm:inline"
        >
          {cabinetLabel}
        </Link>
        <button
          type="button"
          onClick={openContactModal}
          className="hidden border border-white/50 px-3 py-2 transition hover:border-white hover:text-white sm:inline"
        >
          Связаться
        </button>
        <Link
          href={user ? "/cabinet?tab=cart" : "/login?next=/cabinet?tab=cart"}
          className="relative border border-white/50 px-3 py-2 transition hover:border-white hover:text-white"
        >
          Корзина
          {cartCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-medium text-ved-navy">
              {cartCount}
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={openContactModal}
          className="border border-white/50 px-2 py-2 transition hover:border-white hover:text-white sm:hidden"
          aria-label="Связаться"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
        </button>
        <Link href={cabinetHref} className="transition hover:text-white sm:hidden">
          {cabinetLabel}
        </Link>
      </nav>
    </header>
  );
}
