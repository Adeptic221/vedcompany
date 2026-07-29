import { Header } from "@/components/Header";
import { PageBackground } from "@/components/PageBackground";

export default function AboutPage() {
  return (
    <main className="relative ved-screen bg-ved-navy">
      <PageBackground />
      <Header />
      <div className="relative z-10 mx-auto max-w-3xl px-8 py-12 md:px-12">
        <img src="/logo.png" alt="VED" className="mb-8 h-16 w-auto md:h-20" />
        <h1 className="text-3xl font-light uppercase tracking-[0.15em]">О компании ВЭД</h1>
        <p className="mt-6 leading-relaxed text-white/70">VED — online-avtosalon dlya importa avtomobilej pod klyuch. My soprovozhdaem klienta ot vybora avto do tamozhni i dostavki v RF.</p>
        <p className="mt-4 leading-relaxed text-white/70">Sajt vedcompany.ru — lichnyj kabinet, chat s menedzherom i otslezhivanie zakaza.</p>
      </div>
    </main>
  );
}