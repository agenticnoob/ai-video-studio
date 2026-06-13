import { scriptedTemplateBundle } from "./scripted";
import { sceneGraphTemplateBundle } from "./scene-graph";
import { spotlightTemplateBundle } from "./spotlight";
import { statsDashboardTemplateBundle } from "./stats-dashboard";

export const registeredTemplateBundles = [
  scriptedTemplateBundle,
  spotlightTemplateBundle,
  statsDashboardTemplateBundle,
  sceneGraphTemplateBundle,
] as const;
