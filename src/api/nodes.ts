import type { MagnoliaNode } from "../types/magnolia.js";
import { apiFetch } from "./client.js";

const WORKSPACE = "website";

export interface GetNodeOptions {
  depth?: number;
  excludeNodeTypes?: string[];
  nodeTypes?: string[];
}

export function getNode(nodePath: string, options: GetNodeOptions = {}): Promise<MagnoliaNode> {
  const params: Record<string, string> = {};
  if (options.depth !== undefined) params["depth"] = String(options.depth);
  if (options.excludeNodeTypes?.length) params["excludeNodeTypes"] = options.excludeNodeTypes.join(",");
  if (options.nodeTypes?.length) params["nodeTypes"] = options.nodeTypes.join(",");

  const path = nodePath.startsWith("/") ? nodePath : `/${nodePath}`;
  return apiFetch<MagnoliaNode>(`/nodes/v1/${WORKSPACE}${path}`, params);
}

export async function getChildren(nodePath: string): Promise<MagnoliaNode[]> {
  const node = await getNode(nodePath, { depth: 1 });
  return node.nodes;
}
