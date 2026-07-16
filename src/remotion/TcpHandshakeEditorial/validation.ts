import type { ProducerAssetManifest } from "../producer-samples/asset-manifest";
import assetManifestJson from "./assets.manifest.json";
import { tcpHandshakeEditorialAudio } from "./audio.generated";
import { tcpHandshakeEditorialManifest } from "./manifest";
import { tcpHandshakeEditorialNarrationBeats } from "./script";
import { TCP_HANDSHAKE_EDITORIAL_COMPOSITION_ID } from "./types";

export const producerValidationInput = {
  compositionId: TCP_HANDSHAKE_EDITORIAL_COMPOSITION_ID,
  manifest: tcpHandshakeEditorialManifest,
  assetManifest: assetManifestJson as ProducerAssetManifest,
  beats: tcpHandshakeEditorialNarrationBeats,
  tracks: tcpHandshakeEditorialAudio,
  scenes: tcpHandshakeEditorialAudio.map((track) => ({
    id: track.sceneId,
    durationInFrames: track.durationInFrames,
  })),
  scenePaddingFrames: 0,
  artifactPaths: ["public/generated/tcp-handshake-editorial/", "out/tcp-handshake-editorial/"],
  registeredCompositionIds: [
    TCP_HANDSHAKE_EDITORIAL_COMPOSITION_ID,
    tcpHandshakeEditorialManifest.render.cover16x9CompositionId,
    tcpHandshakeEditorialManifest.render.cover9x16CompositionId,
  ],
};
