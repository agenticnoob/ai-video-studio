import { sampleNameAudio } from "./audio.generated";
import {
  SAMPLE_NAME_CONTENT_FAMILY,
  SAMPLE_NAME_PROFILE_ID,
  type SampleNameData,
  type SampleNameSceneId,
} from "./types";

const audioBySceneId = new Map<SampleNameSceneId, (typeof sampleNameAudio)[number]>(
  sampleNameAudio.map((track) => [track.sceneId, track]),
);

const scene = (sceneId: SampleNameSceneId, headline: string) => {
  const audio = audioBySceneId.get(sceneId);

  if (!audio) {
    throw new Error(`Missing scaffold audio metadata for ${sceneId}.`);
  }

  return {
    id: sceneId,
    headline,
    narration: audio.narration,
    audioFile: audio.audioFile,
    durationInFrames: audio.durationInFrames,
    captions: audio.captions,
  };
};

export const sampleNameData = {
  contentFamily: SAMPLE_NAME_CONTENT_FAMILY,
  profileId: SAMPLE_NAME_PROFILE_ID,
  scenes: [
    scene("open", "Real topic promise"),
    scene("proof", "Evidence beat"),
    scene("close", "Reusable takeaway"),
  ],
} satisfies SampleNameData;
