import { getGithubCatalogConfig } from "@/lib/storage/github-catalog";

type GithubContentResponse = {
  sha?: string;
  content?: string;
  message?: string;
};

async function githubFetch(
  token: string,
  urlPath: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(`https://api.github.com${urlPath}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "vedcompany-json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
}

export function useRemoteJsonStore(): boolean {
  return Boolean(process.env.VERCEL || process.env.AUTH_USE_GITHUB === "1");
}

export async function readGithubJsonFile<T>(
  path: string,
  fallback: T
): Promise<{ data: T; sha: string }> {
  const config = getGithubCatalogConfig();
  if (!config) return { data: fallback, sha: "" };

  const urlPath =
    `/repos/${config.owner}/${config.repo}/contents/${path}` +
    `?ref=${encodeURIComponent(config.branch)}`;
  const res = await githubFetch(config.token, urlPath);
  if (res.status === 404) return { data: fallback, sha: "" };
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub read ${path} failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const body = (await res.json()) as GithubContentResponse;
  if (!body.content) return { data: fallback, sha: body.sha || "" };
  const raw = Buffer.from(body.content.replace(/\n/g, ""), "base64").toString("utf8");
  return { data: JSON.parse(raw) as T, sha: body.sha || "" };
}

export async function writeGithubJsonFile(
  path: string,
  data: unknown,
  message: string
): Promise<void> {
  const config = getGithubCatalogConfig();
  if (!config) throw new Error("GitHub persistence is not configured");

  const urlPath = `/repos/${config.owner}/${config.repo}/contents/${path}`;
  let sha: string | undefined;
  const existing = await githubFetch(
    config.token,
    `${urlPath}?ref=${encodeURIComponent(config.branch)}`
  );
  if (existing.ok) {
    const body = (await existing.json()) as GithubContentResponse;
    sha = body.sha;
  } else if (existing.status !== 404) {
    const text = await existing.text();
    throw new Error(`GitHub sha ${path} failed (${existing.status}): ${text.slice(0, 200)}`);
  }

  const res = await githubFetch(config.token, urlPath, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: Buffer.from(JSON.stringify(data, null, 2), "utf8").toString("base64"),
      branch: config.branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub write ${path} failed (${res.status}): ${text.slice(0, 300)}`);
  }
}

export async function writeGithubBinaryFile(
  path: string,
  bytes: Buffer,
  message: string
): Promise<void> {
  const config = getGithubCatalogConfig();
  if (!config) throw new Error("GitHub persistence is not configured");

  const urlPath = `/repos/${config.owner}/${config.repo}/contents/${path}`;
  let sha: string | undefined;
  const existing = await githubFetch(
    config.token,
    `${urlPath}?ref=${encodeURIComponent(config.branch)}`
  );
  if (existing.ok) {
    const body = (await existing.json()) as GithubContentResponse;
    sha = body.sha;
  } else if (existing.status !== 404) {
    const text = await existing.text();
    throw new Error(`GitHub sha ${path} failed (${existing.status}): ${text.slice(0, 200)}`);
  }

  const res = await githubFetch(config.token, urlPath, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: bytes.toString("base64"),
      branch: config.branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub binary write ${path} failed (${res.status}): ${text.slice(0, 300)}`);
  }
}

export async function readGithubBinaryFile(path: string): Promise<Buffer | null> {
  const config = getGithubCatalogConfig();
  if (!config) return null;
  const urlPath =
    `/repos/${config.owner}/${config.repo}/contents/${path}` +
    `?ref=${encodeURIComponent(config.branch)}`;
  const res = await githubFetch(config.token, urlPath);
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const body = (await res.json()) as GithubContentResponse;
  if (!body.content) return null;
  return Buffer.from(body.content.replace(/\n/g, ""), "base64");
}

export async function deleteGithubFile(path: string, message: string): Promise<void> {
  const config = getGithubCatalogConfig();
  if (!config) return;
  const urlPath = `/repos/${config.owner}/${config.repo}/contents/${path}`;
  const existing = await githubFetch(
    config.token,
    `${urlPath}?ref=${encodeURIComponent(config.branch)}`
  );
  if (!existing.ok) return;
  const body = (await existing.json()) as GithubContentResponse;
  if (!body.sha) return;
  await githubFetch(config.token, urlPath, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      sha: body.sha,
      branch: config.branch,
    }),
  });
}