import {
  SCRIPTED_TEMPLATE_ID,
  SPOTLIGHT_TEMPLATE_ID,
  STATS_DASHBOARD_TEMPLATE_ID,
  TECHNICAL_EXPLAINER_TEMPLATE_ID,
} from "./ids";
import {
  registeredTemplateDefinitions,
  type RegisteredTemplateDefinition,
} from "./registered-definitions";

export {
  SCRIPTED_TEMPLATE_ID,
  SPOTLIGHT_TEMPLATE_ID,
  STATS_DASHBOARD_TEMPLATE_ID,
  TECHNICAL_EXPLAINER_TEMPLATE_ID,
};

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

export type PlannerTemplateManifestEntry = {
  templateId: TemplateId;
  label: string;
  description: string;
  bestUseCases: string[];
  avoidCases: string[];
  textDensity: RegisteredTemplateDefinition["capabilities"]["textDensity"];
  recommendedDurationFrames: {
    min: number;
    max: number;
  };
  recommendedDurationSeconds: {
    min: number;
    max: number;
  };
  narrationFit: string;
  mediaExpectations: string;
  examples: string[];
  recipes?: {
    recipeId: string;
    label: string;
    bestFor: string[];
    avoidCases: string[];
    requiredInputsSummary: string;
    durationFit: string;
  }[];
};

const framesToSeconds = (frames: number): number => Math.round((frames / 30) * 10) / 10;

export const buildPlannerTemplateManifest = (): PlannerTemplateManifestEntry[] => {
  return templateIds.map((templateId) => {
    const template = templateDefinitions[templateId];
    const durationFrames = template.capabilities.recommendedDurationFrames;

    return {
      templateId,
      label: template.label,
      description: template.planner.description,
      bestUseCases: template.capabilities.bestFor,
      avoidCases: template.planner.avoidCases,
      textDensity: template.capabilities.textDensity,
      recommendedDurationFrames: durationFrames,
      recommendedDurationSeconds: {
        min: framesToSeconds(durationFrames.min),
        max: framesToSeconds(durationFrames.max),
      },
      narrationFit: template.planner.narrationFit,
      mediaExpectations: template.planner.mediaExpectations,
      examples: template.planner.examples,
      recipes: template.planner.recipes,
    };
  });
};

export const buildPlannerTemplateManifestPrompt = (): string => {
  return buildPlannerTemplateManifest()
    .map((template) =>
      [
        `- ${template.templateId} (${template.label})`,
        `  description: ${template.description}`,
        `  bestUseCases: ${template.bestUseCases.join(", ")}`,
        `  avoidCases: ${template.avoidCases.join(", ")}`,
        `  textDensity: ${template.textDensity}`,
        `  recommendedDurationSeconds: ${template.recommendedDurationSeconds.min}-${template.recommendedDurationSeconds.max}`,
        `  narrationFit: ${template.narrationFit}`,
        `  mediaExpectations: ${template.mediaExpectations}`,
        `  examples: ${template.examples.join("; ")}`,
        template.recipes && template.recipes.length > 0
          ? `  recipes: ${template.recipes.map((recipe) => recipe.recipeId).join(", ")}`
          : "  recipes: none",
      ].join("\n"),
    )
    .join("\n\n");
};

export type PlannerRecipeManifestEntry = {
  templateId: TemplateId;
  templateLabel: string;
  recipeId: string;
  label: string;
  bestFor: string[];
  avoidCases: string[];
  requiredInputsSummary: string;
  durationFit: string;
};

export const buildPlannerRecipeManifest = (): PlannerRecipeManifestEntry[] => {
  return templateIds.flatMap((templateId) => {
    const template = templateDefinitions[templateId];
    return (template.planner.recipes ?? []).map((recipe) => ({
      templateId,
      templateLabel: template.label,
      recipeId: recipe.recipeId,
      label: recipe.label,
      bestFor: recipe.bestFor,
      avoidCases: recipe.avoidCases,
      requiredInputsSummary: recipe.requiredInputsSummary,
      durationFit: recipe.durationFit,
    }));
  });
};

export const getPlannerRecipeIdsForTemplate = (templateId: TemplateId): string[] => {
  return (templateDefinitions[templateId].planner.recipes ?? []).map((recipe) => recipe.recipeId);
};

export const buildPlannerRecipeManifestPrompt = (): string => {
  const byTemplate = templateIds
    .map((templateId) => {
      const template = templateDefinitions[templateId];
      const recipes = template.planner.recipes ?? [];
      if (recipes.length === 0) {
        return "";
      }

      return [
        `- ${templateId} (${template.label})`,
        ...recipes.map((recipe) =>
          [
            `  - ${recipe.recipeId} (${recipe.label})`,
            `    bestFor: ${recipe.bestFor.join(", ")}`,
            `    avoidCases: ${recipe.avoidCases.join(", ")}`,
            `    requiredInputs: ${recipe.requiredInputsSummary}`,
            `    durationFit: ${recipe.durationFit}`,
          ].join("\n"),
        ),
      ].join("\n");
    })
    .filter(Boolean);

  return byTemplate.length > 0
    ? byTemplate.join("\n\n")
    : "No planner-facing recipes are registered.";
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
