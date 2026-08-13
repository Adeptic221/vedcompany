"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type {
  CartItem,
  DeliveryDestination,
  Order,
  ChatMessage,
  UploadedDoc,
  UserProfile,
  FavoriteItem,
} from "@/types/cart";
import type { CabinetDocKind } from "@/lib/cabinet/documents";
import {
  saveDocFile,
  getDocFile,
  deleteDocFile,
} from "@/lib/cabinet/doc-files";
import { useAuth } from "@/context/AuthContext";

const CART_KEY = "ved-cart";
const ORDERS_KEY = "ved-orders";
const CHAT_KEY = "ved-chat";
const DOCS_KEY = "ved-docs";
const PROFILE_KEY = "ved-profile";
const FAVORITES_KEY = "ved-favorites";

const DEFAULT_PROFILE: UserProfile = { name: "", phone: "", email: "" };

interface CartContextValue {
  items: CartItem[];
  orders: Order[];
  messages: ChatMessage[];
  documents: UploadedDoc[];
  profile: UserProfile;
  favorites: FavoriteItem[];
  addToCart: (carId: string) => void;
  removeFromCart: (carId: string) => void;
  updateCartDelivery: (carId: string, destination: DeliveryDestination) => void;
  clearCart: () => void;
  cartCount: number;
  isInCart: (carId: string) => boolean;
  checkout: (carId: string, totalAmount: number) => Promise<Order>;
  sendMessage: (text: string) => void;
  addDocument: (file: File, kind: CabinetDocKind) => Promise<void>;
  removeDocument: (id: string) => Promise<void>;
  openDocument: (id: string) => Promise<void>;
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
    /* ignore */
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(
      load<CartItem[]>(CART_KEY, []).map((item) => ({
        ...item,
        deliveryDestination: item.deliveryDestination ?? "none",
      }))
    );
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
    if (!ready || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const [docsRes, ordersRes, chatRes] = await Promise.all([
          fetch("/api/cabinet/docs", { cache: "no-store" }),
          fetch("/api/cabinet/orders", { cache: "no-store" }),
          fetch("/api/cabinet/chat", { cache: "no-store" }),
        ]);
        if (cancelled) return;
        if (docsRes.ok) {
          const data = await docsRes.json();
          if (Array.isArray(data.documents)) setDocuments(data.documents);
        }
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          if (Array.isArray(data.orders)) setOrders(data.orders);
        }
        if (chatRes.ok) {
          const data = await chatRes.json();
          if (Array.isArray(data.messages)) setMessages(data.messages);
        }
      } catch {
        /* keep local */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, user?.id]);

  useEffect(() => {
    if (ready) save(CART_KEY, items);
  }, [items, ready]);
  useEffect(() => {
    if (ready && !user) save(ORDERS_KEY, orders);
  }, [orders, ready, user]);
  useEffect(() => {
    if (ready && !user) save(CHAT_KEY, messages);
  }, [messages, ready, user]);
  useEffect(() => {
    if (ready && !user) save(DOCS_KEY, documents);
  }, [documents, ready, user]);
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
        : [
            ...prev,
            {
              carId,
              addedAt: new Date().toISOString(),
              deliveryDestination: "none" as DeliveryDestination,
            },
          ]
    );
  }, []);

  const updateCartDelivery = useCallback(
    (carId: string, destination: DeliveryDestination) => {
      setItems((prev) =>
        prev.map((item) =>
          item.carId === carId
            ? { ...item, deliveryDestination: destination }
            : item
        )
      );
    },
    []
  );

  const removeFromCart = useCallback((carId: string) => {
    setItems((prev) => prev.filter((i) => i.carId !== carId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const isInCart = useCallback(
    (carId: string) => items.some((i) => i.carId === carId),
    [items]
  );

  const checkout = useCallback(
    async (carId: string, totalAmount: number) => {
      let order: Order = {
        id: `ord-${Date.now()}`,
        carId,
        status: "new",
        createdAt: new Date().toISOString(),
        paidAmount: Math.round(totalAmount * 0.3),
        totalAmount,
      };

      if (user) {
        const res = await fetch("/api/cabinet/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ carId, totalAmount }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.order) order = data.order as Order;
        }
      }

      setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
      setItems((prev) => prev.filter((i) => i.carId !== carId));
      return order;
    },
    [user]
  );

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      if (user) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-local-${Date.now()}`,
            text: trimmed,
            from: "client",
            createdAt: new Date().toISOString(),
          },
        ]);
        void fetch("/api/cabinet/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (Array.isArray(data.messages)) setMessages(data.messages);
          })
          .catch(() => undefined);
        return;
      }

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
    },
    [user]
  );

  const addDocument = useCallback(
    async (file: File, kind: CabinetDocKind) => {
      if (user) {
        const form = new FormData();
        form.append("file", file);
        form.append("kind", kind);
        const res = await fetch("/api/cabinet/docs", {
          method: "POST",
          body: form,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "upload failed");
        }
        const doc = data.document as UploadedDoc;
        setDocuments((prev) => {
          const withoutSameKind =
            kind === "other" ? prev : prev.filter((d) => d.kind !== kind);
          return [...withoutSameKind, doc];
        });
        return;
      }

      const id = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await saveDocFile(id, file);
      setDocuments((prev) => {
        const withoutSameKind =
          kind === "other" ? prev : prev.filter((d) => d.kind !== kind);
        return [
          ...withoutSameKind,
          {
            id,
            name: file.name,
            uploadedAt: new Date().toISOString(),
            kind,
            mime: file.type || undefined,
            size: file.size,
            hasFile: true,
          },
        ];
      });
    },
    [user]
  );

  const removeDocument = useCallback(
    async (id: string) => {
      if (user) {
        await fetch(`/api/cabinet/docs/${id}`, { method: "DELETE" });
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        return;
      }
      try {
        await deleteDocFile(id);
      } catch {
        /* ignore */
      }
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    },
    [user]
  );

  const openDocument = useCallback(
    async (id: string) => {
      if (user) {
        window.open(
          `/api/cabinet/docs/${id}/file`,
          "_blank",
          "noopener,noreferrer"
        );
        return;
      }
      const blob = await getDocFile(id);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    },
    [user]
  );

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
        updateCartDelivery,
        clearCart,
        cartCount: items.length,
        isInCart,
        checkout,
        sendMessage,
        addDocument,
        removeDocument,
        openDocument,
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