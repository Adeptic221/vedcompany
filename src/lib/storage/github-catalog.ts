import type { Car } from "@/types/car";

const CATALOG_REPO_PATH = "data/cars.catalog.json";

export type GithubCatalogConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  path: string;
};

function parseRepo(raw: string | undefined): { owner?: string; repo?: string } {
  if (!raw) return {};
  const trimmed = raw.trim();
  if (!trimmed) return {};
  if (trimmed.includes("/")) {
    const [owner, repo] = trimmed.split("/");
    return { owner: owner || undefined, repo: repo || undefined };
  }
  return { repo: trimmed };
}

export function getGithubCatalogConfig(): GithubCatalogConfig | null {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) return null;

  const parsed = parseRepo(process.env.GITHUB_REPO);
  const owner = process.env.GITHUB_OWNER?.trim() || parsed.owner;
  const repo = parsed.repo;
  const branch = process.env.GITHUB_BRANCH?.trim() || "main";

  if (!owner || !repo) return null;

  return {
    token,
    owner,
    repo,
    branch,
    path: CATALOG_REPO_PATH,
  };
}

export function isGithubCatalogEnabled(): boolean {
  return getGithubCatalogConfig() !== null;
}

type GithubContentResponse = {
  sha?: string;
  content?: string;
  encoding?: string;
  message?: string;
};

async function githubFetch(
  config: GithubCatalogConfig,
  urlPath: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(`https://api.github.com${urlPath}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "vedcompany-cars-catalog",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
}

function decodeBase64Content(content: string): string {
  return Buffer.from(content.replace(/\n/g, ""), "base64").toString("utf8");
}

export async function fetchCatalogFromGithub(): Promise<{
  cars: Car[];
  sha: string;
} | null> {
  const config = getGithubCatalogConfig();
  if (!config) return null;

  const urlPath =
    `/repos/${config.owner}/${config.repo}/contents/${config.path}` +
    `?ref=${encodeURIComponent(config.branch)}`;

  const res = await githubFetch(config, urlPath);
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub catalog fetch failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as GithubContentResponse;
  if (!data.content || !data.sha) return null;

  const parsed = JSON.parse(decodeBase64Content(data.content)) as Car[];
  if (!Array.isArray(parsed)) {
    throw new Error("GitHub catalog JSON is not an array");
  }

  return { cars: parsed, sha: data.sha };
}

export async function pushCatalogToGithub(
  cars: Car[],
  message: string
): Promise<void> {
  const config = getGithubCatalogConfig();
  if (!config) {
    throw new Error("GitHub catalog persistence is not configured");
  }

  const urlPath = `/repos/${config.owner}/${config.repo}/contents/${config.path}`;
  let sha: string | undefined;

  const existing = await githubFetch(
    config,
    `${urlPath}?ref=${encodeURIComponent(config.branch)}`
  );
  if (existing.ok) {
    const data = (await existing.json()) as GithubContentResponse;
    sha = data.sha;
  } else if (existing.status !== 404) {
    const text = await existing.text();
    throw new Error(`GitHub catalog sha lookup failed (${existing.status}): ${text.slice(0, 200)}`);
  }

  const body = {
    message,
    content: Buffer.from(JSON.stringify(cars, null, 2), "utf8").toString("base64"),
    branch: config.branch,
    ...(sha ? { sha } : {}),
  };

  let res = await githubFetch(config, urlPath, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // Retry once on conflict (concurrent admin edits).
  if (res.status === 409 || res.status === 422) {
    const latest = await fetchCatalogFromGithub();
    if (latest?.sha) {
      res = await githubFetch(config, urlPath, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, sha: latest.sha }),
      });
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub catalog push failed (${res.status}): ${text.slice(0, 300)}`);
  }
}
