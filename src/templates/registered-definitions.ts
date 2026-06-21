import { scriptedTemplate } from "./scripted/definition";
import { spotlightTemplate } from "./spotlight/definition";
import { statsDashboardTemplate } from "./stats-dashboard/definition";
import { technicalExplainerTemplate } from "./technical-explainer/definition";

export const registeredTemplateDefinitions = [
  scriptedTemplate,
  spotlightTemplate,
  statsDashboardTemplate,
  technicalExplainerTemplate,
] as const;

export type RegisteredTemplateDefinition = (typeof registeredTemplateDefinitions)[number];
