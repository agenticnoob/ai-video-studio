/* global console */

const { parseStoryboardPlanToolCallArguments } =
  await import("../src/lib/deepseek/parse-storyboard-plan.js");

const basePlan = {
  title: "Recipe hint smoke",
  brief: "Explain a technical workflow.",
  segments: [
    {
      id: "segment-1",
      order: 1,
      title: "Workflow",
      purpose: "Explain the build and deploy path.",
      templateId: "technical-explainer",
      templateReason: "The technical explainer supports workflow and terminal recipes.",
      narration: {
        text: "The workflow starts with planning, then runs tests, then ships.",
      },
      visualBrief: "Show workflow nodes and terminal output.",
      recipeHints: [
        {
          recipeId: "workflow-node-map",
          reason: "The segment explains a staged system flow.",
        },
        {
          recipeId: "terminal-build-run",
          reason: "The narration references running commands and tests.",
        },
        {
          recipeId: "product-ui-zoom",
          reason: "The segment can focus attention on a controlled product UI surface.",
        },
      ],
    },
  ],
};

const parse = (value) => parseStoryboardPlanToolCallArguments(JSON.stringify(value));
const clone = (value) => JSON.parse(JSON.stringify(value));

const validPlan = parse(basePlan);
if (validPlan.segments[0].recipeHints?.length !== 3) {
  throw new Error("Expected valid recipe hints to survive storyboard parsing.");
}

const invalidRecipeId = clone(basePlan);
invalidRecipeId.segments[0].recipeHints = [
  {
    recipeId: "invented-recipe",
    reason: "The provider invented an unsupported recipe.",
  },
];

try {
  parse(invalidRecipeId);
  throw new Error("Expected invented recipe id to fail validation.");
} catch (error) {
  if (!String(error).includes("recipeHints")) {
    throw error;
  }
}

const wrongTemplate = clone(basePlan);
wrongTemplate.segments[0].templateId = "spotlight";
wrongTemplate.segments[0].recipeHints = [
  {
    recipeId: "workflow-node-map",
    reason: "Spotlight does not publish planner-facing recipes.",
  },
];

try {
  parse(wrongTemplate);
  throw new Error("Expected recipe hints on a template without recipes to fail validation.");
} catch (error) {
  if (!String(error).includes("recipeHints")) {
    throw error;
  }
}

const noHints = clone(basePlan);
delete noHints.segments[0].recipeHints;
parse(noHints);

console.log("Storyboard recipe hints smoke passed.");
