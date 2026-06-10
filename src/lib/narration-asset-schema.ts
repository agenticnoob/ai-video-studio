import { z } from "zod";

export const DEFAULT_VIDEO_FPS = 30;

export const narrationAudioFormatSchema = z.enum(["mp3", "wav", "aac", "m4a"]);

export const segmentNarrationAssetSchema = z
  .object({
    text: z.string().trim().min(1).max(2000),
    audioSrc: z.string().trim().min(1),
    durationInFrames: z.number().int().positive(),
    durationInSeconds: z.number().positive(),
    voiceId: z.string().trim().min(1).max(160).optional(),
    provider: z.string().trim().min(1).max(80).optional(),
    format: narrationAudioFormatSchema.optional(),
  })
  .strict();

export type NarrationAudioFormat = z.infer<typeof narrationAudioFormatSchema>;
export type SegmentNarrationAsset = z.infer<typeof segmentNarrationAssetSchema>;

export const durationSecondsToFrames = (
  durationInSeconds: number,
  fps = DEFAULT_VIDEO_FPS,
): number => {
  if (!Number.isFinite(durationInSeconds) || durationInSeconds <= 0) {
    throw new Error(`Invalid audio duration: ${durationInSeconds}`);
  }

  return Math.max(1, Math.ceil(durationInSeconds * fps));
};
