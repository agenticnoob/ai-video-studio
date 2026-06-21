import { defineTemplateBundle } from "../bundle";
import { technicalExplainerTemplate } from "./definition";
import { technicalExplainerRuntimeTemplate } from "./runtime";

export const technicalExplainerTemplateBundle = defineTemplateBundle({
  definition: technicalExplainerTemplate,
  runtime: technicalExplainerRuntimeTemplate,
});

export { technicalExplainerTemplate };
