"use client";

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
  const px = size;
  const sizeStyle = px ? { width: px, height: px } : undefined;
  const sizeClass = px
    ? "relative shrink-0 animate-ved-spin"
    : "relative h-[240px] w-[240px] shrink-0 animate-ved-spin md:h-[320px] md:w-[320px]";

  const sphere = (
    <div className={sizeClass} style={sizeStyle} role="img" aria-label={label}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/preloader.png"
        alt=""
        width={px || 320}
        height={px || 320}
        className="h-full w-full object-contain"
        decoding="async"
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
