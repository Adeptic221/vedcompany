"use client";

import { Suspense } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ContactModalProvider } from "@/context/ContactModalContext";
import { NavigationLoader } from "@/components/NavigationLoader";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ContactModalProvider>
          <Suspense fallback={null}>
            <NavigationLoader />
          </Suspense>
          {children}
        </ContactModalProvider>
      </CartProvider>
    </AuthProvider>
  );
}