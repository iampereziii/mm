import { config } from "../config.js";

function getTargetConfig(): { baseUrl: string; auth: string; instancePath: string } {
  const { targetBaseUrl, targetUsername, targetPassword, targetInstancePath } = config;
  if (!targetBaseUrl || !targetUsername || !targetPassword || !targetInstancePath) {
    throw new Error(
      "Missing required env vars for target instance: MAGNOLIA_TARGET_BASE_URL, MAGNOLIA_TARGET_USERNAME, MAGNOLIA_TARGET_PASSWORD, MAGNOLIA_TARGET_INSTANCE_PATH",
    );
  }
  return {
    baseUrl: targetBaseUrl,
    auth: `Basic ${Buffer.from(`${targetUsername}:${targetPassword}`).toString("base64")}`,
    instancePath: targetInstancePath,
  };
}

export async function targetApiFetch<T>(path: string, method: string, body?: unknown): Promise<T> {
  const { baseUrl, auth, instancePath } = getTargetConfig();
  const url = new URL(`${baseUrl}/${instancePath}/.rest-v2${path}`);

  console.error(`--> ${method} ${url}`);

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : null,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Target API error ${response.status}: ${response.statusText} — ${url}\n${text}`);
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
