import { z } from "zod";

export const mediaLayerSourceTypeSchema = z.enum(["public", "remote", "route"]);

export const audioMediaLayerKindSchema = z.enum(["narration", "music", "sfx", "ambient"]);

const baseMediaLayerSchema = z
  .object({
    id: z.string().trim().min(1).max(120),
    startFrame: z.number().int().nonnegative(),
    durationInFrames: z.number().int().positive(),
  })
  .strict();

export const audioMediaLayerSchema = baseMediaLayerSchema
  .extend({
    type: z.literal("audio"),
    kind: audioMediaLayerKindSchema.default("narration"),
    src: z.string().trim().min(1),
    sourceType: mediaLayerSourceTypeSchema.default("route"),
    trimStartFrame: z.number().int().nonnegative().optional(),
    volume: z.number().min(0).max(2).default(1),
    loop: z.boolean().default(false),
  })
  .strict();

export const mediaLayerSchema = z.discriminatedUnion("type", [audioMediaLayerSchema]);

export const projectMediaSchema = z
  .object({
    layers: z.array(mediaLayerSchema).default([]),
  })
  .strict();

export type MediaLayerSourceType = z.infer<typeof mediaLayerSourceTypeSchema>;
export type AudioMediaLayerKind = z.infer<typeof audioMediaLayerKindSchema>;
export type AudioMediaLayer = z.infer<typeof audioMediaLayerSchema>;
export type ProjectMediaLayer = z.infer<typeof mediaLayerSchema>;
export type ProjectMedia = z.infer<typeof projectMediaSchema>;
