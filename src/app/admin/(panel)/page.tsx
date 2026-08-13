import Link from "next/link";
import { getCarsCatalog, getCarsStorageInfo } from "@/lib/storage/cars-store";
import { readLeads } from "@/lib/leads/storage";
import { listUsers } from "@/lib/auth/users-store";
import { listOrders } from "@/lib/orders/orders-store";
import { listAllDocs } from "@/lib/cabinet/server-docs-store";

export default async function AdminDashboardPage() {
  const [cars, leads, users, orders, docs] = await Promise.all([
    getCarsCatalog(),
    readLeads(),
    listUsers(),
    listOrders(),
    listAllDocs(),
  ]);
  const storage = getCarsStorageInfo();
  const resend = Boolean(process.env.RESEND_API_KEY);
  const blob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light uppercase tracking-[0.15em]">Dashboard</h1>
        <p className="mt-2 text-sm text-white/50">
          Менеджер: клиенты, заказы, документы, чат
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/clients" className="border border-white/10 bg-white/5 p-6 transition hover:border-white/25">
          <p className="text-xs uppercase tracking-widest text-white/50">Клиенты</p>
          <p className="mt-2 text-3xl font-light">{users.length}</p>
        </Link>
        <Link href="/admin/orders" className="border border-white/10 bg-white/5 p-6 transition hover:border-white/25">
          <p className="text-xs uppercase tracking-widest text-white/50">Заказы</p>
          <p className="mt-2 text-3xl font-light">{orders.length}</p>
        </Link>
        <Link href="/admin/clients" className="border border-white/10 bg-white/5 p-6 transition hover:border-white/25">
          <p className="text-xs uppercase tracking-widest text-white/50">Документы</p>
          <p className="mt-2 text-3xl font-light">{docs.length}</p>
        </Link>
        <Link href="/admin/chats" className="border border-white/10 bg-white/5 p-6 transition hover:border-white/25">
          <p className="text-xs uppercase tracking-widest text-white/50">Чат</p>
          <p className="mt-2 text-sm text-white/60">Открыть переписку</p>
        </Link>
        <Link href="/admin/cars" className="border border-white/10 bg-white/5 p-6 transition hover:border-white/25">
          <p className="text-xs uppercase tracking-widest text-white/50">Cars</p>
          <p className="mt-2 text-3xl font-light">{cars.length}</p>
        </Link>
        <Link href="/admin/leads" className="border border-white/10 bg-white/5 p-6 transition hover:border-white/25">
          <p className="text-xs uppercase tracking-widest text-white/50">Leads</p>
          <p className="mt-2 text-3xl font-light">{leads.length}</p>
        </Link>
      </div>

      <div className="space-y-3 text-sm">
        <p className={`border px-4 py-3 ${resend ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100/90" : "border-amber-400/30 bg-amber-400/10 text-amber-100/90"}`}>
          Resend (восстановление пароля): {resend ? "настроен" : "нет RESEND_API_KEY — письма показывают dev-ссылку"}
        </p>
        <p className={`border px-4 py-3 ${blob ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100/90" : "border-white/10 text-white/50"}`}>
          Vercel Blob: {blob ? "включён" : "не задан BLOB_READ_WRITE_TOKEN — файлы через GitHub/local fallback"}
        </p>
        {storage.persistence === "github" && (
          <p className="border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-emerald-100/90">
            Каталог и пользовательские данные пишутся в GitHub.
          </p>
        )}
      </div>
    </div>
  );
}