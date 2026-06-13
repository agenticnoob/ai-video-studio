import { defineTemplateBundle } from "../bundle";
import { sceneGraphTemplate } from "./definition";
import { sceneGraphRuntimeTemplate } from "./runtime";

export { sceneGraphTemplate } from "./definition";
export { sceneGraphSpecSchema, sceneGraphSegmentSchema } from "./schema";

export const sceneGraphTemplateBundle = defineTemplateBundle({
  definition: sceneGraphTemplate,
  runtime: sceneGraphRuntimeTemplate,
});
