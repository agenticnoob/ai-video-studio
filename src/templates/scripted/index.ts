import { defineTemplateBundle } from "../bundle";
import { scriptedTemplate } from "./definition";
import { scriptedRuntimeTemplate } from "./runtime";

export const scriptedTemplateBundle = defineTemplateBundle({
  definition: scriptedTemplate,
  runtime: scriptedRuntimeTemplate,
});

export { scriptedTemplate };
