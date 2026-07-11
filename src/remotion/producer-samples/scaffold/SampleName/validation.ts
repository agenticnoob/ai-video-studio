import { sampleNameAudio } from "./audio.generated";
import { sampleNameNarrationBeats } from "./script";
import { SAMPLE_NAME_COMPOSITION_ID } from "./types";

export const producerValidationInput = {
  compositionId: SAMPLE_NAME_COMPOSITION_ID,
  beats: sampleNameNarrationBeats.map((beat) => ({ id: beat.sceneId, ttsText: beat.text })),
  tracks: sampleNameAudio,
  scenes: sampleNameAudio.map((track) => ({
    id: track.sceneId,
    durationInFrames: track.durationInFrames + 6,
  })),
  expectedProvider: "voxcpm",
  scenePaddingFrames: 6,
  artifactPaths: ["public/generated/sample-name/", "out/sample-name/"],
  registeredCompositionIds: [SAMPLE_NAME_COMPOSITION_ID],
  fallbackReasons: [],
};
