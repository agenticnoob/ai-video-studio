/* global console */

const { parseStoryboardPlanToolCallArguments } = await import(
  "../src/lib/deepseek/parse-storyboard-plan.js"
);

const parse = (value) => parseStoryboardPlanToolCallArguments(JSON.stringify(value));

const flatDraft = {
  title: "Draft planner smoke",
  brief: "Explain an AI video studio workflow.",
  language: "en",
  globalStyle: "Clear technical product demo.",
  segments: [
    {
      title: "Plan the story",
      purpose: "Show that the app first plans segments.",
      templateId: "technical-explainer",
      templateReason: "A technical explainer can show the staged workflow.",
      narrationText: "First, the studio turns a brief into a structured storyboard.",
      narrationTone: "clear",
      visualBrief: "Show a workflow map from brief to storyboard.",
      recipeHints: [
        {
          recipeId: "workflow-node-map",
          reason: "The segment explains a staged system flow.",
        },
      ],
      expectedDurationSeconds: 5,
    },
  ],
};

const compiledFlatDraft = parse(flatDraft);
if (compiledFlatDraft.segments[0].narration.text !== flatDraft.segments[0].narrationText) {
  throw new Error("Expected flat draft narrationText to compile into narration.text.");
}
if (compiledFlatDraft.segments[0].id !== "segment-1") {
  throw new Error("Expected draft compiler to assign stable segment ids.");
}
if (compiledFlatDraft.segments[0].order !== 1) {
  throw new Error("Expected draft compiler to assign contiguous segment order.");
}

// Regression for provider drift observed in live generation:
// narration.intent is useful draft metadata, but must never reach StoryboardPlan.narration.
const nestedNarrationDraft = {
  title: "Nested narration smoke",
  brief: "Demonstrate why draft compilation is safer than final JSON.",
  language: "zh",
  segments: [
    {
      purpose: "开场说明产品价值。",
      templateId: "technical-explainer",
      narration: {
        text: "输入一个 brief，系统会先规划分镜。",
        intent: "This extra provider key must not leak into StoryboardPlan.",
      },
      visualBrief: "用流程图展示 brief 到分镜。",
    },
  ],
};

const compiledNestedDraft = parse(nestedNarrationDraft);
if (
  compiledNestedDraft.segments[0].narration.text !==
  nestedNarrationDraft.segments[0].narration.text
) {
  throw new Error("Expected nested draft narration.text to compile into narration.text.");
}
if ("intent" in compiledNestedDraft.segments[0].narration) {
  throw new Error("Expected draft-only narration.intent to be excluded from strict StoryboardPlan.");
}
const finalNarrationKeys = Object.keys(compiledNestedDraft.segments[0].narration).sort();
if (JSON.stringify(finalNarrationKeys) !== JSON.stringify(["text"])) {
  throw new Error(`Expected strict narration keys [text], received ${finalNarrationKeys.join(",")}`);
}

const invalidRecipeDraft = {
  ...flatDraft,
  segments: [
    {
      ...flatDraft.segments[0],
      recipeHints: [
        {
          recipeId: "invented-recipe",
          reason: "Provider invented a recipe.",
        },
      ],
    },
  ],
};

try {
  parse(invalidRecipeDraft);
  throw new Error("Expected invalid draft recipe id to fail strict StoryboardPlan validation.");
} catch (error) {
  if (!String(error).includes("invented-recipe") && !String(error).includes("recipeHints")) {
    throw error;
  }
}

const wrappedDraft = {
  storyboardPlanDraft: {
    title: "Wrapped draft smoke",
    brief: "Regenerate one segment.",
    segments: [
      {
        purpose: "Replace one selected segment.",
        templateId: "technical-explainer",
        narrationText: "This replacement segment keeps the original segment id later.",
        visualBrief: "Show one focused replacement beat.",
      },
    ],
  },
};

const compiledWrappedDraft = parse(wrappedDraft);
if (compiledWrappedDraft.segments.length !== 1) {
  throw new Error("Expected wrapped draft to compile into exactly one segment.");
}

console.log("Storyboard plan draft smoke passed.");
