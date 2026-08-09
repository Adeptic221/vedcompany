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
}

export interface ChatMessage {
  id: string;
  text: string;
  from: "client" | "manager";
  createdAt: string;
}

export interface UploadedDoc {
  id: string;
  name: string;
  uploadedAt: string;
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
