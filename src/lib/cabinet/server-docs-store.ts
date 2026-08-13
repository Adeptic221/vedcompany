import { promises as fs } from "fs";
import path from "path";
import { put, del } from "@vercel/blob";
import type { CabinetDocKind } from "@/lib/cabinet/documents";
import type { UploadedDoc } from "@/types/cart";
import {
  deleteGithubFile,
  readGithubBinaryFile,
  readGithubJsonFile,
  useRemoteJsonStore,
  writeGithubBinaryFile,
  writeGithubJsonFile,
} from "@/lib/storage/github-json";

const META_PATH = "data/cabinet-docs.json";
const LOCAL_META = path.join(process.cwd(), "data", "cabinet-docs.json");
const LOCAL_FILES = path.join(process.cwd(), "data", "cabinet-files");

async function readMeta(): Promise<UploadedDoc[]> {
  if (useRemoteJsonStore()) {
    try {
      const { data } = await readGithubJsonFile<UploadedDoc[]>(META_PATH, []);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn("[docs] github meta read failed", err);
    }
  }
  try {
    const raw = await fs.readFile(LOCAL_META, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeMeta(docs: UploadedDoc[]): Promise<void> {
  if (useRemoteJsonStore()) {
    await writeGithubJsonFile(META_PATH, docs, "chore: update cabinet docs meta");
    try {
      await fs.mkdir(path.dirname(LOCAL_META), { recursive: true });
      await fs.writeFile(LOCAL_META, JSON.stringify(docs, null, 2), "utf8");
    } catch {
      /* ignore local on serverless */
    }
    return;
  }
  await fs.mkdir(path.dirname(LOCAL_META), { recursive: true });
  await fs.writeFile(LOCAL_META, JSON.stringify(docs, null, 2), "utf8");
}

function hasBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function listAllDocs(): Promise<UploadedDoc[]> {
  return readMeta();
}

export async function listUserDocs(userId: string): Promise<UploadedDoc[]> {
  const all = await readMeta();
  return all.filter((d) => d.userId === userId);
}

export async function saveUserDoc(input: {
  userId: string;
  userEmail: string;
  kind: CabinetDocKind;
  fileName: string;
  mime: string;
  bytes: Buffer;
}): Promise<UploadedDoc> {
  const id = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const safeName = input.fileName.replace(/[^\w.\-()+ ]+/g, "_").slice(0, 120);
  let storage: UploadedDoc["storage"] = "local";
  let storagePath = `${input.userId}/${id}-${safeName}`;
  let url: string | undefined;

  if (hasBlob()) {
    const blob = await put(`cabinet-docs/${storagePath}`, input.bytes, {
      access: "public",
      contentType: input.mime || "application/octet-stream",
    });
    storage = "blob";
    url = blob.url;
    storagePath = blob.pathname;
  } else if (useRemoteJsonStore()) {
    const ghPath = `data/cabinet-files/${storagePath}`;
    await writeGithubBinaryFile(ghPath, input.bytes, `chore: upload doc ${id}`);
    storage = "github";
    storagePath = ghPath;
  } else {
    const full = path.join(LOCAL_FILES, storagePath);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, input.bytes);
    storage = "local";
  }

  const doc: UploadedDoc = {
    id,
    name: input.fileName,
    uploadedAt: new Date().toISOString(),
    kind: input.kind,
    mime: input.mime || undefined,
    size: input.bytes.length,
    hasFile: true,
    userId: input.userId,
    userEmail: input.userEmail,
    url,
    storage,
    storagePath,
  };

  const all = await readMeta();
  const next =
    input.kind === "other"
      ? [...all, doc]
      : [...all.filter((d) => !(d.userId === input.userId && d.kind === input.kind)), doc];
  await writeMeta(next);
  return doc;
}

export async function deleteUserDoc(
  docId: string,
  userId?: string
): Promise<boolean> {
  const all = await readMeta();
  const doc = all.find((d) => d.id === docId);
  if (!doc) return false;
  if (userId && doc.userId !== userId) return false;

  if (doc.storage === "blob" && doc.url && hasBlob()) {
    try {
      await del(doc.url);
    } catch (err) {
      console.warn("[docs] blob delete failed", err);
    }
  } else if (doc.storage === "github" && doc.storagePath) {
    await deleteGithubFile(doc.storagePath, `chore: delete doc ${docId}`);
  } else if (doc.storagePath) {
    try {
      await fs.unlink(path.join(LOCAL_FILES, doc.storagePath));
    } catch {
      /* ignore */
    }
  }

  await writeMeta(all.filter((d) => d.id !== docId));
  return true;
}

export async function readDocBytes(doc: UploadedDoc): Promise<{
  bytes: Buffer;
  mime: string;
  name: string;
} | null> {
  if (doc.storage === "blob" && doc.url) {
    const res = await fetch(doc.url);
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    return {
      bytes: Buffer.from(ab),
      mime: doc.mime || "application/octet-stream",
      name: doc.name,
    };
  }
  if (doc.storage === "github" && doc.storagePath) {
    const bytes = await readGithubBinaryFile(doc.storagePath);
    if (!bytes) return null;
    return {
      bytes,
      mime: doc.mime || "application/octet-stream",
      name: doc.name,
    };
  }
  if (doc.storagePath) {
    try {
      const bytes = await fs.readFile(path.join(LOCAL_FILES, doc.storagePath));
      return {
        bytes,
        mime: doc.mime || "application/octet-stream",
        name: doc.name,
      };
    } catch {
      return null;
    }
  }
  return null;
}

export async function getDocById(id: string): Promise<UploadedDoc | null> {
  const all = await readMeta();
  return all.find((d) => d.id === id) || null;
}