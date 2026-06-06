import { getSpotlightDuration, spotlightSpecSchema } from "../../lib/spotlight-schema";
import { defineTemplate } from "../definition";
import { SPOTLIGHT_TEMPLATE_ID } from "../ids";
import { createSegmentJsonSchema, metaJsonSchema, themeJsonSchema } from "../shared-json-schema";
import { spotlightSegmentSchema } from "./schema";

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

export const spotlightTemplate = defineTemplate({
  id: SPOTLIGHT_TEMPLATE_ID,
  label: "Spotlight",
  implementationSchema: spotlightSpecSchema,
  segmentSchema: spotlightSegmentSchema,
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
  buildRevisionPayload: (implementation) => ({
    meta: implementation.meta,
    theme: implementation.theme,
    durationInFrames: implementation.durationInFrames,
    kicker: implementation.kicker,
    headline: implementation.headline,
    subheadline: implementation.subheadline,
    callouts: implementation.callouts,
  }),
});
