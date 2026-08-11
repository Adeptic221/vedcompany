import Image from "next/image";

/** Car sketch ~2.5x previous visual size in the right column. */
export function HomeHeroSketch() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
      aria-hidden
    >
      <div className="relative mx-auto h-full w-[92%] max-w-md origin-center scale-100 md:h-[420px] md:w-[480px] md:max-w-none md:scale-[2.15] md:translate-y-[8%] lg:h-[460px] lg:w-[520px]">
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
