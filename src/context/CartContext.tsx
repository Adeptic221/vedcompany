"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type {
  CartItem,
  Order,
  ChatMessage,
  UploadedDoc,
  UserProfile,
  FavoriteItem,
} from "@/types/cart";

const CART_KEY = "ved-cart";
const ORDERS_KEY = "ved-orders";
const CHAT_KEY = "ved-chat";
const DOCS_KEY = "ved-docs";
const PROFILE_KEY = "ved-profile";
const FAVORITES_KEY = "ved-favorites";

const DEFAULT_PROFILE: UserProfile = { name: "", phone: "" };

interface CartContextValue {
  items: CartItem[];
  orders: Order[];
  messages: ChatMessage[];
  documents: UploadedDoc[];
  profile: UserProfile;
  favorites: FavoriteItem[];
  addToCart: (carId: string) => void;
  removeFromCart: (carId: string) => void;
  clearCart: () => void;
  cartCount: number;
  isInCart: (carId: string) => boolean;
  checkout: (carId: string, totalAmount: number) => Order;
  sendMessage: (text: string) => void;
  addDocument: (name: string) => void;
  removeDocument: (id: string) => void;
  updateProfile: (profile: UserProfile) => void;
  toggleFavorite: (carId: string) => void;
  removeFavorite: (carId: string) => void;
  isFavorite: (carId: string) => boolean;
  favoritesCount: number;
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
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Safari private mode, quota exceeded, or storage disabled */
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(load(CART_KEY, []));
    setOrders(load(ORDERS_KEY, []));
    setMessages(
      load(CHAT_KEY, [
        {
          id: "welcome",
          text: "Здравствуйте! Я ваш менеджер ВЭД. Помогу с выбором авто, документами и отслеживанием заказа.",
          from: "manager",
          createdAt: new Date().toISOString(),
        },
      ])
    );
    setDocuments(load(DOCS_KEY, []));
    setProfile(load(PROFILE_KEY, DEFAULT_PROFILE));
    setFavorites(load(FAVORITES_KEY, []));
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
  useEffect(() => {
    if (ready) save(PROFILE_KEY, profile);
  }, [profile, ready]);
  useEffect(() => {
    if (ready) save(FAVORITES_KEY, favorites);
  }, [favorites, ready]);

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
          text: "Спасибо за сообщение! Скоро отвечу. Если вопрос срочный — позвоните по телефону на сайте.",
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

  const removeDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const updateProfile = useCallback((next: UserProfile) => {
    setProfile(next);
  }, []);

  const toggleFavorite = useCallback((carId: string) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.carId === carId);
      if (exists) return prev.filter((f) => f.carId !== carId);
      return [...prev, { carId, addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeFavorite = useCallback((carId: string) => {
    setFavorites((prev) => prev.filter((f) => f.carId !== carId));
  }, []);

  const isFavorite = useCallback(
    (carId: string) => favorites.some((f) => f.carId === carId),
    [favorites]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        orders,
        messages,
        documents,
        profile,
        favorites,
        addToCart,
        removeFromCart,
        clearCart,
        cartCount: items.length,
        isInCart,
        checkout,
        sendMessage,
        addDocument,
        removeDocument,
        updateProfile,
        toggleFavorite,
        removeFavorite,
        isFavorite,
        favoritesCount: favorites.length,
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
