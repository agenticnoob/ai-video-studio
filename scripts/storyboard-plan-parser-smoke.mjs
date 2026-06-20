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

const videoProjectShapedPlan = parseStoryboardPlanToolCallArguments(
  JSON.stringify({
    projectId: "ai-video-studio-demo",
    title: "AI Video Studio 产品演示",
    brief:
      "为 AI Video Studio 生成一条简洁的产品演示视频：展示用户如何输入创意 brief、获得分段项目、逐段微调，并预览完整成片。",
    language: "zh-CN",
    segments: [
      {
        id: "segment-2",
        order: 1,
        title: "逐段微调",
        language: "zh-CN",
        durationSeconds: 6,
        templateId: "spotlight",
        strategyDecision: {
          fallbackStrategy: "template_macro",
          strategy: "template_macro",
        },
        narration: {
          text: "选择任意分镜，输入修改指令，系统只重生成这一段。",
        },
        visualBrief: "展示分段项目中的单个分镜被选中并微调。",
      },
    ],
  }),
);

const recoveredVideoProjectSegment = videoProjectShapedPlan.segments[0];
assert.equal(videoProjectShapedPlan.title, "AI Video Studio 产品演示");
assert.equal(recoveredVideoProjectSegment?.purpose, "逐段微调");
assert.equal(
  recoveredVideoProjectSegment?.templateReason,
  'Template "spotlight" matches this segment\'s planned visual structure.',
);
assert.equal(recoveredVideoProjectSegment?.strategyDecision.confidence, 0.75);
assert.equal(
  recoveredVideoProjectSegment?.strategyDecision.reason,
  "Use template_macro for this segment, with template_macro as the fallback.",
);
assert.equal(recoveredVideoProjectSegment?.expectedDurationSeconds, 6);

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

const systemFlowNearMissPlan = parseStoryboardPlanToolCallArguments(
  JSON.stringify({
    title: "系统流程演示：从 Brief 到 Visual Review",
    brief:
      "做一个系统流程演示：Brief -> StoryboardPlan -> TTS -> Visual IR -> Remotion render -> Visual Review。用 node graph / line path / terminal session 表现流程。",
    language: "zh-CN",
    globalStyle: {
      palette: "technical dark UI",
      motion: "step-by-step reveals",
      tone: "system walkthrough",
    },
    segments: [
      {
        id: "segment-1",
        order: 1,
        title: "系统流程",
        purpose: "展示从 Brief 到 Visual Review 的系统流程。",
        templateId: "scene-graph",
        templateReason: "SceneGraph can render a node graph procedural generator.",
        strategyDecision: {
          confidence: 0.94,
          fallbackStrategy: "template_macro",
          reason: "A system pipeline is best represented as a node graph flow.",
          strategy: "procedural_generator",
        },
        narration: {
          text: "Brief becomes a storyboard plan, then TTS, Visual IR, Remotion render, and visual review.",
        },
        visualBrief: "Use a node graph to show the system pipeline.",
        proceduralGenerator: {
          generatorId: "node-graph-flow",
          renderStrategy: "procedural_generator",
          durationInFrames: 210,
          nodes: [
            { id: "brief", label: "Brief", lane: "input" },
            { id: "plan", label: "StoryboardPlan", lane: "plan" },
            { id: "tts", label: "TTS", lane: "build" },
            { id: "ir", label: "Visual IR", lane: "build" },
            { id: "render", label: "Remotion render", lane: "verify" },
            { id: "review", label: "Visual Review", lane: "output" },
          ],
          edges: [
            { from: "brief", to: "plan" },
            { from: "plan", to: "tts" },
            { from: "tts", to: "ir" },
            { from: "ir", to: "render" },
            { from: "render", to: "review" },
          ],
          beats: [
            { action: "reveal", duration: 18, nodeId: "brief", startFrame: 0 },
            { action: "activate", duration: 24, nodeId: "plan", startFrame: 36 },
          ],
        },
      },
    ],
  }),
);

assert.equal(
  systemFlowNearMissPlan.globalStyle,
  "palette: technical dark UI; motion: step-by-step reveals; tone: system walkthrough",
);
const systemFlowGenerator = systemFlowNearMissPlan.segments[0]?.proceduralGenerator;
assert.equal(systemFlowGenerator?.title, "系统流程");
assert.equal(systemFlowGenerator?.beats[0]?.atFrame, 0);
assert.equal(systemFlowGenerator?.beats[1]?.atFrame, 36);
assert.equal("duration" in (systemFlowGenerator?.beats[0] ?? {}), false);

const overlongTerminalBeats = Array.from({ length: 18 }, (_, index) => ({
  action: index % 2 === 0 ? "reveal" : "run",
  duration: 12,
  lineId: `line-${(index % 4) + 1}`,
  startFrame: index * 12,
}));

const multiProceduralNearMissPlan = parseStoryboardPlanToolCallArguments(
  JSON.stringify({
    title: "系统流程演示",
    brief:
      "做一个系统流程演示：Brief -> StoryboardPlan -> TTS -> Visual IR -> Remotion render -> Visual Review。用 node graph / line path / terminal session 表现流程。",
    language: "zh-CN",
    segments: [
      {
        id: "segment-1",
        order: 1,
        title: "流程总览",
        purpose: "用节点图展示 Brief 到 Visual Review 的完整链路。",
        templateId: "scene-graph",
        templateReason: "SceneGraph can render a node graph flow.",
        strategyDecision: {
          confidence: 0.94,
          fallbackStrategy: "template_macro",
          reason: "A system pipeline maps naturally to a node graph.",
          strategy: "procedural_generator",
        },
        narration: {
          text: "Brief becomes StoryboardPlan, then TTS, Visual IR, Remotion render, and Visual Review.",
        },
        visualBrief: "Show the whole system as connected workflow nodes.",
        proceduralGenerator: {
          generatorId: "node-graph-flow",
          renderStrategy: "procedural_generator",
          durationInFrames: 240,
          nodes: [
            { id: "brief", label: "Brief", lane: "input" },
            { id: "plan", label: "StoryboardPlan", lane: "plan" },
            { id: "tts", label: "TTS", lane: "build" },
          ],
          edges: [
            { from: "brief", to: "plan" },
            { from: "plan", to: "tts" },
          ],
          beats: [
            { action: "reveal", duration: 12, nodeId: "brief", startFrame: 0 },
            { action: "activate", duration: 12, nodeId: "plan", startFrame: 36 },
            { action: "complete", duration: 12, nodeId: "tts", startFrame: 72 },
          ],
        },
      },
      {
        id: "segment-2",
        order: 2,
        title: "路径推进",
        purpose: "用路径线展示从文本计划到可渲染结构的推进。",
        templateId: "scene-graph",
        templateReason: "SceneGraph can render a line path flow.",
        strategyDecision: {
          confidence: 0.9,
          fallbackStrategy: "template_macro",
          reason: "A line path is suitable for staged progression.",
          strategy: "procedural_generator",
        },
        narration: {
          text: "The plan moves through narration and visual compilation before render.",
        },
        visualBrief: "Show a line path through staged generation.",
        proceduralGenerator: {
          generatorId: "line-path-flow",
          renderStrategy: "procedural_generator",
          durationInFrames: 220,
          points: [
            { id: "storyboard", label: "StoryboardPlan", x: 0.18, y: 0.5 },
            { id: "narration", label: "TTS", x: 0.42, y: 0.36 },
            { id: "visual-ir", label: "Visual IR", x: 0.66, y: 0.52 },
            { id: "render", label: "Render", x: 0.86, y: 0.44 },
          ],
          beats: [
            { action: "reveal", duration: 12, pointId: "storyboard", startFrame: 0 },
            { action: "advance", duration: 12, pointId: "narration", startFrame: 48 },
            { action: "highlight", duration: 12, pointId: "visual-ir", startFrame: 96 },
          ],
        },
      },
      {
        id: "segment-3",
        order: 3,
        title: "终端验收",
        purpose: "用终端会话展示 render 与 visual review 的验收步骤。",
        templateId: "scene-graph",
        templateReason: "SceneGraph can render a terminal session.",
        strategyDecision: {
          confidence: 0.9,
          fallbackStrategy: "template_macro",
          reason: "A terminal session can show validation commands clearly.",
          strategy: "procedural_generator",
        },
        narration: {
          text: "The render finishes, still frames are reviewed, and visual findings drive repair.",
        },
        visualBrief: "Show terminal commands and review output.",
        proceduralGenerator: {
          generatorId: "terminal-session",
          renderStrategy: "procedural_generator",
          durationInFrames: 260,
          lines: [
            { id: "line-1", text: "$ npm run render", status: "running" },
            { id: "line-2", text: "Rendered ProjectVideo", status: "success" },
            { id: "line-3", text: "$ npm run visual-review", status: "running" },
            { id: "line-4", text: "Review findings ready", status: "success" },
          ],
          beats: overlongTerminalBeats,
        },
      },
    ],
  }),
);

assert.equal(multiProceduralNearMissPlan.segments[0]?.proceduralGenerator?.title, "流程总览");
assert.equal(multiProceduralNearMissPlan.segments[1]?.proceduralGenerator?.title, "路径推进");
const recoveredTerminalGenerator = multiProceduralNearMissPlan.segments[2]?.proceduralGenerator;
assert.equal(recoveredTerminalGenerator?.title, "终端验收");
assert.equal(recoveredTerminalGenerator?.beats.length, 16);
assert.equal(recoveredTerminalGenerator?.beats[0]?.atFrame, 0);
assert.equal(recoveredTerminalGenerator?.beats[15]?.atFrame, 180);
assert.equal("duration" in (recoveredTerminalGenerator?.beats[0] ?? {}), false);

const stagedFixturesSource = readFileSync("src/lib/staged-smoke-fixtures.ts", "utf8");
assert.equal(
  stagedFixturesSource.includes("Missing Planner Fields Recovery Smoke"),
  false,
  "Storyboard parser recovery fixtures must stay out of Remotion-loaded staged fixtures.",
);

console.log("Storyboard plan parser smoke passed.");
