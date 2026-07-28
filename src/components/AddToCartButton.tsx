"use client";
import { useCart } from "@/context/CartContext";
export function AddToCartButton({ carId, className = "", fullWidth = false }: { carId: string; className?: string; fullWidth?: boolean }) {
  const { addToCart, isInCart, removeFromCart } = useCart();
  const inCart = isInCart(carId);
  const base = className || "border border-white/20 px-3 py-2 text-xs uppercase tracking-wider text-white/70 transition hover:border-white/40 hover:text-white";
  return (
    <button type="button" onClick={() => (inCart ? removeFromCart(carId) : addToCart(carId))} className={`${base} ${fullWidth ? "w-full" : ""}`}>
      {inCart ? "\u2713 \u0412 \u043a\u043e\u0440\u0437\u0438\u043d\u0435" : "+ \u041a\u043e\u0440\u0437\u0438\u043d\u0430"}
    </button>
  );
}