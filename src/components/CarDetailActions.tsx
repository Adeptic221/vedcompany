"use client";
import { AddToCartButton } from "@/components/AddToCartButton";
import { CheckoutButton } from "@/components/CheckoutButton";
export function CarDetailActions({ carId, totalAmount }: { carId: string; totalAmount: number }) {
  return (
    <div className="mt-6 flex gap-3">
      <AddToCartButton carId={carId} fullWidth className="flex-1 border border-white bg-white px-6 py-3 text-xs uppercase tracking-widest text-ved-navy transition hover:bg-white/90" />
      <CheckoutButton carId={carId} totalAmount={totalAmount} />
    </div>
  );
}