import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { PageBackground } from "@/components/PageBackground";
import { SiteFooter } from "@/components/SiteFooter";
import { LEGAL_PAGES, getLegalPage } from "@/lib/legal/pages";

export function generateStaticParams() {
  return LEGAL_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getLegalPage(slug);
  if (!page) {
    return { title: "\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d" };
  }
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/legal/${page.slug}` },
  };
}

export default async function LegalDocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getLegalPage(slug);
  if (!page) notFound();

  return (
    <main className="relative ved-screen bg-ved-navy text-white">
      <PageBackground />
      <Header />
      <article className="relative z-10 mx-auto max-w-3xl px-8 py-12 md:px-12">
        <Link href="/legal" className="text-xs uppercase tracking-widest text-white/45 transition hover:text-white">
          {"\u2190 \u041a \u0441\u043f\u0438\u0441\u043a\u0443 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u043e\u0432"}
        </Link>
        <h1 className="mt-6 text-2xl font-light uppercase tracking-[0.12em] md:text-3xl">{page.title}</h1>
        <p className="mt-3 text-xs text-white/40">
          {"\u041e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u043e:"} {page.updatedAt}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-white/55">{page.description}</p>
        <div className="mt-10 space-y-8">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-sm uppercase tracking-[0.18em] text-white/75">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/60">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
        <p className="mt-12 border-t border-white/10 pt-6 text-xs leading-relaxed text-white/35">
          {"\u0420\u0435\u043a\u0432\u0438\u0437\u0438\u0442\u044b \u044e\u0440\u0438\u0434\u0438\u0447\u0435\u0441\u043a\u043e\u0433\u043e \u043b\u0438\u0446\u0430 \u043c\u043e\u0433\u0443\u0442 \u0431\u044b\u0442\u044c \u0434\u043e\u043f\u043e\u043b\u043d\u0435\u043d\u044b \u043f\u043e\u0437\u0436\u0435."}
        </p>
      </article>
      <SiteFooter />
    </main>
  );
}
