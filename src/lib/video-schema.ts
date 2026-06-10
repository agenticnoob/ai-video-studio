import { z } from "zod";

// Current implementation schema for the `scripted` segment template.
// `scenes` is intentionally scoped to this template; future templates should
// define their own implementation schemas instead of inheriting this shape.
export const themeSchema = z.object({
  background: z.string().default("#0b1020"),
  panel: z.string().default("rgba(255,255,255,0.08)"),
  primary: z.string().default("#7dd3fc"),
  secondary: z.string().default("#c084fc"),
  text: z.string().default("#f8fafc"),
  muted: z.string().default("#cbd5e1"),
});

const baseSceneSchema = z.object({
  id: z.string(),
  duration: z.number().int().positive(),
  kicker: z.string().optional(),
});

const titleSceneSchema = baseSceneSchema.extend({
  type: z.literal("title"),
  title: z.string(),
  subtitle: z.string().optional(),
});

const bulletsSceneSchema = baseSceneSchema.extend({
  type: z.literal("bullets"),
  title: z.string(),
  bullets: z.array(z.string()).min(1),
});

const quoteSceneSchema = baseSceneSchema.extend({
  type: z.literal("quote"),
  quote: z.string(),
  author: z.string().optional(),
});

export const sceneSchema = z.discriminatedUnion("type", [
  titleSceneSchema,
  bulletsSceneSchema,
  quoteSceneSchema,
]);

export const videoSpecSchema = z.object({
  meta: z.object({
    title: z.string(),
    fps: z.number().int().positive().default(30),
    width: z.number().int().positive().default(1280),
    height: z.number().int().positive().default(720),
  }),
  theme: themeSchema.default({
    background: "#0b1020",
    panel: "rgba(255,255,255,0.08)",
    primary: "#7dd3fc",
    secondary: "#c084fc",
    text: "#f8fafc",
    muted: "#cbd5e1",
  }),
  scenes: z.array(sceneSchema).min(1),
});

export type VideoSpec = z.infer<typeof videoSpecSchema>;
export type VideoScene = z.infer<typeof sceneSchema>;

export const getVideoDuration = (spec: VideoSpec): number => {
  return spec.scenes.reduce((sum: number, scene: VideoScene) => sum + scene.duration, 0);
};

export const getSceneStart = (spec: VideoSpec, index: number): number => {
  return spec.scenes
    .slice(0, index)
    .reduce((sum: number, scene: VideoScene) => sum + scene.duration, 0);
};
