import { SCRIPTED_TEMPLATE_ID, SPOTLIGHT_TEMPLATE_ID } from "./ids";
import {
  registeredTemplateDefinitions,
  type RegisteredTemplateDefinition,
} from "./registered-definitions";

export { SCRIPTED_TEMPLATE_ID, SPOTLIGHT_TEMPLATE_ID };

export type TemplateId = RegisteredTemplateDefinition["id"];

type TemplateDefinitionsById = {
  [TDefinition in RegisteredTemplateDefinition as TDefinition["id"]]: TDefinition;
};

type SegmentSchemaVariant = RegisteredTemplateDefinition["segmentSchema"];

export const templateDefinitions = Object.fromEntries(
  registeredTemplateDefinitions.map((template) => [template.id, template]),
) as TemplateDefinitionsById;

export const registeredTemplateIds = registeredTemplateDefinitions.map((template) => template.id);

export const templateIds = registeredTemplateIds;

export const videoSegmentSchemaVariants = registeredTemplateDefinitions.map(
  (template) => template.segmentSchema,
) as [SegmentSchemaVariant, ...SegmentSchemaVariant[]];

export const templateSegmentJsonSchemas = registeredTemplateDefinitions.map(
  (template) => template.segmentJsonSchema,
);

export const getTemplateDefinition = (templateId: TemplateId) => {
  return templateDefinitions[templateId];
};

export const getTemplateLabel = (templateId: TemplateId): string => {
  return templateDefinitions[templateId].label;
};

export const buildTemplateSelectionPrompt = (): string => {
  return templateIds
    .map((templateId) => {
      const template = templateDefinitions[templateId];
      const capabilities = template.capabilities;

      return [
        `- ${templateId}: ${template.selectionGuidance}`,
        `  bestFor: ${capabilities.bestFor.join(", ")}`,
        `  textDensity: ${capabilities.textDensity}`,
        `  recommendedDurationFrames: ${capabilities.recommendedDurationFrames.min}-${capabilities.recommendedDurationFrames.max}`,
        `  supportsMedia: ${capabilities.supportsMedia ? "yes" : "no"}`,
        `  supportsBaseLayer: ${capabilities.supportsBaseLayer ? "yes" : "no"}`,
      ].join("\n");
    })
    .join("\n");
};

export const buildTemplateImplementationPrompt = (): string => {
  return templateIds
    .map(
      (templateId) =>
        `# ${templateDefinitions[templateId].label} implementation rules\n${templateDefinitions[templateId].implementationPrompt}`,
    )
    .join("\n\n");
};

export const buildTemplateRevisionPrompt = (): string => {
  return templateIds
    .map((templateId) => templateDefinitions[templateId].revisionPrompt)
    .join("\n\n");
};

export const buildTemplatePreservationPrompt = (): string => {
  return templateIds
    .map((templateId) => `  - ${templateDefinitions[templateId].preservationPrompt}`)
    .join("\n");
};
