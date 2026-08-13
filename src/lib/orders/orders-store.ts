import { promises as fs } from "fs";
import path from "path";
import type { Order, OrderStatus } from "@/types/cart";
import {
  readGithubJsonFile,
  useRemoteJsonStore,
  writeGithubJsonFile,
} from "@/lib/storage/github-json";

const REMOTE = "data/orders.json";
const LOCAL = path.join(process.cwd(), "data", "orders.json");

async function readAll(): Promise<Order[]> {
  if (useRemoteJsonStore()) {
    try {
      const { data } = await readGithubJsonFile<Order[]>(REMOTE, []);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn("[orders] github read failed", err);
    }
  }
  try {
    const raw = await fs.readFile(LOCAL, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(orders: Order[]): Promise<void> {
  if (useRemoteJsonStore()) {
    await writeGithubJsonFile(REMOTE, orders, "chore: update orders");
    try {
      await fs.mkdir(path.dirname(LOCAL), { recursive: true });
      await fs.writeFile(LOCAL, JSON.stringify(orders, null, 2), "utf8");
    } catch {
      /* ignore */
    }
    return;
  }
  await fs.mkdir(path.dirname(LOCAL), { recursive: true });
  await fs.writeFile(LOCAL, JSON.stringify(orders, null, 2), "utf8");
}

export async function listOrders(): Promise<Order[]> {
  const all = await readAll();
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listUserOrders(userId: string): Promise<Order[]> {
  return (await listOrders()).filter((o) => o.userId === userId);
}

export async function createOrder(input: {
  carId: string;
  paidAmount: number;
  totalAmount: number;
  userId?: string;
  userEmail?: string;
  userName?: string;
  status?: OrderStatus;
}): Promise<Order> {
  const order: Order = {
    id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: input.status || "new",
    carId: input.carId,
    paidAmount: input.paidAmount,
    totalAmount: input.totalAmount,
    userId: input.userId,
    userEmail: input.userEmail,
    userName: input.userName,
  };
  const all = await readAll();
  all.unshift(order);
  await writeAll(all);
  return order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  const all = await readAll();
  const idx = all.findIndex((o) => o.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], status };
  await writeAll(all);
  return all[idx];
}
