function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const config = {
  baseUrl: required("MAGNOLIA_BASE_URL"),
  username: required("MAGNOLIA_USERNAME"),
  password: required("MAGNOLIA_PASSWORD"),
  instancePath: required("MAGNOLIA_INSTANCE_PATH"),
  targetBaseUrl: process.env["MAGNOLIA_TARGET_BASE_URL"],
  targetUsername: process.env["MAGNOLIA_TARGET_USERNAME"],
  targetPassword: process.env["MAGNOLIA_TARGET_PASSWORD"],
  targetInstancePath: process.env["MAGNOLIA_TARGET_INSTANCE_PATH"],
} as const;
