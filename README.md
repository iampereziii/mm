# mm — Magnolia Node CLI

A command-line tool for browsing, inspecting, and migrating [Magnolia CMS](https://www.magnolia-cms.com/) nodes via the REST API.

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- A running Magnolia CMS instance

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Configure environment**

Copy the example env file and fill in your Magnolia credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Source instance (all commands)
MAGNOLIA_BASE_URL=http://localhost:8080
MAGNOLIA_USERNAME=superuser
MAGNOLIA_PASSWORD=superuser
MAGNOLIA_INSTANCE_PATH=magnoliaAuthor

# Target instance (migrate command only)
MAGNOLIA_TARGET_BASE_URL=http://target:8080
MAGNOLIA_TARGET_USERNAME=superuser
MAGNOLIA_TARGET_PASSWORD=superuser
MAGNOLIA_TARGET_INSTANCE_PATH=magnoliaAuthor
```

## Running

### Development (no build step)

```bash
npm run dev -- <command> [path] [options]
```

### Production (build first)

```bash
npm run build
npm start -- <command> [path] [options]
```

## Commands

| Command | Description |
|---|---|
| `get <path> [depth]` | Fetch a node as JSON (default depth: 0) |
| `list <path>` | List immediate children of a node |
| `print <path> [depth]` | Pretty-print the node tree (default depth: 1) |
| `schema <path>` | Export page as recreatable schema (areas → components → props) → `schema.json` |
| `components <path>` | List all `mgnl:component` nodes on a page → `response.json` |
| `migrate [schema.json] [migration.json]` | Recreate a page from schema on the target instance |

### Examples

```bash
# List children of root
npm run dev -- list /

# Get a node as JSON with depth 2
npm run dev -- get /website 2

# Pretty-print a node tree
npm run dev -- print /website/home

# Extract page schema
npm run dev -- schema /website/home

# List all components on a page
npm run dev -- components /website/home

# Migrate a page to a target instance
npm run dev -- migrate
```

## Migration workflow

Use `schema` + `migrate` together to recreate a page on a different Magnolia instance with different templates.

**1. Export the source page**

```bash
mm schema /website/my-site/my-page
# writes schema.json
```

**2. Create `migration.json`**

Maps source component templates to their equivalents on the target instance:

```json
{
  "pageTemplate": "target-module:pages/articleDetail/articleDetail",
  "componentTemplates": {
    "source-module:components/hero/hero": "target-module:components/hero/heroBanner",
    "source-module:components/text/text": "target-module:components/richText/richText"
  }
}
```

Components with no entry in `componentTemplates` are skipped with a warning.

**3. Set target credentials in `.env`**

```env
MAGNOLIA_TARGET_BASE_URL=http://target:8080
MAGNOLIA_TARGET_USERNAME=superuser
MAGNOLIA_TARGET_PASSWORD=superuser
MAGNOLIA_TARGET_INSTANCE_PATH=magnoliaAuthor
```

**4. Run the migration**

```bash
mm migrate
# or with custom file paths:
mm migrate my-schema.json my-migration.json
```

The target page path is taken from `sourcePath` in `schema.json`. The parent node must already exist on the target instance.

## Install as global CLI (optional)

```bash
npm run build
npm link
```

Then use it directly:

```bash
mm list /
mm get /website 1
mm print /website/home
```
