import { CarEditor } from "@/components/admin/CarEditor";

export default function AdminNewCarPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-light uppercase tracking-[0.15em]">New car</h1>
      <CarEditor />
    </div>
  );
}
