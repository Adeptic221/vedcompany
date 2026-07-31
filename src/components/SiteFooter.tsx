import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/legal/privacy", label: "\u041a\u043e\u043d\u0444\u0438\u0434\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u044c" },
  { href: "/legal/terms", label: "\u0421\u043e\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u0435" },
  { href: "/legal/consent", label: "\u0421\u043e\u0433\u043b\u0430\u0441\u0438\u0435 \u043d\u0430 \u041f\u0414\u043d" },
  { href: "/legal/cookies", label: "Cookies" },
  { href: "/about", label: "\u041e \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-white/10 px-8 pb-8 pt-8 text-xs text-white/40 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p>
          {"\u00a9"} {year} {"\u0412\u042d\u0414"} {"\u00b7"} vedcompany.ru
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Legal">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-white/70"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
