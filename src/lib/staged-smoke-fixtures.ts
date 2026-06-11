import { segmentNarrationFromAsset, type SegmentNarrationAsset } from "./narration-asset-schema";
import { videoSegmentSchema, type VideoProject, type VideoSegment } from "./project-schema";
import {
  assembleStagedProject,
  orderPlanSegments,
  replaceSegmentAndNarrationLayer,
} from "./staged-project-assembly";
import { storyboardPlanSchema, type StoryboardPlan } from "./storyboard-plan-schema";
import { SCRIPTED_TEMPLATE_ID, SPOTLIGHT_TEMPLATE_ID } from "./template-registry";

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
};
