"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export function CheckoutButton({
  carId,
  totalAmount,
  className,
}: {
  carId: string;
  totalAmount: number;
  className?: string;
}) {
  const { checkout } = useCart();
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        void checkout(carId, totalAmount).then(() => {
          router.push("/cabinet?tab=orders");
        });
      }}
      className={
        className ||
        "flex-1 border border-white/30 px-6 py-3 text-xs uppercase tracking-widest transition hover:border-white hover:bg-white/10"
      }
    >
      Оформить
    </button>
  );
}