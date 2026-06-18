/* global console */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { parseStoryboardPlanToolCallArguments } from "../src/lib/deepseek/parse-storyboard-plan.js";

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

const missingPurposePlan = parseStoryboardPlanToolCallArguments(
  JSON.stringify({
    title: "Missing Purpose Recovery Smoke",
    brief: "Recover DeepSeek planner output when segments omit purpose.",
    language: "zh-CN",
    segments: [
      {
        id: "segment-1",
        order: 1,
        title: "输入 brief",
        templateId: "spotlight",
        templateReason: "Spotlight can establish the product promise.",
        strategyDecision: {
          confidence: 0.9,
          fallbackStrategy: "template_macro",
          reason: "A registered macro template is sufficient for this planned segment.",
          strategy: "template_macro",
        },
        narration: {
          text: "用户输入一个创意 brief，系统开始规划视频。",
        },
        visualBrief: "Show the brief input turning into a video plan.",
      },
    ],
  }),
);

assert.equal(missingPurposePlan.segments[0]?.purpose, "输入 brief");

const proceduralGeneratorAliasPlan = parseStoryboardPlanToolCallArguments(
  JSON.stringify({
    title: "Procedural Generator Alias Recovery Smoke",
    brief: "Recover DeepSeek procedural generator aliases.",
    language: "en",
    segments: [
      {
        id: "segment-1",
        order: 1,
        title: "Agent workflow",
        purpose: "Show the agent workflow as a node graph flow.",
        templateId: "scene-graph",
        templateReason: "SceneGraph can render node graph procedural generators.",
        strategyDecision: {
          confidence: 0.92,
          fallbackStrategy: "template_macro",
          reason: "A workflow is best represented as a procedural node graph.",
          strategy: "procedural_generator",
        },
        narration: {
          text: "The agent plans, builds, verifies, and exports.",
        },
        visualBrief: "Show a node graph workflow.",
        proceduralGenerator: {
          generatorId: "node-graph-flow",
          renderStrategy: "procedural_generator",
          durationInFrames: 180,
          nodes: [
            { id: "plan", label: "Plan", lane: "plan" },
            { id: "build", label: "Build", lane: "build" },
          ],
          edges: [{ from: "plan", to: "build" }],
          beats: [
            { time: 0, nodeId: "plan", action: "reveal" },
            { time: 60, nodeId: "build", action: "activate" },
          ],
        },
      },
    ],
  }),
);

const proceduralGenerator = proceduralGeneratorAliasPlan.segments[0]?.proceduralGenerator;
assert.equal(proceduralGenerator?.generatorId, "node-graph-flow");
assert.equal(proceduralGenerator?.title, "Agent workflow");
assert.equal(proceduralGenerator?.beats[0]?.atFrame, 0);
assert.equal(proceduralGenerator?.beats[1]?.atFrame, 60);

const stagedFixturesSource = readFileSync("src/lib/staged-smoke-fixtures.ts", "utf8");
assert.equal(
  stagedFixturesSource.includes("Missing Planner Fields Recovery Smoke"),
  false,
  "Storyboard parser recovery fixtures must stay out of Remotion-loaded staged fixtures.",
);

console.log("Storyboard plan parser smoke passed.");
