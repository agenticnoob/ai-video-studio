/* global console */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { parseStoryboardPlanToolCallArguments } from "../src/lib/minimax/parse-storyboard-plan.js";

const plan = parseStoryboardPlanToolCallArguments(
  JSON.stringify({
    title: "Missing Planner Fields Recovery Smoke",
    brief: "Recover provider output when a later segment omits narration and visualBrief.",
    language: "en",
    segments: [
      {
        id: "segment-1",
        order: 1,
        title: "Opening",
        purpose: "Introduce the product workflow.",
        templateId: "spotlight",
        templateReason: "Spotlight can quickly establish the value proposition.",
        narration: {
          text: "AI Video Studio turns a brief into an editable video project.",
        },
        visualBrief: "A focused product-opening lockup.",
        strategyDecision: {
          confidence: 0.9,
          fallbackStrategy: "template_macro",
          reason: "A registered macro template is sufficient for this planned segment.",
          strategy: "template_macro",
        },
      },
      {
        id: "segment-2",
        order: 2,
        title: "Segment Editing",
        purpose: "Show that each generated segment can be selected, edited, and regenerated.",
        templateId: "spotlight",
        templateReason: "Spotlight can emphasize the segment-level editing workflow.",
        strategyDecision: {
          confidence: 0.9,
          fallbackStrategy: "template_macro",
          reason: "A registered macro template is sufficient for this planned segment.",
          strategy: "template_macro",
        },
      },
    ],
  }),
);
const recoveredSegment = plan.segments[1];

assert.ok(recoveredSegment);
assert.equal(
  recoveredSegment.narration.text,
  "Show that each generated segment can be selected, edited, and regenerated.",
);
assert.equal(
  recoveredSegment.visualBrief,
  "Visualize: Show that each generated segment can be selected, edited, and regenerated.",
);

const stagedFixturesSource = readFileSync("src/lib/staged-smoke-fixtures.ts", "utf8");
assert.equal(
  stagedFixturesSource.includes("Missing Planner Fields Recovery Smoke"),
  false,
  "Storyboard parser recovery fixtures must stay out of Remotion-loaded staged fixtures.",
);

console.log("Storyboard plan parser smoke passed.");
