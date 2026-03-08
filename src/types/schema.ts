export interface ComponentSchema {
  order: number;
  template: string;
  path: string;
  properties: Record<string, string | string[]>;
  contentNodes: Record<string, ContentNodeSchema>;
  areas: Record<string, AreaSchema>;
}

export interface ContentNodeSchema {
  properties: Record<string, string | string[]>;
  children: Record<string, ContentNodeSchema>;
}

export interface AreaSchema {
  components: ComponentSchema[];
}

export interface PageSchema {
  sourcePath: string;
  exportedAt: string;
  areas: Record<string, AreaSchema>;
}
