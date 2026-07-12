import { gitTutorialAudio } from "./audio.generated";
import { gitNarrationBeats } from "./script";
import {
  GIT_TUTORIAL_CONTENT_FAMILY,
  GIT_TUTORIAL_PROFILE_ID,
  type GitTutorialData,
  type GitTutorialSceneId,
} from "./types";

const audioBySceneId = new Map(gitTutorialAudio.map((track) => [track.sceneId, track]));

const trackFor = (sceneId: GitTutorialSceneId) => {
  const track = audioBySceneId.get(sceneId);
  if (!track) {
    throw new Error(`Missing git tutorial audio metadata for ${sceneId}`);
  }
  return track;
};

const sceneIds: GitTutorialSceneId[] = [
  "open",
  "what",
  "concepts",
  "workflow",
  "agent",
  "tips",
  "close",
];

const buildScene = (sceneId: GitTutorialSceneId) => {
  const beat = gitNarrationBeats.find((b) => b.id === sceneId);
  if (!beat) throw new Error(`Missing beat for ${sceneId}`);

  const track = trackFor(sceneId);

  return {
    id: sceneId,
    audioFile: track.audioFile,
    captions: track.captions,
    durationInFrames: track.durationInFrames + 6,
    headline: beat.headline,
    kicker: beat.chapter,
    narration: beat.narration,
    primitiveMap: beat.primitiveMap,
    visual: { kind: beat.visualKind },
  };
};

export const gitTutorialData: GitTutorialData = {
  contentFamily: GIT_TUTORIAL_CONTENT_FAMILY,
  generatedAt: new Date().toISOString(),
  profileId: GIT_TUTORIAL_PROFILE_ID,
  scenes: sceneIds.map(buildScene),
  topic: {
    description: "Git tutorial for developers and AI agent users",
  },
};