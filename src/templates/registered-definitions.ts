import { scriptedTemplate } from "./scripted/definition";
import { spotlightTemplate } from "./spotlight/definition";
import { statsDashboardTemplate } from "./stats-dashboard/definition";

export const registeredTemplateDefinitions = [
  scriptedTemplate,
  spotlightTemplate,
  statsDashboardTemplate,
] as const;

export type RegisteredTemplateDefinition = (typeof registeredTemplateDefinitions)[number];
