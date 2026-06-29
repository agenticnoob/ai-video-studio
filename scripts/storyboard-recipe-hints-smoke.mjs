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
        {
          recipeId: "screenshot-evidence-flow",
          reason: "The segment can explain a screenshot-backed evidence flow.",
        },
      ],
    },
    {
      id: "segment-2",
      order: 2,
      title: "EV ranking",
      purpose: "Rank market opportunities by expected value.",
      templateId: "stats-dashboard",
      templateReason: "The dashboard template supports compact data rankings.",
      narration: {
        text: "The strongest opportunity is the market with positive expected value after no-vig adjustment.",
      },
      visualBrief: "Show odds, no-vig probability, expected value, and risk ranking.",
      recipeHints: [
        {
          recipeId: "odds-ev-ranking",
          reason: "The segment compares odds, no-vig probability, EV, and risk.",
        },
      ],
    },
  ],
};

const parse = (value) => parseStoryboardPlanToolCallArguments(JSON.stringify(value));
const clone = (value) => JSON.parse(JSON.stringify(value));

const validPlan = parse(basePlan);
if (validPlan.segments[0].recipeHints?.length !== 4) {
  throw new Error("Expected valid recipe hints to survive storyboard parsing.");
}
if (validPlan.segments[1].recipeHints?.[0]?.recipeId !== "odds-ev-ranking") {
  throw new Error("Expected stats-dashboard recipe hint to survive storyboard parsing.");
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
