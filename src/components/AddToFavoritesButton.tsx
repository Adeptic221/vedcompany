"use client";

import { useCart } from "@/context/CartContext";

export function AddToFavoritesButton({
  carId,
  className = "",
  compact = false,
  fullWidth = false,
}: {
  carId: string;
  className?: string;
  compact?: boolean;
  fullWidth?: boolean;
}) {
  const { toggleFavorite, isFavorite } = useCart();
  const active = isFavorite(carId);

  const base =
    className ||
    "border border-white/20 px-3 py-2 text-xs uppercase tracking-wider text-white/70 transition hover:border-white/40 hover:text-white";

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(carId)}
      aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
      aria-pressed={active}
      className={`${base} ${active ? "border-rose-400/50 text-rose-300" : ""} ${fullWidth ? "w-full" : ""}`}
    >
      <span className="inline-flex items-center gap-1.5">
        <svg
          className={`h-3.5 w-3.5 ${active ? "fill-rose-400" : "fill-none"}`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
        {!compact && (active ? "В избранном" : "В избранное")}
      </span>
    </button>
  );
}
