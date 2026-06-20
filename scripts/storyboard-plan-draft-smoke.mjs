/* global console */

import assert from "node:assert/strict";

import { compileStoryboardPlanDraft } from "../src/lib/storyboard-plan-draft-compiler.js";
import { storyboardPlanDraftSchema } from "../src/lib/storyboard-plan-draft-schema.js";

const draft = storyboardPlanDraftSchema.parse({
  title: "系统流程演示",
  brief:
    "做一个系统流程演示：Brief -> StoryboardPlan -> TTS -> Visual IR -> Remotion render -> Visual Review。用 node graph / line path / terminal session 表现流程。",
  language: "zh-CN",
  globalStyle: "technical dark UI, step-by-step reveals",
  segments: [
    {
      title: "流程总览",
      purpose: "用节点图展示 Brief 到 Visual Review 的完整链路。",
      narrationText:
        "Brief becomes StoryboardPlan, then TTS, Visual IR, Remotion render, and Visual Review.",
      visualBrief: "Show the whole system as connected workflow nodes.",
      visualKind: "workflow",
      steps: ["Brief", "StoryboardPlan", "TTS", "Visual IR", "Remotion render", "Visual Review"],
    },
    {
      title: "路径推进",
      purpose: "用路径线展示从文本计划到可渲染结构的推进。",
      narrationText: "The plan moves through narration and visual compilation before render.",
      visualBrief: "Show a line path through staged generation.",
      visualKind: "line_path",
      steps: ["StoryboardPlan", "TTS", "Visual IR", "Render"],
    },
    {
      title: "终端验收",
      purpose: "用终端会话展示 render 与 visual review 的验收步骤。",
      narrationText:
        "The render finishes, still frames are reviewed, and visual findings drive repair.",
      visualBrief: "Show terminal commands and review output.",
      visualKind: "terminal",
      commands: [
        "$ npm run render",
        "Rendered ProjectVideo",
        "$ npm run visual-review",
        "Review findings ready",
      ],
    },
  ],
});

const plan = compileStoryboardPlanDraft(draft);

assert.equal(plan.title, "系统流程演示");
assert.equal(plan.brief, draft.brief);
assert.equal(plan.language, "zh-CN");
assert.equal(plan.globalStyle, "technical dark UI, step-by-step reveals");
assert.equal(plan.segments.length, 3);

const workflowSegment = plan.segments[0];
assert.equal(workflowSegment?.id, "segment-1");
assert.equal(workflowSegment?.order, 1);
assert.equal(workflowSegment?.templateId, "scene-graph");
assert.equal(workflowSegment?.strategyDecision.strategy, "procedural_generator");
assert.equal(workflowSegment?.strategyDecision.fallbackStrategy, "template_macro");
assert.equal(workflowSegment?.proceduralGenerator?.generatorId, "node-graph-flow");
assert.equal(workflowSegment?.proceduralGenerator?.title, "流程总览");
assert.equal(workflowSegment?.proceduralGenerator?.nodes.length, 6);
assert.equal(workflowSegment?.proceduralGenerator?.edges.length, 5);
assert.equal(workflowSegment?.proceduralGenerator?.beats.length, 6);
assert.equal(workflowSegment?.proceduralGenerator?.beats[0]?.atFrame, 0);

const linePathSegment = plan.segments[1];
assert.equal(linePathSegment?.id, "segment-2");
assert.equal(linePathSegment?.templateId, "scene-graph");
assert.equal(linePathSegment?.proceduralGenerator?.generatorId, "line-path-flow");
assert.equal(linePathSegment?.proceduralGenerator?.points.length, 4);
assert.equal(linePathSegment?.proceduralGenerator?.beats.length, 4);
assert.equal(linePathSegment?.proceduralGenerator?.beats.at(-1)?.atFrame, 180);

const terminalSegment = plan.segments[2];
assert.equal(terminalSegment?.id, "segment-3");
assert.equal(terminalSegment?.templateId, "scene-graph");
assert.equal(terminalSegment?.proceduralGenerator?.generatorId, "terminal-session");
assert.equal(terminalSegment?.proceduralGenerator?.title, "终端验收");
assert.equal(terminalSegment?.proceduralGenerator?.lines.length, 4);
assert.equal(terminalSegment?.proceduralGenerator?.beats.length, 4);
assert.equal(terminalSegment?.proceduralGenerator?.beats[1]?.atFrame, 60);

const longDraft = storyboardPlanDraftSchema.parse({
  title: "Long Draft",
  brief: "Keep draft compilation bounded.",
  segments: [
    {
      title: "Many steps",
      purpose: "Show bounded deterministic node graph generation.",
      narrationText: "Many steps are summarized into a safe workflow graph.",
      visualBrief: "Generate a bounded graph.",
      visualKind: "workflow",
      steps: Array.from({ length: 30 }, (_, index) => `Step ${index + 1}`),
    },
  ],
});

const boundedPlan = compileStoryboardPlanDraft(longDraft);
const boundedGenerator = boundedPlan.segments[0]?.proceduralGenerator;
assert.equal(boundedGenerator?.generatorId, "node-graph-flow");
assert.equal(boundedGenerator?.nodes.length, 12);
assert.equal(boundedGenerator?.beats.length, 12);

const longDurationDraft = storyboardPlanDraftSchema.parse({
  title: "Long Duration Draft",
  brief: "Clamp provider duration hints to the procedural generator schema limit.",
  segments: [
    {
      title: "Long terminal",
      purpose: "Show that long duration hints do not break generator validation.",
      narrationText:
        "A long narration hint should not make the generator duration exceed schema limits.",
      visualBrief: "Show terminal checks for a long-running process.",
      visualKind: "terminal",
      expectedDurationSeconds: 120,
      commands: ["$ npm run build", "Build completed"],
    },
  ],
});

const clampedDurationPlan = compileStoryboardPlanDraft(longDurationDraft);
const clampedGenerator = clampedDurationPlan.segments[0]?.proceduralGenerator;
assert.equal(clampedGenerator?.generatorId, "terminal-session");
assert.equal(clampedGenerator?.durationInFrames, 1200);
assert.equal(clampedGenerator?.beats.at(-1)?.atFrame, 1170);

console.log("Storyboard plan draft smoke passed.");
