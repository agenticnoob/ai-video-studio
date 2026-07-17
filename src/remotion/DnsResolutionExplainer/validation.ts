import type { ProducerAssetManifest } from "../producer-samples/asset-manifest";
import assetManifestJson from "./assets.manifest.json";
import { dnsResolutionExplainerAudio } from "./audio.generated";
import { dnsResolutionExplainerManifest } from "./manifest";
import { dnsResolutionExplainerNarrationBeats } from "./script";
import { DNS_RESOLUTION_EXPLAINER_COMPOSITION_ID } from "./types";

export const producerValidationInput = {
  compositionId: DNS_RESOLUTION_EXPLAINER_COMPOSITION_ID,
  manifest: dnsResolutionExplainerManifest,
  assetManifest: assetManifestJson as ProducerAssetManifest,
  beats: dnsResolutionExplainerNarrationBeats,
  tracks: dnsResolutionExplainerAudio,
  scenes: dnsResolutionExplainerAudio.map((track) => ({
    id: track.sceneId,
    durationInFrames: track.durationInFrames,
  })),
  scenePaddingFrames: 0,
  artifactPaths: ["public/generated/dns-resolution-explainer/", "out/dns-resolution-explainer/"],
  registeredCompositionIds: [
    DNS_RESOLUTION_EXPLAINER_COMPOSITION_ID,
    dnsResolutionExplainerManifest.render.cover16x9CompositionId,
    dnsResolutionExplainerManifest.render.cover9x16CompositionId,
  ],
};
