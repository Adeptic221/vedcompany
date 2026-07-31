import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { PageBackground } from "@/components/PageBackground";
import { SiteFooter } from "@/components/SiteFooter";
import { LEGAL_PAGES } from "@/lib/legal/pages";

export const metadata: Metadata = {
  title: "\u041f\u0440\u0430\u0432\u043e\u0432\u0430\u044f \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f",
  description: "\u041f\u043e\u043b\u0438\u0442\u0438\u043a\u0430 \u043a\u043e\u043d\u0444\u0438\u0434\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u0438, \u0441\u043e\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u0435, \u0441\u043e\u0433\u043b\u0430\u0441\u0438\u0435 \u043d\u0430 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0443 \u041f\u0414\u043d \u0438 cookies \u2014 vedcompany.ru.",
  alternates: { canonical: "/legal" },
};

export default function LegalHubPage() {
  return (
    <main className="relative ved-screen bg-ved-navy text-white">
      <PageBackground />
      <Header />
      <div className="relative z-10 mx-auto max-w-3xl px-8 py-12 md:px-12">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">VED / LEGAL</p>
        <h1 className="mt-3 text-2xl font-light uppercase tracking-[0.15em] md:text-3xl">
          {"\u041f\u0440\u0430\u0432\u043e\u0432\u0430\u044f \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f"}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/55">
          {"\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b \u0434\u043b\u044f \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0435\u0439 \u0441\u0430\u0439\u0442\u0430 vedcompany.ru. \u0420\u0435\u043a\u0432\u0438\u0437\u0438\u0442\u044b \u044e\u0440\u043b\u0438\u0446\u0430 \u043c\u043e\u0433\u0443\u0442 \u0431\u044b\u0442\u044c \u0434\u043e\u043f\u043e\u043b\u043d\u0435\u043d\u044b \u043f\u043e\u0437\u0436\u0435."}
        </p>
        <ul className="mt-10 space-y-3">
          {LEGAL_PAGES.map((page) => (
            <li key={page.slug}>
              <Link
                href={`/legal/${page.slug}`}
                className="block border border-white/10 bg-white/5 px-5 py-4 transition hover:border-white/25 hover:bg-white/10"
              >
                <span className="text-sm text-white/90">{page.title}</span>
                <span className="mt-1 block text-xs text-white/40">{page.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <SiteFooter />
    </main>
  );
}
