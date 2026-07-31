import { notFound } from "next/navigation";
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
