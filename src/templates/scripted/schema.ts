import { z } from "zod";

import { videoSpecSchema } from "../../lib/video-schema";
import { SCRIPTED_TEMPLATE_ID } from "../ids";

export const scriptedSegmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  intent: z.string(),
  revisionPrompt: z.string().optional(),
  durationInFrames: z.number().int().positive().optional(),
  templateId: z.literal(SCRIPTED_TEMPLATE_ID).default(SCRIPTED_TEMPLATE_ID),
  implementation: videoSpecSchema,
});

export type ScriptedSegment = z.infer<typeof scriptedSegmentSchema>;
