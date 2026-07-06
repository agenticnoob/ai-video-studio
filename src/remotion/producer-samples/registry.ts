import type { ProducerSampleManifest } from "./manifest";

export const producerSampleManifests = [
  {
    compositionId: "UvOpenSourceBrief",
    sampleName: "UvOpenSourceBrief",
    slug: "uv-open-source-brief",
    contentFamily: "project-intro",
    canvasProfile: "landscape-16x9",
    localArtifactRoot: "public/generated/uv-open-source-brief/",
    ttsStatus: "generated-local",
    reviewFrames: [
      {
        frame: 45,
        label: "opening context",
        purpose: "Check first-read headline and hero composition.",
      },
      {
        frame: 260,
        label: "repo evidence",
        purpose: "Check screenshot readability and overlay placement.",
      },
      {
        frame: 650,
        label: "workflow beat",
        purpose: "Check block composition and caption clearance.",
      },
      {
        frame: 1390,
        label: "closing synthesis",
        purpose: "Check final synthesis and safe margins.",
      },
    ],
    sourceFiles: [
      { path: "src/remotion/UvOpenSourceBrief/UvOpenSourceBrief.tsx", kind: "renderer" },
      { path: "src/remotion/UvOpenSourceBrief/types.ts", kind: "types" },
      { path: "src/remotion/UvOpenSourceBrief/script.ts", kind: "script" },
      { path: "src/remotion/UvOpenSourceBrief/data.ts", kind: "data" },
      { path: "src/remotion/UvOpenSourceBrief/audio.generated.ts", kind: "audio-metadata" },
      { path: "src/remotion/Root.tsx", kind: "root-registration" },
      { path: "scripts/uv-open-source-brief-smoke.mjs", kind: "smoke" },
    ],
    promotionCandidates: [
      {
        id: "evidence-screenshot-backdrop",
        targetLayer: "block",
        reason:
          "Full-frame screenshot evidence with readable focus motion can be shared after more samples prove it.",
      },
      {
        id: "evidence-overlay-panel",
        targetLayer: "block",
        reason: "Compact translucent proof overlays recur across source-backed explainer samples.",
      },
      {
        id: "screenshot-focus",
        targetLayer: "primitive",
        reason: "Claim-aligned zoom-in, hold, and return metadata is a small reusable motion contract.",
      },
    ],
    notes: [
      "Generated screenshots and narration audio stay local-only under public/generated/uv-open-source-brief/.",
      "This sample remains a dedicated composition and does not use the parked web prompt path.",
    ],
  },
  {
    compositionId: "WorldCupBettingAnalysis",
    sampleName: "WorldCupBettingAnalysis",
    slug: "world-cup-betting-analysis",
    contentFamily: "data-analysis",
    canvasProfile: "portrait-9x16",
    localArtifactRoot: "public/generated/world-cup-betting-analysis/",
    ttsStatus: "generated-local",
    reviewFrames: [
      {
        frame: 30,
        label: "title",
        purpose: "Check portrait title readability and visual hierarchy.",
      },
      {
        frame: 360,
        label: "formula",
        purpose: "Check EV formula explanation and subtitle separation.",
      },
      {
        frame: 900,
        label: "match analysis",
        purpose: "Check odds/probability chart density.",
      },
      {
        frame: 1840,
        label: "disclaimer",
        purpose: "Check risk disclaimer prominence.",
      },
    ],
    sourceFiles: [
      {
        path: "src/remotion/WorldCupBettingAnalysis/WorldCupBettingAnalysis.tsx",
        kind: "renderer",
      },
      { path: "src/remotion/WorldCupBettingAnalysis/types.ts", kind: "types" },
      { path: "src/remotion/WorldCupBettingAnalysis/script.ts", kind: "script" },
      { path: "src/remotion/WorldCupBettingAnalysis/data.ts", kind: "data" },
      { path: "src/remotion/WorldCupBettingAnalysis/audio.generated.ts", kind: "audio-metadata" },
      { path: "src/remotion/Root.tsx", kind: "root-registration" },
      { path: "scripts/world-cup-betting-analysis-smoke.mjs", kind: "smoke" },
    ],
    promotionCandidates: [
      {
        id: "odds-ev-ranking",
        targetLayer: "recipe",
        reason:
          "The odds, no-vig probability, EV, and risk ranking story already informed a productized stats recipe.",
      },
      {
        id: "risk-disclaimer-frame",
        targetLayer: "block",
        reason: "Explicit risk-note treatment is reusable for data-analysis shorts.",
      },
    ],
    notes: [
      "Generated F5 voiceover files stay local-only under public/generated/world-cup-betting-analysis/.",
      "The sample redraws odds data in code when no source screenshot is available.",
    ],
  },
  {
    compositionId: "PixelRAGChineseStandalonePreview",
    sampleName: "PixelRAGChineseStandalone",
    slug: "pixelrag-chinese-standalone",
    contentFamily: "project-intro",
    canvasProfile: "landscape-16x9",
    localArtifactRoot: "public/generated/pixelrag-chinese-standalone/",
    ttsStatus: "generated-local",
    reviewFrames: [
      {
        frame: 30,
        label: "opening",
        purpose: "Check project intro headline and foreground 3D readability.",
      },
      {
        frame: 420,
        label: "screenshot process",
        purpose: "Check screenshot-backed visual proof and caption clearance.",
      },
      {
        frame: 820,
        label: "retrieval flow",
        purpose: "Check vector/index motion and focal point.",
      },
      {
        frame: 1280,
        label: "closing",
        purpose: "Check final takeaway and safe margins.",
      },
    ],
    sourceFiles: [
      {
        path: "src/remotion/PixelRAGChineseStandalone/PixelRAGChineseStandalone.tsx",
        kind: "renderer",
      },
      { path: "src/remotion/PixelRAGChineseStandalone/types.ts", kind: "types" },
      { path: "src/remotion/PixelRAGChineseStandalone/script.ts", kind: "script" },
      { path: "src/remotion/PixelRAGChineseStandalone/data.generated.ts", kind: "audio-metadata" },
      { path: "src/remotion/PixelRAGChineseStandalone/visuals.tsx", kind: "renderer" },
      { path: "src/remotion/Root.tsx", kind: "root-registration" },
      { path: "scripts/pixelrag-chinese-standalone-smoke.mjs", kind: "smoke" },
    ],
    promotionCandidates: [
      {
        id: "screenshot-evidence-flow",
        targetLayer: "recipe",
        reason:
          "Screenshot/process language already informed the technical-explainer evidence flow.",
      },
      {
        id: "foreground-3d-evidence-cards",
        targetLayer: "block",
        reason:
          "The foreground 3D card/page/index treatment may be reusable after another project-intro sample proves it.",
      },
    ],
    notes: [
      "This sample currently stores generated audio metadata inside data.generated.ts; Producer Sample OS v1 accepts that legacy shape.",
      "Generated screenshots and audio stay local-only under public/generated/pixelrag-chinese-standalone/.",
    ],
  },
] as const satisfies readonly ProducerSampleManifest[];

export const getProducerSampleManifestByCompositionId = (
  compositionId: string,
): ProducerSampleManifest | undefined =>
  producerSampleManifests.find((manifest) => manifest.compositionId === compositionId);
