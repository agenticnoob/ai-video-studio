import { defineTemplate } from "../definition";
import { SCENE_GRAPH_TEMPLATE_ID } from "../ids";
import { createSegmentJsonSchema, metaJsonSchema, themeJsonSchema } from "../shared-json-schema";
import { getSceneGraphDuration, sceneGraphSegmentSchema, sceneGraphSpecSchema } from "./schema";

const sceneTransitionJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    type: {
      type: "string",
      enum: ["cut", "dissolve", "slide-left", "slide-up", "zoom-through", "soft-wipe"],
    },
    durationInFrames: { type: "integer", minimum: 0, maximum: 45 },
  },
  required: ["type"],
} as const;

const sceneLayerJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string", minLength: 1, maxLength: 80 },
    type: {
      type: "string",
      enum: [
        "background",
        "kinetic-title",
        "text",
        "rich-text",
        "shape",
        "image-plane",
        "code-panel",
        "terminal-panel",
        "browser-window",
        "node-graph",
        "line-path",
        "cursor",
        "callout",
        "metric-highlight",
        "process-step",
        "caption",
      ],
    },
    motionPreset: {
      type: "string",
      enum: [
        "fade-in",
        "slide-in",
        "pop",
        "draw-path",
        "highlight",
        "type-text",
        "camera-push",
        "match-cut",
        "success-pulse",
        "error-glitch",
      ],
    },
    startFrame: { type: "integer", minimum: 0 },
    durationInFrames: { type: "integer", minimum: 1 },
    treatment: {
      type: "string",
      enum: [
        "solid",
        "depth-gradient",
        "noise-grid",
        "placeholder",
        "device",
        "full-bleed",
        "cutout",
      ],
    },
    text: { type: "string", minLength: 1, maxLength: 240 },
    emphasis: { type: "array", items: { type: "string", maxLength: 120 }, maxItems: 4 },
    layout: {
      type: "string",
      enum: [
        "center",
        "left",
        "right",
        "split",
        "full-bleed",
        "lockup",
        "safe-bottom",
        "split-left",
        "split-right",
        "safe-lockup",
        "left-rail",
        "right-rail",
        "center-mark",
        "background",
        "wide",
        "bottom",
        "horizontal",
        "radial",
        "pipeline",
      ],
    },
    role: { type: "string", enum: ["eyebrow", "headline", "label", "annotation"] },
    body: { type: "array", items: { type: "string", maxLength: 120 }, minItems: 1, maxItems: 4 },
    shape: { type: "string", enum: ["bar", "circle", "beam", "frame", "mask"] },
    tone: { type: "string", enum: ["primary", "secondary", "muted", "dark", "success", "warning"] },
    language: { type: "string", enum: ["ts", "tsx", "json", "bash", "text"] },
    lines: {
      type: "array",
      items: { type: "string", minLength: 1, maxLength: 96 },
      minItems: 1,
      maxItems: 12,
    },
    highlightLines: {
      type: "array",
      items: { type: "integer", minimum: 1, maximum: 12 },
      maxItems: 4,
    },
    status: { type: "string", enum: ["idle", "running", "active", "success", "error"] },
    url: { type: "string", minLength: 1, maxLength: 120 },
    callouts: { type: "array", items: { type: "string", maxLength: 120 }, maxItems: 3 },
    nodes: {
      type: "array",
      minItems: 2,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string", minLength: 1, maxLength: 80 },
          label: { type: "string", minLength: 1, maxLength: 120 },
          detail: { type: "string", maxLength: 120 },
          status: { type: "string", enum: ["idle", "active", "success", "error"] },
          lane: { type: "string", enum: ["input", "plan", "build", "verify", "output"] },
        },
        required: ["id", "label"],
      },
    },
    edges: {
      type: "array",
      minItems: 1,
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          from: { type: "string", minLength: 1, maxLength: 80 },
          to: { type: "string", minLength: 1, maxLength: 80 },
          status: { type: "string", enum: ["idle", "active", "success", "error"] },
        },
        required: ["from", "to"],
      },
    },
    points: {
      type: "array",
      minItems: 2,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          x: { type: "number", minimum: 0, maximum: 1 },
          y: { type: "number", minimum: 0, maximum: 1 },
          label: { type: "string", maxLength: 120 },
        },
        required: ["x", "y"],
      },
    },
    path: {
      type: "array",
      minItems: 2,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          x: { type: "number", minimum: 0, maximum: 1 },
          y: { type: "number", minimum: 0, maximum: 1 },
          label: { type: "string", maxLength: 120 },
        },
        required: ["x", "y"],
      },
    },
    showNodes: { type: "boolean" },
    clickFrame: { type: "integer", minimum: 0 },
    anchor: { type: "string", enum: ["left", "right", "center"] },
    label: { type: "string", minLength: 1, maxLength: 120 },
    value: { type: "string", minLength: 1, maxLength: 120 },
    context: { type: "string", maxLength: 240 },
    index: { type: "integer", minimum: 1, maximum: 8 },
    title: { type: "string", minLength: 1, maxLength: 120 },
    detail: { type: "string", maxLength: 240 },
    source: { type: "string", const: "segment-narration" },
  },
  required: ["id", "type"],
} as const;

export const sceneGraphImplementationJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    meta: metaJsonSchema,
    theme: themeJsonSchema,
    sceneType: {
      type: "string",
      enum: ["opener", "explain", "proof", "comparison", "process", "transition", "closing"],
    },
    renderStrategy: {
      type: "string",
      enum: [
        "template_macro",
        "primitive_scene_graph",
        "procedural_generator",
        "media_asset_composite",
        "generated_component",
      ],
    },
    composition: {
      type: "string",
      enum: ["hero", "path", "split", "node-graph", "code-terminal", "lockup"],
    },
    layout: {
      type: "string",
      enum: [
        "full-bleed",
        "center",
        "split",
        "path-horizontal",
        "node-graph",
        "code-terminal-split",
        "safe-lockup",
      ],
    },
    durationInFrames: { type: "integer", minimum: 45, maximum: 1200 },
    camera: {
      type: "object",
      additionalProperties: false,
      properties: {
        movement: {
          type: "string",
          enum: ["static", "push-in", "pan-left", "pan-right", "drift", "zoom-through"],
        },
        intensity: { type: "string", enum: ["subtle", "medium", "strong"] },
      },
      required: ["movement", "intensity"],
    },
    transitionIn: sceneTransitionJsonSchema,
    transitionOut: sceneTransitionJsonSchema,
    captionSafeZone: { type: "boolean" },
    layers: {
      type: "array",
      minItems: 1,
      maxItems: 12,
      items: sceneLayerJsonSchema,
    },
    beats: {
      type: "array",
      maxItems: 16,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string", maxLength: 80 },
          atFrame: { type: "integer", minimum: 0 },
          action: {
            type: "string",
            enum: ["reveal-layer", "emphasize-text", "advance-step", "change-camera", "exit-layer"],
          },
          targetLayerId: { type: "string", maxLength: 80 },
        },
        required: ["atFrame", "action"],
      },
    },
  },
  required: ["meta", "sceneType", "durationInFrames", "camera", "layers"],
} as const;

export const sceneGraphTemplate = defineTemplate({
  id: SCENE_GRAPH_TEMPLATE_ID,
  label: "Scene Graph",
  capabilities: {
    bestFor: [
      "authored openers",
      "process explainers",
      "visual continuity across multi-segment videos",
      "caption-safe kinetic title and callout sequences",
      "primitive scene graphs with node, path, code, and terminal treatments",
    ],
    textDensity: "medium",
    recommendedDurationFrames: {
      min: 90,
      max: 300,
    },
    supportsMedia: false,
    supportsBaseLayer: false,
  },
  planner: {
    description:
      "Flexible validated Visual IR renderer using bounded primitive_scene_graph layers, beats, camera movement, and transitions. It is not arbitrary generated code.",
    avoidCases: [
      "dense dashboards with many numeric series",
      "long paragraph-heavy segments",
      "segments requiring arbitrary external media or unrestricted TSX",
    ],
    narrationFit:
      "Best with concise narration where visual beats can reveal full-bleed titles, node graphs, paths, code panels, terminal panels, lockups, and caption-safe regions over the real segment duration.",
    mediaExpectations:
      "No external media ingestion in Visual IR v1. Use text, shapes, placeholder image planes, node graphs, line paths, code panels, terminal panels, browser-window placeholders, cursors, and caption-safe regions only.",
    examples: [
      "Open with a full-bleed kinetic title, shape beam, camera push, and no central card shell.",
      "Explain a process with a node graph, drawn line path, and code or terminal panel.",
      "Close with a safe-lockup title, terminal success state, and caption-safe lower band.",
    ],
  },
  implementationSchema: sceneGraphSpecSchema,
  segmentSchema: sceneGraphSegmentSchema,
  implementationJsonSchema: sceneGraphImplementationJsonSchema,
  segmentJsonSchema: createSegmentJsonSchema(
    SCENE_GRAPH_TEMPLATE_ID,
    sceneGraphImplementationJsonSchema,
  ),
  getDuration: getSceneGraphDuration,
  selectionGuidance:
    "Use scene-graph when the segment needs stronger shot language, camera motion, layered reveals, or a cinematic opener/process/closing rhythm without generated TSX.",
  implementationPrompt: [
    "Return a schema-valid SceneGraph only.",
    "For this version set renderStrategy to primitive_scene_graph; template_macro and generated_component are not executable scene-graph strategies.",
    "Use only bounded composition/layout/motion presets from the schema.",
    "Do not return TSX, imports, package names, URLs, file paths, or arbitrary code.",
    "Use segment-local frame values and keep durationInFrames anchored to narration duration.",
    "Keep captions outside implementation; use a caption layer only to reserve space for segment narration captions.",
    "Every beat targetLayerId must match a layer id.",
  ].join("\n"),
  revisionPrompt:
    "For scene-graph revisions, replace only the target segment SceneGraph fields requested by the user while preserving narration ownership outside implementation.",
  preservationPrompt:
    "scene-graph segments preserve validated layers, beats, camera movement, caption-safe zones, and duration unless the target segment is explicitly regenerated.",
  buildRevisionPayload: (implementation) => implementation,
});
