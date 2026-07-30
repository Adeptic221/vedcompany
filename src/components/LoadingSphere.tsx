"use client";

import { useId } from "react";

type LoadingSphereProps = {
  label?: string;
  /** Explicit px size; default ≈ 10% viewport height */
  size?: number;
  fullscreen?: boolean;
};

const GOLD = "#d4af37";
const GOLD_LIGHT = "#e8c872";

export function LoadingSphere({
  label = "Загрузка",
  size,
  fullscreen = false,
}: LoadingSphereProps) {
  const uid = useId().replace(/:/g, "");
  const blueGrad = `ved-blue-${uid}`;

  const sizeStyle = size ? { width: size, height: size } : undefined;
  const sizeClass = size
    ? ""
    : "h-[10vh] w-[10vh] min-h-[72px] min-w-[72px] max-h-[160px] max-w-[160px]";

  const sphere = (
    <div
      className={`relative ${sizeClass} shrink-0 animate-ved-spin`}
      style={sizeStyle}
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
        <defs>
          <radialGradient id={blueGrad} cx="32%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#3d6a9e" />
            <stop offset="45%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#0a1628" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="44" fill={`url(#${blueGrad})`} />
        <ellipse
          cx="50"
          cy="50"
          rx="44"
          ry="14"
          fill="none"
          stroke={GOLD}
          strokeWidth="2.2"
          opacity="0.95"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="14"
          ry="44"
          fill="none"
          stroke={GOLD_LIGHT}
          strokeWidth="1.8"
          opacity="0.85"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="44"
          ry="14"
          fill="none"
          stroke={GOLD}
          strokeWidth="1.4"
          opacity="0.5"
          transform="rotate(60 50 50)"
        />
        <ellipse cx="36" cy="32" rx="10" ry="7" fill="white" opacity="0.22" />
      </svg>
    </div>
  );

  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      {sphere}
      <p className="text-xs uppercase tracking-[0.35em] text-white/45">{label}</p>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ved-navy/90 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
