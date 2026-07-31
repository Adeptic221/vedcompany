import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Suspense fallback={<p className="text-white/50">Loading...</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
