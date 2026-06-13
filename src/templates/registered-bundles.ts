import { scriptedTemplateBundle } from "./scripted";
import { spotlightTemplateBundle } from "./spotlight";
import { statsDashboardTemplateBundle } from "./stats-dashboard";

export const registeredTemplateBundles = [
  scriptedTemplateBundle,
  spotlightTemplateBundle,
  statsDashboardTemplateBundle,
] as const;
