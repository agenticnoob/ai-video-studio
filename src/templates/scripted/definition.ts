import { getVideoDuration, videoSpecSchema } from "../../lib/video-schema";
import { defineTemplate } from "../definition";
import { SCRIPTED_TEMPLATE_ID } from "../ids";
import { createSegmentJsonSchema, metaJsonSchema, themeJsonSchema } from "../shared-json-schema";
import { scriptedSegmentSchema } from "./schema";

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

export const scriptedTemplate = defineTemplate({
  id: SCRIPTED_TEMPLATE_ID,
  label: "Scripted",
  capabilities: {
    bestFor: [
      "explanatory flow",
      "multi-step process",
      "narrative development",
      "before and after explanation",
    ],
    textDensity: "high",
    recommendedDurationFrames: {
      min: 90,
      max: 600,
    },
    supportsMedia: false,
    supportsBaseLayer: false,
  },
  implementationSchema: videoSpecSchema,
  segmentSchema: scriptedSegmentSchema,
  implementationJsonSchema: scriptedImplementationJsonSchema,
  segmentJsonSchema: createSegmentJsonSchema(SCRIPTED_TEMPLATE_ID, scriptedImplementationJsonSchema),
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
  preservationPrompt: "for scripted segments, scenes and theme must match the input exactly",
  buildRevisionPayload: (implementation) => ({
    meta: implementation.meta,
    theme: implementation.theme,
    scenes: implementation.scenes,
  }),
});
