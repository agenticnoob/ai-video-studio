import { scriptedTemplate } from "./scripted/definition";
import { spotlightTemplate } from "./spotlight/definition";

export const registeredTemplateDefinitions = [scriptedTemplate, spotlightTemplate] as const;

export type RegisteredTemplateDefinition = (typeof registeredTemplateDefinitions)[number];
