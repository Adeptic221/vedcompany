import Image from "next/image";

export function PageBackground() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/background.jpg)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_35%,rgba(37,99,235,0.22),transparent_65%)]"
        aria-hidden
      />
    </>
  );
}
