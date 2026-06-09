import type { z } from "zod";

export type TemplateCapabilities = {
  bestFor: string[];
  textDensity: "low" | "medium" | "high";
  recommendedDurationFrames: {
    min: number;
    max: number;
  };
  supportsMedia: boolean;
  supportsBaseLayer: boolean;
};

export type TemplatePlannerMetadata = {
  description: string;
  avoidCases: string[];
  narrationFit: string;
  mediaExpectations: string;
  examples: string[];
};

export type TemplateDefinition<
  TId extends string,
  TImplementationSchema extends z.ZodTypeAny,
  TSegmentSchema extends z.ZodTypeAny,
> = {
  id: TId;
  label: string;
  capabilities: TemplateCapabilities;
  planner: TemplatePlannerMetadata;
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
