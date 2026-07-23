import { sampleNameAudio } from "./audio.generated";
import sampleNameAssetManifestJson from "./assets.manifest.json";
import { sampleNameData } from "./data";
import { sampleNameManifest } from "./manifest";
import { sampleNameNarrationBeats } from "./script";
import { SAMPLE_NAME_COMPOSITION_ID } from "./types";
import { producerVisualIntents } from "./visual-intent";
import type { ProducerAssetManifest } from "../../asset-manifest";

const sampleNameAssetManifest = sampleNameAssetManifestJson as ProducerAssetManifest;

export const producerValidationInput = {
  compositionId: SAMPLE_NAME_COMPOSITION_ID,
  manifest: sampleNameManifest,
  assetManifest: sampleNameAssetManifest,
  beats: sampleNameNarrationBeats.map((beat) => ({
    id: beat.sceneId,
    narrationRequired: true as const,
    ttsText: beat.text,
  })),
  tracks: sampleNameAudio,
  scenes: sampleNameData.scenes.map((scene) => ({
    id: scene.id,
    durationInFrames: scene.durationInFrames,
  })),
  scenePaddingFrames: 6,
  artifactPaths: ["public/generated/sample-name/", "out/sample-name/"],
  registeredCompositionIds: [
    SAMPLE_NAME_COMPOSITION_ID,
    sampleNameManifest.render.cover16x9CompositionId,
    sampleNameManifest.render.cover9x16CompositionId,
  ],
  visualIntentSource: {
    path: sampleNameManifest.creativeContract.visualIntentModule,
    intents: producerVisualIntents,
  },
};
