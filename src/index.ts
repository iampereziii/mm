import { writeFile, readFile } from "node:fs/promises";
import { getNode, getChildren, getComponents, getPageSchema } from "./api/nodes.js";
import { migratePage } from "./api/migrate.js";
import type { MagnoliaNode } from "./types/magnolia.js";
import type { PageSchema } from "./types/schema.js";
import type { MigrationConfig } from "./types/migration.js";

const [, , command, nodePath = "/", ...rest] = process.argv;

function printNode(node: MagnoliaNode, indent = 0): void {
  const pad = "  ".repeat(indent);
  console.log(`${pad}[${node.type}] ${node.path}`);
  for (const prop of node.properties) {
    const val = prop.values.length === 1 ? prop.values[0] : prop.values.join(", ");
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
    case "schema": {
      const schema = await getPageSchema(nodePath);
      const json = JSON.stringify(schema, null, 2);
      await writeFile("schema.json", json, "utf-8");
      const total = Object.values(schema.areas).reduce((n, a) => n + a.components.length, 0);
      console.error(`Wrote schema with ${Object.keys(schema.areas).length} areas, ${total} top-level components to schema.json`);
      break;
    }
    case "components": {
      const components = await getComponents(nodePath);
      const json = JSON.stringify(components, null, 2);
      await writeFile("response.json", json, "utf-8");
      console.error(`Wrote ${components.length} components to response.json`);
      break;
    }
    case "migrate": {
      const schemaFile = rest[0] ?? "schema.json";
      const migrationFile = rest[1] ?? "migration.json";
      const schemaRaw = await readFile(schemaFile, "utf-8");
      const migrationRaw = await readFile(migrationFile, "utf-8");
      const schema = JSON.parse(schemaRaw) as PageSchema;
      const migrationConfig = JSON.parse(migrationRaw) as MigrationConfig;
      await migratePage(schema, migrationConfig);
      console.error(`Migration complete: ${schema.sourcePath}`);
      break;
    }
    default:
      console.log(`Usage:
  mm get        <path> [depth]   Fetch node as JSON (default depth 0)
  mm list       <path>           List immediate children
  mm print      <path> [depth]   Pretty-print node tree (default depth 1)
  mm schema     <path>           Export page as recreatable schema (writes to schema.json)
  mm components <path>           List all mgnl:component nodes on a page (writes to response.json)
  mm migrate    [schema.json] [migration.json]
                                 Recreate page from schema on target instance

Environment variables (.env):
  MAGNOLIA_BASE_URL              e.g. http://localhost:8080
  MAGNOLIA_USERNAME
  MAGNOLIA_PASSWORD
  MAGNOLIA_INSTANCE_PATH
  MAGNOLIA_TARGET_BASE_URL       Target instance for migrate command
  MAGNOLIA_TARGET_USERNAME
  MAGNOLIA_TARGET_PASSWORD
  MAGNOLIA_TARGET_INSTANCE_PATH
`);
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
