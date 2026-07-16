import type { MaintainedProducerSampleManifest } from "../producer-samples/manifest";
import { agentProducerMediaSoundProofSceneStarts } from "./data";

export const agentProducerMediaSoundProofManifest = {
  sampleStatus: "maintained",
  compositionId: "AgentProducerMediaSoundProof",
  sampleName: "AgentProducerMediaSoundProof",
  slug: "agent-producer-media-sound-proof",
  contentFamily: "project-intro",
  canvasProfile: "landscape-16x9",
  localArtifactRoot: "public/generated/agent-producer-media-sound-proof/",
  ttsStatus: "generated-local",
  productionBrief: {
    audience: "Agent Producer maintainers reviewing local dynamic media and sound design.",
    publishingSurface: "Local Remotion review only.",
    durationTargetSeconds: 18,
  },
  narration: {
    required: true,
    provider: "voxcpm",
    mode: "voice-design",
    scriptPath: "src/remotion/AgentProducerMediaSoundProof/script.ts",
    audioMetadataPath: "src/remotion/AgentProducerMediaSoundProof/audio.generated.ts",
  },
  assets: {
    manifestPath: "src/remotion/AgentProducerMediaSoundProof/assets.manifest.json",
  },
  soundDesign: {
    soundtrackModulePath: "src/remotion/AgentProducerMediaSoundProof/soundtrack.tsx",
    narrationAssetIds: ["narration-open", "narration-media", "narration-signal"],
    bgmAssetIds: ["proof-bgm"],
    ambienceAssetIds: ["proof-ambience"],
    sfxAssetIds: ["soft-whoosh", "signal-sweep"],
  },
  validationModule: "src/remotion/AgentProducerMediaSoundProof/validation.ts",
  render: {
    metadataPath: "src/remotion/AgentProducerMediaSoundProof/render-metadata.json",
    cover16x9CompositionId: "AgentProducerMediaSoundProofCover16x9",
    cover9x16CompositionId: "AgentProducerMediaSoundProofCover9x16",
  },
  publishingCopyPath: "src/remotion/AgentProducerMediaSoundProof/publishing.md",
  reviewFrames: [
    {
      frame: agentProducerMediaSoundProofSceneStarts[0] + 48,
      label: "opening",
      purpose: "Check PNG and animated image fit plus title hierarchy.",
    },
    {
      frame: agentProducerMediaSoundProofSceneStarts[1] + 48,
      label: "local video",
      purpose: "Check local video crop, trim, loop, and caption clearance.",
    },
    {
      frame: agentProducerMediaSoundProofSceneStarts[2] + 48,
      label: "lottie",
      purpose: "Check expression-free Lottie and deterministic trail treatment.",
    },
  ],
  sourceFiles: [
    {
      path: "src/remotion/AgentProducerMediaSoundProof/AgentProducerMediaSoundProof.tsx",
      kind: "renderer",
    },
    { path: "src/remotion/AgentProducerMediaSoundProof/types.ts", kind: "types" },
    { path: "src/remotion/AgentProducerMediaSoundProof/script.ts", kind: "script" },
    { path: "src/remotion/AgentProducerMediaSoundProof/data.ts", kind: "data" },
    {
      path: "src/remotion/AgentProducerMediaSoundProof/audio.generated.ts",
      kind: "audio-metadata",
    },
    { path: "src/remotion/AgentProducerMediaSoundProof/manifest.ts", kind: "manifest" },
    {
      path: "src/remotion/AgentProducerMediaSoundProof/assets.manifest.json",
      kind: "asset-manifest",
    },
    { path: "src/remotion/AgentProducerMediaSoundProof/soundtrack.tsx", kind: "soundtrack" },
    { path: "src/remotion/AgentProducerMediaSoundProof/validation.ts", kind: "validation" },
    { path: "src/remotion/AgentProducerMediaSoundProof/cover.tsx", kind: "cover" },
    {
      path: "src/remotion/AgentProducerMediaSoundProof/render-metadata.json",
      kind: "render-metadata",
    },
    { path: "src/remotion/AgentProducerMediaSoundProof/publishing.md", kind: "publishing-copy" },
    { path: "src/remotion/Root.tsx", kind: "root-registration" },
  ],
  promotionCandidates: [],
  notes: [
    "All narration, media, stills, covers, and rendered output remain ignored local artifacts.",
    "Rive remains unadmitted because no approved local Rive asset is available for an honest proof.",
  ],
} as const satisfies MaintainedProducerSampleManifest;
