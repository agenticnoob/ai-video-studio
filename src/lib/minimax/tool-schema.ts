import { MAX_STORYBOARD_SEGMENTS } from "../storyboard-plan-schema";
import {
  getTemplateDefinition,
  templateIds,
  templateSegmentJsonSchemas,
  type TemplateId,
} from "../template-registry";
import type { MinimaxTool } from "./provider";

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

/**
 * Single `emit_result` tool for the registered template union. The forced
 * single-tool strategy is inherited from the live MiniMax T1/T2 probe; the
 * segment schemas now come from `template-registry` so adding a template has
 * one model-contract entry point.
 */
export const EMIT_RESULT_TOOL: MinimaxTool = {
  type: "function",
  function: {
    name: "emit_result",
    description:
      "Emit a complete VideoProject. Each segment uses one registered primary template. Populate every required field literally. Return the full project (for segment mode, return the full project with non-target segments byte-identical to the input).",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        meta: metaJsonSchema,
        brief: { type: "string" },
        segments: {
          type: "array",
          minItems: 1,
          maxItems: MAX_STORYBOARD_SEGMENTS,
          items: {
            oneOf: templateSegmentJsonSchemas,
          },
        },
      },
      required: ["meta", "brief", "segments"],
    },
  },
};

export const EMIT_STORYBOARD_PLAN_TOOL: MinimaxTool = {
  type: "function",
  function: {
    name: "emit_result",
    description:
      "Emit a validated StoryboardPlan. Choose one registered primary template for each planned segment. Do not generate final template implementation fields.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        brief: { type: "string" },
        language: { type: "string" },
        globalStyle: { type: "string" },
        segments: {
          type: "array",
          minItems: 1,
          maxItems: MAX_STORYBOARD_SEGMENTS,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              id: { type: "string" },
              order: { type: "integer", minimum: 1 },
              title: { type: "string" },
              purpose: { type: "string" },
              templateId: { type: "string", enum: templateIds },
              templateReason: { type: "string" },
              narration: {
                type: "object",
                additionalProperties: false,
                properties: {
                  text: { type: "string" },
                  tone: { type: "string" },
                },
                required: ["text"],
              },
              visualBrief: { type: "string" },
              pacingHint: { type: "string" },
              expectedDurationSeconds: { type: "number", exclusiveMinimum: 0, maximum: 120 },
            },
            required: [
              "id",
              "order",
              "purpose",
              "templateId",
              "templateReason",
              "narration",
              "visualBrief",
            ],
          },
        },
      },
      required: ["title", "brief", "segments"],
    },
  },
};

export const buildEmitTemplateImplementationTool = (templateId: TemplateId): MinimaxTool => {
  const template = getTemplateDefinition(templateId);

  return {
    type: "function",
    function: {
      name: "emit_result",
      description: `Emit only the schema-valid implementation object for the selected "${templateId}" template. Do not wrap it in a segment, project, media, narration, or implementation key.`,
      parameters: template.implementationJsonSchema,
    },
  };
};

/** Forced selection — model must call `emit_result`, no auto-routing. */
export const EMIT_RESULT_TOOL_CHOICE = {
  type: "function" as const,
  function: { name: "emit_result" },
};
