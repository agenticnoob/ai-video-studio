import { z } from "zod";

import { storyboardPlanSchema } from "../storyboard-plan-schema";
import { voiceCloneRequestSchema } from "./voice-references";

export const ttsRequestSchema = z.object({
  plan: storyboardPlanSchema,
  provider: z.enum(["f5-tts"]).optional(),
  segmentId: z.string().trim().min(1, "Segment id is required"),
  voiceId: z.string().trim().min(1).max(160).optional(),
  voiceClone: voiceCloneRequestSchema.optional(),
});
