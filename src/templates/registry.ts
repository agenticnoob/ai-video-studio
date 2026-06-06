import { scriptedTemplate } from "./scripted/definition";
import { spotlightTemplate } from "./spotlight/definition";
import { SCRIPTED_TEMPLATE_ID, SPOTLIGHT_TEMPLATE_ID, type TemplateId } from "./ids";

export { SCRIPTED_TEMPLATE_ID, SPOTLIGHT_TEMPLATE_ID };
export type { TemplateId };

export const templateDefinitions = {
  [SCRIPTED_TEMPLATE_ID]: scriptedTemplate,
  [SPOTLIGHT_TEMPLATE_ID]: spotlightTemplate,
} as const;

export const templateIds = Object.keys(templateDefinitions) as TemplateId[];

export const videoSegmentSchemaVariants = [
  templateDefinitions[SCRIPTED_TEMPLATE_ID].segmentSchema,
  templateDefinitions[SPOTLIGHT_TEMPLATE_ID].segmentSchema,
] as const;

export const templateSegmentJsonSchemas = templateIds.map(
  (templateId) => templateDefinitions[templateId].segmentJsonSchema,
);

export const getTemplateDefinition = (templateId: TemplateId) => {
  return templateDefinitions[templateId];
};

export const getTemplateLabel = (templateId: TemplateId): string => {
  return templateDefinitions[templateId].label;
};

export const buildTemplateSelectionPrompt = (): string => {
  return templateIds
    .map((templateId) => `- ${templateId}: ${templateDefinitions[templateId].selectionGuidance}`)
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
