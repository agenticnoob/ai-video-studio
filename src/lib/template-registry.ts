import { z } from "zod";

import { getSpotlightDuration, spotlightSpecSchema } from "./spotlight-schema";
import { getVideoDuration, videoSpecSchema } from "./video-schema";

export const SCRIPTED_TEMPLATE_ID = "scripted" as const;
export const SPOTLIGHT_TEMPLATE_ID = "spotlight" as const;

export type TemplateId = typeof SCRIPTED_TEMPLATE_ID | typeof SPOTLIGHT_TEMPLATE_ID;

const metaJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    fps: { type: "integer", const: 30 },
    width: { type: "integer", const: 1280 },
    height: { type: "integer", const: 720 },
  },
  required: ["title", "fps", "width", "height"],
} as const;

const themeJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    background: { type: "string" },
    panel: { type: "string" },
    primary: { type: "string" },
    secondary: { type: "string" },
    text: { type: "string" },
    muted: { type: "string" },
  },
  required: ["background", "panel", "primary", "secondary", "text", "muted"],
} as const;

const scriptedImplementationJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    meta: metaJsonSchema,
    theme: themeJsonSchema,
    scenes: {
      type: "array",
      minItems: 1,
      items: {
        oneOf: [
          {
            type: "object",
            additionalProperties: false,
            properties: {
              id: { type: "string" },
              type: { type: "string", const: "title" },
              duration: { type: "integer", minimum: 1 },
              kicker: { type: "string" },
              title: { type: "string" },
              subtitle: { type: "string" },
              voiceover: { type: "string" },
            },
            required: ["id", "type", "duration", "title"],
          },
          {
            type: "object",
            additionalProperties: false,
            properties: {
              id: { type: "string" },
              type: { type: "string", const: "bullets" },
              duration: { type: "integer", minimum: 1 },
              kicker: { type: "string" },
              title: { type: "string" },
              bullets: { type: "array", minItems: 1, items: { type: "string" } },
              voiceover: { type: "string" },
            },
            required: ["id", "type", "duration", "title", "bullets"],
          },
          {
            type: "object",
            additionalProperties: false,
            properties: {
              id: { type: "string" },
              type: { type: "string", const: "quote" },
              duration: { type: "integer", minimum: 1 },
              kicker: { type: "string" },
              quote: { type: "string" },
              author: { type: "string" },
              voiceover: { type: "string" },
            },
            required: ["id", "type", "duration", "quote"],
          },
        ],
      },
    },
  },
  required: ["meta", "theme", "scenes"],
} as const;

const spotlightImplementationJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    meta: metaJsonSchema,
    theme: themeJsonSchema,
    durationInFrames: { type: "integer", minimum: 1 },
    kicker: { type: "string" },
    headline: { type: "string" },
    subheadline: { type: "string" },
    callouts: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: { type: "string" },
    },
  },
  required: ["meta", "theme", "durationInFrames", "headline", "callouts"],
} as const;

const baseSegmentShape = {
  id: z.string(),
  title: z.string(),
  intent: z.string(),
  revisionPrompt: z.string().optional(),
  durationInFrames: z.number().int().positive().optional(),
};

const scriptedVideoSegmentSchema = z.object({
  ...baseSegmentShape,
  templateId: z.literal(SCRIPTED_TEMPLATE_ID).default(SCRIPTED_TEMPLATE_ID),
  implementation: videoSpecSchema,
});

const spotlightVideoSegmentSchema = z.object({
  ...baseSegmentShape,
  templateId: z.literal(SPOTLIGHT_TEMPLATE_ID),
  implementation: spotlightSpecSchema,
});

const createSegmentJsonSchema = (
  templateId: TemplateId,
  implementation: Record<string, unknown>,
) =>
  ({
    type: "object",
    additionalProperties: false,
    properties: {
      id: { type: "string", pattern: "^segment-[0-9]+$" },
      title: { type: "string", maxLength: 64 },
      intent: { type: "string" },
      templateId: { type: "string", const: templateId },
      implementation,
    },
    required: ["id", "title", "intent", "templateId", "implementation"],
  }) as const;

export const templateDefinitions = {
  [SCRIPTED_TEMPLATE_ID]: {
    id: SCRIPTED_TEMPLATE_ID,
    label: "Scripted",
    segmentSchema: scriptedVideoSegmentSchema,
    implementationJsonSchema: scriptedImplementationJsonSchema,
    segmentJsonSchema: createSegmentJsonSchema(
      SCRIPTED_TEMPLATE_ID,
      scriptedImplementationJsonSchema,
    ),
    getDuration: getVideoDuration,
    selectionGuidance:
      "Use scripted for explanatory flow, multi-step processes, narrative development, before/after explanations, or segments that benefit from several internal scenes.",
    implementationPrompt: `When segment.templateId is "scripted", segment.implementation
must be the scripted VideoSpec shape. In that shape, implementation.scenes is
an array of 1+ scripted scenes. Each scene has a discriminated type
in {"title", "bullets", "quote"} with fields:

  title:   { id, type:"title",   duration, kicker?, title, subtitle?, voiceover? }
  bullets: { id, type:"bullets", duration, kicker?, title, bullets: string[>=1], voiceover? }
  quote:   { id, type:"quote",   duration, kicker?, quote, author?, voiceover? }

- duration is an integer > 0, in frames at 30fps (so 90 is about 3 seconds)
- scene ids must be unique within the segment and stable across regenerations
  (e.g. "hook", "pipeline", "output")
- keep total per-segment duration between 90 and 600 frames`,
    revisionPrompt: `Scripted implementation schema:
- implementation.meta: { title, fps=30, width=1280, height=720 }
- implementation.theme: { background, panel, primary, secondary, text, muted }
- implementation.scenes: 1+ items, each type in {"title", "bullets", "quote"} with matching fields; duration is integer frames at 30fps`,
    preservationPrompt:
      "for scripted segments, scenes and theme must match the input exactly",
    buildRevisionPayload: (implementation: z.infer<typeof videoSpecSchema>) => ({
      meta: implementation.meta,
      theme: implementation.theme,
      scenes: implementation.scenes,
    }),
  },
  [SPOTLIGHT_TEMPLATE_ID]: {
    id: SPOTLIGHT_TEMPLATE_ID,
    label: "Spotlight",
    segmentSchema: spotlightVideoSegmentSchema,
    implementationJsonSchema: spotlightImplementationJsonSchema,
    segmentJsonSchema: createSegmentJsonSchema(
      SPOTLIGHT_TEMPLATE_ID,
      spotlightImplementationJsonSchema,
    ),
    getDuration: getSpotlightDuration,
    selectionGuidance:
      "Use spotlight for a hook, opener, key message, metric, punchline, transition bumper, recap, or call-to-action that should read as one focused visual card.",
    implementationPrompt: `When segment.templateId is "spotlight", segment.implementation
must have:
  meta: { title, fps=30, width=1280, height=720 }
  theme: { background, panel, primary, secondary, text, muted }
  durationInFrames: integer > 0, usually 120-240 frames
  kicker?: short label
  headline: strong main message, ideally <= 18 Chinese chars or <= 8 English words
  subheadline?: one supporting sentence
  callouts: 1-4 short strings`,
    revisionPrompt: `Spotlight implementation schema:
- implementation.meta: { title, fps=30, width=1280, height=720 }
- implementation.theme: { background, panel, primary, secondary, text, muted }
- implementation.durationInFrames: integer frames at 30fps
- implementation.kicker?: string
- implementation.headline: string
- implementation.subheadline?: string
- implementation.callouts: 1-4 strings`,
    preservationPrompt:
      "for spotlight segments, durationInFrames, kicker, headline, subheadline, callouts, and theme must match the input exactly",
    buildRevisionPayload: (implementation: z.infer<typeof spotlightSpecSchema>) => ({
      meta: implementation.meta,
      theme: implementation.theme,
      durationInFrames: implementation.durationInFrames,
      kicker: implementation.kicker,
      headline: implementation.headline,
      subheadline: implementation.subheadline,
      callouts: implementation.callouts,
    }),
  },
} as const;

export const templateIds = Object.keys(templateDefinitions) as TemplateId[];

export const videoSegmentSchemaVariants = [
  templateDefinitions[SCRIPTED_TEMPLATE_ID].segmentSchema,
  templateDefinitions[SPOTLIGHT_TEMPLATE_ID].segmentSchema,
] as const;

export const templateSegmentJsonSchemas = templateIds.map(
  (templateId) => templateDefinitions[templateId].segmentJsonSchema,
);

export const getTemplateDefinition = (templateId: TemplateId) => {
  return templateDefinitions[templateId];
};

export const getTemplateLabel = (templateId: TemplateId): string => {
  return templateDefinitions[templateId].label;
};

export const buildTemplateSelectionPrompt = (): string => {
  return templateIds
    .map((templateId) => `- ${templateId}: ${templateDefinitions[templateId].selectionGuidance}`)
    .join("\n");
};

export const buildTemplateImplementationPrompt = (): string => {
  return templateIds
    .map((templateId) => `# ${templateDefinitions[templateId].label} implementation rules\n${templateDefinitions[templateId].implementationPrompt}`)
    .join("\n\n");
};

export const buildTemplateRevisionPrompt = (): string => {
  return templateIds
    .map((templateId) => templateDefinitions[templateId].revisionPrompt)
    .join("\n\n");
};

export const buildTemplatePreservationPrompt = (): string => {
  return templateIds
    .map((templateId) => `  - ${templateDefinitions[templateId].preservationPrompt}`)
    .join("\n");
};
