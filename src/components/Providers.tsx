"use client";
import { Suspense } from "react";
import { CartProvider } from "@/context/CartContext";
import { ContactModalProvider } from "@/context/ContactModalContext";
import { NavigationLoader } from "@/components/NavigationLoader";
import { GlobalAiAssistant } from "@/components/GlobalAiAssistant";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <ContactModalProvider>
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>
        {children}
        <Suspense fallback={null}>
          <GlobalAiAssistant />
        </Suspense>
      </ContactModalProvider>
    </CartProvider>
  );
}