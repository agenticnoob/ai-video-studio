import type { ProfiledMaintainedProducerSampleManifest } from "../producer-samples/manifest";
import { tcpHandshakeEditorialSceneStarts } from "./data";

export const tcpHandshakeEditorialManifest = {
  sampleStatus: "maintained",
  compositionId: "TcpHandshakeEditorial",
  sampleName: "TcpHandshakeEditorial",
  slug: "tcp-handshake-editorial",
  contentFamily: "tutorial",
  canvasProfile: "landscape-16x9",
  styleProfileId: "editorial-tech",
  localArtifactRoot: "public/generated/tcp-handshake-editorial/",
  ttsStatus: "generated-local",
  productionBrief: {
    audience: "Developers learning how TCP connection establishment confirms both directions.",
    publishingSurface: "Local review and approved technical education channels.",
    durationTargetSeconds: 18,
  },
  narration: {
    required: true,
    provider: "voxcpm",
    mode: "high-fidelity-clone",
    scriptPath: "src/remotion/TcpHandshakeEditorial/script.ts",
    audioMetadataPath: "src/remotion/TcpHandshakeEditorial/audio.generated.ts",
  },
  assets: { manifestPath: "src/remotion/TcpHandshakeEditorial/assets.manifest.json" },
  soundDesign: {
    soundtrackModulePath: "src/remotion/TcpHandshakeEditorial/soundtrack.tsx",
    narrationAssetIds: ["narration-syn", "narration-syn-ack", "narration-ack"],
    bgmAssetIds: ["editorial-bgm"],
    ambienceAssetIds: ["editorial-ambience"],
    sfxAssetIds: ["soft-whoosh", "node-confirm"],
  },
  validationModule: "src/remotion/TcpHandshakeEditorial/validation.ts",
  render: {
    metadataPath: "src/remotion/TcpHandshakeEditorial/render-metadata.json",
    cover16x9CompositionId: "TcpHandshakeEditorialCover16x9",
    cover9x16CompositionId: "TcpHandshakeEditorialCover9x16",
  },
  publishingCopyPath: "src/remotion/TcpHandshakeEditorial/publishing.md",
  reviewFrames: [
    {
      frame: tcpHandshakeEditorialSceneStarts[0] + 42,
      label: "editorial syn",
      purpose: "Check asymmetric thesis hierarchy, diagram evidence, and SYN motion.",
    },
    {
      frame: tcpHandshakeEditorialSceneStarts[1] + 140,
      label: "editorial syn ack",
      purpose:
        "Check stable editorial hierarchy, reverse packet direction, and caption clearance after the transition.",
    },
    {
      frame: tcpHandshakeEditorialSceneStarts[2] + 48,
      label: "editorial established",
      purpose: "Check final ACK state, whitespace, and closing hierarchy.",
    },
  ],
  sourceFiles: [
    { path: "src/remotion/TcpHandshakeEditorial/TcpHandshakeEditorial.tsx", kind: "renderer" },
    { path: "src/remotion/TcpHandshakeEditorial/types.ts", kind: "types" },
    { path: "src/remotion/TcpHandshakeEditorial/script.ts", kind: "script" },
    { path: "src/remotion/TcpHandshakeEditorial/data.ts", kind: "data" },
    { path: "src/remotion/TcpHandshakeEditorial/audio.generated.ts", kind: "audio-metadata" },
    { path: "src/remotion/TcpHandshakeEditorial/manifest.ts", kind: "manifest" },
    { path: "src/remotion/TcpHandshakeEditorial/assets.manifest.json", kind: "asset-manifest" },
    { path: "src/remotion/TcpHandshakeEditorial/soundtrack.tsx", kind: "soundtrack" },
    { path: "src/remotion/TcpHandshakeEditorial/validation.ts", kind: "validation" },
    { path: "src/remotion/TcpHandshakeEditorial/cover.tsx", kind: "cover" },
    { path: "src/remotion/TcpHandshakeEditorial/render-metadata.json", kind: "render-metadata" },
    { path: "src/remotion/TcpHandshakeEditorial/publishing.md", kind: "publishing-copy" },
    { path: "src/remotion/Root.tsx", kind: "root-registration" },
  ],
  promotionCandidates: [],
  notes: [
    "This composition proves editorial-tech against the same TCP facts used by the terminal proof.",
    "Generated narration, localized assets, review frames, covers, metadata, and MP4 remain local-only.",
  ],
} as const satisfies ProfiledMaintainedProducerSampleManifest;
