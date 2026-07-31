import { AdminNav } from "@/components/admin/AdminNav";

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
