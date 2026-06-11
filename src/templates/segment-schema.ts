import { z } from "zod";

import { segmentNarrationSchema } from "../lib/narration-asset-schema";

export const createTemplateSegmentSchema = <
  TTemplateId extends string,
  TImplementationSchema extends z.ZodTypeAny,
>(
  templateId: TTemplateId,
  implementationSchema: TImplementationSchema,
) => {
  return z.object({
    id: z.string(),
    title: z.string(),
    intent: z.string(),
    revisionPrompt: z.string().optional(),
    durationInFrames: z.number().int().positive().optional(),
    narration: segmentNarrationSchema.optional(),
    templateId: z.literal(templateId),
    implementation: implementationSchema,
  });
};
