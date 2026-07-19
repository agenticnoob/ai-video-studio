import type { ProducerAssetManifest } from "../producer-samples/asset-manifest";
import assetManifestJson from "./assets.manifest.json";
import { superintelligenceBeyondHumanCognitionAudio } from "./audio.generated";
import {
  superintelligenceBeyondHumanCognitionData,
  superintelligenceBeyondHumanCognitionSceneStarts,
} from "./data";
import { superintelligenceBeyondHumanCognitionManifest } from "./manifest";
import { superintelligenceBeyondHumanCognitionNarrationBeats } from "./script";
import {
  SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_COMPOSITION_ID,
  SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_CHAPTER_TRANSITION_FRAMES,
  SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_DURATION_IN_FRAMES,
  SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_NARRATION_DURATION_IN_FRAMES,
} from "./types";

let expectedNarrationStart = 0;
for (const [index, track] of superintelligenceBeyondHumanCognitionAudio.entries()) {
  const actualNarrationStart = superintelligenceBeyondHumanCognitionSceneStarts[index];
  if (actualNarrationStart !== expectedNarrationStart) {
    throw new Error(
      `${track.sceneId} narration must start without a gap: expected ${expectedNarrationStart}, received ${actualNarrationStart}.`,
    );
  }
  expectedNarrationStart += track.durationInFrames;
}

if (
  SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_DURATION_IN_FRAMES !==
  SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_NARRATION_DURATION_IN_FRAMES
) {
  throw new Error("Composition duration must equal measured narration duration without tail holds.");
}

export const producerValidationInput = {
  compositionId: SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_COMPOSITION_ID,
  manifest: superintelligenceBeyondHumanCognitionManifest,
  assetManifest: assetManifestJson as ProducerAssetManifest,
  beats: superintelligenceBeyondHumanCognitionNarrationBeats.map((beat) => ({
    id: beat.sceneId,
    narrationRequired: true as const,
    ttsText: beat.ttsText,
    displayText: beat.displayText,
  })),
  tracks: superintelligenceBeyondHumanCognitionAudio,
  scenes: superintelligenceBeyondHumanCognitionData.scenes.map((scene) => ({
    id: scene.id,
    durationInFrames: scene.durationInFrames,
  })),
  scenePaddingFrames: SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_CHAPTER_TRANSITION_FRAMES,
  artifactPaths: [
    "public/generated/superintelligence-beyond-human-cognition/",
    "out/superintelligence-beyond-human-cognition/",
  ],
  registeredCompositionIds: [
    SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_COMPOSITION_ID,
    superintelligenceBeyondHumanCognitionManifest.render.cover16x9CompositionId,
    superintelligenceBeyondHumanCognitionManifest.render.cover9x16CompositionId,
  ],
};
