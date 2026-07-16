import type { ProducerAssetManifest } from "../producer-samples/asset-manifest";
import assetManifestJson from "./assets.manifest.json";
import { tcpHandshakeTerminalAudio } from "./audio.generated";
import { tcpHandshakeTerminalManifest } from "./manifest";
import { tcpHandshakeTerminalNarrationBeats } from "./script";
import { TCP_HANDSHAKE_TERMINAL_COMPOSITION_ID } from "./types";

export const producerValidationInput = {
  compositionId: TCP_HANDSHAKE_TERMINAL_COMPOSITION_ID,
  manifest: tcpHandshakeTerminalManifest,
  assetManifest: assetManifestJson as ProducerAssetManifest,
  beats: tcpHandshakeTerminalNarrationBeats,
  tracks: tcpHandshakeTerminalAudio,
  scenes: tcpHandshakeTerminalAudio.map((track) => ({
    id: track.sceneId,
    durationInFrames: track.durationInFrames,
  })),
  scenePaddingFrames: 0,
  artifactPaths: ["public/generated/tcp-handshake-terminal/", "out/tcp-handshake-terminal/"],
  registeredCompositionIds: [
    TCP_HANDSHAKE_TERMINAL_COMPOSITION_ID,
    tcpHandshakeTerminalManifest.render.cover16x9CompositionId,
    tcpHandshakeTerminalManifest.render.cover9x16CompositionId,
  ],
};
