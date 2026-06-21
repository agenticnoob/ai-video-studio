import { readFileSync } from "node:fs";

/* global console */

const { buildPlannerRecipeManifest, buildPlannerRecipeManifestPrompt } = await import(
  "../src/templates/registry.js"
);

const read = (path) => readFileSync(path, "utf8");

const definitionTypes = read("src/templates/definition.ts");
const technicalSchema = read("src/templates/technical-explainer/schema.ts");
const technicalDefinition = read("src/templates/technical-explainer/definition.ts");
const registry = read("src/templates/registry.ts");
const prompts = read("src/lib/deepseek/prompts.ts");

const requiredRecipeIds = [
  "hero-title-reveal",
  "terminal-build-run",
  "workflow-node-map",
  "metric-countup",
  "timeline-progress",
];

const assertIncludes = (source, snippet, label) => {
  if (!source.includes(snippet)) {
    throw new Error(`${label} is missing required snippet: ${snippet}`);
  }
};

assertIncludes(definitionTypes, "TemplatePlannerRecipe", "template definition types");
assertIncludes(
  definitionTypes,
  "recipes?: TemplatePlannerRecipe[]",
  "template planner metadata",
);
assertIncludes(technicalSchema, "technicalExplainerRecipeIds", "technical explainer schema");
assertIncludes(technicalDefinition, "recipes:", "technical explainer planner metadata");
assertIncludes(registry, "buildPlannerRecipeManifest", "template registry");
assertIncludes(registry, "buildPlannerRecipeManifestPrompt", "template registry");
assertIncludes(prompts, "recipeHints", "DeepSeek prompts");
assertIncludes(prompts, "buildPlannerRecipeManifestPrompt", "DeepSeek prompts");
assertIncludes(prompts, "Do not generate implementation", "DeepSeek prompts");
assertIncludes(
  prompts,
  "The compiler turns recipe hints into implementation fields",
  "DeepSeek prompts",
);

const manifest = buildPlannerRecipeManifest();
const prompt = buildPlannerRecipeManifestPrompt();

for (const recipeId of requiredRecipeIds) {
  assertIncludes(technicalSchema, recipeId, "technical explainer schema");
  assertIncludes(technicalDefinition, recipeId, "technical explainer definition");
  if (
    !manifest.some(
      (entry) => entry.templateId === "technical-explainer" && entry.recipeId === recipeId,
    )
  ) {
    throw new Error(`Planner recipe manifest is missing technical-explainer recipe: ${recipeId}`);
  }
  assertIncludes(prompt, recipeId, "planner recipe manifest prompt");
}

console.log("Planner recipe manifest smoke passed.");
