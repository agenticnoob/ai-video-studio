import { z } from "zod";

import { themeSchema } from "./video-schema";

export const spotlightSpecSchema = z.object({
  meta: z.object({
    title: z.string(),
    fps: z.number().int().positive().default(30),
    width: z.number().int().positive().default(1280),
    height: z.number().int().positive().default(720),
  }),
  theme: themeSchema.default({
    background: "#111827",
    panel: "rgba(255,255,255,0.10)",
    primary: "#22c55e",
    secondary: "#f97316",
    text: "#f9fafb",
    muted: "#d1d5db",
  }),
  durationInFrames: z.number().int().positive().default(180),
  kicker: z.string().optional(),
  headline: z.string(),
  subheadline: z.string().optional(),
  callouts: z.array(z.string()).min(1).max(4).default(["清晰重点"]),
});

export type SpotlightSpec = z.infer<typeof spotlightSpecSchema>;

export const getSpotlightDuration = (spec: SpotlightSpec): number => {
  return spec.durationInFrames;
};
