import {
  LINE_PATH_FLOW_GENERATOR_ID,
  NODE_GRAPH_FLOW_GENERATOR_ID,
  TERMINAL_SESSION_GENERATOR_ID,
  proceduralGeneratorSchema,
  type ProceduralGenerator,
} from "./procedural-generator-schema";
import {
  storyboardPlanSchema,
  type StoryboardPlan,
  type StoryboardSegmentPlan,
} from "./storyboard-plan-schema";
import type {
  StoryboardPlanDraft,
  StoryboardPlanDraftSegment,
} from "./storyboard-plan-draft-schema";

const FPS = 30;
const DEFAULT_SEGMENT_DURATION_SECONDS = 7;
const MIN_PROCEDURAL_DURATION_FRAMES = 45;
const MAX_PROCEDURAL_DURATION_FRAMES = 1200;

const fallbackTitle = (segment: StoryboardPlanDraftSegment, index: number): string =>
  segment.title ?? `Segment ${index + 1}`;

const stableId = (prefix: string, index: number): string => `${prefix}-${index + 1}`;

const segmentDurationInFrames = (segment: StoryboardPlanDraftSegment): number =>
  Math.min(
    MAX_PROCEDURAL_DURATION_FRAMES,
    Math.max(
      MIN_PROCEDURAL_DURATION_FRAMES,
      Math.round((segment.expectedDurationSeconds ?? DEFAULT_SEGMENT_DURATION_SECONDS) * FPS),
    ),
  );

const beatFrame = (index: number, count: number, durationInFrames: number): number => {
  if (count <= 1) {
    return 0;
  }
  const finalFrame = Math.max(0, durationInFrames - FPS);
  return Math.min(finalFrame, Math.round((finalFrame * index) / (count - 1)));
};

const normalizeItems = ({
  fallback,
  items,
  max,
  min,
}: {
  fallback: string[];
  items?: string[];
  max: number;
  min: number;
}): string[] => {
  const source = (items?.length ? items : fallback)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  const unique = Array.from(new Set(source)).slice(0, max);

  while (unique.length < min) {
    unique.push(`Step ${unique.length + 1}`);
  }

  return unique;
};

const buildStrategyDecision = (
  segment: StoryboardPlanDraftSegment,
): StoryboardSegmentPlan["strategyDecision"] => {
  if (segment.visualKind === "template_macro") {
    return {
      confidence: 0.72,
      fallbackStrategy: "template_macro",
      reason: "Use a registered macro template for this semantic segment draft.",
      strategy: "template_macro",
    };
  }

  return {
    confidence: 0.88,
    fallbackStrategy: "template_macro",
    reason: `Use a deterministic ${segment.visualKind.replace("_", " ")} procedural generator for this segment draft.`,
    strategy: "procedural_generator",
  };
};

const compileWorkflowGenerator = (
  segment: StoryboardPlanDraftSegment,
  index: number,
): ProceduralGenerator => {
  const title = fallbackTitle(segment, index);
  const durationInFrames = segmentDurationInFrames(segment);
  const stepLabels = normalizeItems({
    fallback: [title, "Plan", "Build", "Review"],
    items: segment.steps,
    max: 12,
    min: 2,
  });
  const nodes = stepLabels.map((label, stepIndex) => ({
    id: stableId("node", stepIndex),
    label,
    lane: (["input", "plan", "build", "verify", "output"] as const)[
      Math.min(4, Math.floor((stepIndex / Math.max(1, stepLabels.length - 1)) * 4))
    ],
    status: "idle" as const,
  }));
  const edges = nodes.slice(0, -1).map((node, edgeIndex) => ({
    from: node.id,
    status: "idle" as const,
    to: nodes[edgeIndex + 1]?.id ?? node.id,
  }));

  return proceduralGeneratorSchema.parse({
    beats: nodes.map((node, beatIndex) => ({
      action: beatIndex === 0 ? ("reveal" as const) : ("activate" as const),
      atFrame: beatFrame(beatIndex, nodes.length, durationInFrames),
      nodeId: node.id,
    })),
    durationInFrames,
    edges,
    generatorId: NODE_GRAPH_FLOW_GENERATOR_ID,
    nodes,
    renderStrategy: "procedural_generator",
    title,
  });
};

const compileLinePathGenerator = (
  segment: StoryboardPlanDraftSegment,
  index: number,
): ProceduralGenerator => {
  const title = fallbackTitle(segment, index);
  const durationInFrames = segmentDurationInFrames(segment);
  const pointLabels = normalizeItems({
    fallback: [title, "Progress", "Outcome"],
    items: segment.steps,
    max: 8,
    min: 2,
  });
  const points = pointLabels.map((label, pointIndex) => {
    const ratio = pointLabels.length <= 1 ? 0 : pointIndex / (pointLabels.length - 1);
    return {
      id: stableId("point", pointIndex),
      label,
      x: Number((0.12 + ratio * 0.76).toFixed(3)),
      y: Number((0.5 + (pointIndex % 2 === 0 ? -0.08 : 0.08)).toFixed(3)),
    };
  });

  return proceduralGeneratorSchema.parse({
    beats: points.map((point, beatIndex) => ({
      action: beatIndex === 0 ? ("reveal" as const) : ("advance" as const),
      atFrame: beatFrame(beatIndex, points.length, durationInFrames),
      pointId: point.id,
    })),
    durationInFrames,
    generatorId: LINE_PATH_FLOW_GENERATOR_ID,
    points,
    renderStrategy: "procedural_generator",
    title,
  });
};

const compileTerminalGenerator = (
  segment: StoryboardPlanDraftSegment,
  index: number,
): ProceduralGenerator => {
  const title = fallbackTitle(segment, index);
  const durationInFrames = segmentDurationInFrames(segment);
  const commandLines = normalizeItems({
    fallback: ["$ npm run build", "Build completed", "$ npm run smoke", "Smoke checks passed"],
    items: segment.commands ?? segment.steps,
    max: 8,
    min: 1,
  });
  const lines = commandLines.map((text, lineIndex) => ({
    id: stableId("line", lineIndex),
    status:
      text.trim().startsWith("$") || text.includes("npm") || text.includes("docker")
        ? ("running" as const)
        : ("success" as const),
    text,
  }));

  return proceduralGeneratorSchema.parse({
    beats: lines.map((line, beatIndex) => ({
      action: line.status === "running" ? ("run" as const) : ("complete" as const),
      atFrame: beatFrame(beatIndex, lines.length, durationInFrames),
      lineId: line.id,
    })),
    durationInFrames,
    generatorId: TERMINAL_SESSION_GENERATOR_ID,
    lines,
    prompt: "$",
    renderStrategy: "procedural_generator",
    title,
  });
};

const compileProceduralGenerator = (
  segment: StoryboardPlanDraftSegment,
  index: number,
): ProceduralGenerator | undefined => {
  if (segment.visualKind === "workflow") {
    return compileWorkflowGenerator(segment, index);
  }
  if (segment.visualKind === "line_path") {
    return compileLinePathGenerator(segment, index);
  }
  if (segment.visualKind === "terminal") {
    return compileTerminalGenerator(segment, index);
  }
  return undefined;
};

const compileSegment = (
  segment: StoryboardPlanDraftSegment,
  index: number,
): StoryboardSegmentPlan => {
  const title = fallbackTitle(segment, index);
  const proceduralGenerator = compileProceduralGenerator(segment, index);

  return {
    ...(segment.expectedDurationSeconds
      ? { expectedDurationSeconds: segment.expectedDurationSeconds }
      : {}),
    ...(segment.pacingHint ? { pacingHint: segment.pacingHint } : {}),
    ...(proceduralGenerator ? { proceduralGenerator } : {}),
    id: stableId("segment", index),
    narration: {
      ...(segment.narrationTone ? { tone: segment.narrationTone } : {}),
      text: segment.narrationText,
    },
    order: index + 1,
    purpose: segment.purpose,
    strategyDecision: buildStrategyDecision(segment),
    templateId: proceduralGenerator ? "scene-graph" : "spotlight",
    templateReason: proceduralGenerator
      ? "SceneGraph can render this deterministic procedural visual draft."
      : "Spotlight is a stable macro template for this semantic segment draft.",
    title,
    visualBrief: segment.visualBrief,
  };
};

export const compileStoryboardPlanDraft = (draft: StoryboardPlanDraft): StoryboardPlan => {
  const candidate = {
    ...(draft.globalStyle ? { globalStyle: draft.globalStyle } : {}),
    ...(draft.language ? { language: draft.language } : {}),
    brief: draft.brief,
    segments: draft.segments.map(compileSegment),
    title: draft.title,
  };

  return storyboardPlanSchema.parse(candidate);
};
