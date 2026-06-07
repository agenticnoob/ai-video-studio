import { scriptedTemplateBundle } from "./scripted";
import { spotlightTemplateBundle } from "./spotlight";

export const registeredTemplateBundles = [scriptedTemplateBundle, spotlightTemplateBundle] as const;
