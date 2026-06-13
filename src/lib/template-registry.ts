export {
  buildPlannerTemplateManifest,
  buildPlannerTemplateManifestPrompt,
  buildTemplateImplementationPrompt,
  buildTemplatePreservationPrompt,
  buildTemplateRevisionPrompt,
  buildTemplateSelectionPrompt,
  getTemplateDefinition,
  getTemplateLabel,
  registeredTemplateIds,
  SCRIPTED_TEMPLATE_ID,
  SPOTLIGHT_TEMPLATE_ID,
  STATS_DASHBOARD_TEMPLATE_ID,
  templateDefinitions,
  templateIds,
  templateSegmentJsonSchemas,
  videoSegmentSchemaVariants,
} from "../templates/registry";

export type { PlannerTemplateManifestEntry, TemplateId } from "../templates/registry";
