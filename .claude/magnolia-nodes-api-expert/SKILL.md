---
name: magnolia-website-nodes
description: Expert knowledge for inspecting and debugging Magnolia CMS website workspace nodes using the Nodes API. Use when analyzing Magnolia page structures, areas, components, or when interacting with the Magnolia Nodes REST API.
user-invocable: false
---

# Magnolia Website Workspace Nodes API Expert

This skill provides expertise for working with **Magnolia CMS Nodes API** specifically for the **`website` workspace**.

Scope of this skill:

- Magnolia page nodes
- Magnolia areas
- Magnolia components
- Page properties
- Page hierarchies
- Debugging page content structures

Do NOT analyze other Magnolia workspaces such as:

- `config`
- `dam`
- `users`
- `modules`

Focus exclusively on **content stored under `/website`**.

---

# Nodes API Base Endpoint

The Magnolia Nodes REST API exposes JCR nodes through HTTP.

Base endpoint:

```

/.rest/nodes/v1/website/{path}

```

Example:

```

GET /.rest/nodes/v1/website/home

```

Use query parameters when needed:

```

depth
includeMetadata
excludeNodeTypes

```

Example:

```

GET /.rest/nodes/v1/website/home?depth=3

```

Use `depth` when inspecting page trees.

---

# Magnolia Website Content Model

Magnolia stores website content in a hierarchical node tree.

Example:

```

/website
└ home
├ about
└ contact

```

Page nodes use the node type:

```

mgnl:page

```

Example page properties:

```

jcr:primaryType = mgnl:page
mgnl:template = module:pages/basic
title = Home

```

---

# Page Structure

Magnolia pages follow this structure:

```

page
└ area
└ component

```

Example:

```

/website/home
└ main
├ 0
├ 1
└ 2

```

Explanation:

```

main → area
0,1,2 → components

```

Example component path:

```

/website/home/main/0

```

Component node type:

```

mgnl:component

```

---

# Inspecting Pages

Retrieve a page node:

```

GET /.rest/nodes/v1/website/home

```

Inspect full page structure:

```

GET /.rest/nodes/v1/website/home?depth=3

```

Check for:

- page properties
- areas
- components
- child pages

---

# Inspecting Components

To analyze components inside an area:

```

GET /.rest/nodes/v1/website/home/main?depth=2

```

Typical result:

```

main
├ 0
│   └ text component
├ 1
│   └ image component

```

Each component node contains:

```

component template
content properties
component configuration

```

Example properties:

```

text = "Welcome to the site"
mgnl:template = module:components/text

```

---

# Creating Pages

Create a new page using PUT.

Example:

```

PUT /.rest/nodes/v1/website/home

```

Body:

```

{
"name": "new-page",
"type": "mgnl:page",
"properties": [
{
"name": "title",
"values": ["New Page"]
},
{
"name": "mgnl:template",
"values": ["module:pages/basic"]
}
]
}

```

Rules:

- Only one node per request
- Parent node must exist
- Node name must be unique

---

# Updating Page Properties

Use POST to update node properties.

Example:

```

POST /.rest/nodes/v1/website/home

```

Body:

```

{
"properties": [
{
"name": "title",
"values": ["Updated Title"]
}
]
}

```

Only specified properties will be updated.

---

# Deleting Nodes

Delete nodes using:

```

DELETE /.rest/nodes/v1/website/home/old-page

```

Warning:

Deleting a node removes **all children recursively**.

Example removing a component:

```

DELETE /.rest/nodes/v1/website/home/main/2

```

---

# Debugging Magnolia Website Content

When debugging Magnolia pages using the Nodes API, follow this process.

Step 1 — Inspect the page node

```

GET /.rest/nodes/v1/website/page-path

```

Verify:

```

mgnl:template
title
jcr:primaryType

```

Step 2 — Inspect page structure

```

GET /.rest/nodes/v1/website/page-path?depth=3

```

Look for:

- missing areas
- missing components
- incorrect node types

Step 3 — Inspect components

```

GET /.rest/nodes/v1/website/page-path/area-name?depth=2

```

Verify:

- component template
- component properties
- node hierarchy

---

# Typical Magnolia Website Paths

Common nodes:

```

/website/home
/website/home/main
/website/home/main/0
/website/about
/website/about/main/1

```

Understand the relationship:

```

page → area → component

```

---

# Expected Behavior

When this skill is active, the AI should:

- Analyze Magnolia website node structures
- Interpret Nodes API responses
- Diagnose page hierarchy problems
- Identify missing areas or components
- Construct valid Nodes API requests
- Understand Magnolia page → area → component relationships