"use client";

import Image from "next/image";
import { useState } from "react";
import { normalizeCarPhotoUrl } from "@/lib/catalog/photo-url";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackColor?: string;
  fallbackLabel?: string;
};

export function CarPhoto({
  src,
  alt,
  className = "object-cover",
  sizes,
  priority,
  fallbackColor = "#1a3a5c",
  fallbackLabel,
}: Props) {
  const normalized = normalizeCarPhotoUrl(src);
  const [failed, setFailed] = useState(false);

  if (!normalized || failed) {
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${fallbackColor}, #0a1628)` }}
      >
        <span className="text-4xl font-light tracking-widest text-white/20">
          {fallbackLabel ?? alt.slice(0, 12)}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={normalized}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}