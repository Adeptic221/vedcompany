"use client";
import { Suspense } from "react";
import { CartProvider } from "@/context/CartContext";
import { NavigationLoader } from "@/components/NavigationLoader";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Suspense fallback={null}><NavigationLoader /></Suspense>
      {children}
    </CartProvider>
  );
}