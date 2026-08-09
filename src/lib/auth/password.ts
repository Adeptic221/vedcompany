function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function deriveKey(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBytes(saltHex) as BufferSource,
      iterations: 120_000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  return bytesToHex(new Uint8Array(bits));
}

export async function hashPassword(password: string): Promise<{
  hash: string;
  salt: string;
}> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = bytesToHex(saltBytes);
  const hash = await deriveKey(password, salt);
  return { hash, salt };
}

export async function verifyPassword(
  password: string,
  hash: string,
  salt: string
): Promise<boolean> {
  const next = await deriveKey(password, salt);
  if (next.length !== hash.length) return false;
  let ok = true;
  for (let i = 0; i < next.length; i++) {
    if (next.charCodeAt(i) !== hash.charCodeAt(i)) ok = false;
  }
  return ok;
}