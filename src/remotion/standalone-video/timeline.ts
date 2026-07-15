import type { SegmentCaptionCue, SegmentCaptions } from "./caption-types";
import type { StandaloneTimedScene } from "./types";

type StandaloneSceneTimingOptions = {
  readonly overlapFrames?: number;
};

const normalizeOverlapFrames = (overlapFrames: number | undefined): number => {
  if (!Number.isFinite(overlapFrames)) {
    return 0;
  }

  return Math.max(0, Math.floor(overlapFrames as number));
};

const normalizeDurationInFrames = (durationInFrames: number): number => {
  if (!Number.isFinite(durationInFrames)) {
    return 1;
  }

  return Math.max(1, Math.round(durationInFrames));
};

export const buildStandaloneSceneStartFrames = (
  scenes: readonly StandaloneTimedScene[],
  options: StandaloneSceneTimingOptions = {},
): readonly number[] => {
  const overlapFrames = normalizeOverlapFrames(options.overlapFrames);
  let cursor = 0;

  return scenes.map((scene) => {
    const startFrame = cursor;
    cursor += Math.max(normalizeDurationInFrames(scene.durationInFrames) - overlapFrames, 1);
    return startFrame;
  });
};

export const buildStandaloneSceneStartMap = <TScene extends StandaloneTimedScene>(
  scenes: readonly TScene[],
  options: StandaloneSceneTimingOptions = {},
): Record<TScene["id"], number> => {
  const starts = buildStandaloneSceneStartFrames(scenes, options);

  return scenes.reduce<Record<TScene["id"], number>>(
    (accumulator, scene, index) => ({
      ...accumulator,
      [scene.id]: starts[index] ?? 0,
    }),
    {} as Record<TScene["id"], number>,
  );
};

export const getStandaloneDurationInFrames = (
  scenes: readonly StandaloneTimedScene[],
  options: StandaloneSceneTimingOptions = {},
): number => {
  const starts = buildStandaloneSceneStartFrames(scenes, options);
  const lastScene = scenes[scenes.length - 1];
  const lastStart = starts[starts.length - 1];

  if (!lastScene || lastStart === undefined) {
    return 1;
  }

  return lastStart + normalizeDurationInFrames(lastScene.durationInFrames);
};

export const getActiveStandaloneCaption = (
  captions: SegmentCaptions | undefined,
  frame: number,
): SegmentCaptionCue | undefined => {
  if (!captions || !Number.isFinite(frame)) {
    return undefined;
  }

  return captions.cues.find(
    (candidate) =>
      frame >= candidate.startFrame && frame < candidate.startFrame + candidate.durationInFrames,
  );
};
