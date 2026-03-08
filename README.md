# mm — Magnolia Node CLI

A command-line tool for browsing and inspecting [Magnolia CMS](https://www.magnolia-cms.com/) nodes via the REST API.

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
MAGNOLIA_BASE_URL=http://localhost:8080
MAGNOLIA_USERNAME=superuser
MAGNOLIA_PASSWORD=superuser
# MAGNOLIA_INSTANCE_PATH=magnoliaAuthor  # optional, defaults to magnoliaAuthor
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

### Examples

```bash
# List children of root
npm run dev -- list /

# Get a node as JSON with depth 2
npm run dev -- get /website 2
#  npm run dev -- get /enterogermina-gold-br/pt-br/saude-intestinal/flora-intestinal/bacterias-boas

# Pretty-print a node tree
npm run dev -- print /website/home
```

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
