import Image from "next/image";

/** Car sketch ~2.5x previous visual size in the right column. */
export function HomeHeroSketch() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
      aria-hidden
    >
      <div
        className="relative h-[420px] w-[480px] origin-center lg:h-[460px] lg:w-[520px]"
        style={{ transform: "scale(2.15) translateY(8%)" }}
      >
        <div className="absolute inset-0 animate-hero-sketch-in">
          <Image
            src="/hero-sedan-c.png"
            alt=""
            fill
            priority
            unoptimized
            sizes="80vw"
            className="object-contain object-center"
          />
        </div>
      </div>
    </div>
  );
}
