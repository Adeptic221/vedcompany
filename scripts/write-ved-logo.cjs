const fs = require("fs");
const path = require("path");

const vedLogo = `import Link from "next/link";

/** White mark for navy/blue site chrome. */
const LOGO_COLOR = "#FFFFFF";

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
      <path fill={color} d="M88 0h50v12H88V0z" />
      <path fill={color} d="M88 24h50v12H100v20h38v12H88V24z" />
      <path
        fill={color}
        fillRule="evenodd"
        d="M158 0h20c34 0 40 14 40 34s-6 34-40 34h-20V0zm20 13c20 0 26 8 26 21s-6 21-26 21V13z"
      />
    </svg>
  );
}

export function VedLogo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={\`inline-flex items-center transition hover:opacity-85 \${className}\`}
      aria-label="\u0412\u042D\u0414 \u2014 \u043d\u0430 \u0433\u043b\u0430\u0432\u043d\u0443\u044e"
    >
      <VedLogoMark className="h-9 w-auto md:h-11" />
    </Link>
  );
}
`;

const logoSvg = `<svg viewBox="0 0 220 68" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="VED">
  <rect width="220" height="68" fill="#0a1628"/>
  <path fill="#FFFFFF" d="M2 0h24l12 52L50 0h24L46 68H30L2 0z"/>
  <path fill="#FFFFFF" d="M88 0h50v12H88V0z"/>
  <path fill="#FFFFFF" d="M88 24h50v12H100v20h38v12H88V24z"/>
  <path fill="#FFFFFF" fill-rule="evenodd" d="M158 0h20c34 0 40 14 40 34s-6 34-40 34h-20V0zm20 13c20 0 26 8 26 21s-6 21-26 21V13z"/>
</svg>
`;

const root = path.join(__dirname, "..");
fs.writeFileSync(path.join(root, "src/components/VedLogo.tsx"), vedLogo, "utf8");
fs.writeFileSync(path.join(root, "public/logo.svg"), logoSvg, "utf8");
console.log("VED logo updated");
