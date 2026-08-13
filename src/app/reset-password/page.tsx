import { Suspense } from "react";
import { Header } from "@/components/Header";
import { PageBackground } from "@/components/PageBackground";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <main className="relative ved-screen bg-ved-navy">
      <PageBackground />
      <Header />
      <div className="relative z-10 px-4 py-16 md:px-12">
        <Suspense fallback={<p className="text-center text-white/50">Загрузка...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}