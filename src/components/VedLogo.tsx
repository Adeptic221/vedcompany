import Link from "next/link";

export function VedLogo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`relative inline-flex items-baseline gap-0.5 font-light tracking-[0.15em] text-white transition hover:opacity-80 ${className}`} aria-label="VED">
      <span className="text-3xl">V</span>
      <span className="text-3xl">Э</span>
      <span className="text-3xl">D</span>
      <span className="absolute left-0 top-[2.1rem] h-px w-14 bg-white" aria-hidden />
    </Link>
  );
}