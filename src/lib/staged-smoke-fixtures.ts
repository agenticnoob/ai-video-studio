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

const TECHNICAL_EXPLAINER_PREVIEW_SECTION_DURATION = 150;

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
  title: "Odds EV ranking",
  intent: "Rank compact market opportunities by no-vig expected value and risk.",
  templateId: STATS_DASHBOARD_TEMPLATE_ID,
  implementation: {
    meta: {
      title: "Odds EV ranking",
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
    kicker: "Market screen",
    title: "Positive EV needs risk context",
    subtitle: "The dashboard ranks markets by no-vig probability, expected value, and risk.",
    blocks: [
      {
        id: "top-ev",
        type: "kpi",
        title: "Top ranked market",
        value: "+7.8%",
        label: "Expected value",
        delta: "No-vig edge: +4.1 pts",
        deltaDirection: "up",
      },
      {
        id: "ev-ranking",
        type: "bar-chart",
        title: "EV ranking",
        chart: {
          categories: ["Market A", "Market B", "Market C"],
          series: [
            {
              name: "Expected value",
              values: [7.8, 2.4, 0.8],
              color: "#38bdf8",
            },
          ],
          unit: "%",
          maxValue: 10,
          highlightIndex: 0,
        },
      },
      {
        id: "probability-gap",
        type: "bar-chart",
        title: "No-vig probability gap",
        chart: {
          categories: ["A", "B", "C"],
          series: [
            {
              name: "No-vig minus implied",
              values: [4.1, 1.5, -2.2],
              color: "#f59e0b",
            },
          ],
          unit: "pts",
          maxValue: 5,
          highlightIndex: 0,
        },
      },
      {
        id: "risk-note",
        type: "insight",
        title: "Risk note",
        text: "A small or negative EV market should be avoided; positive EV is still a signal, not a guarantee.",
      },
    ],
    timeline: [
      {
        from: 0,
        durationInFrames: 70,
        blockIds: ["top-ev"],
        layout: "single",
      },
      {
        from: 58,
        durationInFrames: 82,
        blockIds: ["ev-ranking"],
        layout: "single",
      },
      {
        from: 132,
        durationInFrames: 48,
        blockIds: ["top-ev", "ev-ranking", "probability-gap", "risk-note"],
        layout: "grid",
      },
    ],
    footerNote: "Fixture data for stats-dashboard/odds-ev-ranking; not betting advice.",
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

export const statsDashboardStoryboardPlan: StoryboardPlan = storyboardPlanSchema.parse({
  title: "Stats Dashboard EV Smoke",
  brief: "Explain compact odds analysis with expected value and risk ranking.",
  language: "en",
  globalStyle: "Compact data analysis with clear risk language.",
  segments: [
    {
      id: "segment-1",
      order: 1,
      title: "Odds EV ranking",
      purpose: "Rank market opportunities by no-vig expected value and risk.",
      templateId: STATS_DASHBOARD_TEMPLATE_ID,
      templateReason: "The stats dashboard can show odds, probability, EV, and risk ranking.",
      narration: {
        text: "No-vig probability exposes the strongest expected value, but the ranking still needs a risk note.",
      },
      visualBrief: "Show top EV, no-vig probability gap, final ranking, and risk caveat.",
      recipeHints: [
        {
          recipeId: "odds-ev-ranking",
          reason: "The segment compares odds, no-vig probability, expected value, and risk.",
        },
      ],
      expectedDurationSeconds: 6,
    },
  ],
});

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
  durationInFrames: 795,
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
      id: "ui-zoom",
      recipeId: "product-ui-zoom",
      title: "Zoom into the product surface",
      subtitle: "Phase 5 proves controlled image material inside one recipe.",
      asset: {
        sourceType: "public",
        src: "fixtures/phase5-ui-screenshot.svg",
        alt: "A deterministic product UI screenshot fixture for Phase 5.",
        frameLabel: "Controlled screenshot",
      },
      focalPoint: {
        xPercent: 72,
        yPercent: 48,
        zoomPercent: 138,
        label: "Inspect the active panel",
      },
      callouts: ["Controlled asset", "Template-owned", "Preview/export"],
      fallbackSummary: "A product UI screenshot would be highlighted here.",
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

const technicalExplainerPreviewImplementation = {
  ...technicalExplainerImplementation,
  durationInFrames: 900,
  title: "Technical explainer preview",
  subtitle: "A slower Studio fixture for inspecting recipe animation timing.",
  sections: [
    {
      id: "preview-hero",
      recipeId: "hero-title-reveal",
      title: "Preview pacing",
      eyebrow: "Studio inspection",
      primaryText: "Recipe animation has room to breathe",
      secondaryText: "This fixture is intentionally slower than deterministic smoke coverage.",
      callouts: ["Readable", "Frame-driven", "Fixture-only"],
      durationInFrames: TECHNICAL_EXPLAINER_PREVIEW_SECTION_DURATION,
    },
    {
      id: "preview-workflow",
      recipeId: "workflow-node-map",
      title: "Pipeline",
      nodes: [
        { id: "plan", label: "StoryboardPlan", detail: "Segment intent" },
        { id: "voice", label: "Narration", detail: "Audio + captions" },
        { id: "compile", label: "Template compile", detail: "Schema-valid params" },
        { id: "render", label: "ProjectVideo", detail: "Preview and export" },
      ],
      activeNodeId: "compile",
      durationInFrames: TECHNICAL_EXPLAINER_PREVIEW_SECTION_DURATION,
    },
    {
      id: "preview-evidence",
      recipeId: "screenshot-evidence-flow",
      title: "Screenshot becomes evidence",
      subtitle: "A visual surface can be sliced into proof cards before retrieval.",
      asset: {
        sourceType: "public",
        src: "fixtures/phase5-ui-screenshot.svg",
        alt: "A deterministic screenshot fixture used as visual evidence.",
        frameLabel: "Controlled screenshot",
      },
      evidenceItems: [
        {
          id: "source",
          label: "Source screenshot",
          detail: "Start from one visible project surface.",
          status: "source",
        },
        {
          id: "extract",
          label: "Extract regions",
          detail: "Pull out meaningful visual blocks.",
          status: "extract",
        },
        {
          id: "index",
          label: "Index evidence",
          detail: "Store visual chunks with compact labels.",
          status: "index",
        },
        {
          id: "retrieve",
          label: "Retrieve answer proof",
          detail: "Show the card that supports the narration.",
          status: "retrieve",
        },
      ],
      activeEvidenceId: "retrieve",
      callouts: ["Screenshot", "Evidence", "Retrieval"],
      fallbackSummary: "A screenshot-backed evidence flow would be highlighted here.",
      durationInFrames: TECHNICAL_EXPLAINER_PREVIEW_SECTION_DURATION,
    },
    {
      id: "preview-ui-zoom",
      recipeId: "product-ui-zoom",
      title: "Zoom into the product surface",
      subtitle: "Phase 5 proves controlled image material inside one recipe.",
      asset: {
        sourceType: "public",
        src: "fixtures/phase5-ui-screenshot.svg",
        alt: "A deterministic product UI screenshot fixture for Phase 5.",
        frameLabel: "Controlled screenshot",
      },
      focalPoint: {
        xPercent: 72,
        yPercent: 48,
        zoomPercent: 138,
        label: "Inspect the active panel",
      },
      callouts: ["Controlled asset", "Template-owned", "Preview/export"],
      fallbackSummary: "A product UI screenshot would be highlighted here.",
      durationInFrames: TECHNICAL_EXPLAINER_PREVIEW_SECTION_DURATION,
    },
    {
      id: "preview-decision",
      recipeId: "decision-matrix",
      title: "Choose the next bounded slice",
      subtitle: "Tradeoffs stay readable without turning the project into a planning deck.",
      criteria: ["Visual impact", "Scope risk", "Reuse"],
      options: [
        {
          label: "Asset-aware recipes",
          summary: "Best bounded proof",
          scores: [
            { criterion: "Visual impact", rating: "high", note: "Real material helps" },
            { criterion: "Scope risk", rating: "high", note: "One recipe only" },
            { criterion: "Reuse", rating: "medium", note: "Useful later" },
          ],
          recommended: true,
        },
        {
          label: "Media library",
          summary: "Too wide for v1",
          scores: [
            { criterion: "Visual impact", rating: "medium", note: "Needs UI scope" },
            { criterion: "Scope risk", rating: "low", note: "Storage expands" },
            { criterion: "Reuse", rating: "medium", note: "Later milestone" },
          ],
        },
      ],
      decision: "Start with one controlled template-owned asset recipe.",
      durationInFrames: TECHNICAL_EXPLAINER_PREVIEW_SECTION_DURATION,
    },
    {
      id: "preview-layers",
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
      durationInFrames: TECHNICAL_EXPLAINER_PREVIEW_SECTION_DURATION,
    },
  ],
};

const technicalExplainerPreviewSegment = videoSegmentSchema.parse({
  ...technicalExplainerSegment,
  id: "preview-segment",
  title: "Technical explainer preview",
  implementation: technicalExplainerPreviewImplementation,
});

export const technicalExplainerPreviewProject: VideoProject = videoProjectSchema.parse({
  meta: {
    title: "Technical Explainer Preview",
    fps: 30,
    width: 1280,
    height: 720,
  },
  brief: "Inspect a slower recipe-oriented technical explainer preview.",
  segments: [technicalExplainerPreviewSegment],
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
          reason: "The segment explains how reusable recipe primitives flow into generated output.",
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
      visualBrief:
        "Metric cards, a timeline progress view, and controlled product UI screenshot material.",
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
          reason: "The segment explains why recipe expansion is the better bounded next slice.",
        },
        {
          recipeId: "product-ui-zoom",
          reason: "The segment needs to focus attention on a controlled product UI screenshot.",
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
      sections: [
        {
          id: "metrics",
          recipeId: "metric-countup",
          title: "Outcome",
          metrics: [
            { label: "Recipe sections", value: "11", detail: "Bounded visual treatments" },
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
            headline: "Eleven generated recipes",
            points: ["Code diffs compile", "Evidence flows render", "Fallbacks stay useful"],
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
              summary: "Best bounded proof",
              scores: [
                { criterion: "Visual impact", rating: "high", note: "Real material helps" },
                { criterion: "Scope risk", rating: "high", note: "One recipe only" },
                { criterion: "Reuse", rating: "medium", note: "Useful later" },
              ],
              recommended: true,
            },
            {
              label: "Media library",
              summary: "Too wide for v1",
              scores: [
                { criterion: "Visual impact", rating: "medium", note: "Needs UI scope" },
                { criterion: "Scope risk", rating: "low", note: "Storage expands" },
                { criterion: "Reuse", rating: "medium", note: "Later milestone" },
              ],
            },
          ],
          decision: "Start with one controlled template-owned asset recipe.",
          durationInFrames: 75,
        },
        {
          id: "ui-zoom-fallback",
          recipeId: "product-ui-zoom",
          title: "Fallback stays useful",
          subtitle: "The recipe remains renderable when no screenshot is provided.",
          focalPoint: {
            xPercent: 50,
            yPercent: 50,
            zoomPercent: 120,
            label: "Fallback mode",
          },
          callouts: ["No broken frame", "Clear summary", "Same schema"],
          fallbackSummary:
            "No screenshot was attached, so the recipe renders a structured fallback frame.",
          durationInFrames: 75,
        },
      ],
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
