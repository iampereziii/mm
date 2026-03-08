import { config } from "../config.js";

const authHeader = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString("base64")}`;
const apiBase = `${config.baseUrl}/${config.instancePath}/.rest`;

export async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${apiBase}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  console.error(`--> ${url}`);
  const response = await fetch(url, {
    headers: {
      Authorization: authHeader,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Magnolia API error ${response.status}: ${response.statusText} — ${url}`);
  }

  return response.json() as Promise<T>;
}
