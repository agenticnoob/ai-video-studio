import { readFileSync } from "node:fs";

/* global console */

const { buildTemplateCompilerPrompt } = await import("../src/lib/deepseek/prompts.js");
const { parseStoryboardPlanToolCallArguments } =
  await import("../src/lib/deepseek/parse-storyboard-plan.js");
const { buildPlannerRecipeManifest, buildPlannerRecipeManifestPrompt } =
  await import("../src/templates/registry.js");

const read = (path) => readFileSync(path, "utf8");

const assertIncludes = (source, snippet, label) => {
  if (!source.includes(snippet)) {
    throw new Error(`${label} is missing required snippet: ${snippet}`);
  }
};

const assertRecipeManifestEntry = ({ recipeId, templateId }) => {
  const manifest = buildPlannerRecipeManifest();
  if (!manifest.some((entry) => entry.templateId === templateId && entry.recipeId === recipeId)) {
    throw new Error(`Planner recipe manifest is missing ${templateId}/${recipeId}.`);
  }

  assertIncludes(
    buildPlannerRecipeManifestPrompt(),
    recipeId,
    "planner recipe manifest prompt",
  );
};

const technicalSchema = read("src/templates/technical-explainer/schema.ts");
const technicalDefinition = read("src/templates/technical-explainer/definition.ts");
const technicalRuntime = read("src/templates/technical-explainer/runtime.tsx");
const technicalScenes = read("src/templates/technical-explainer/recipe-scenes.tsx");
const statsDefinition = read("src/templates/stats-dashboard/definition.ts");
const statsRuntime = read("src/templates/stats-dashboard/runtime.tsx");
const fixtures = read("src/lib/staged-smoke-fixtures.ts");
const prompts = read("src/lib/deepseek/prompts.ts");

assertRecipeManifestEntry({
  recipeId: "screenshot-evidence-flow",
  templateId: "technical-explainer",
});
assertRecipeManifestEntry({
  recipeId: "odds-ev-ranking",
  templateId: "stats-dashboard",
});

for (const source of [technicalSchema, technicalDefinition, technicalRuntime, technicalScenes]) {
  assertIncludes(source, "screenshot-evidence-flow", "technical-explainer source");
}
assertIncludes(technicalScenes, "ScreenshotEvidenceFlowScene", "technical recipe scenes");
assertIncludes(technicalScenes, "evidenceItems", "technical recipe scenes");

assertIncludes(statsDefinition, "odds-ev-ranking", "stats-dashboard definition");
assertIncludes(statsDefinition, "expected value", "stats-dashboard implementation prompt");
assertIncludes(statsRuntime, "StatsDashboardVideo", "stats-dashboard runtime");

assertIncludes(fixtures, "screenshot-evidence-flow", "staged smoke fixtures");
assertIncludes(fixtures, "odds-ev-ranking", "staged smoke fixtures");
assertIncludes(prompts, "recipeHints", "template compiler prompt");
assertIncludes(prompts, "plannerRecipes", "template compiler prompt");

const plan = parseStoryboardPlanToolCallArguments(
  JSON.stringify({
    title: "Main site recipe abstractions",
    brief: "Generate a project intro and a market analysis segment.",
    language: "en",
    segments: [
      {
        id: "tech-1",
        order: 1,
        title: "Evidence flow",
        purpose: "Explain how screenshots become visual retrieval evidence.",
        templateId: "technical-explainer",
        templateReason: "A technical explainer can combine screenshot focus and evidence cards.",
        narration: {
          text: "The screenshot is sliced, indexed, and retrieved as visual evidence.",
        },
        visualBrief: "Show a screenshot panel with evidence cards and a retrieval path.",
        recipeHints: [
          {
            recipeId: "screenshot-evidence-flow",
            reason: "The segment needs a screenshot plus evidence-card process.",
          },
        ],
      },
      {
        id: "data-1",
        order: 2,
        title: "EV ranking",
        purpose: "Rank betting opportunities by no-vig expected value and risk.",
        templateId: "stats-dashboard",
        templateReason: "A dashboard can show odds, probabilities, EV, and risk ranking.",
        narration: {
          text: "No-vig probabilities expose which markets have positive expected value.",
        },
        visualBrief: "Show a compact EV table, risk note, and ranking chart.",
        recipeHints: [
          {
            recipeId: "odds-ev-ranking",
            reason: "The segment compares odds, probabilities, expected value, and risk.",
          },
        ],
      },
    ],
  }),
);

if (plan.segments[0].recipeHints?.[0]?.recipeId !== "screenshot-evidence-flow") {
  throw new Error("Expected technical-explainer recipe hint to survive parsing.");
}
if (plan.segments[1].recipeHints?.[0]?.recipeId !== "odds-ev-ranking") {
  throw new Error("Expected stats-dashboard recipe hint to survive parsing.");
}

const compilerPrompt = buildTemplateCompilerPrompt({
  plan,
  segment: plan.segments[0],
  narration: {
    text: plan.segments[0].narration.text,
    audioSrc: "/api/tts/assets/smoke/tech-1.mp3",
    durationInFrames: 180,
    durationInSeconds: 6,
    provider: "fixture",
    format: "mp3",
  },
  targetDurationInFrames: 180,
});
const compilerPayload = compilerPrompt.messages.map((message) => message.content).join("\n");
assertIncludes(compilerPayload, "screenshot-evidence-flow", "template compiler prompt payload");
assertIncludes(compilerPayload, "plannerRecipes", "template compiler prompt payload");
assertIncludes(compilerPayload, "recipeHints", "template compiler prompt payload");

console.log("Main-site recipe abstractions smoke passed.");
