import Link from "next/link";
import Image from "next/image";

export function VedLogo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center transition hover:opacity-85 ${className}`}
      aria-label="ВЭД — на главную"
    >
      <Image
        src="/logo.png"
        alt="VED"
        width={132}
        height={52}
        priority
        className="h-9 w-auto md:h-11"
      />
    </Link>
  );
}
