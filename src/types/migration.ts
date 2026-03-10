export interface MigrationConfig {
  pageTemplate: string;
  componentTemplates: Record<string, string>;
  targetParentPath?: string;
}
