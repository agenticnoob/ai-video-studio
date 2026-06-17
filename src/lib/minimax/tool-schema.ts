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

const nodeGraphFlowGeneratorJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    generatorId: { type: "string", const: "node-graph-flow" },
    renderStrategy: { type: "string", const: "procedural_generator" },
    durationInFrames: { type: "integer", minimum: 45, maximum: 1200 },
    captionSafeZone: { type: "boolean" },
    fallbackStrategy: {
      type: "string",
      enum: ["primitive_scene_graph", "template_macro"],
    },
    fallbackReason: { type: "string" },
    title: { type: "string" },
    summary: { type: "string" },
    theme: themeJsonSchema,
    direction: {
      type: "string",
      enum: ["left-to-right", "top-to-bottom"],
    },
    nodes: {
      type: "array",
      minItems: 2,
      maxItems: 12,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          detail: { type: "string" },
          lane: {
            type: "string",
            enum: ["input", "plan", "build", "verify", "output"],
          },
          status: {
            type: "string",
            enum: ["idle", "active", "success", "error"],
          },
        },
        required: ["id", "label"],
      },
    },
    edges: {
      type: "array",
      minItems: 1,
      maxItems: 18,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          from: { type: "string" },
          to: { type: "string" },
          label: { type: "string" },
          status: {
            type: "string",
            enum: ["idle", "active", "success", "error"],
          },
        },
        required: ["from", "to"],
      },
    },
    beats: {
      type: "array",
      maxItems: 20,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          atFrame: { type: "integer", minimum: 0 },
          nodeId: { type: "string" },
          action: {
            type: "string",
            enum: ["reveal", "activate", "complete", "error"],
          },
        },
        required: ["atFrame", "nodeId"],
      },
    },
  },
  required: ["generatorId", "renderStrategy", "durationInFrames", "title", "nodes", "edges"],
} as const;

const linePathFlowGeneratorJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    generatorId: { type: "string", const: "line-path-flow" },
    renderStrategy: { type: "string", const: "procedural_generator" },
    durationInFrames: { type: "integer", minimum: 45, maximum: 1200 },
    captionSafeZone: { type: "boolean" },
    fallbackStrategy: {
      type: "string",
      enum: ["primitive_scene_graph", "template_macro"],
    },
    fallbackReason: { type: "string" },
    title: { type: "string" },
    summary: { type: "string" },
    theme: themeJsonSchema,
    tone: {
      type: "string",
      enum: ["primary", "secondary", "success", "warning"],
    },
    showNodes: { type: "boolean" },
    points: {
      type: "array",
      minItems: 2,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          x: { type: "number", minimum: 0, maximum: 1 },
          y: { type: "number", minimum: 0, maximum: 1 },
        },
        required: ["id", "label", "x", "y"],
      },
    },
    beats: {
      type: "array",
      maxItems: 16,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          atFrame: { type: "integer", minimum: 0 },
          pointId: { type: "string" },
          action: {
            type: "string",
            enum: ["reveal", "advance", "highlight"],
          },
        },
        required: ["atFrame", "pointId"],
      },
    },
  },
  required: ["generatorId", "renderStrategy", "durationInFrames", "title", "points"],
} as const;

const terminalSessionGeneratorJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    generatorId: { type: "string", const: "terminal-session" },
    renderStrategy: { type: "string", const: "procedural_generator" },
    durationInFrames: { type: "integer", minimum: 45, maximum: 1200 },
    captionSafeZone: { type: "boolean" },
    fallbackStrategy: {
      type: "string",
      enum: ["primitive_scene_graph", "template_macro"],
    },
    fallbackReason: { type: "string" },
    title: { type: "string" },
    summary: { type: "string" },
    theme: themeJsonSchema,
    status: {
      type: "string",
      enum: ["idle", "running", "success", "error"],
    },
    prompt: { type: "string" },
    lines: {
      type: "array",
      minItems: 1,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          text: { type: "string" },
          status: {
            type: "string",
            enum: ["idle", "running", "success", "error"],
          },
        },
        required: ["id", "text"],
      },
    },
    beats: {
      type: "array",
      maxItems: 16,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          atFrame: { type: "integer", minimum: 0 },
          lineId: { type: "string" },
          action: {
            type: "string",
            enum: ["reveal", "run", "complete", "error", "focus"],
          },
        },
        required: ["atFrame", "lineId"],
      },
    },
  },
  required: ["generatorId", "renderStrategy", "durationInFrames", "title", "lines"],
} as const;

const proceduralGeneratorJsonSchema = {
  oneOf: [
    nodeGraphFlowGeneratorJsonSchema,
    linePathFlowGeneratorJsonSchema,
    terminalSessionGeneratorJsonSchema,
  ],
} as const;

const assetRequirementJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: {
      type: "string",
      pattern: "^[a-z][a-z0-9_-]*$",
      description: "Stable asset ref such as dashboard-screenshot.",
    },
    kind: {
      type: "string",
      enum: [
        "product_screenshot",
        "screen_recording",
        "generated_image",
        "generated_video",
        "icon",
        "illustration",
        "stock_clip",
        "code_snippet",
        "terminal_output",
        "chart_data",
      ],
    },
    purpose: { type: "string" },
    fallback: { type: "string" },
  },
  required: ["id", "kind", "purpose", "fallback"],
} as const;

const assetPlanJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    requiredAssets: {
      type: "array",
      maxItems: 12,
      items: assetRequirementJsonSchema,
    },
  },
  required: ["requiredAssets"],
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
        assetPlan: assetPlanJsonSchema,
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
              strategyDecision: {
                type: "object",
                additionalProperties: false,
                properties: {
                  strategy: {
                    type: "string",
                    enum: ["template_macro", "primitive_scene_graph", "procedural_generator"],
                  },
                  confidence: { type: "number", minimum: 0, maximum: 1 },
                  reason: { type: "string" },
                  fallbackStrategy: {
                    type: "string",
                    enum: ["template_macro", "primitive_scene_graph"],
                  },
                },
                required: ["strategy", "confidence", "reason", "fallbackStrategy"],
              },
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
              proceduralGenerator: proceduralGeneratorJsonSchema,
              pacingHint: { type: "string" },
              expectedDurationSeconds: { type: "number", exclusiveMinimum: 0, maximum: 120 },
            },
            required: [
              "id",
              "order",
              "purpose",
              "templateId",
              "templateReason",
              "strategyDecision",
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
