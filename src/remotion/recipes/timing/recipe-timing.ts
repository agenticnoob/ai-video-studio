export type RecipeBeatTiming = {
  revealStartFrame: number;
  revealEndFrame: number;
  holdStartFrame: number;
  holdEndFrame: number;
  exitStartFrame: number;
  exitEndFrame: number;
};

export type RecipeCaptionSafeArea = {
  bottom: number;
  left: number;
  right: number;
};

export const DEFAULT_RECIPE_CAPTION_SAFE_AREA: RecipeCaptionSafeArea = {
  bottom: 96,
  left: 72,
  right: 72,
};

const normalizeFrameCount = (value: number | undefined, fallback: number) => {
  const candidate = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.max(0, Math.round(candidate));
};

const normalizeRatio = (value: number | undefined, fallback: number) => {
  const candidate = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.max(0, Math.min(0.45, candidate));
};

export const getRecipeBeatTiming = ({
  durationInFrames,
  minRevealFrames = 24,
  minExitFrames = 24,
  revealRatio = 0.18,
  exitRatio = 0.14,
}: {
  durationInFrames: number;
  minRevealFrames?: number;
  minExitFrames?: number;
  revealRatio?: number;
  exitRatio?: number;
}): RecipeBeatTiming => {
  const duration = Math.max(1, normalizeFrameCount(durationInFrames, 1));
  const revealMinimum = normalizeFrameCount(minRevealFrames, 24);
  const exitMinimum = normalizeFrameCount(minExitFrames, 24);
  const revealFrameRatio = normalizeRatio(revealRatio, 0.18);
  const exitFrameRatio = normalizeRatio(exitRatio, 0.14);

  const requestedRevealFrames = Math.max(revealMinimum, Math.round(duration * revealFrameRatio));
  const revealFrames = Math.min(duration, Math.max(0, Math.floor(duration * 0.45)), requestedRevealFrames);
  const remainingAfterReveal = Math.max(0, duration - revealFrames);

  const requestedExitFrames = Math.max(exitMinimum, Math.round(duration * exitFrameRatio));
  const exitFrames = Math.min(
    remainingAfterReveal,
    Math.max(0, Math.floor(duration * 0.4)),
    requestedExitFrames,
  );

  const revealStartFrame = 0;
  const revealEndFrame = revealFrames;
  const holdStartFrame = revealEndFrame;
  const exitEndFrame = duration;
  const exitStartFrame = Math.max(holdStartFrame, exitEndFrame - exitFrames);
  const holdEndFrame = exitStartFrame;

  return {
    revealStartFrame,
    revealEndFrame,
    holdStartFrame,
    holdEndFrame,
    exitStartFrame,
    exitEndFrame,
  };
};
