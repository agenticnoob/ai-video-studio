import { z } from "zod";

import { spotlightSpecSchema } from "../../lib/spotlight-schema";
import { SPOTLIGHT_TEMPLATE_ID } from "../ids";

export const spotlightSegmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  intent: z.string(),
  revisionPrompt: z.string().optional(),
  durationInFrames: z.number().int().positive().optional(),
  templateId: z.literal(SPOTLIGHT_TEMPLATE_ID),
  implementation: spotlightSpecSchema,
});

export type SpotlightSegment = z.infer<typeof spotlightSegmentSchema>;
