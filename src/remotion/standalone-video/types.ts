import type { SegmentCaptions } from "./caption-types";

export type StandaloneCanvasProfileId = "landscape-16x9" | "portrait-9x16";

export type StandaloneCanvasOrientation = "landscape" | "portrait";

export type StandaloneContentFamily =
  | "project-intro"
  | "data-analysis"
  | "tutorial"
  | "trend-briefing";

export type StandaloneCanvasProfile = {
  readonly fps: 30;
  readonly height: number;
  readonly id: StandaloneCanvasProfileId;
  readonly orientation: StandaloneCanvasOrientation;
  readonly width: number;
};

export const STANDALONE_CANVAS_PROFILES = [
  {
    fps: 30,
    height: 720,
    id: "landscape-16x9",
    orientation: "landscape",
    width: 1280,
  },
  {
    fps: 30,
    height: 1920,
    id: "portrait-9x16",
    orientation: "portrait",
    width: 1080,
  },
] as const satisfies readonly StandaloneCanvasProfile[];

export const getStandaloneCanvasProfile = (
  id: StandaloneCanvasProfileId,
): StandaloneCanvasProfile => {
  const profile = STANDALONE_CANVAS_PROFILES.find((candidate) => candidate.id === id);

  if (!profile) {
    throw new Error(`Unknown standalone canvas profile: ${id}`);
  }

  return profile;
};

export type StandaloneTimedScene = {
  readonly captions?: SegmentCaptions;
  readonly durationInFrames: number;
  readonly id: string;
};

export type StandaloneAudioTrack<TSceneId extends string = string> = {
  readonly audioFile: string;
  readonly captions?: SegmentCaptions;
  readonly durationInFrames: number;
  readonly durationInSeconds?: number;
  readonly format?: "mp3" | "wav" | "aac" | "m4a";
  readonly narration?: string;
  readonly provider?: string;
  readonly sceneId: TSceneId;
};
