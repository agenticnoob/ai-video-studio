import { z } from "zod";

import { themeSchema } from "./video-schema";

const idSchema = z.string().trim().min(1).max(80);
const shortTextSchema = z.string().trim().min(1).max(120);
const mediumTextSchema = z.string().trim().min(1).max(240);
const colorSchema = z.string().trim().min(1).max(80);
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const boundedTextFallback = (value: unknown, fallback: string): string => {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 120) : fallback;
};

const normalizeLayer = (value: unknown): unknown => {
  if (!isRecord(value) || typeof value.type !== "string") {
    return value;
  }

  const layer = { ...value };
  if (layer.type === "browser-window") {
    layer.title = boundedTextFallback(layer.title ?? layer.label ?? layer.text, "Browser preview");
    layer.url = boundedTextFallback(layer.url, "app://preview");
    if (layer.layout !== "left" && layer.layout !== "right" && layer.layout !== "center") {
      layer.layout = "center";
    }
  }

  if (layer.type === "node-graph") {
    if (layer.layout === "node-graph" || layer.layout === "path-horizontal") {
      layer.layout = "pipeline";
    }
  }

  if (layer.type === "line-path") {
    if (!Array.isArray(layer.points) && Array.isArray(layer.path)) {
      layer.points = layer.path;
    }
  }

  if (layer.type === "code-panel" || layer.type === "terminal-panel") {
    layer.title = boundedTextFallback(layer.title ?? layer.label ?? layer.text, "Panel");
  }

  return layer;
};

const normalizeSceneGraphCandidate = (value: unknown): unknown => {
  if (!isRecord(value)) {
    return value;
  }
  if (!Array.isArray(value.layers)) {
    return value;
  }

  return {
    ...value,
    layers: value.layers.map(normalizeLayer),
  };
};

export const renderStrategySchema = z.enum([
  "template_macro",
  "primitive_scene_graph",
  "procedural_generator",
  "media_asset_composite",
  "generated_component",
]);

export const compositionPresetSchema = z.enum([
  "hero",
  "path",
  "split",
  "node-graph",
  "code-terminal",
  "lockup",
]);

export const layoutPresetSchema = z.enum([
  "full-bleed",
  "center",
  "split",
  "path-horizontal",
  "node-graph",
  "code-terminal-split",
  "safe-lockup",
]);

export const motionPresetSchema = z.enum([
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
]);

export const sceneTransitionSchema = z.object({
  type: z.enum(["cut", "dissolve", "slide-left", "slide-up", "zoom-through", "soft-wipe"]),
  durationInFrames: z.number().int().min(0).max(45).default(12),
});

const sceneLayerBaseSchema = z.object({
  id: idSchema,
  motionPreset: motionPresetSchema.optional(),
  startFrame: z.number().int().nonnegative().default(0),
  durationInFrames: z.number().int().positive().optional(),
});

const backgroundLayerSchema = sceneLayerBaseSchema.extend({
  type: z.literal("background"),
  treatment: z.enum(["solid", "depth-gradient", "noise-grid"]).default("depth-gradient"),
});

const kineticTitleLayerSchema = sceneLayerBaseSchema.extend({
  type: z.literal("kinetic-title"),
  text: mediumTextSchema,
  emphasis: z.array(shortTextSchema).max(4).optional(),
  layout: z.enum(["center", "left", "split", "full-bleed", "lockup"]).default("center"),
});

const textLayerSchema = sceneLayerBaseSchema.extend({
  type: z.literal("text"),
  text: mediumTextSchema,
  role: z.enum(["eyebrow", "headline", "label", "annotation"]).default("label"),
  layout: z.enum(["left", "center", "right", "safe-bottom"]).default("left"),
});

const richTextLayerSchema = sceneLayerBaseSchema.extend({
  type: z.literal("rich-text"),
  title: shortTextSchema,
  body: z.array(shortTextSchema).min(1).max(4),
  layout: z.enum(["split-left", "split-right", "safe-lockup"]).default("split-left"),
});

const shapeLayerSchema = sceneLayerBaseSchema.extend({
  type: z.literal("shape"),
  shape: z.enum(["bar", "circle", "beam", "frame", "mask"]),
  tone: z.enum(["primary", "secondary", "muted", "dark"]).default("primary"),
  layout: z.enum(["full-bleed", "left-rail", "right-rail", "center-mark"]).default("full-bleed"),
});

const imagePlaneLayerSchema = sceneLayerBaseSchema.extend({
  type: z.literal("image-plane"),
  label: shortTextSchema,
  treatment: z.enum(["placeholder", "device", "full-bleed", "cutout"]).default("placeholder"),
  layout: z.enum(["split", "center", "background"]).default("split"),
});

const codePanelLayerSchema = sceneLayerBaseSchema.extend({
  type: z.literal("code-panel"),
  title: shortTextSchema,
  language: z.enum(["ts", "tsx", "json", "bash", "text"]).default("ts"),
  lines: z.array(z.string().trim().min(1).max(96)).min(1).max(12),
  highlightLines: z.array(z.number().int().min(1).max(12)).max(4).default([]),
  layout: z.enum(["left", "right", "wide"]).default("right"),
});

const terminalPanelLayerSchema = sceneLayerBaseSchema.extend({
  type: z.literal("terminal-panel"),
  title: shortTextSchema,
  lines: z.array(z.string().trim().min(1).max(96)).min(1).max(10),
  status: z.enum(["idle", "running", "success", "error"]).default("running"),
  layout: z.enum(["left", "right", "bottom", "wide"]).default("bottom"),
});

const browserWindowLayerSchema = sceneLayerBaseSchema.extend({
  type: z.literal("browser-window"),
  title: shortTextSchema,
  url: z.string().trim().min(1).max(120),
  callouts: z.array(shortTextSchema).max(3).default([]),
  layout: z.enum(["left", "right", "center"]).default("center"),
});

const nodeGraphNodeSchema = z.object({
  id: idSchema,
  label: shortTextSchema,
  detail: shortTextSchema.optional(),
  status: z.enum(["idle", "active", "success", "error"]).default("idle"),
  lane: z.enum(["input", "plan", "build", "verify", "output"]).default("build"),
});

const nodeGraphEdgeSchema = z.object({
  from: idSchema,
  to: idSchema,
  status: z.enum(["idle", "active", "success", "error"]).default("idle"),
});

const nodeGraphLayerSchema = sceneLayerBaseSchema.extend({
  type: z.literal("node-graph"),
  title: shortTextSchema.optional(),
  nodes: z.array(nodeGraphNodeSchema).min(2).max(8),
  edges: z.array(nodeGraphEdgeSchema).min(1).max(10),
  layout: z.enum(["horizontal", "radial", "pipeline"]).default("pipeline"),
});

const linePathPointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  label: shortTextSchema.optional(),
});

const linePathLayerSchema = sceneLayerBaseSchema.extend({
  type: z.literal("line-path"),
  points: z.array(linePathPointSchema).min(2).max(8),
  tone: z.enum(["primary", "secondary", "success", "warning"]).default("primary"),
  showNodes: z.boolean().default(true),
});

const cursorLayerSchema = sceneLayerBaseSchema.extend({
  type: z.literal("cursor"),
  label: shortTextSchema.optional(),
  path: z.array(linePathPointSchema).min(2).max(8),
  clickFrame: z.number().int().nonnegative().optional(),
});

const calloutLayerSchema = sceneLayerBaseSchema.extend({
  type: z.literal("callout"),
  text: mediumTextSchema,
  anchor: z.enum(["left", "right", "center"]).default("center"),
});

const metricHighlightLayerSchema = sceneLayerBaseSchema.extend({
  type: z.literal("metric-highlight"),
  label: shortTextSchema,
  value: shortTextSchema,
  context: mediumTextSchema.optional(),
});

const processStepLayerSchema = sceneLayerBaseSchema.extend({
  type: z.literal("process-step"),
  index: z.number().int().min(1).max(8),
  title: shortTextSchema,
  detail: mediumTextSchema.optional(),
});

const captionLayerSchema = sceneLayerBaseSchema.extend({
  type: z.literal("caption"),
  source: z.literal("segment-narration"),
});

export const sceneLayerSchema = z.discriminatedUnion("type", [
  backgroundLayerSchema,
  kineticTitleLayerSchema,
  textLayerSchema,
  richTextLayerSchema,
  shapeLayerSchema,
  imagePlaneLayerSchema,
  codePanelLayerSchema,
  terminalPanelLayerSchema,
  browserWindowLayerSchema,
  nodeGraphLayerSchema,
  linePathLayerSchema,
  cursorLayerSchema,
  calloutLayerSchema,
  metricHighlightLayerSchema,
  processStepLayerSchema,
  captionLayerSchema,
]);

export const sceneBeatSchema = z.object({
  id: idSchema.optional(),
  atFrame: z.number().int().nonnegative(),
  action: z.enum(["reveal-layer", "emphasize-text", "advance-step", "change-camera", "exit-layer"]),
  targetLayerId: idSchema.optional(),
});

export const shotLanguagePlanSchema = z.object({
  visualStyle: z.string().trim().min(1).max(160),
  colorSystem: z.object({
    background: colorSchema,
    foreground: colorSchema,
    accent: colorSchema,
    contrast: z.enum(["low", "medium", "high"]).default("medium"),
  }),
  motionSystem: z.object({
    camera: z
      .array(z.enum(["static", "push-in", "pan", "drift", "zoom-through"]))
      .min(1)
      .max(5),
    transitions: z
      .array(z.enum(["cut", "match-cut", "soft-wipe", "slide", "zoom"]))
      .min(1)
      .max(5),
    textMotion: z.enum(["minimal", "kinetic", "editorial", "bold"]).default("editorial"),
  }),
  rhythm: z.object({
    opener: z.enum(["fast", "steady", "slow"]).default("steady"),
    middle: z.enum(["fast", "steady", "slow"]).default("steady"),
    ending: z.enum(["fast", "steady", "slow"]).default("steady"),
  }),
  recurringMotifs: z.array(shortTextSchema).max(6).default([]),
  captionStyle: z
    .object({
      position: z.enum(["bottom", "center", "top"]).default("bottom"),
      treatment: z.enum(["clean", "boxed", "cinematic"]).default("clean"),
    })
    .optional(),
});

export const sceneGraphSchema = z.preprocess(
  normalizeSceneGraphCandidate,
  z
    .object({
      meta: z.object({
        title: z.string(),
        fps: z.number().int().positive().default(30),
        width: z.number().int().positive().default(1280),
        height: z.number().int().positive().default(720),
      }),
      theme: themeSchema.default({
        background: "#0b1020",
        panel: "rgba(255,255,255,0.10)",
        primary: "#7dd3fc",
        secondary: "#f59e0b",
        text: "#f8fafc",
        muted: "#cbd5e1",
      }),
      sceneType: z.enum([
        "opener",
        "explain",
        "proof",
        "comparison",
        "process",
        "transition",
        "closing",
      ]),
      renderStrategy: renderStrategySchema.default("primitive_scene_graph"),
      composition: compositionPresetSchema.default("hero"),
      layout: layoutPresetSchema.default("full-bleed"),
      durationInFrames: z.number().int().min(45).max(1200),
      camera: z.object({
        movement: z.enum(["static", "push-in", "pan-left", "pan-right", "drift", "zoom-through"]),
        intensity: z.enum(["subtle", "medium", "strong"]).default("medium"),
      }),
      transitionIn: sceneTransitionSchema.optional(),
      transitionOut: sceneTransitionSchema.optional(),
      captionSafeZone: z.boolean().default(true),
      layers: z.array(sceneLayerSchema).min(1).max(12),
      beats: z.array(sceneBeatSchema).max(16).default([]),
    })
    .superRefine((sceneGraph, context) => {
      if (sceneGraph.renderStrategy !== "primitive_scene_graph") {
        context.addIssue({
          code: "custom",
          message: "Scene graph Visual IR v1 only accepts primitive_scene_graph renderStrategy.",
          path: ["renderStrategy"],
        });
      }

      const layerIds = new Set<string>();
      sceneGraph.layers.forEach((layer, index) => {
        if (layerIds.has(layer.id)) {
          context.addIssue({
            code: "custom",
            message: `Layer id "${layer.id}" must be unique.`,
            path: ["layers", index, "id"],
          });
        }
        layerIds.add(layer.id);

        if (layer.type === "node-graph") {
          const nodeIds = new Set<string>();
          layer.nodes.forEach((node, nodeIndex) => {
            if (nodeIds.has(node.id)) {
              context.addIssue({
                code: "custom",
                message: `Node id "${node.id}" must be unique inside layer "${layer.id}".`,
                path: ["layers", index, "nodes", nodeIndex, "id"],
              });
            }
            nodeIds.add(node.id);
          });
          layer.edges.forEach((edge, edgeIndex) => {
            if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
              context.addIssue({
                code: "custom",
                message: `Node graph edge "${edge.from}" -> "${edge.to}" must reference nodes in the same layer.`,
                path: ["layers", index, "edges", edgeIndex],
              });
            }
          });
        }

        if (layer.startFrame >= sceneGraph.durationInFrames) {
          context.addIssue({
            code: "custom",
            message: `Layer "${layer.id}" starts after the segment duration.`,
            path: ["layers", index, "startFrame"],
          });
        }
      });

      sceneGraph.beats.forEach((beat, index) => {
        if (beat.atFrame >= sceneGraph.durationInFrames) {
          context.addIssue({
            code: "custom",
            message: `Beat at frame ${beat.atFrame} is outside the segment duration.`,
            path: ["beats", index, "atFrame"],
          });
        }
        if (beat.targetLayerId && !layerIds.has(beat.targetLayerId)) {
          context.addIssue({
            code: "custom",
            message: `Beat targetLayerId "${beat.targetLayerId}" does not match a layer id.`,
            path: ["beats", index, "targetLayerId"],
          });
        }
      });
    }),
);

export type SceneTransition = z.infer<typeof sceneTransitionSchema>;
export type SceneLayer = z.infer<typeof sceneLayerSchema>;
export type SceneBeat = z.infer<typeof sceneBeatSchema>;
export type SceneGraph = z.infer<typeof sceneGraphSchema>;
export type ShotLanguagePlan = z.infer<typeof shotLanguagePlanSchema>;
