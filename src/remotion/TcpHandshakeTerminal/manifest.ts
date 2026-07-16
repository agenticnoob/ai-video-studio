import type { ProfiledMaintainedProducerSampleManifest } from "../producer-samples/manifest";
import { tcpHandshakeTerminalSceneStarts } from "./data";

export const tcpHandshakeTerminalManifest = {
  sampleStatus: "maintained",
  compositionId: "TcpHandshakeTerminal",
  sampleName: "TcpHandshakeTerminal",
  slug: "tcp-handshake-terminal",
  contentFamily: "tutorial",
  canvasProfile: "landscape-16x9",
  styleProfileId: "retro-terminal",
  localArtifactRoot: "public/generated/tcp-handshake-terminal/",
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
    scriptPath: "src/remotion/TcpHandshakeTerminal/script.ts",
    audioMetadataPath: "src/remotion/TcpHandshakeTerminal/audio.generated.ts",
  },
  assets: { manifestPath: "src/remotion/TcpHandshakeTerminal/assets.manifest.json" },
  soundDesign: {
    soundtrackModulePath: "src/remotion/TcpHandshakeTerminal/soundtrack.tsx",
    narrationAssetIds: ["narration-syn", "narration-syn-ack", "narration-ack"],
    bgmAssetIds: ["terminal-bgm"],
    ambienceAssetIds: ["terminal-ambience"],
    sfxAssetIds: ["signal-sweep", "key-confirm"],
  },
  validationModule: "src/remotion/TcpHandshakeTerminal/validation.ts",
  render: {
    metadataPath: "src/remotion/TcpHandshakeTerminal/render-metadata.json",
    cover16x9CompositionId: "TcpHandshakeTerminalCover16x9",
    cover9x16CompositionId: "TcpHandshakeTerminalCover9x16",
  },
  publishingCopyPath: "src/remotion/TcpHandshakeTerminal/publishing.md",
  reviewFrames: [
    {
      frame: tcpHandshakeTerminalSceneStarts[0] + 42,
      label: "terminal syn",
      purpose: "Check command reveal, SYN packet trace, and prompt caption.",
    },
    {
      frame: tcpHandshakeTerminalSceneStarts[1] + 48,
      label: "terminal syn ack",
      purpose: "Check signal-wipe state, log hierarchy, and SYN-ACK readability.",
    },
    {
      frame: tcpHandshakeTerminalSceneStarts[2] + 119,
      label: "terminal established",
      purpose:
        "Check the stable ESTABLISHED state, cursor focus, and closing caption clearance after the signal wipe.",
    },
  ],
  sourceFiles: [
    { path: "src/remotion/TcpHandshakeTerminal/TcpHandshakeTerminal.tsx", kind: "renderer" },
    { path: "src/remotion/TcpHandshakeTerminal/types.ts", kind: "types" },
    { path: "src/remotion/TcpHandshakeTerminal/script.ts", kind: "script" },
    { path: "src/remotion/TcpHandshakeTerminal/data.ts", kind: "data" },
    { path: "src/remotion/TcpHandshakeTerminal/audio.generated.ts", kind: "audio-metadata" },
    { path: "src/remotion/TcpHandshakeTerminal/manifest.ts", kind: "manifest" },
    { path: "src/remotion/TcpHandshakeTerminal/assets.manifest.json", kind: "asset-manifest" },
    { path: "src/remotion/TcpHandshakeTerminal/soundtrack.tsx", kind: "soundtrack" },
    { path: "src/remotion/TcpHandshakeTerminal/validation.ts", kind: "validation" },
    { path: "src/remotion/TcpHandshakeTerminal/cover.tsx", kind: "cover" },
    { path: "src/remotion/TcpHandshakeTerminal/render-metadata.json", kind: "render-metadata" },
    { path: "src/remotion/TcpHandshakeTerminal/publishing.md", kind: "publishing-copy" },
    { path: "src/remotion/Root.tsx", kind: "root-registration" },
  ],
  promotionCandidates: [],
  notes: [
    "This composition proves retro-terminal against the same TCP facts used by the editorial proof.",
    "Generated narration, localized assets, review frames, covers, metadata, and MP4 remain local-only.",
  ],
} as const satisfies ProfiledMaintainedProducerSampleManifest;
