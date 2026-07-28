"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { CartItem, Order, ChatMessage, UploadedDoc } from "@/types/cart";

const CART_KEY = "ved-cart";
const ORDERS_KEY = "ved-orders";
const CHAT_KEY = "ved-chat";
const DOCS_KEY = "ved-docs";

interface CartContextValue {
  items: CartItem[];
  orders: Order[];
  messages: ChatMessage[];
  documents: UploadedDoc[];
  addToCart: (carId: string) => void;
  removeFromCart: (carId: string) => void;
  clearCart: () => void;
  cartCount: number;
  isInCart: (carId: string) => boolean;
  checkout: (carId: string, totalAmount: number) => Order;
  sendMessage: (text: string) => void;
  addDocument: (name: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(load(CART_KEY, []));
    setOrders(load(ORDERS_KEY, []));
    setMessages(
      load(CHAT_KEY, [
        {
          id: "welcome",
          text: "\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435! \u042f \u0432\u0430\u0448 \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440 \u0412\u042d\u0414.",
          from: "manager",
          createdAt: new Date().toISOString(),
        },
      ])
    );
    setDocuments(load(DOCS_KEY, []));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) save(CART_KEY, items);
  }, [items, ready]);
  useEffect(() => {
    if (ready) save(ORDERS_KEY, orders);
  }, [orders, ready]);
  useEffect(() => {
    if (ready) save(CHAT_KEY, messages);
  }, [messages, ready]);
  useEffect(() => {
    if (ready) save(DOCS_KEY, documents);
  }, [documents, ready]);

  const addToCart = useCallback((carId: string) => {
    setItems((prev) =>
      prev.some((i) => i.carId === carId)
        ? prev
        : [...prev, { carId, addedAt: new Date().toISOString() }]
    );
  }, []);

  const removeFromCart = useCallback((carId: string) => {
    setItems((prev) => prev.filter((i) => i.carId !== carId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const isInCart = useCallback(
    (carId: string) => items.some((i) => i.carId === carId),
    [items]
  );

  const checkout = useCallback((carId: string, totalAmount: number) => {
    const order: Order = {
      id: `ord-${Date.now()}`,
      carId,
      status: "new",
      createdAt: new Date().toISOString(),
      paidAmount: Math.round(totalAmount * 0.3),
      totalAmount,
    };
    setOrders((prev) => [order, ...prev]);
    setItems((prev) => prev.filter((i) => i.carId !== carId));
    return order;
  }, []);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        text: trimmed,
        from: "client",
        createdAt: new Date().toISOString(),
      },
    ]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-r`,
          text: "\u0421\u043f\u0430\u0441\u0438\u0431\u043e! \u0421\u043a\u043e\u0440\u043e \u043e\u0442\u0432\u0435\u0447\u0443.",
          from: "manager",
          createdAt: new Date().toISOString(),
        },
      ]);
    }, 1200);
  }, []);

  const addDocument = useCallback((name: string) => {
    setDocuments((prev) => [
      ...prev,
      { id: `doc-${Date.now()}`, name, uploadedAt: new Date().toISOString() },
    ]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        orders,
        messages,
        documents,
        addToCart,
        removeFromCart,
        clearCart,
        cartCount: items.length,
        isInCart,
        checkout,
        sendMessage,
        addDocument,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
