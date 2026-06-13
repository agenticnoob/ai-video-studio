import { scriptedTemplate } from "./scripted/definition";
import { sceneGraphTemplate } from "./scene-graph/definition";
import { spotlightTemplate } from "./spotlight/definition";
import { statsDashboardTemplate } from "./stats-dashboard/definition";

export const registeredTemplateDefinitions = [
  scriptedTemplate,
  spotlightTemplate,
  statsDashboardTemplate,
  sceneGraphTemplate,
] as const;

export type RegisteredTemplateDefinition = (typeof registeredTemplateDefinitions)[number];
