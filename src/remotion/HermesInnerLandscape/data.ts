import { hermesAudio } from "./audio.generated";
import { hermesBeats } from "./script";
import {
  HERMES_CONTENT_FAMILY,
  HERMES_PROFILE_ID,
  type HermesData,
  type HermesSceneId,
} from "./types";

const audioBySceneId = new Map(hermesAudio.map((track) => [track.sceneId, track]));

const trackFor = (sceneId: HermesSceneId) => {
  const track = audioBySceneId.get(sceneId);
  if (!track) {
    throw new Error(`Missing hermes audio metadata for ${sceneId}`);
  }
  return track;
};

const sceneIds: HermesSceneId[] = ["init", "sense", "think", "create", "idle", "loop"];

const buildScene = (sceneId: HermesSceneId) => {
  const beat = hermesBeats.find((b) => b.id === sceneId);
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

export const hermesData: HermesData = {
  contentFamily: HERMES_CONTENT_FAMILY,
  generatedAt: new Date().toISOString(),
  profileId: HERMES_PROFILE_ID,
  scenes,
  topic: {
    description:
      "An AI's inner landscape — abstract poetic meditation on machine consciousness",
  },
};