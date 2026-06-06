import { templateSegmentJsonSchemas } from "../template-registry";
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
          maxItems: 3,
          items: {
            oneOf: templateSegmentJsonSchemas,
          },
        },
      },
      required: ["meta", "brief", "segments"],
    },
  },
};

/** Forced selection — model must call `emit_result`, no auto-routing. */
export const EMIT_RESULT_TOOL_CHOICE = {
  type: "function" as const,
  function: { name: "emit_result" },
};
