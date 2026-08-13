import { promises as fs } from "fs";
import path from "path";
import type { ChatMessage } from "@/types/cart";
import {
  readGithubJsonFile,
  useRemoteJsonStore,
  writeGithubJsonFile,
} from "@/lib/storage/github-json";

export type ChatThread = {
  userId: string;
  userEmail?: string;
  userName?: string;
  messages: ChatMessage[];
  updatedAt: string;
};

const REMOTE = "data/chats.json";
const LOCAL = path.join(process.cwd(), "data", "chats.json");

async function readAll(): Promise<ChatThread[]> {
  if (useRemoteJsonStore()) {
    try {
      const { data } = await readGithubJsonFile<ChatThread[]>(REMOTE, []);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn("[chat] github read failed", err);
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

async function writeAll(threads: ChatThread[]): Promise<void> {
  if (useRemoteJsonStore()) {
    await writeGithubJsonFile(REMOTE, threads, "chore: update chats");
    try {
      await fs.mkdir(path.dirname(LOCAL), { recursive: true });
      await fs.writeFile(LOCAL, JSON.stringify(threads, null, 2), "utf8");
    } catch {
      /* ignore */
    }
    return;
  }
  await fs.mkdir(path.dirname(LOCAL), { recursive: true });
  await fs.writeFile(LOCAL, JSON.stringify(threads, null, 2), "utf8");
}

function welcome(userId: string): ChatMessage {
  return {
    id: "welcome",
    userId,
    text: "Здравствуйте! Я ваш менеджер ВЭД. Помогу с выбором авто, документами и отслеживанием заказа.",
    from: "manager",
    createdAt: new Date().toISOString(),
  };
}

export async function listThreads(): Promise<ChatThread[]> {
  const all = await readAll();
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getThread(userId: string): Promise<ChatThread> {
  const all = await readAll();
  const found = all.find((t) => t.userId === userId);
  if (found) return found;
  return {
    userId,
    messages: [welcome(userId)],
    updatedAt: new Date().toISOString(),
  };
}

export async function appendMessage(input: {
  userId: string;
  userEmail?: string;
  userName?: string;
  text: string;
  from: "client" | "manager";
}): Promise<ChatThread> {
  const all = await readAll();
  let idx = all.findIndex((t) => t.userId === input.userId);
  if (idx < 0) {
    all.push({
      userId: input.userId,
      userEmail: input.userEmail,
      userName: input.userName,
      messages: [welcome(input.userId)],
      updatedAt: new Date().toISOString(),
    });
    idx = all.length - 1;
  }
  const msg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: input.userId,
    text: input.text.trim(),
    from: input.from,
    createdAt: new Date().toISOString(),
  };
  all[idx] = {
    ...all[idx],
    userEmail: input.userEmail || all[idx].userEmail,
    userName: input.userName || all[idx].userName,
    messages: [...all[idx].messages, msg],
    updatedAt: msg.createdAt,
  };
  await writeAll(all);
  return all[idx];
}