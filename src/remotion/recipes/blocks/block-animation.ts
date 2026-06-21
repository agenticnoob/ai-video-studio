import { Easing, interpolate } from "remotion";

export const recipeBlockClamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const recipeBlockSoftOut = Easing.bezier(0.16, 1, 0.3, 1);

export const recipeBlockFocusedOut = Easing.bezier(0.22, 1, 0.36, 1);

export const recipeBlockEnter = (frame: number, start = 0, end = 32) =>
  interpolate(frame, [start, end], [0, 1], {
    ...recipeBlockClamp,
    easing: recipeBlockSoftOut,
  });

export const recipeBlockMonoFontFamily =
  '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace';
