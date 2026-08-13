import type { CabinetDocKind } from "@/lib/cabinet/documents";

export type DeliveryDestination = "none" | "vladivostok" | "moscow";

export interface CartItem {
  carId: string;
  addedAt: string;
  deliveryDestination: DeliveryDestination;
}

export type OrderStatus =
  | "new"
  | "manager"
  | "documents"
  | "customs"
  | "shipping"
  | "done";

export interface Order {
  id: string;
  carId: string;
  status: OrderStatus;
  createdAt: string;
  paidAmount: number;
  totalAmount: number;
  userId?: string;
  userEmail?: string;
  userName?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  from: "client" | "manager";
  createdAt: string;
  userId?: string;
}

export interface UploadedDoc {
  id: string;
  name: string;
  uploadedAt: string;
  kind?: CabinetDocKind;
  mime?: string;
  size?: number;
  hasFile?: boolean;
  userId?: string;
  userEmail?: string;
  url?: string;
  storage?: "blob" | "github" | "local";
  storagePath?: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  email?: string;
}

export interface FavoriteItem {
  carId: string;
  addedAt: string;
}