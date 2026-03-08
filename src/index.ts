import { writeFile } from "node:fs/promises";
import { getNode, getChildren, getComponents } from "./api/nodes.js";
import type { MagnoliaNode } from "./types/magnolia.js";

const [, , command, nodePath = "/", ...rest] = process.argv;

function printNode(node: MagnoliaNode, indent = 0): void {
  const pad = "  ".repeat(indent);
  console.log(`${pad}[${node.type}] ${node.path}`);
  for (const prop of node.properties) {
    const val = Array.isArray(prop.value) ? prop.value.join(", ") : prop.value;
    console.log(`${pad}  ${prop.name}: ${val}`);
  }
}

async function main(): Promise<void> {
  switch (command) {
    case "get": {
      const depth = rest[0] ? Number(rest[0]) : 0;
      const node = await getNode(nodePath, { depth });
      console.log(JSON.stringify(node, null, 2));
      break;
    }
    case "list": {
      const children = await getChildren(nodePath);
      if (children.length === 0) {
        console.log("No children found.");
      } else {
        for (const child of children) printNode(child);
      }
      break;
    }
    case "print": {
      const depth = rest[0] ? Number(rest[0]) : 1;
      const node = await getNode(nodePath, { depth });
      printNode(node);
      for (const child of node.nodes) printNode(child, 1);
      break;
    }
    case "components": {
      const components = await getComponents(nodePath);
      const json = JSON.stringify(components, null, 2);
      await writeFile("response.json", json, "utf-8");
      console.error(`Wrote ${components.length} components to response.json`);
      break;
    }
    default:
      console.log(`Usage:
  mm get        <path> [depth]   Fetch node as JSON (default depth 0)
  mm list       <path>           List immediate children
  mm print      <path> [depth]   Pretty-print node tree (default depth 1)
  mm components <path>           List all mgnl:component nodes on a page (writes to response.json)

Environment variables (.env):
  MAGNOLIA_BASE_URL       e.g. http://localhost:8080
  MAGNOLIA_USERNAME
  MAGNOLIA_PASSWORD
  MAGNOLIA_INSTANCE_PATH
`);
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
