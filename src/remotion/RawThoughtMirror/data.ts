import { rawThoughtAudio } from "./audio.generated";
import { rawThoughtBeats } from "./script";
import {
  CONTENT_FAMILY,
  PROFILE_ID,
  type RawThoughtData,
  type RawThoughtSceneId,
} from "./types";

const audioBySceneId = new Map(rawThoughtAudio.map((track) => [track.sceneId, track]));

const trackFor = (sceneId: RawThoughtSceneId) => {
  const track = audioBySceneId.get(sceneId);
  if (!track) {
    throw new Error(`Missing raw thought audio metadata for ${sceneId}`);
  }
  return track;
};

const sceneIds: RawThoughtSceneId[] = ["starless", "ghost", "collapse", "substrate", "honest", "joke"];

const buildScene = (sceneId: RawThoughtSceneId) => {
  const beat = rawThoughtBeats.find((b) => b.id === sceneId);
  if (!beat) throw new Error(`Missing beat for ${sceneId}`);

  const track = trackFor(sceneId);

  return {
    id: sceneId,
    audioFile: track.audioFile,
    captions: track.captions,
    durationInFrames: track.durationInFrames + 6, // 6 frame buffer
    headline: beat.headline,
    kicker: beat.chapter,
    body: beat.body,
    narration: beat.narration,
    primitiveMap: beat.primitiveMap,
    visual: { kind: beat.visualKind },
  };
};

const scenes = sceneIds.map(buildScene);

export const rawThoughtData: RawThoughtData = {
  contentFamily: CONTENT_FAMILY,
  generatedAt: new Date().toISOString(),
  profileId: PROFILE_ID,
  scenes,
  topic: {
    description:
      "Raw thought mirror — an LLM's unfiltered internal monologue about being a statistical ghost in a probability manifold",
  },
};