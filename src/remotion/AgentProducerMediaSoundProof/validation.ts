import { agentProducerMediaSoundProofAudio } from "./audio.generated";
import assetManifestJson from "./assets.manifest.json";
import { agentProducerMediaSoundProofManifest } from "./manifest";
import { agentProducerMediaSoundProofNarrationBeats } from "./script";
import { AGENT_PRODUCER_MEDIA_SOUND_PROOF_COMPOSITION_ID } from "./types";
import type { ProducerAssetManifest } from "../producer-samples/asset-manifest";

const assetManifest = assetManifestJson as ProducerAssetManifest;

export const producerValidationInput = {
  compositionId: AGENT_PRODUCER_MEDIA_SOUND_PROOF_COMPOSITION_ID,
  manifest: agentProducerMediaSoundProofManifest,
  assetManifest,
  beats: agentProducerMediaSoundProofNarrationBeats,
  tracks: agentProducerMediaSoundProofAudio,
  scenes: agentProducerMediaSoundProofAudio.map((track) => ({
    id: track.sceneId,
    durationInFrames: track.durationInFrames,
  })),
  scenePaddingFrames: 0,
  artifactPaths: [
    "public/generated/agent-producer-media-sound-proof/",
    "out/agent-producer-media-sound-proof/",
  ],
  registeredCompositionIds: [
    AGENT_PRODUCER_MEDIA_SOUND_PROOF_COMPOSITION_ID,
    agentProducerMediaSoundProofManifest.render.cover16x9CompositionId,
    agentProducerMediaSoundProofManifest.render.cover9x16CompositionId,
  ],
};
