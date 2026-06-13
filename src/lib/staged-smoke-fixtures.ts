import { segmentNarrationFromAsset, type SegmentNarrationAsset } from "./narration-asset-schema";
import { normalizeSegmentCaptions } from "./captions";
import {
  videoProjectSchema,
  videoSegmentSchema,
  type VideoProject,
  type VideoSegment,
} from "./project-schema";
import {
  assembleStagedProject,
  orderPlanSegments,
  replaceSegmentAndNarrationLayer,
} from "./staged-project-assembly";
import { storyboardPlanSchema, type StoryboardPlan } from "./storyboard-plan-schema";
import {
  SCENE_GRAPH_TEMPLATE_ID,
  SCRIPTED_TEMPLATE_ID,
  SPOTLIGHT_TEMPLATE_ID,
  STATS_DASHBOARD_TEMPLATE_ID,
} from "./template-registry";

const createNarrationAsset = ({
  durationInFrames,
  segmentId,
  text,
}: {
  durationInFrames: number;
  segmentId: string;
  text: string;
}): SegmentNarrationAsset => ({
  text,
  audioSrc: `/api/tts/assets/smoke/${segmentId}.mp3`,
  durationInFrames,
  durationInSeconds: durationInFrames / 30,
  voiceId: "smoke-voice",
  provider: "fixture",
  format: "mp3",
  captions: normalizeSegmentCaptions({
    durationInFrames,
    language: "en",
    text,
  }),
});

export const mixedTemplateStoryboardPlan: StoryboardPlan = storyboardPlanSchema.parse({
  title: "Mixed Template Staged Smoke",
  brief: "Show a two-part product update with an explanatory setup and a focused recap.",
  language: "en",
  globalStyle: "Clean product demo with crisp transitions and readable contrast.",
  segments: [
    {
      id: "segment-2",
      order: 2,
      title: "Focused recap",
      purpose: "Emphasize the key takeaway after the setup.",
      templateId: SPOTLIGHT_TEMPLATE_ID,
      templateReason: "A focused card is best for a short memorable recap.",
      narration: {
        text: "The result is a faster staged path that keeps edits local and exports cleanly.",
        tone: "confident",
      },
      visualBrief: "A bold headline with three compact callouts.",
      expectedDurationSeconds: 4,
    },
    {
      id: "segment-1",
      order: 1,
      title: "Setup",
      purpose: "Explain why staged generation matters before the recap.",
      templateId: SCRIPTED_TEMPLATE_ID,
      templateReason: "A scripted sequence can introduce the idea with multiple beats.",
      narration: {
        text: "Plan the segment, generate narration, compile the template, then assemble the project.",
        tone: "clear",
      },
      visualBrief: "A title beat followed by concise bullets about the staged pipeline.",
      expectedDurationSeconds: 5,
    },
  ],
});

export const mixedTemplateNarrationAssets: Record<string, SegmentNarrationAsset> = {
  "segment-1": createNarrationAsset({
    durationInFrames: 150,
    segmentId: "segment-1",
    text: mixedTemplateStoryboardPlan.segments[1].narration.text,
  }),
  "segment-2": createNarrationAsset({
    durationInFrames: 120,
    segmentId: "segment-2",
    text: mixedTemplateStoryboardPlan.segments[0].narration.text,
  }),
};

const scriptedSegment = videoSegmentSchema.parse({
  id: "segment-1",
  title: "Setup",
  intent: "Explain why staged generation matters before the recap.",
  templateId: SCRIPTED_TEMPLATE_ID,
  implementation: {
    meta: {
      title: "Setup",
      fps: 30,
      width: 1280,
      height: 720,
    },
    theme: {
      background: "#0f172a",
      panel: "rgba(255,255,255,0.08)",
      primary: "#38bdf8",
      secondary: "#f59e0b",
      text: "#f8fafc",
      muted: "#cbd5e1",
    },
    scenes: [
      {
        id: "setup-title",
        type: "title",
        title: "Staged generation",
        subtitle: "Plan, speak, compile, assemble.",
        duration: 60,
      },
      {
        id: "setup-bullets",
        type: "bullets",
        title: "Why it matters",
        bullets: ["One primary template per segment", "Narration duration drives visuals"],
        duration: 90,
      },
    ],
  },
});

const spotlightSegment = videoSegmentSchema.parse({
  id: "segment-2",
  title: "Focused recap",
  intent: "Emphasize the key takeaway after the setup.",
  templateId: SPOTLIGHT_TEMPLATE_ID,
  implementation: {
    meta: {
      title: "Focused recap",
      fps: 30,
      width: 1280,
      height: 720,
    },
    theme: {
      background: "#111827",
      panel: "rgba(255,255,255,0.10)",
      primary: "#22c55e",
      secondary: "#f97316",
      text: "#f9fafb",
      muted: "#d1d5db",
    },
    durationInFrames: 120,
    kicker: "Recap",
    headline: "Edits stay local",
    subheadline: "The final draft remains a validated VideoProject.",
    callouts: ["Plan", "TTS", "Compile"],
  },
});

export const mixedTemplateCompiledSegments: VideoSegment[] = [scriptedSegment, spotlightSegment];

export const scriptedTemplateSmokeProject: VideoProject = videoProjectSchema.parse({
  meta: {
    title: "Scripted Template Preview",
    fps: 30,
    width: 1280,
    height: 720,
  },
  brief: "Render one scripted template segment.",
  segments: [scriptedSegment],
});

export const spotlightTemplateSmokeProject: VideoProject = videoProjectSchema.parse({
  meta: {
    title: "Spotlight Template Preview",
    fps: 30,
    width: 1280,
    height: 720,
  },
  brief: "Render one spotlight template segment.",
  segments: [spotlightSegment],
});

const mixedTemplateCompiledSegmentsWithNarration = orderPlanSegments(
  mixedTemplateStoryboardPlan,
).map((segmentPlan, index) =>
  videoSegmentSchema.parse({
    ...mixedTemplateCompiledSegments[index],
    narration: segmentNarrationFromAsset(mixedTemplateNarrationAssets[segmentPlan.id]),
  }),
);

export const mixedTemplateStagedProject: VideoProject = assembleStagedProject({
  compiledSegments: mixedTemplateCompiledSegmentsWithNarration.map((segment) => ({ segment })),
  plan: mixedTemplateStoryboardPlan,
});

const revisedSpotlightSegment = videoSegmentSchema.parse({
  ...spotlightSegment,
  title: "Focused recap revised",
  intent: "Emphasize the revised takeaway after the setup.",
  implementation: {
    ...spotlightSegment.implementation,
    meta: {
      ...spotlightSegment.implementation.meta,
      title: "Focused recap revised",
    },
    durationInFrames: 150,
    headline: "Regeneration stays scoped",
    callouts: ["Target segment", "Fresh narration", "Preserved setup"],
  },
});

export const mixedTemplateSegmentRevisionProject: VideoProject = replaceSegmentAndNarrationLayer({
  narration: createNarrationAsset({
    durationInFrames: 150,
    segmentId: "segment-2",
    text: "Only the target segment gets fresh narration and template parameters.",
  }),
  project: mixedTemplateStagedProject,
  segment: revisedSpotlightSegment,
  segmentId: "segment-2",
});

const assertMixedTemplateFixture = (): void => {
  const [firstSegment, secondSegment] = mixedTemplateStagedProject.segments;
  const [revisedFirstSegment, revisedSecondSegment] = mixedTemplateSegmentRevisionProject.segments;

  if (firstSegment.templateId !== SCRIPTED_TEMPLATE_ID) {
    throw new Error("Mixed-template smoke fixture expected segment-1 to use scripted.");
  }
  if (secondSegment.templateId !== SPOTLIGHT_TEMPLATE_ID) {
    throw new Error("Mixed-template smoke fixture expected segment-2 to use spotlight.");
  }
  if (
    firstSegment.narration?.audio?.src !== "/api/tts/assets/smoke/segment-1.mp3" ||
    secondSegment.narration?.audio?.src !== "/api/tts/assets/smoke/segment-2.mp3"
  ) {
    throw new Error("Mixed-template smoke fixture expected segment-owned narration audio.");
  }
  if (
    !firstSegment.narration?.captions?.cues.length ||
    !secondSegment.narration?.captions?.cues.length
  ) {
    throw new Error("Mixed-template smoke fixture expected segment-owned captions.");
  }
  if (mixedTemplateStagedProject.media?.layers.some((layer) => layer.kind === "narration")) {
    throw new Error("Mixed-template smoke fixture should not use project-level narration layers.");
  }
  if (JSON.stringify(revisedFirstSegment) !== JSON.stringify(firstSegment)) {
    throw new Error("Mixed-template smoke fixture should preserve the non-target segment data.");
  }
  if (
    revisedSecondSegment.narration?.text !==
    "Only the target segment gets fresh narration and template parameters."
  ) {
    throw new Error("Mixed-template smoke fixture should replace target segment narration.");
  }
  if (!revisedSecondSegment.narration?.captions?.cues.length) {
    throw new Error("Mixed-template smoke fixture should replace target segment captions.");
  }
};

assertMixedTemplateFixture();

export const mixedTemplateSmokeFixtureSummary = {
  segmentCount: mixedTemplateStagedProject.segments.length,
  templateIds: mixedTemplateStagedProject.segments.map((segment) => segment.templateId),
  narrationAudioSources: mixedTemplateStagedProject.segments.map(
    (segment) => segment.narration?.audio?.src,
  ),
  revisedNarrationAudioSources: mixedTemplateSegmentRevisionProject.segments.map(
    (segment) => segment.narration?.audio?.src,
  ),
  captionCueCounts: mixedTemplateStagedProject.segments.map(
    (segment) => segment.narration?.captions?.cues.length ?? 0,
  ),
};

const statsDashboardSegment = videoSegmentSchema.parse({
  id: "segment-1",
  title: "Dashboard recap",
  intent: "Summarize a data-backed quarterly growth result.",
  templateId: STATS_DASHBOARD_TEMPLATE_ID,
  implementation: {
    meta: {
      title: "Dashboard recap",
      fps: 30,
      width: 1280,
      height: 720,
    },
    theme: {
      background: "#0f172a",
      panel: "rgba(248,250,252,0.10)",
      primary: "#38bdf8",
      secondary: "#f59e0b",
      text: "#f8fafc",
      muted: "#cbd5e1",
    },
    durationInFrames: 180,
    layout: "timeline",
    kicker: "Quarterly KPI",
    title: "Revenue momentum is compounding",
    subtitle: "A sequenced dashboard can reveal KPI, trend, and share blocks inside one segment.",
    blocks: [
      {
        id: "revenue-kpi",
        type: "kpi",
        title: "Primary signal",
        value: "+42%",
        label: "Revenue growth",
        delta: "+11 pts vs last quarter",
        deltaDirection: "up",
      },
      {
        id: "revenue-trend",
        type: "line-chart",
        title: "Revenue index",
        chart: {
          categories: ["Q1", "Q2", "Q3", "Q4"],
          series: [
            {
              name: "Revenue index",
              values: [42, 58, 73, 96],
              color: "#38bdf8",
            },
          ],
          unit: "index",
          maxValue: 100,
          highlightIndex: 3,
        },
      },
      {
        id: "channel-mix",
        type: "donut-chart",
        title: "Channel mix",
        centerValue: "52%",
        centerLabel: "Paid search",
        segments: [
          { label: "Paid search", value: 52, color: "#38bdf8" },
          { label: "Organic", value: 28, color: "#22c55e" },
          { label: "Referral", value: 20, color: "#f59e0b" },
        ],
      },
      {
        id: "takeaway",
        type: "insight",
        title: "Takeaway",
        text: "Mid-quarter campaign tuning lifted both revenue velocity and paid-search share.",
      },
    ],
    timeline: [
      {
        from: 0,
        durationInFrames: 70,
        blockIds: ["revenue-kpi"],
        layout: "single",
      },
      {
        from: 58,
        durationInFrames: 82,
        blockIds: ["revenue-trend"],
        layout: "single",
      },
      {
        from: 132,
        durationInFrames: 48,
        blockIds: ["revenue-kpi", "revenue-trend", "channel-mix", "takeaway"],
        layout: "grid",
      },
    ],
    footerNote: "Fixture data for deterministic template smoke.",
  },
});

export const statsDashboardSmokeProject: VideoProject = videoProjectSchema.parse({
  meta: {
    title: "Stats Dashboard Smoke",
    fps: 30,
    width: 1280,
    height: 720,
  },
  brief: "Render one data-statistics segment with segment-owned narration.",
  segments: [statsDashboardSegment],
});

const assertStatsDashboardFixture = (): void => {
  const [segment] = statsDashboardSmokeProject.segments;

  if (segment.templateId !== STATS_DASHBOARD_TEMPLATE_ID) {
    throw new Error("Stats-dashboard smoke fixture expected segment-1 to use stats-dashboard.");
  }
};

assertStatsDashboardFixture();

export const sceneGraphShotLanguagePlan = {
  visualStyle: "Cinematic product explainer with deep blue surfaces and amber continuity marks.",
  colorSystem: {
    background: "#08111f",
    foreground: "#f8fafc",
    accent: "#f59e0b",
    contrast: "high",
  },
  motionSystem: {
    camera: ["push-in", "drift", "pan"],
    transitions: ["soft-wipe", "slide", "zoom"],
    textMotion: "editorial",
  },
  rhythm: {
    opener: "fast",
    middle: "steady",
    ending: "slow",
  },
  recurringMotifs: ["grid sweep", "amber lockup", "caption-safe lower band"],
  captionStyle: {
    position: "bottom",
    treatment: "cinematic",
  },
} as const;

const sceneGraphSegments: VideoSegment[] = [
  videoSegmentSchema.parse({
    id: "segment-1",
    title: "Visual opener",
    intent: "Open with a strong shot-language hook.",
    templateId: SCENE_GRAPH_TEMPLATE_ID,
    narration: segmentNarrationFromAsset(
      createNarrationAsset({
        durationInFrames: 120,
        segmentId: "scene-graph-1",
        text: "Start with a visual system that feels authored, not assembled from static cards.",
      }),
    ),
    implementation: {
      meta: {
        title: "Visual opener",
        fps: 30,
        width: 1280,
        height: 720,
      },
      theme: {
        background: "#08111f",
        panel: "rgba(248,250,252,0.10)",
        primary: "#7dd3fc",
        secondary: "#f59e0b",
        text: "#f8fafc",
        muted: "#cbd5e1",
      },
      sceneType: "opener",
      renderStrategy: "primitive_scene_graph",
      composition: "hero",
      layout: "full-bleed",
      durationInFrames: 120,
      camera: {
        movement: "push-in",
        intensity: "medium",
      },
      transitionOut: {
        type: "soft-wipe",
        durationInFrames: 14,
      },
      captionSafeZone: true,
      layers: [
        {
          id: "opener-bg",
          type: "background",
          treatment: "depth-gradient",
        },
        {
          id: "opener-beam",
          type: "shape",
          shape: "beam",
          tone: "primary",
          layout: "full-bleed",
          motionPreset: "camera-push",
          startFrame: 0,
          durationInFrames: 118,
        },
        {
          id: "opener-frame",
          type: "shape",
          shape: "frame",
          tone: "secondary",
          layout: "full-bleed",
          motionPreset: "fade-in",
          startFrame: 10,
          durationInFrames: 100,
        },
        {
          id: "opener-title",
          type: "kinetic-title",
          text: "Visual IR for technical video",
          emphasis: ["primitive scene graph", "bounded motion", "caption-safe"],
          layout: "full-bleed",
          motionPreset: "camera-push",
          startFrame: 8,
          durationInFrames: 96,
        },
        {
          id: "opener-path",
          type: "line-path",
          points: [
            { x: 0.1, y: 0.74, label: "brief" },
            { x: 0.34, y: 0.62, label: "graph" },
            { x: 0.62, y: 0.7, label: "render" },
            { x: 0.88, y: 0.54, label: "export" },
          ],
          tone: "secondary",
          showNodes: true,
          motionPreset: "draw-path",
          startFrame: 34,
          durationInFrames: 78,
        },
        {
          id: "opener-cursor",
          type: "cursor",
          label: "compile",
          path: [
            { x: 0.12, y: 0.74 },
            { x: 0.35, y: 0.62 },
            { x: 0.62, y: 0.7 },
            { x: 0.88, y: 0.54 },
          ],
          clickFrame: 72,
          motionPreset: "highlight",
          startFrame: 40,
          durationInFrames: 72,
        },
        {
          id: "opener-caption-zone",
          type: "caption",
          source: "segment-narration",
        },
      ],
      beats: [
        { atFrame: 0, action: "reveal-layer", targetLayerId: "opener-beam" },
        { atFrame: 8, action: "reveal-layer", targetLayerId: "opener-title" },
        { atFrame: 34, action: "reveal-layer", targetLayerId: "opener-path" },
        { atFrame: 40, action: "reveal-layer", targetLayerId: "opener-cursor" },
      ],
    },
  }),
  videoSegmentSchema.parse({
    id: "segment-2",
    title: "Process explanation",
    intent: "Explain the bounded scene graph path with distinct process rhythm.",
    templateId: SCENE_GRAPH_TEMPLATE_ID,
    narration: segmentNarrationFromAsset(
      createNarrationAsset({
        durationInFrames: 150,
        segmentId: "scene-graph-2",
        text: "Each segment carries validated layers, local beats, and a camera move while captions stay outside the renderer data.",
      }),
    ),
    implementation: {
      meta: {
        title: "Process explanation",
        fps: 30,
        width: 1280,
        height: 720,
      },
      theme: {
        background: "#0b1325",
        panel: "rgba(255,255,255,0.09)",
        primary: "#22c55e",
        secondary: "#f59e0b",
        text: "#f8fafc",
        muted: "#cbd5e1",
      },
      sceneType: "process",
      renderStrategy: "primitive_scene_graph",
      composition: "node-graph",
      layout: "node-graph",
      durationInFrames: 150,
      camera: {
        movement: "drift",
        intensity: "subtle",
      },
      transitionIn: {
        type: "slide-up",
        durationInFrames: 12,
      },
      transitionOut: {
        type: "slide-left",
        durationInFrames: 12,
      },
      captionSafeZone: true,
      layers: [
        {
          id: "process-bg",
          type: "background",
          treatment: "noise-grid",
        },
        {
          id: "process-title",
          type: "text",
          text: "Bounded renderer pipeline",
          role: "eyebrow",
          layout: "left",
          startFrame: 0,
          durationInFrames: 64,
        },
        {
          id: "process-graph",
          type: "node-graph",
          title: "prompt -> graph -> code/test -> export",
          nodes: [
            { id: "prompt", label: "Prompt", detail: "intent", status: "success", lane: "input" },
            { id: "task", label: "Task", detail: "shot plan", status: "success", lane: "plan" },
            {
              id: "graph",
              label: "SceneGraph",
              detail: "validated IR",
              status: "active",
              lane: "build",
            },
            { id: "code", label: "Compile", detail: "Remotion", status: "active", lane: "build" },
            { id: "test", label: "Smoke", detail: "stills", status: "success", lane: "verify" },
            {
              id: "export",
              label: "ProjectVideo",
              detail: "same payload",
              status: "success",
              lane: "output",
            },
          ],
          edges: [
            { from: "prompt", to: "task", status: "success" },
            { from: "task", to: "graph", status: "success" },
            { from: "graph", to: "code", status: "active" },
            { from: "code", to: "test", status: "active" },
            { from: "test", to: "export", status: "success" },
          ],
          layout: "pipeline",
          motionPreset: "draw-path",
          startFrame: 18,
          durationInFrames: 122,
        },
        {
          id: "process-code",
          type: "code-panel",
          title: "scene-graph.ts",
          language: "ts",
          lines: [
            "renderStrategy: 'primitive_scene_graph',",
            "composition: 'node-graph',",
            "layout: 'node-graph',",
            "layers: [NodeGraph, LinePath, TerminalPanel],",
            "captions: segment.narration.captions",
          ],
          highlightLines: [1, 4, 5],
          layout: "right",
          motionPreset: "type-text",
          startFrame: 64,
          durationInFrames: 78,
        },
        {
          id: "process-terminal",
          type: "terminal-panel",
          title: "fixture smoke",
          lines: ["validate scene graph", "bundle ProjectVideo", "render deterministic stills"],
          status: "success",
          layout: "bottom",
          motionPreset: "type-text",
          startFrame: 92,
          durationInFrames: 54,
        },
        {
          id: "process-caption-zone",
          type: "caption",
          source: "segment-narration",
        },
      ],
      beats: [
        { atFrame: 18, action: "reveal-layer", targetLayerId: "process-graph" },
        { atFrame: 64, action: "reveal-layer", targetLayerId: "process-code" },
        { atFrame: 92, action: "reveal-layer", targetLayerId: "process-terminal" },
      ],
    },
  }),
  videoSegmentSchema.parse({
    id: "segment-3",
    title: "Closing lockup",
    intent: "Close with a coherent visual language lockup.",
    templateId: SCENE_GRAPH_TEMPLATE_ID,
    narration: segmentNarrationFromAsset(
      createNarrationAsset({
        durationInFrames: 120,
        segmentId: "scene-graph-3",
        text: "The result is a flexible visual path that still exports from the same validated project payload.",
      }),
    ),
    implementation: {
      meta: {
        title: "Closing lockup",
        fps: 30,
        width: 1280,
        height: 720,
      },
      theme: {
        background: "#101827",
        panel: "rgba(248,250,252,0.10)",
        primary: "#f59e0b",
        secondary: "#7dd3fc",
        text: "#f8fafc",
        muted: "#cbd5e1",
      },
      sceneType: "closing",
      renderStrategy: "primitive_scene_graph",
      composition: "lockup",
      layout: "safe-lockup",
      durationInFrames: 120,
      camera: {
        movement: "zoom-through",
        intensity: "subtle",
      },
      transitionIn: {
        type: "zoom-through",
        durationInFrames: 16,
      },
      captionSafeZone: true,
      layers: [
        {
          id: "closing-bg",
          type: "background",
          treatment: "depth-gradient",
        },
        {
          id: "closing-frame",
          type: "shape",
          shape: "frame",
          tone: "primary",
          layout: "full-bleed",
          motionPreset: "match-cut",
          startFrame: 0,
          durationInFrames: 118,
        },
        {
          id: "closing-title",
          type: "kinetic-title",
          text: "Validated visuals. Same product loop.",
          emphasis: ["preview", "edit", "export"],
          layout: "lockup",
          motionPreset: "success-pulse",
          startFrame: 6,
          durationInFrames: 104,
        },
        {
          id: "closing-summary",
          type: "rich-text",
          title: "Visual IR v1 boundary",
          body: [
            "No generated TSX",
            "No media ingestion",
            "Captions stay segment-owned",
            "ProjectVideo remains export entrypoint",
          ],
          layout: "split-left",
          motionPreset: "slide-in",
          startFrame: 34,
          durationInFrames: 76,
        },
        {
          id: "closing-terminal",
          type: "terminal-panel",
          title: "export contract",
          lines: [
            "ProjectVideo composition found",
            "scene-graph fixture rendered",
            "local export path preserved",
          ],
          status: "success",
          layout: "right",
          motionPreset: "type-text",
          startFrame: 50,
          durationInFrames: 60,
        },
        {
          id: "closing-caption-zone",
          type: "caption",
          source: "segment-narration",
        },
      ],
      beats: [
        { atFrame: 0, action: "reveal-layer", targetLayerId: "closing-frame" },
        { atFrame: 6, action: "reveal-layer", targetLayerId: "closing-title" },
        { atFrame: 34, action: "reveal-layer", targetLayerId: "closing-summary" },
        { atFrame: 50, action: "reveal-layer", targetLayerId: "closing-terminal" },
      ],
    },
  }),
];

export const sceneGraphSmokeProject: VideoProject = videoProjectSchema.parse({
  meta: {
    title: "Scene Graph Smoke",
    fps: 30,
    width: 1280,
    height: 720,
  },
  brief: "Render three scene-graph segments through the existing VideoProject path.",
  visualLanguage: sceneGraphShotLanguagePlan,
  segments: sceneGraphSegments,
});

const assertSceneGraphFixture = (): void => {
  if (sceneGraphSmokeProject.segments.length !== 3) {
    throw new Error("Scene-graph smoke fixture expected three segments.");
  }
  if (!sceneGraphSmokeProject.visualLanguage) {
    throw new Error("Scene-graph smoke fixture expected a project-level ShotLanguagePlan.");
  }
  if (
    sceneGraphSmokeProject.segments.some(
      (segment) => segment.templateId !== SCENE_GRAPH_TEMPLATE_ID,
    )
  ) {
    throw new Error("Scene-graph smoke fixture expected all segments to use scene-graph.");
  }
  if (
    sceneGraphSmokeProject.segments.some((segment) => !segment.narration?.captions?.cues.length)
  ) {
    throw new Error("Scene-graph smoke fixture expected segment-owned captions.");
  }
};

assertSceneGraphFixture();
