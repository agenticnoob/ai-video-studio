import type { VoiceProfiledQualityGatedMaintainedProducerSampleManifest } from "../producer-samples/manifest";

export const aiDaily20260720Manifest = {
  sampleStatus: "maintained",
  compositionId: "AiDaily20260720",
  sampleName: "AiDaily20260720",
  slug: "ai-daily-2026-07-20",
  contentFamily: "trend-briefing",
  canvasProfile: "portrait-9x16",
  styleProfileId: "hand-drawn-explainer",
  localArtifactRoot: "public/generated/ai-daily-2026-07-20/",
  ttsStatus: "generated-local",
  productionBrief: {
    audience:
      "Agent developers and technical practitioners following daily AI infrastructure signals.",
    publishingSurface: "9:16 vertical social video and local review.",
    durationTargetSeconds: 320,
  },
  narration: {
    required: true,
    provider: "voxcpm",
    voiceProfileId: "science-explainer-young-male",
    mode: "controllable-clone",
    scriptPath: "src/remotion/AiDaily20260720/script.ts",
    audioMetadataPath: "src/remotion/AiDaily20260720/audio.generated.ts",
  },
  assets: {
    manifestPath: "src/remotion/AiDaily20260720/assets.manifest.json",
  },
  validationModule: "src/remotion/AiDaily20260720/validation.ts",
  qualityModule: "src/remotion/AiDaily20260720/quality.ts",
  render: {
    metadataPath: "src/remotion/AiDaily20260720/render-metadata.json",
    cover16x9CompositionId: "AiDaily20260720Cover16x9",
    cover9x16CompositionId: "AiDaily20260720Cover9x16",
  },
  publishingCopyPath: "src/remotion/AiDaily20260720/publishing.md",
  reviewFrames: [
    {
      frame: 180,
      label: "opening-thesis",
      purpose: "Check the opening thesis, hand-drawn hierarchy, and portrait caption clearance.",
    },
    {
      frame: 1051,
      label: "google-chip",
      purpose: "Check Frozen v2 metric framing and uncertainty language.",
    },
    {
      frame: 2242,
      label: "nvidia-simulation",
      purpose: "Check the CAD-to-Agent-to-SimReady workshop path and wide-shot staging.",
    },
    {
      frame: 3321,
      label: "kimi-capacity",
      purpose: "Check the capacity bottleneck visual and caption clearance.",
    },
    {
      frame: 4538,
      label: "science-loop",
      purpose: "Check the four-station model-to-experiment pipeline.",
    },
    {
      frame: 5200,
      label: "science-late",
      purpose: "Check the late-state experiment loop remains complete and legible.",
    },
    {
      frame: 5737,
      label: "eu-transparency",
      purpose: "Check transparency architecture framing and dense caption fit.",
    },
    {
      frame: 6400,
      label: "regulation-late",
      purpose: "Check all four exported content types retain complete provenance tags.",
    },
    {
      frame: 7080,
      label: "power-infrastructure",
      purpose: "Check 1 GW and lease metric readability.",
    },
    { frame: 8145, label: "trend-summary", purpose: "Check the complete-system synthesis." },
    {
      frame: 8450,
      label: "signals-late",
      purpose: "Check the complete machine stays assembled after gear motion.",
    },
    {
      frame: 8874,
      label: "agent-checklist",
      purpose: "Check the six-item developer close and final safe area.",
    },
    {
      frame: 9300,
      label: "close-late",
      purpose: "Check all six operational switches reach ON and stable-running state.",
    },
  ],
  sourceFiles: [
    { path: "src/remotion/AiDaily20260720/AiDaily20260720.tsx", kind: "renderer" },
    { path: "src/remotion/AiDaily20260720/types.ts", kind: "types" },
    { path: "src/remotion/AiDaily20260720/script.ts", kind: "script" },
    { path: "src/remotion/AiDaily20260720/data.ts", kind: "data" },
    { path: "src/remotion/AiDaily20260720/audio.generated.ts", kind: "audio-metadata" },
    { path: "src/remotion/AiDaily20260720/manifest.ts", kind: "manifest" },
    { path: "src/remotion/AiDaily20260720/assets.manifest.json", kind: "asset-manifest" },
    { path: "src/remotion/AiDaily20260720/validation.ts", kind: "validation" },
    { path: "src/remotion/AiDaily20260720/quality.ts", kind: "quality" },
    { path: "src/remotion/AiDaily20260720/cover.tsx", kind: "cover" },
    { path: "src/remotion/AiDaily20260720/render-metadata.json", kind: "render-metadata" },
    { path: "src/remotion/AiDaily20260720/publishing.md", kind: "publishing-copy" },
    { path: "src/remotion/Root.tsx", kind: "root-registration" },
  ],
  promotionCandidates: [],
  notes: [
    "Generated narration, review frames, covers, metadata, and MP4 stay local-only.",
    "All nine beats are code-led hand-drawn information graphics; failed source-capture attempts are recorded outside the frame.",
    "The narration uses science-explainer-young-male in controllable-clone mode with no fallback.",
    "All nine scenes plus four meaning-changing late states and both centered covers were visually reviewed; final MP4 export is user-owned and was not committed.",
  ],
} as const satisfies VoiceProfiledQualityGatedMaintainedProducerSampleManifest;
