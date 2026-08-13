import { promises as fs } from "fs";
import path from "path";
import type { PublicUser, UserRecord } from "@/types/user";
import {
  fetchUsersFromGithub,
  pushUsersToGithub,
} from "@/lib/storage/github-users";
import { normalizePhone, phoneToEmail } from "@/lib/auth/phone";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

function toPublic(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    createdAt: user.createdAt,
  };
}

async function readLocal(): Promise<UserRecord[]> {
  try {
    const raw = await fs.readFile(USERS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UserRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeLocal(users: UserRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

function useGithubUsers(): boolean {
  return Boolean(process.env.VERCEL || process.env.AUTH_USE_GITHUB === "1");
}
export async function listUsers(): Promise<UserRecord[]> {
  if (useGithubUsers()) {
    try {
      const fromGh = await fetchUsersFromGithub();
      if (fromGh) return fromGh.users;
    } catch (err) {
      console.warn("[users] GitHub read failed:", err);
    }
  }
  return readLocal();
}


export async function saveUsers(users: UserRecord[]): Promise<void> {
  // On Vercel the deploy filesystem is read-only — local write would throw
  // and break registration. Persist to GitHub there; keep local for dev.
  if (useGithubUsers()) {
    await pushUsersToGithub(users, "chore: update users store");
    try {
      await writeLocal(users);
    } catch (err) {
      console.warn("[users] local write skipped on serverless:", err);
    }
    return;
  }
  await writeLocal(users);
}

export async function findUserByEmail(
  email: string
): Promise<UserRecord | null> {
  const normalized = email.trim().toLowerCase();
  const users = await listUsers();
  return users.find((u) => u.email === normalized) || null;
}

export async function findUserByPhone(
  phone: string
): Promise<UserRecord | null> {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  const users = await listUsers();
  return (
    users.find((u) => normalizePhone(u.phone || "") === normalized) || null
  );
}

export async function createUser(input: {
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  passwordSalt: string;
}): Promise<PublicUser> {
  const users = await listUsers();
  const email = input.email.trim().toLowerCase();
  if (users.some((u) => u.email === email)) {
    throw new Error("EMAIL_TAKEN");
  }

  const phoneNorm = normalizePhone(input.phone || "") || input.phone.trim();
  if (phoneNorm && users.some((u) => normalizePhone(u.phone || "") === phoneNorm)) {
    throw new Error("PHONE_TAKEN");
  }

  const user: UserRecord = {
    id: crypto.randomUUID(),
    email,
    name: input.name.trim(),
    phone: phoneNorm,
    passwordHash: input.passwordHash,
    passwordSalt: input.passwordSalt,
    authProvider: "email",
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await saveUsers(users);
  return toPublic(user);
}

export async function upsertUserByPhone(input: {
  phone: string;
  name?: string;
}): Promise<PublicUser> {
  const phone = normalizePhone(input.phone);
  if (!phone) throw new Error("INVALID_PHONE");

  const users = await listUsers();
  const idx = users.findIndex((u) => normalizePhone(u.phone || "") === phone);

  if (idx >= 0) {
    if (input.name && input.name.trim().length >= 2) {
      users[idx].name = input.name.trim();
    }
    await saveUsers(users);
    return toPublic(users[idx]);
  }

  const user: UserRecord = {
    id: crypto.randomUUID(),
    email: phoneToEmail(phone),
    name: (input.name || "").trim() || "Клиент",
    phone,
    authProvider: "sms",
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await saveUsers(users);
  return toPublic(user);
}

export async function updateUserProfile(
  userId: string,
  patch: { name?: string; phone?: string }
): Promise<PublicUser | null> {
  const users = await listUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return null;

  if (typeof patch.name === "string") users[idx].name = patch.name.trim();
  if (typeof patch.phone === "string") {
    const phoneNorm = normalizePhone(patch.phone) || patch.phone.trim();
    users[idx].phone = phoneNorm;
  }

  await saveUsers(users);
  return toPublic(users[idx]);
}


export async function updateUserPassword(
  email: string,
  passwordHash: string,
  passwordSalt: string
): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const users = await listUsers();
  const idx = users.findIndex((u) => u.email === normalized);
  if (idx < 0) return false;
  users[idx].passwordHash = passwordHash;
  users[idx].passwordSalt = passwordSalt;
  if (!users[idx].authProvider) users[idx].authProvider = "email";
  await saveUsers(users);
  return true;
}
export { toPublic };