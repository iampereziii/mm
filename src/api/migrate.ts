import type { PageSchema, AreaSchema, ComponentSchema, ContentNodeSchema } from "../types/schema.js";
import type { MigrationConfig } from "../types/migration.js";
import { targetApiFetch } from "./target-client.js";

interface NodeProperty {
  name: string;
  values: string[];
}

interface NodeCreatePayload {
  name: string;
  type: string;
  properties?: NodeProperty[];
  nodes?: NodeCreatePayload[];
}

function toProperties(props: Record<string, string | string[]>): NodeProperty[] {
  return Object.entries(props).map(([name, value]) => ({
    name,
    values: Array.isArray(value) ? value : [value],
  }));
}

function resolveTemplate(template: string, map: Record<string, string>): string | undefined {
  return map[template];
}

async function postNode(parentPath: string, payload: NodeCreatePayload): Promise<void> {
  await targetApiFetch<unknown>(`/nodes/v1/website${parentPath}`, "POST", payload);
}

async function createContentNodes(
  parentPath: string,
  contentNodes: Record<string, ContentNodeSchema>,
): Promise<void> {
  for (const [name, cn] of Object.entries(contentNodes)) {
    await postNode(parentPath, {
      name,
      type: "mgnl:contentNode",
      properties: toProperties(cn.properties),
    });
    if (Object.keys(cn.children).length > 0) {
      await createContentNodes(`${parentPath}/${name}`, cn.children);
    }
  }
}

async function createComponent(
  areaPath: string,
  name: string,
  component: ComponentSchema,
  templateMap: Record<string, string>,
): Promise<void> {
  const template = resolveTemplate(component.template, templateMap);
  if (template === undefined) {
    console.error(`  Skipping component (no mapping for: ${component.template})`);
    return;
  }
  const properties = toProperties(component.properties);
  properties.push({ name: "mgnl:template", values: [template] });

  await postNode(areaPath, { name, type: "mgnl:component", properties });

  const componentPath = `${areaPath}/${name}`;

  if (Object.keys(component.contentNodes).length > 0) {
    await createContentNodes(componentPath, component.contentNodes);
  }

  for (const [nestedAreaName, nestedArea] of Object.entries(component.areas)) {
    await createArea(componentPath, nestedAreaName, nestedArea, templateMap);
  }
}

async function createArea(
  parentPath: string,
  name: string,
  area: AreaSchema,
  templateMap: Record<string, string>,
): Promise<void> {
  await postNode(parentPath, { name, type: "mgnl:area" });

  const areaPath = `${parentPath}/${name}`;
  for (let i = 0; i < area.components.length; i++) {
    const component = area.components[i];
    if (!component) continue;
    await createComponent(areaPath, String(i), component, templateMap);
  }
}

export async function migratePage(schema: PageSchema, migrationConfig: MigrationConfig): Promise<void> {
  const sourcePath = schema.sourcePath;
  const lastSlash = sourcePath.lastIndexOf("/");
  const pageName = sourcePath.substring(lastSlash + 1);
  const parentPath = migrationConfig.targetParentPath ?? sourcePath.substring(0, lastSlash);

  const properties = toProperties(schema.pageProperties);
  properties.push({ name: "mgnl:template", values: [migrationConfig.pageTemplate] });

  console.error(`Creating page: ${sourcePath}`);
  await postNode(parentPath, { name: pageName, type: "mgnl:page", properties });

  for (const [areaName, area] of Object.entries(schema.areas)) {
    console.error(`  Creating area: ${areaName} (${area.components.length} components)`);
    await createArea(sourcePath, areaName, area, migrationConfig.componentTemplates);
  }
}
