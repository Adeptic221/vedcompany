import type { UserRecord } from "@/types/user";
import { getGithubCatalogConfig } from "@/lib/storage/github-catalog";

const USERS_REPO_PATH = "data/users.json";

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
      "User-Agent": "vedcompany-users",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
}

function decodeBase64Content(content: string): string {
  return Buffer.from(content.replace(/\n/g, ""), "base64").toString("utf8");
}

function getUsersGithubConfig() {
  const base = getGithubCatalogConfig();
  if (!base) return null;
  return { ...base, path: USERS_REPO_PATH };
}

export async function fetchUsersFromGithub(): Promise<{
  users: UserRecord[];
  sha: string;
} | null> {
  const config = getUsersGithubConfig();
  if (!config) return null;

  const urlPath =
    `/repos/${config.owner}/${config.repo}/contents/${config.path}` +
    `?ref=${encodeURIComponent(config.branch)}`;

  const res = await githubFetch(config.token, urlPath);
  if (res.status === 404) return { users: [], sha: "" };
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub users fetch failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as GithubContentResponse;
  if (!data.content || !data.sha) return { users: [], sha: "" };

  const parsed = JSON.parse(decodeBase64Content(data.content));
  if (!Array.isArray(parsed)) {
    throw new Error("GitHub users JSON is not an array");
  }

  return { users: parsed as UserRecord[], sha: data.sha };
}

export async function pushUsersToGithub(
  users: UserRecord[],
  message: string
): Promise<void> {
  const config = getUsersGithubConfig();
  if (!config) {
    throw new Error("GitHub users persistence is not configured");
  }

  const urlPath = `/repos/${config.owner}/${config.repo}/contents/${config.path}`;
  let sha: string | undefined;

  const existing = await githubFetch(
    config.token,
    `${urlPath}?ref=${encodeURIComponent(config.branch)}`
  );
  if (existing.ok) {
    const data = (await existing.json()) as GithubContentResponse;
    sha = data.sha;
  } else if (existing.status !== 404) {
    const text = await existing.text();
    throw new Error(
      `GitHub users sha lookup failed (${existing.status}): ${text.slice(0, 200)}`
    );
  }

  const body = {
    message,
    content: Buffer.from(JSON.stringify(users, null, 2), "utf8").toString(
      "base64"
    ),
    branch: config.branch,
    ...(sha ? { sha } : {}),
  };

  const res = await githubFetch(config.token, urlPath, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub users push failed (${res.status}): ${text.slice(0, 300)}`);
  }
}