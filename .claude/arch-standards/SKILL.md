---
name: arch-standards
description: Architectural standards for Node.js/TypeScript CLI tools that consume REST APIs (like this Magnolia mm project). Use when adding new commands, new API integrations, new modules, or when reviewing code structure.
user-invocable: true
---

# Architecture Standards — Node.js TypeScript CLI

This skill enforces the architectural patterns used in this project. Follow these standards whenever adding or modifying code.

---

## Project Layout

```
src/
├── index.ts          # Entry point — CLI command routing only
├── config.ts         # Env var loading — all config lives here
├── api/
│   ├── client.ts     # Generic HTTP fetch wrapper
│   └── nodes.ts      # Domain-specific API calls (one file per API resource)
└── types/
    └── magnolia.ts   # TypeScript interfaces for API response shapes
```

Rules:

- `index.ts` only routes commands and calls functions — no business logic
- `config.ts` is the single source of truth for all env vars
- `api/client.ts` handles auth, base URL, and error handling — nothing else
- Domain functions go in `api/<resource>.ts`, not in `client.ts` or `index.ts`
- Types go in `types/<domain>.ts`, never inline in API or index files

---

## Config (`src/config.ts`)

All environment variables are loaded here using a `required()` helper.

```ts
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
} as const;
```

Rules:

- Every required env var uses `required()` — no silent fallbacks to empty string
- Optional env vars use `process.env["VAR"] ?? "default"` and are documented
- `config` is `as const` — treat it as immutable
- Nothing else reads `process.env` directly — all env access goes through `config`

---

## HTTP Client (`src/api/client.ts`)

A single `apiFetch<T>` function handles all HTTP calls.

```ts
export async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T>
```

Rules:

- Auth header and base URL are constructed once at module load, not per call
- Query params are passed as `Record<string, string>` and appended via `URLSearchParams`
- On non-OK response: throw with status code, status text, and full URL
- Return type is always generic `T` — the caller (domain module) asserts the type
- Log the full request URL to stderr before each fetch for debugging

---

## Domain API Modules (`src/api/<resource>.ts`)

Each API resource gets its own file.

```ts
// nodes.ts
export interface GetNodeOptions {
  depth?: number;
  excludeNodeTypes?: string[];
}

export function getNode(nodePath: string, options: GetNodeOptions = {}): Promise<MagnoliaNode> {
  const params: Record<string, string> = {};
  if (options.depth !== undefined) params["depth"] = String(options.depth);
  return apiFetch<MagnoliaNode>(`/nodes/v1/${WORKSPACE}${path}`, params);
}
```

Rules:

- Export typed option interfaces for functions with multiple params
- Normalize inputs before calling `apiFetch` (e.g., ensure leading `/` on paths)
- Convert typed options to `Record<string, string>` for query params — do not pass raw options to `apiFetch`
- Keep workspace/prefix constants at the top of the file, not hardcoded in function bodies
- No `console.log` in domain modules — only in `index.ts`

---

## Entry Point (`src/index.ts`)

Command routing via `switch` on `process.argv`.

```ts
const [, , command, nodePath = "/", ...rest] = process.argv;

async function main(): Promise<void> {
  switch (command) {
    case "get": { ... break; }
    case "list": { ... break; }
    default:
      console.log(`Usage: ...`);
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
```

Rules:

- Destructure `process.argv` at the top — do not access it inside `main()`
- Each command is a `case` block with `break` — no fall-through
- Default case always prints usage
- `main()` is always `async` and always caught with `.catch()` + `process.exit(1)`
- Output goes to `console.log` (stdout); errors and debug logs go to `console.error` (stderr)
- Formatting/printing helpers (`printNode`) live in `index.ts` if only used there

---

## TypeScript Standards

```jsonc
// tsconfig.json key settings
"module": "nodenext",
"target": "esnext",
"strict": true,
"verbatimModuleSyntax": true,
"noUncheckedIndexedAccess": true,
"exactOptionalPropertyTypes": true,
```

Rules:

- ESM only — `"type": "module"` in `package.json`, `.js` extensions in all imports
- Use `import type` for type-only imports (`verbatimModuleSyntax` enforces this)
- No `any` — use `unknown` and narrow
- Prefer `interface` for API shapes, `type` for unions and aliases
- `as const` on config and static lookup objects

---

## Env File

```
MAGNOLIA_BASE_URL=http://localhost:8080
MAGNOLIA_USERNAME=superuser
MAGNOLIA_PASSWORD=superuser
MAGNOLIA_INSTANCE_PATH=local
```

Rules:

- `.env.example` is committed with safe defaults — `.env` is gitignored
- Env is loaded via `node --env-file=.env` — no third-party dotenv library needed
- All vars are documented in `.env.example` — including optional ones (commented out)

---

## Dev vs Build

| Mode | Command | How it runs |
|---|---|---|
| Dev | `npm run dev -- <cmd>` | `tsx/esm` — no build step |
| Production | `npm run build && npm start -- <cmd>` | `tsc` → `node dist/index.js` |
| Global CLI | `npm link` after build | `mm <cmd>` |

Rules:

- `tsx` is devDependency only — never required at runtime
- Build output goes to `dist/` — never commit `dist/`
- `bin.mm` in `package.json` points to `./dist/index.js` for global install

---

## Adding a New Command

1. Add the fetch function in `src/api/<resource>.ts`
2. Add types in `src/types/<domain>.ts` if needed
3. Add a `case` in the `switch` in `src/index.ts`
4. Update the usage string in the `default` case
5. Update `README.md` commands table

## Adding a New API Resource

1. Create `src/api/<resource>.ts` — import `apiFetch` from `./client.js`
2. Create `src/types/<resource>.ts` if the response shape is non-trivial
3. Export typed option interfaces alongside the functions
4. Import and use from `src/index.ts`
