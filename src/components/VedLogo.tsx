import Link from "next/link";

const LOGO_COLOR = "#0059A3";

export function VedLogoMark({
  className = "",
  color = LOGO_COLOR,
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 220 68"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="VED"
      className={className}
    >
      <path fill={color} d="M2 0h24l12 52L50 0h24L46 68H30L2 0z" />
      <path
        fill={color}
        d="M88 0h50v11H88L68 30v11h70v11H88v5h50v11H88v-11H88V41H68V30L88 11V0z"
      />
      <path fill={color} d="M158 0h20v68h-20q48 0 48-34T158 0z" />
    </svg>
  );
}

export function VedLogo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center transition hover:opacity-85 ${className}`}
      aria-label="ВЭД — на главную"
    >
      <VedLogoMark className="h-9 w-auto md:h-11" />
    </Link>
  );
}
