import { scriptedTemplateBundle } from "./scripted";
import { spotlightTemplateBundle } from "./spotlight";
import { statsDashboardTemplateBundle } from "./stats-dashboard";
import { technicalExplainerTemplateBundle } from "./technical-explainer";

export const registeredTemplateBundles = [
  scriptedTemplateBundle,
  spotlightTemplateBundle,
  statsDashboardTemplateBundle,
  technicalExplainerTemplateBundle,
] as const;
