import type { z } from "zod";

export type TemplateDefinition<
  TId extends string,
  TImplementationSchema extends z.ZodTypeAny,
  TSegmentSchema extends z.ZodTypeAny,
> = {
  id: TId;
  label: string;
  implementationSchema: TImplementationSchema;
  segmentSchema: TSegmentSchema;
  implementationJsonSchema: Record<string, unknown>;
  segmentJsonSchema: Record<string, unknown>;
  getDuration: (implementation: z.infer<TImplementationSchema>) => number;
  selectionGuidance: string;
  implementationPrompt: string;
  revisionPrompt: string;
  preservationPrompt: string;
  buildRevisionPayload: (implementation: z.infer<TImplementationSchema>) => unknown;
};

export const defineTemplate = <
  TId extends string,
  TImplementationSchema extends z.ZodTypeAny,
  TSegmentSchema extends z.ZodTypeAny,
>(
  definition: TemplateDefinition<TId, TImplementationSchema, TSegmentSchema>,
) => definition;
