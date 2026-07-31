const fs = require("fs");
const path = require("path");
function write(rel, content) {
  const full = path.join(__dirname, "..", rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  console.log("wrote", rel);
}

write("src/app/admin/layout.tsx", `import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ved-navy text-white">
      {children}
    </div>
  );
}
`);

write("src/app/admin/login/page.tsx", `import { Suspense } from "react";
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
`);

write("src/app/admin/(panel)/layout.tsx", `import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </>
  );
}
`);

write("src/app/admin/(panel)/page.tsx", `import Link from "next/link";
import { getCarsCatalog } from "@/lib/storage/cars-store";
import { readLeads } from "@/lib/leads/storage";
import { getCarsStorageInfo } from "@/lib/storage/cars-store";

export default async function AdminDashboardPage() {
  const [cars, leads] = await Promise.all([getCarsCatalog(), readLeads()]);
  const storage = getCarsStorageInfo();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light uppercase tracking-[0.15em]">Dashboard</h1>
        <p className="mt-2 text-sm text-white/50">MVP admin: cars and leads</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/cars"
          className="border border-white/10 bg-white/5 p-6 transition hover:border-white/25"
        >
          <p className="text-xs uppercase tracking-widest text-white/50">Cars</p>
          <p className="mt-2 text-3xl font-light">{cars.length}</p>
        </Link>
        <Link
          href="/admin/leads"
          className="border border-white/10 bg-white/5 p-6 transition hover:border-white/25"
        >
          <p className="text-xs uppercase tracking-widest text-white/50">Leads</p>
          <p className="mt-2 text-3xl font-light">{leads.length}</p>
        </Link>
      </div>

      {storage.isServerless && (
        <p className="border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100/90">
          Serverless host: catalog writes go to temporary storage and may reset after redeploy.
          Prefer editing locally and committing data/cars.catalog.json, or use a persistent DB later.
        </p>
      )}
    </div>
  );
}
`);

write("src/app/admin/(panel)/cars/page.tsx", `import Link from "next/link";
import { CarsAdminTable } from "@/components/admin/CarsAdminTable";
import { getCarsCatalog } from "@/lib/storage/cars-store";

export default async function AdminCarsPage() {
  const cars = await getCarsCatalog();
  const sorted = [...cars].sort((a, b) =>
    \`\${a.brand} \${a.model}\`.localeCompare(\`\${b.brand} \${b.model}\`, "ru")
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-light uppercase tracking-[0.15em]">Cars</h1>
          <p className="mt-1 text-sm text-white/50">{sorted.length} in catalog</p>
        </div>
        <Link
          href="/admin/cars/new"
          className="border border-white px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-ved-navy"
        >
          Add car
        </Link>
      </div>
      <CarsAdminTable cars={sorted} />
    </div>
  );
}
`);

write("src/app/admin/(panel)/cars/new/page.tsx", `import { CarEditor } from "@/components/admin/CarEditor";

export default function AdminNewCarPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-light uppercase tracking-[0.15em]">New car</h1>
      <CarEditor />
    </div>
  );
}
`);

write("src/app/admin/(panel)/cars/[id]/page.tsx", `import { notFound } from "next/navigation";
import { CarEditor } from "@/components/admin/CarEditor";
import { getCarById } from "@/lib/storage/cars-store";

export default async function AdminEditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await getCarById(decodeURIComponent(id));
  if (!car) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-light uppercase tracking-[0.15em]">
        Edit {car.brand} {car.model}
      </h1>
      <CarEditor car={car} />
    </div>
  );
}
`);

write("src/app/admin/(panel)/leads/page.tsx", `import { LeadsAdminTable } from "@/components/admin/LeadsAdminTable";
import { readLeads } from "@/lib/leads/storage";

export default async function AdminLeadsPage() {
  const leads = await readLeads();
  const sorted = [...leads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light uppercase tracking-[0.15em]">Leads</h1>
        <p className="mt-1 text-sm text-white/50">{sorted.length} total</p>
      </div>
      <LeadsAdminTable leads={sorted} />
    </div>
  );
}
`);

// Patch .env.example
const envPath = path.join(__dirname, "..", ".env.example");
let env = fs.readFileSync(envPath, "utf8");
if (!env.includes("ADMIN_SECRET")) {
  env = env.replace(
    "# ?????? ??? ???????????? ????????????? (cron)\\nSYNC_CRON_SECRET=your-secret-key-here",
    "# ?????? ??? ???????????? ????????????? (cron)\\nSYNC_CRON_SECRET=your-secret-key-here\\n\\n# ?????? ????? ? ??????? /admin (???? ?? ????? ? ???????????? SYNC_CRON_SECRET)\\nADMIN_SECRET=change-me-admin-password"
  );
  if (!env.includes("ADMIN_SECRET")) {
    env = "# ?????? ????? ? ??????? /admin\\nADMIN_SECRET=change-me-admin-password\\n\\n" + env;
  }
  fs.writeFileSync(envPath, env, "utf8");
  console.log("patched .env.example");
}

console.log("pages done");
