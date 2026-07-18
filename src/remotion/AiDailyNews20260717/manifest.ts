import type { QualityGatedMaintainedProducerSampleManifest } from "../producer-samples/manifest";
import { narrationBeats } from "./script";
import { AI_DAILY_NEWS_20260717_COMPOSITION_ID, AI_DAILY_NEWS_20260717_DURATION_IN_FRAMES } from "./types";

export const aiDailyNews20260717Manifest = {
  sampleStatus: "maintained",
  compositionId: AI_DAILY_NEWS_20260717_COMPOSITION_ID,
  sampleName: "AiDailyNews20260717",
  slug: "ai-daily-news-2026-07-17",
  contentFamily: "trend-briefing",
  canvasProfile: "portrait-9x16",
  styleProfileId: "comic-anime",
  localArtifactRoot: "public/generated/ai-daily-news-2026-07-17/",
  ttsStatus: "generated-local",
  productionBrief: {
    audience: "AI software engineers and developers interested in daily AI industry news.",
    publishingSurface: "Local review and portrait vertical video social publishing surfaces.",
    durationTargetSeconds: 300,
  },
  narration: {
    required: true,
    provider: "voxcpm",
    mode: "high-fidelity-clone",
    scriptPath: "src/remotion/AiDailyNews20260717/script.ts",
    audioMetadataPath: "src/remotion/AiDailyNews20260717/audio.generated.ts",
  },
  assets: {
    manifestPath: "src/remotion/AiDailyNews20260717/assets.manifest.json",
  },
  validationModule: "src/remotion/AiDailyNews20260717/validation.ts",
  qualityModule: "src/remotion/AiDailyNews20260717/quality.ts",
  render: {
    metadataPath: "src/remotion/AiDailyNews20260717/render-metadata.json",
    cover16x9CompositionId: "AiDailyNews20260717Cover16x9",
    cover9x16CompositionId: "AiDailyNews20260717Cover9x16",
  },
  publishingCopyPath: "src/remotion/AiDailyNews20260717/publishing.md",
  reviewFrames: [
    { frame: 30, label: "opening-thesis", purpose: "Check opening headline hierarchy, kicker badge, and safe margins." },
    { frame: 500, label: "moonshot-k3", purpose: "Check Kimi K3 scene content card, accent color, and caption clearance." },
    { frame: 2000, label: "enterprise-ai", purpose: "Check enterprise AI scene narration card and visual density." },
    { frame: 3800, label: "tech-breakthroughs", purpose: "Check tech breakthroughs scene content and transition." },
    { frame: 5200, label: "policy-regulation", purpose: "Check policy scene red accent and safe margins." },
    { frame: 6800, label: "capital-markets", purpose: "Check capital markets scene and metric badges." },
    { frame: 7800, label: "trend-summary", purpose: "Check summary matrix grid with six metric badges." },
    { frame: 8600, label: "closing", purpose: "Check closing statement, caption clearance, and portrait safe area." },
  ],
  sourceFiles: [
    { path: `src/remotion/${AI_DAILY_NEWS_20260717_COMPOSITION_ID}/${AI_DAILY_NEWS_20260717_COMPOSITION_ID}.tsx`, kind: "renderer" },
    { path: `src/remotion/${AI_DAILY_NEWS_20260717_COMPOSITION_ID}/types.ts`, kind: "types" },
    { path: `src/remotion/${AI_DAILY_NEWS_20260717_COMPOSITION_ID}/script.ts`, kind: "script" },
    { path: `src/remotion/${AI_DAILY_NEWS_20260717_COMPOSITION_ID}/data.ts`, kind: "data" },
    { path: `src/remotion/${AI_DAILY_NEWS_20260717_COMPOSITION_ID}/audio.generated.ts`, kind: "audio-metadata" },
    { path: `src/remotion/${AI_DAILY_NEWS_20260717_COMPOSITION_ID}/manifest.ts`, kind: "manifest" },
    { path: `src/remotion/${AI_DAILY_NEWS_20260717_COMPOSITION_ID}/assets.manifest.json`, kind: "asset-manifest" },
    { path: `src/remotion/${AI_DAILY_NEWS_20260717_COMPOSITION_ID}/soundtrack.tsx`, kind: "soundtrack" },
    { path: `src/remotion/${AI_DAILY_NEWS_20260717_COMPOSITION_ID}/validation.ts`, kind: "validation" },
    { path: `src/remotion/${AI_DAILY_NEWS_20260717_COMPOSITION_ID}/quality.ts`, kind: "quality" },
    { path: `src/remotion/${AI_DAILY_NEWS_20260717_COMPOSITION_ID}/cover.tsx`, kind: "cover" },
    { path: `src/remotion/${AI_DAILY_NEWS_20260717_COMPOSITION_ID}/render-metadata.json`, kind: "render-metadata" },
    { path: `src/remotion/${AI_DAILY_NEWS_20260717_COMPOSITION_ID}/publishing.md`, kind: "publishing-copy" },
    { path: "src/remotion/Root.tsx", kind: "root-registration" },
  ],
  promotionCandidates: [],
  notes: [
    "This composition proves editorial-tech style profile in portrait 9:16 format for a daily AI news brief.",
    "Generated narration, localized assets, review frames, covers, metadata, and MP4 remain local-only.",
    "Content is user-provided AI daily news from July 17, 2026 with Reuters, OpenAI, and other sources.",
    "First portrait Agent Producer composition providing vertical video for mobile/social publishing.",
  ],
} as const satisfies QualityGatedMaintainedProducerSampleManifest;

export const aiDailyNews20260717SceneStarts = narrationBeats.reduce<readonly number[]>(
  (starts, _, index) => {
    if (index === 0) return [0];
    return [...starts, AI_DAILY_NEWS_20260717_DURATION_IN_FRAMES / narrationBeats.length * index];
  },
  [] as number[],
);