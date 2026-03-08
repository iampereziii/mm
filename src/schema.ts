import type { MagnoliaNode } from "./types/magnolia.js";
import type { AreaSchema, ComponentSchema, ContentNodeSchema, PageSchema } from "./types/schema.js";

const SKIP_PROPS = new Set([
  "jcr:uuid",
  "mgnl:createdBy",
  "mgnl:lastActivatedBy",
  "mgnl:lastModifiedBy",
]);

function isSystemProp(name: string): boolean {
  if (SKIP_PROPS.has(name)) return true;
  return (
    name.startsWith("jcr:") ||
    name.startsWith("mgnl:created") ||
    name.startsWith("mgnl:lastActivated") ||
    name.startsWith("mgnl:lastModified")
  );
}

function propValue(values: string[]): string | string[] {
  return values.length === 1 ? (values[0] ?? "") : values;
}

function extractProperties(node: MagnoliaNode): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  for (const p of node.properties ?? []) {
    if (p.name === "mgnl:template" || isSystemProp(p.name)) continue;
    result[p.name] = propValue(p.values);
  }
  return result;
}

function getTemplate(node: MagnoliaNode): string {
  return node.properties?.find((p) => p.name === "mgnl:template")?.values[0] ?? "unknown";
}

function serializeContentNode(node: MagnoliaNode): ContentNodeSchema {
  const properties = extractProperties(node);
  const children: Record<string, ContentNodeSchema> = {};
  for (const child of node.nodes ?? []) {
    if (child.type === "mgnl:contentNode") {
      children[child.name] = serializeContentNode(child);
    }
  }
  return { properties, children };
}

function transformComponent(node: MagnoliaNode, order: number): ComponentSchema {
  const areas: Record<string, AreaSchema> = {};
  const contentNodes: Record<string, ContentNodeSchema> = {};

  for (const child of node.nodes ?? []) {
    if (child.type === "mgnl:area") {
      areas[child.name] = transformArea(child);
    } else if (child.type === "mgnl:contentNode") {
      contentNodes[child.name] = serializeContentNode(child);
    }
  }

  return {
    order,
    template: getTemplate(node),
    path: node.path,
    properties: extractProperties(node),
    contentNodes,
    areas,
  };
}

function transformArea(areaNode: MagnoliaNode): AreaSchema {
  const components = (areaNode.nodes ?? [])
    .filter((n) => n.type === "mgnl:component")
    .map((n, i) => transformComponent(n, i));
  return { components };
}

export function buildPageSchema(pageNode: MagnoliaNode): PageSchema {
  const areas: Record<string, AreaSchema> = {};

  for (const child of pageNode.nodes ?? []) {
    if (child.type === "mgnl:area") {
      const area = transformArea(child);
      if (area.components.length > 0) {
        areas[child.name] = area;
      }
    }
  }

  return {
    sourcePath: pageNode.path,
    exportedAt: new Date().toISOString(),
    areas,
  };
}
