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
  SCRIPTED_TEMPLATE_ID,
  SPOTLIGHT_TEMPLATE_ID,
  STATS_DASHBOARD_TEMPLATE_ID,
  TECHNICAL_EXPLAINER_TEMPLATE_ID,
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

const technicalExplainerImplementation = {
  meta: {
    title: "Recipe runtime explained",
    fps: 30,
    width: 1280,
    height: 720,
  },
  theme: {
    background: "#0b1020",
    panel: "rgba(255,255,255,0.10)",
    primary: "#38bdf8",
    secondary: "#f59e0b",
    text: "#f8fafc",
    muted: "#cbd5e1",
  },
  durationInFrames: 720,
  title: "Recipe primitives now power a real template",
  subtitle: "Phase 3 proves the runtime boundary without changing the product flow.",
  sections: [
    {
      id: "hero",
      recipeId: "hero-title-reveal",
      title: "Phase 3",
      eyebrow: "Visual recipe compiler",
      primaryText: "Reusable recipes become generated segments",
      secondaryText: "A registered template keeps AI output bounded and editable.",
      callouts: ["Template", "Recipes", "ProjectVideo"],
      durationInFrames: 90,
    },
    {
      id: "workflow",
      recipeId: "workflow-node-map",
      title: "Pipeline",
      nodes: [
        { id: "plan", label: "StoryboardPlan", detail: "Segment intent" },
        { id: "voice", label: "Narration", detail: "Audio + captions" },
        { id: "compile", label: "Template compile", detail: "Schema-valid params" },
        { id: "render", label: "ProjectVideo", detail: "Preview and export" },
      ],
      activeNodeId: "compile",
      durationInFrames: 90,
    },
    {
      id: "terminal",
      recipeId: "terminal-build-run",
      title: "Runtime check",
      command: "npm run smoke:technical-explainer-template",
      lines: [
        "checking template id",
        "checking runtime bundle",
        "checking Remotion preview",
        "technical explainer template smoke passed",
      ],
      statusLabel: "Green",
      durationInFrames: 90,
    },
    {
      id: "metrics",
      recipeId: "metric-countup",
      title: "Outcome",
      metrics: [
        { label: "Recipe sections", value: "5", detail: "Bounded visual treatments" },
        { label: "Template instances", value: "1", detail: "One primary template per segment" },
        { label: "Generated TSX", value: "0", detail: "Structured params only" },
      ],
      durationInFrames: 75,
    },
    {
      id: "timeline",
      recipeId: "timeline-progress",
      title: "Delivery path",
      checkpoints: ["Schema", "Runtime", "Fixture", "Preview", "Export"],
      note: "The same ProjectVideo composition remains the preview and export boundary.",
      durationInFrames: 75,
    },
    {
      id: "code-diff",
      recipeId: "code-diff-highlight",
      title: "Compiler boundary stays structured",
      subtitle: "The model changes data, not renderer code.",
      fileLabel: "src/templates/technical-explainer/schema.ts",
      beforeLabel: "Before",
      afterLabel: "After",
      lines: [
        { text: "template: simple spotlight", mode: "remove" },
        { text: "recipe: code-diff-highlight", mode: "add", focus: true },
        { text: "recipe: decision-matrix", mode: "add", focus: true },
        { text: "output: VideoProject", mode: "neutral" },
      ],
      note: "The section remains schema-valid template data.",
      durationInFrames: 75,
    },
    {
      id: "compare",
      recipeId: "before-after-compare",
      title: "From sparse template output to recipe coverage",
      subtitle: "The product model stays stable while the visual vocabulary grows.",
      before: {
        label: "Before",
        headline: "Five generated recipes",
        points: ["Good skeleton", "Limited contrast scenes", "Code changes stuck in showcase"],
      },
      after: {
        label: "After",
        headline: "Nine generated recipes",
        points: ["Code diffs compile", "Tradeoffs render", "Architecture boundaries show clearly"],
      },
      emphasis: "More visual range without media-library scope.",
      durationInFrames: 75,
    },
    {
      id: "decision",
      recipeId: "decision-matrix",
      title: "Choose the next bounded slice",
      subtitle: "Tradeoffs stay readable without turning the project into a planning deck.",
      criteria: ["Visual impact", "Scope risk", "Reuse"],
      options: [
        {
          label: "Asset-aware recipes",
          summary: "Powerful but wider",
          scores: [
            { criterion: "Visual impact", rating: "high", note: "Real material helps" },
            { criterion: "Scope risk", rating: "low", note: "Needs asset rules" },
            { criterion: "Reuse", rating: "medium", note: "Useful later" },
          ],
        },
        {
          label: "Recipe expansion",
          summary: "Best next branch fit",
          scores: [
            { criterion: "Visual impact", rating: "high", note: "More scene language" },
            { criterion: "Scope risk", rating: "high", note: "No new asset model" },
            { criterion: "Reuse", rating: "high", note: "Compiler can select it" },
          ],
          recommended: true,
        },
      ],
      decision: "Expand generated recipe coverage before Phase 5 assets.",
      durationInFrames: 75,
    },
    {
      id: "layers",
      recipeId: "architecture-layer-stack",
      title: "Keep ownership layered",
      subtitle: "Recipes grow inside the template while the product model stays stable.",
      layers: [
        { label: "VideoProject", detail: "Preview and export boundary", tone: "interface" },
        { label: "StoryboardPlan", detail: "Planner-stage segment intent", tone: "foundation" },
        { label: "technical-explainer", detail: "Template-owned recipe schema", tone: "runtime" },
        { label: "DeepSeek", detail: "Compiler fills bounded parameters", tone: "provider" },
      ],
      dataFlow: ["brief", "recipeHints", "implementation", "ProjectVideo"],
      emphasis: "More recipes, same segment-first architecture.",
      durationInFrames: 75,
    },
  ],
};

const technicalExplainerSegment = videoSegmentSchema.parse({
  id: "segment-1",
  title: "Recipe runtime explained",
  intent: "Explain how recipe primitives become real generated template output.",
  templateId: TECHNICAL_EXPLAINER_TEMPLATE_ID,
  implementation: technicalExplainerImplementation,
});

export const technicalExplainerSmokeProject: VideoProject = videoProjectSchema.parse({
  meta: {
    title: "Technical Explainer Smoke",
    fps: 30,
    width: 1280,
    height: 720,
  },
  brief: "Render one recipe-oriented technical explainer segment.",
  segments: [technicalExplainerSegment],
});

export const technicalExplainerStoryboardPlan: StoryboardPlan = storyboardPlanSchema.parse({
  title: "Technical Explainer Multi-Segment Smoke",
  brief: "Explain how reusable recipe primitives become real generated segments.",
  language: "en",
  globalStyle: "Crisp technical explainer with strong motion and readable contrast.",
  segments: [
    {
      id: "segment-1",
      order: 1,
      title: "Runtime boundary",
      purpose: "Show the registered template boundary.",
      templateId: TECHNICAL_EXPLAINER_TEMPLATE_ID,
      templateReason:
        "A recipe-oriented template can explain the runtime with multiple visual beats.",
      narration: {
        text: "Phase three takes the reusable recipe primitives and makes them part of a real generated template.",
        tone: "clear",
      },
      visualBrief: "Hero title, workflow map, and terminal smoke check.",
      recipeHints: [
        {
          recipeId: "hero-title-reveal",
          reason: "The opening beat introduces the phase three template boundary.",
        },
        {
          recipeId: "workflow-node-map",
          reason:
            "The segment explains how reusable recipe primitives flow into generated output.",
        },
        {
          recipeId: "terminal-build-run",
          reason: "The segment references the deterministic smoke check path.",
        },
        {
          recipeId: "code-diff-highlight",
          reason: "The segment explains a concrete implementation change.",
        },
        {
          recipeId: "architecture-layer-stack",
          reason:
            "The segment explains ownership boundaries between planning, compiling, and rendering.",
        },
      ],
      expectedDurationSeconds: 7,
    },
    {
      id: "segment-2",
      order: 2,
      title: "Delivery path",
      purpose: "Show the measurable outcome and implementation checkpoints.",
      templateId: TECHNICAL_EXPLAINER_TEMPLATE_ID,
      templateReason: "The metric and timeline recipes fit a concise delivery recap.",
      narration: {
        text: "The result is still a normal VideoProject, with preview and export using the same ProjectVideo composition.",
        tone: "confident",
      },
      visualBrief: "Metric cards followed by a timeline progress view.",
      recipeHints: [
        {
          recipeId: "metric-countup",
          reason: "The segment recaps measurable outcomes.",
        },
        {
          recipeId: "timeline-progress",
          reason: "The segment closes with implementation checkpoints.",
        },
        {
          recipeId: "before-after-compare",
          reason: "The segment compares the previous recipe range with the expanded range.",
        },
        {
          recipeId: "decision-matrix",
          reason:
            "The segment explains why recipe expansion is the better bounded next slice.",
        },
      ],
      expectedDurationSeconds: 6,
    },
  ],
});

const technicalExplainerCompiledSegments = [
  videoSegmentSchema.parse({
    ...technicalExplainerSegment,
    id: "segment-1",
    title: "Runtime boundary",
    intent: "Show the registered template boundary.",
  }),
  videoSegmentSchema.parse({
    ...technicalExplainerSegment,
    id: "segment-2",
    title: "Delivery path",
    intent: "Show the measurable outcome and implementation checkpoints.",
    implementation: {
      ...technicalExplainerImplementation,
      meta: {
        ...technicalExplainerImplementation.meta,
        title: "Delivery path",
      },
      title: "Preview and export stay unified",
      subtitle: "The recipe template is still just one segment implementation.",
      durationInFrames: 480,
      sections: technicalExplainerImplementation.sections.filter((section) =>
        ["metric-countup", "timeline-progress", "before-after-compare", "decision-matrix"].includes(
          section.recipeId,
        ),
      ),
    },
  }),
];

const technicalExplainerCompiledSegmentsWithNarration = orderPlanSegments(
  technicalExplainerStoryboardPlan,
).map((segmentPlan, index) =>
  videoSegmentSchema.parse({
    ...technicalExplainerCompiledSegments[index],
    narration: segmentNarrationFromAsset(
      createNarrationAsset({
        durationInFrames: index === 0 ? 210 : 180,
        segmentId: segmentPlan.id,
        text: segmentPlan.narration.text,
      }),
    ),
  }),
);

export const technicalExplainerStagedProject: VideoProject = assembleStagedProject({
  compiledSegments: technicalExplainerCompiledSegmentsWithNarration.map((segment) => ({ segment })),
  plan: technicalExplainerStoryboardPlan,
});

const assertTechnicalExplainerFixture = (): void => {
  if (technicalExplainerStagedProject.segments.length !== 2) {
    throw new Error("Technical explainer staged fixture expected two segments.");
  }
  for (const segment of technicalExplainerStagedProject.segments) {
    if (segment.templateId !== TECHNICAL_EXPLAINER_TEMPLATE_ID) {
      throw new Error("Technical explainer staged fixture expected technical-explainer segments.");
    }
    if (!segment.narration?.audio?.src || !segment.narration.captions?.cues.length) {
      throw new Error(
        "Technical explainer staged fixture expected segment-owned narration and captions.",
      );
    }
  }
};

assertTechnicalExplainerFixture();
