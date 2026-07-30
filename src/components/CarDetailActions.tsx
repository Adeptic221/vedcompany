"use client";
import { AddToCartButton } from "@/components/AddToCartButton";
import { AddToFavoritesButton } from "@/components/AddToFavoritesButton";
import { CheckoutButton } from "@/components/CheckoutButton";
export function CarDetailActions({ carId, totalAmount }: { carId: string; totalAmount: number }) {
  return (
    <div className="mt-6 space-y-3">
      <div className="flex gap-3">
        <AddToCartButton carId={carId} fullWidth className="flex-1 border border-white bg-white px-6 py-3 text-xs uppercase tracking-widest text-ved-navy transition hover:bg-white/90" />
        <CheckoutButton carId={carId} totalAmount={totalAmount} />
      </div>
      <AddToFavoritesButton carId={carId} fullWidth className="w-full border border-white/20 px-6 py-3 text-xs uppercase tracking-widest text-white/70 transition hover:border-white/40 hover:text-white" />
    </div>
  );
}
