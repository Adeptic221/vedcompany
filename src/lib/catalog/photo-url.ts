/** Normalize Wikimedia photo URLs so they load in the browser. */
export function normalizeCarPhotoUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "upload.wikimedia.org") return url;

    const parts = parsed.pathname.split("/").filter(Boolean);
    const thumbIdx = parts.indexOf("thumb");

    if (thumbIdx !== -1) {
      const a = parts[thumbIdx + 1];
      const ab = parts[thumbIdx + 2];
      const filename = decodeURIComponent(parts[thumbIdx + 3] || "");
      if (!a || !ab || !filename) return url;
      const safeName = filename.replace(/ /g, "%20");
      return `https://upload.wikimedia.org/wikipedia/commons/${a}/${ab}/${safeName}`;
    }

    const decoded = parts.map((p) => decodeURIComponent(p));
    const safe = decoded.map((p) => p.replace(/ /g, "%20"));
    return `https://upload.wikimedia.org/${safe.join("/")}`;
  } catch {
    return url;
  }
}