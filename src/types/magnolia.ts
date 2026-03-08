export type PropertyType =
  | "String"
  | "Boolean"
  | "Long"
  | "Double"
  | "Date"
  | "Binary"
  | "Name"
  | "Path"
  | "Reference"
  | "WeakReference"
  | "URI"
  | "Decimal";

export interface NodeProperty {
  name: string;
  type: PropertyType;
  multiple: boolean;
  values: string[];
}

export interface MagnoliaNode {
  name: string;
  path: string;
  type: string;
  identifier: string;
  properties: NodeProperty[];
  nodes: MagnoliaNode[];
}
