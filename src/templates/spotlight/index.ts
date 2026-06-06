import { defineTemplateBundle } from "../bundle";
import { spotlightTemplate } from "./definition";
import { spotlightRuntimeTemplate } from "./runtime";

export const spotlightTemplateBundle = defineTemplateBundle({
  definition: spotlightTemplate,
  runtime: spotlightRuntimeTemplate,
});

export { spotlightTemplate };
