export function PageBackground() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ved-blue via-ved-navy to-ved-accent opacity-90" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(42,74,110,0.35),transparent_60%)]" aria-hidden />
    </>
  );
}