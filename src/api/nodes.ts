import type { MagnoliaNode } from "../types/magnolia.js";
import type { PageSchema } from "../types/schema.js";
import { buildPageSchema } from "../schema.js";
import { apiFetch } from "./client.js";

const WORKSPACE = "website";

export interface GetNodeOptions {
  depth?: number;
  excludeNodeTypes?: string[];
  nodeTypes?: string[];
  includeMetadata?: boolean;
}

export function getNode(nodePath: string, options: GetNodeOptions = {}): Promise<MagnoliaNode> {
  const params: Record<string, string> = {};
  if (options.depth !== undefined) params["depth"] = String(options.depth);
  if (options.excludeNodeTypes?.length) params["excludeNodeTypes"] = options.excludeNodeTypes.join(",");
  if (options.nodeTypes?.length) params["nodeTypes"] = options.nodeTypes.join(",");
  if (options.includeMetadata) params["includeMetadata"] = "true";

  const path = nodePath.startsWith("/") ? nodePath : `/${nodePath}`;
  return apiFetch<MagnoliaNode>(`/nodes/v1/${WORKSPACE}${path}`, params);
}

export async function getChildren(nodePath: string): Promise<MagnoliaNode[]> {
  const node = await getNode(nodePath, { depth: 1 });
  return node.nodes;
}

function collectComponents(node: MagnoliaNode, result: MagnoliaNode[]): void {
  if (node.type === "mgnl:component") result.push(node);
  if (!Array.isArray(node.nodes)) return;
  for (const child of node.nodes) collectComponents(child, result);
}

export async function getComponents(nodePath: string): Promise<MagnoliaNode[]> {
  const node = await getNode(nodePath, { depth: 10, includeMetadata: true });
  const result: MagnoliaNode[] = [];
  collectComponents(node, result);
  return result;
}

export async function getPageSchema(nodePath: string): Promise<PageSchema> {
  const node = await getNode(nodePath, { depth: 10, includeMetadata: true });
  return buildPageSchema(node);
}
