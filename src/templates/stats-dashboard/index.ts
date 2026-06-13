import { defineTemplateBundle } from "../bundle";
import { statsDashboardTemplate } from "./definition";
import { statsDashboardRuntimeTemplate } from "./runtime";

export const statsDashboardTemplateBundle = defineTemplateBundle({
  definition: statsDashboardTemplate,
  runtime: statsDashboardRuntimeTemplate,
});

export { statsDashboardTemplate };
