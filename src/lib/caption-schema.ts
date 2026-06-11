import { z } from "zod";

export const segmentCaptionCueSchema = z
  .object({
    id: z.string().trim().min(1),
    text: z.string().trim().min(1),
    startFrame: z.number().int().min(0),
    durationInFrames: z.number().int().positive(),
  })
  .strict();

export const segmentCaptionsSchema = z
  .object({
    language: z.string().trim().min(1).max(40).optional(),
    cues: z.array(segmentCaptionCueSchema),
    style: z
      .object({
        preset: z.string().trim().min(1).max(80).optional(),
        position: z.enum(["bottom", "center", "top"]).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type SegmentCaptionCue = z.infer<typeof segmentCaptionCueSchema>;
export type SegmentCaptions = z.infer<typeof segmentCaptionsSchema>;
