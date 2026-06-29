import { Easing, interpolate } from "remotion";

export const pixelragPalette = {
  background: "#071018",
  ink: "#f8fafc",
  muted: "#a8b3c7",
  panel: "rgba(13, 24, 36, 0.86)",
  panelStrong: "rgba(18, 32, 48, 0.96)",
} as const;

export const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const fade = (frame: number, start: number, end: number): number =>
  interpolate(frame, [start, end], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
