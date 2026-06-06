import { z } from "zod";

import type { TemplateId } from "./ids";

export const createTemplateSegmentSchema = <
  TTemplateId extends TemplateId,
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
    templateId: z.literal(templateId),
    implementation: implementationSchema,
  });
};
