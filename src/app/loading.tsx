import { LoadingSphere } from "@/components/LoadingSphere";
import { PageBackground } from "@/components/PageBackground";

export default function Loading() {
  return (
    <main className="relative ved-screen overflow-hidden bg-ved-navy">
      <PageBackground />
      <div className="relative z-10 flex min-h-[inherit] items-center justify-center">
        <LoadingSphere />
      </div>
    </main>
  );
}
