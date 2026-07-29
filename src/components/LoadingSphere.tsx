import Image from "next/image";

type LoadingSphereProps = {
  label?: string;
  size?: number;
  fullscreen?: boolean;
};

export function LoadingSphere({
  label = "Загрузка",
  size = 112,
  fullscreen = false,
}: LoadingSphereProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-5">
      <div className="animate-ved-spin" style={{ width: size, height: size }} aria-hidden>
        <Image src="/preloader.png" alt="" width={size} height={size} priority className="h-full w-full object-contain" />
      </div>
      <p className="text-xs uppercase tracking-[0.35em] text-white/45">{label}</p>
    </div>
  );
  if (fullscreen) {
    return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ved-navy/95">{content}</div>;
  }
  return content;
}