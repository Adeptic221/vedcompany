"use client";

import Image from "next/image";

type LoadingSphereProps = {
  label?: string;
  /** Explicit px size; default ≈ 40% viewport height */
  size?: number;
  fullscreen?: boolean;
};

export function LoadingSphere({
  label = "Загрузка",
  size,
  fullscreen = false,
}: LoadingSphereProps) {
  const px = size ?? undefined;
  const sizeStyle = px ? { width: px, height: px } : undefined;
  const sizeClass = px
    ? ""
    : "h-[36vh] w-[36vh] min-h-[240px] min-w-[240px] max-h-[520px] max-w-[520px]";

  const sphere = (
    <div
      className={`relative ${sizeClass} shrink-0 animate-ved-spin`}
      style={sizeStyle}
      role="img"
      aria-label={label}
    >
      <Image
        src="/preloader.png"
        alt=""
        fill
        priority
        unoptimized
        sizes="40vh"
        className="object-contain"
      />
    </div>
  );

  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      {sphere}
      {label ? (
        <p className="text-xs uppercase tracking-[0.35em] text-white/45">{label}</p>
      ) : null}
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
