import { z } from "zod";

import { sceneGraphSchema, type SceneGraph } from "./scene-graph-schema";
import { themeSchema } from "./video-schema";

export const NODE_GRAPH_FLOW_GENERATOR_ID = "node-graph-flow" as const;
export const LINE_PATH_FLOW_GENERATOR_ID = "line-path-flow" as const;
export const TERMINAL_SESSION_GENERATOR_ID = "terminal-session" as const;

const idSchema = z.string().trim().min(1).max(80);
const shortTextSchema = z.string().trim().min(1).max(120);
const mediumTextSchema = z.string().trim().min(1).max(240);

export const proceduralGeneratorIdSchema = z.enum([
  NODE_GRAPH_FLOW_GENERATOR_ID,
  LINE_PATH_FLOW_GENERATOR_ID,
  TERMINAL_SESSION_GENERATOR_ID,
]);
export const proceduralGeneratorFallbackStrategySchema = z.enum([
  "primitive_scene_graph",
  "template_macro",
]);

const proceduralGeneratorBaseSchema = z
  .object({
    generatorId: proceduralGeneratorIdSchema,
    renderStrategy: z.literal("procedural_generator"),
    durationInFrames: z.number().int().min(45).max(1200),
    captionSafeZone: z.boolean().default(true),
    fallbackStrategy: proceduralGeneratorFallbackStrategySchema.default("primitive_scene_graph"),
    fallbackReason: z.string().trim().min(1).max(400).optional(),
  })
  .strict();

const nodeGraphFlowNodeSchema = z
  .object({
    id: idSchema,
    label: shortTextSchema,
    detail: shortTextSchema.optional(),
    lane: z.enum(["input", "plan", "build", "verify", "output"]).default("build"),
    status: z.enum(["idle", "active", "success", "error"]).default("idle"),
  })
  .strict();

const nodeGraphFlowEdgeSchema = z
  .object({
    from: idSchema,
    to: idSchema,
    label: shortTextSchema.optional(),
    status: z.enum(["idle", "active", "success", "error"]).default("idle"),
  })
  .strict();

const nodeGraphFlowBeatSchema = z
  .object({
    atFrame: z.number().int().nonnegative(),
    nodeId: idSchema,
    action: z.enum(["reveal", "activate", "complete", "error"]).default("activate"),
  })
  .strict();

const linePathFlowPointSchema = z
  .object({
    id: idSchema,
    label: shortTextSchema,
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
  })
  .strict();

const linePathFlowBeatSchema = z
  .object({
    atFrame: z.number().int().nonnegative(),
    pointId: idSchema,
    action: z.enum(["reveal", "advance", "highlight"]).default("advance"),
  })
  .strict();

const terminalSessionLineSchema = z
  .object({
    id: idSchema,
    text: mediumTextSchema,
    status: z.enum(["idle", "running", "success", "error"]).default("idle"),
  })
  .strict();

const terminalSessionBeatSchema = z
  .object({
    atFrame: z.number().int().nonnegative(),
    lineId: idSchema,
    action: z.enum(["reveal", "run", "complete", "error", "focus"]).default("run"),
  })
  .strict();

export const nodeGraphFlowGeneratorSchema = proceduralGeneratorBaseSchema
  .extend({
    generatorId: z.literal(NODE_GRAPH_FLOW_GENERATOR_ID),
    title: shortTextSchema,
    summary: mediumTextSchema.optional(),
    theme: themeSchema.default({
      background: "#08111f",
      panel: "rgba(248,250,252,0.10)",
      primary: "#7dd3fc",
      secondary: "#f59e0b",
      text: "#f8fafc",
      muted: "#cbd5e1",
    }),
    direction: z.enum(["left-to-right", "top-to-bottom"]).default("left-to-right"),
    nodes: z.array(nodeGraphFlowNodeSchema).min(2).max(12),
    edges: z.array(nodeGraphFlowEdgeSchema).min(1).max(18),
    beats: z.array(nodeGraphFlowBeatSchema).max(20).default([]),
  })
  .strict()
  .superRefine((generator, context) => {
    const nodeIds = new Set<string>();

    generator.nodes.forEach((node, index) => {
      if (nodeIds.has(node.id)) {
        context.addIssue({
          code: "custom",
          message: `Node id "${node.id}" must be unique.`,
          path: ["nodes", index, "id"],
        });
      }
      nodeIds.add(node.id);
    });

    generator.edges.forEach((edge, index) => {
      if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
        context.addIssue({
          code: "custom",
          message: `Edge "${edge.from}" -> "${edge.to}" must reference declared node ids.`,
          path: ["edges", index],
        });
      }
    });

    generator.beats.forEach((beat, index) => {
      if (!nodeIds.has(beat.nodeId)) {
        context.addIssue({
          code: "custom",
          message: `Beat nodeId "${beat.nodeId}" must reference a declared node id.`,
          path: ["beats", index, "nodeId"],
        });
      }
      if (beat.atFrame >= generator.durationInFrames) {
        context.addIssue({
          code: "custom",
          message: `Beat at frame ${beat.atFrame} is outside generator duration.`,
          path: ["beats", index, "atFrame"],
        });
      }
    });
  });

export const linePathFlowGeneratorSchema = proceduralGeneratorBaseSchema
  .extend({
    generatorId: z.literal(LINE_PATH_FLOW_GENERATOR_ID),
    title: shortTextSchema,
    summary: mediumTextSchema.optional(),
    theme: themeSchema.default({
      background: "#08111f",
      panel: "rgba(248,250,252,0.10)",
      primary: "#7dd3fc",
      secondary: "#f59e0b",
      text: "#f8fafc",
      muted: "#cbd5e1",
    }),
    tone: z.enum(["primary", "secondary", "success", "warning"]).default("primary"),
    showNodes: z.boolean().default(true),
    points: z.array(linePathFlowPointSchema).min(2).max(8),
    beats: z.array(linePathFlowBeatSchema).max(16).default([]),
  })
  .strict()
  .superRefine((generator, context) => {
    const pointIds = new Set<string>();

    generator.points.forEach((point, index) => {
      if (pointIds.has(point.id)) {
        context.addIssue({
          code: "custom",
          message: `Point id "${point.id}" must be unique.`,
          path: ["points", index, "id"],
        });
      }
      pointIds.add(point.id);
    });

    generator.beats.forEach((beat, index) => {
      if (!pointIds.has(beat.pointId)) {
        context.addIssue({
          code: "custom",
          message: `Beat pointId "${beat.pointId}" must reference a declared point id.`,
          path: ["beats", index, "pointId"],
        });
      }
      if (beat.atFrame >= generator.durationInFrames) {
        context.addIssue({
          code: "custom",
          message: `Beat at frame ${beat.atFrame} is outside generator duration.`,
          path: ["beats", index, "atFrame"],
        });
      }
    });
  });

export const terminalSessionGeneratorSchema = proceduralGeneratorBaseSchema
  .extend({
    generatorId: z.literal(TERMINAL_SESSION_GENERATOR_ID),
    title: shortTextSchema,
    summary: mediumTextSchema.optional(),
    theme: themeSchema.default({
      background: "#08111f",
      panel: "rgba(248,250,252,0.10)",
      primary: "#7dd3fc",
      secondary: "#f59e0b",
      text: "#f8fafc",
      muted: "#cbd5e1",
    }),
    status: z.enum(["idle", "running", "success", "error"]).default("running"),
    prompt: z.string().trim().min(1).max(20).default("$"),
    lines: z.array(terminalSessionLineSchema).min(1).max(8),
    beats: z.array(terminalSessionBeatSchema).max(16).default([]),
  })
  .strict()
  .superRefine((generator, context) => {
    const lineIds = new Set<string>();

    generator.lines.forEach((line, index) => {
      if (lineIds.has(line.id)) {
        context.addIssue({
          code: "custom",
          message: `Line id "${line.id}" must be unique.`,
          path: ["lines", index, "id"],
        });
      }
      lineIds.add(line.id);
    });

    generator.beats.forEach((beat, index) => {
      if (!lineIds.has(beat.lineId)) {
        context.addIssue({
          code: "custom",
          message: `Beat lineId "${beat.lineId}" must reference a declared line id.`,
          path: ["beats", index, "lineId"],
        });
      }
      if (beat.atFrame >= generator.durationInFrames) {
        context.addIssue({
          code: "custom",
          message: `Beat at frame ${beat.atFrame} is outside generator duration.`,
          path: ["beats", index, "atFrame"],
        });
      }
    });
  });

export const proceduralGeneratorSchema = z.discriminatedUnion("generatorId", [
  nodeGraphFlowGeneratorSchema,
  linePathFlowGeneratorSchema,
  terminalSessionGeneratorSchema,
]);

export type ProceduralGenerator = z.infer<typeof proceduralGeneratorSchema>;
export type NodeGraphFlowGenerator = z.infer<typeof nodeGraphFlowGeneratorSchema>;
export type LinePathFlowGenerator = z.infer<typeof linePathFlowGeneratorSchema>;
export type TerminalSessionGenerator = z.infer<typeof terminalSessionGeneratorSchema>;
export type ProceduralGeneratorCompiledRenderStrategy = "primitive_scene_graph" | "template_macro";
export type ProceduralGeneratorDiagnostics = {
  compiledRenderStrategy: ProceduralGeneratorCompiledRenderStrategy;
  durationInFrames: number;
  executable: boolean;
  fallback?: {
    reason: string;
    type: ProceduralGeneratorCompiledRenderStrategy;
  };
  fallbackStrategy: "primitive_scene_graph" | "template_macro";
  generatorId: ProceduralGenerator["generatorId"];
  renderStrategy: "procedural_generator";
};

const statusToTerminalStatus = (
  status: NodeGraphFlowGenerator["nodes"][number]["status"],
): "idle" | "running" | "success" | "error" => {
  if (status === "active") {
    return "running";
  }
  return status;
};

const statusToPathTone = (
  status: NodeGraphFlowGenerator["edges"][number]["status"],
): "primary" | "secondary" | "success" | "warning" => {
  if (status === "success") {
    return "success";
  }
  if (status === "error") {
    return "warning";
  }
  if (status === "active") {
    return "secondary";
  }
  return "primary";
};

const buildLinePathPoints = (generator: NodeGraphFlowGenerator) => {
  const count = Math.max(generator.nodes.length, 2);

  return generator.nodes.slice(0, 8).map((node, index) => {
    const progress = count === 1 ? 0.5 : index / (count - 1);
    const x = generator.direction === "left-to-right" ? 0.12 + progress * 0.76 : 0.5;
    const y = generator.direction === "top-to-bottom" ? 0.18 + progress * 0.58 : 0.58;

    return {
      x,
      y,
      label: node.label,
    };
  });
};

const generatorBeatActionToSceneBeatAction = (
  action: NodeGraphFlowGenerator["beats"][number]["action"],
): "reveal-layer" | "emphasize-text" | "advance-step" | "change-camera" | "exit-layer" => {
  if (action === "complete") {
    return "advance-step";
  }
  if (action === "error") {
    return "emphasize-text";
  }
  return "reveal-layer";
};

const linePathBeatActionToSceneBeatAction = (
  action: LinePathFlowGenerator["beats"][number]["action"],
): "reveal-layer" | "emphasize-text" | "advance-step" => {
  if (action === "highlight") {
    return "emphasize-text";
  }
  if (action === "advance") {
    return "advance-step";
  }
  return "reveal-layer";
};

const terminalBeatActionToSceneBeatAction = (
  action: TerminalSessionGenerator["beats"][number]["action"],
): "reveal-layer" | "emphasize-text" | "advance-step" => {
  if (action === "complete") {
    return "advance-step";
  }
  if (action === "error" || action === "focus") {
    return "emphasize-text";
  }
  return "reveal-layer";
};

export const compileNodeGraphFlowToSceneGraph = (generator: NodeGraphFlowGenerator): SceneGraph => {
  const activeNode = generator.nodes.find((node) => node.status === "active");
  const terminalStatus = statusToTerminalStatus(activeNode?.status ?? "success");
  const durationInFrames = generator.durationInFrames;
  const graphDuration = Math.max(30, durationInFrames - 32);
  const pathTone = statusToPathTone(
    generator.edges.find((edge) => edge.status === "active")?.status ??
      generator.edges.find((edge) => edge.status === "success")?.status ??
      "idle",
  );

  return sceneGraphSchema.parse({
    meta: {
      title: generator.title,
      fps: 30,
      width: 1280,
      height: 720,
    },
    theme: generator.theme,
    sceneType: "process",
    renderStrategy: "primitive_scene_graph",
    composition: "node-graph",
    layout: "node-graph",
    durationInFrames,
    camera: {
      movement: generator.direction === "top-to-bottom" ? "pan-right" : "drift",
      intensity: "subtle",
    },
    transitionIn: {
      type: "slide-up",
      durationInFrames: 12,
    },
    transitionOut: {
      type: "soft-wipe",
      durationInFrames: 12,
    },
    captionSafeZone: generator.captionSafeZone,
    layers: [
      {
        id: "generator-bg",
        type: "background",
        treatment: "noise-grid",
      },
      {
        id: "generator-title",
        type: "text",
        text: generator.title,
        role: "eyebrow",
        layout: "left",
        startFrame: 0,
        durationInFrames: Math.min(72, durationInFrames),
      },
      {
        id: "generator-graph",
        type: "node-graph",
        title: generator.summary ?? generator.title,
        nodes: generator.nodes.slice(0, 8),
        edges: generator.edges.slice(0, 10).map(({ from, status, to }) => ({ from, status, to })),
        layout: generator.direction === "left-to-right" ? "pipeline" : "horizontal",
        motionPreset: "draw-path",
        startFrame: 14,
        durationInFrames: graphDuration,
      },
      {
        id: "generator-path",
        type: "line-path",
        points: buildLinePathPoints(generator),
        tone: pathTone,
        showNodes: true,
        motionPreset: "draw-path",
        startFrame: 26,
        durationInFrames: Math.max(24, durationInFrames - 44),
      },
      {
        id: "generator-status",
        type: "terminal-panel",
        title: activeNode ? activeNode.label : "generator status",
        lines: generator.nodes
          .slice(0, 6)
          .map((node) => `${node.status}: ${node.label}${node.detail ? ` - ${node.detail}` : ""}`),
        status: terminalStatus,
        layout: "bottom",
        motionPreset: "type-text",
        startFrame: Math.max(36, Math.floor(durationInFrames * 0.46)),
        durationInFrames: Math.max(30, Math.floor(durationInFrames * 0.44)),
      },
      {
        id: "generator-caption-zone",
        type: "caption",
        source: "segment-narration",
      },
    ],
    beats: generator.beats.slice(0, 16).map((beat, index) => ({
      id: `generator-beat-${index + 1}`,
      atFrame: beat.atFrame,
      action: generatorBeatActionToSceneBeatAction(beat.action),
      targetLayerId: beat.action === "reveal" ? "generator-graph" : "generator-status",
    })),
  });
};

export const compileLinePathFlowToSceneGraph = (generator: LinePathFlowGenerator): SceneGraph => {
  const durationInFrames = generator.durationInFrames;

  return sceneGraphSchema.parse({
    meta: {
      title: generator.title,
      fps: 30,
      width: 1280,
      height: 720,
    },
    theme: generator.theme,
    sceneType: "process",
    renderStrategy: "primitive_scene_graph",
    composition: "path",
    layout: "path-horizontal",
    durationInFrames,
    camera: {
      movement: "drift",
      intensity: "subtle",
    },
    transitionIn: {
      type: "slide-up",
      durationInFrames: 12,
    },
    transitionOut: {
      type: "soft-wipe",
      durationInFrames: 12,
    },
    captionSafeZone: generator.captionSafeZone,
    layers: [
      {
        id: "line-path-bg",
        type: "background",
        treatment: "noise-grid",
      },
      {
        id: "line-path-title",
        type: "text",
        text: generator.title,
        role: "eyebrow",
        layout: "left",
        startFrame: 0,
        durationInFrames: Math.min(72, durationInFrames),
      },
      {
        id: "line-path-flow",
        type: "line-path",
        points: generator.points.map((point) => ({
          x: point.x,
          y: point.y,
          label: point.label,
        })),
        tone: generator.tone,
        showNodes: generator.showNodes,
        motionPreset: "draw-path",
        startFrame: 18,
        durationInFrames: Math.max(30, durationInFrames - 40),
      },
      ...(generator.summary
        ? [
            {
              id: "line-path-summary",
              type: "callout" as const,
              text: generator.summary,
              anchor: "center" as const,
              motionPreset: "fade-in" as const,
              startFrame: Math.max(36, Math.floor(durationInFrames * 0.55)),
              durationInFrames: Math.max(30, Math.floor(durationInFrames * 0.34)),
            },
          ]
        : []),
      {
        id: "line-path-caption-zone",
        type: "caption",
        source: "segment-narration",
      },
    ],
    beats: generator.beats.slice(0, 16).map((beat, index) => ({
      id: `line-path-beat-${index + 1}`,
      atFrame: beat.atFrame,
      action: linePathBeatActionToSceneBeatAction(beat.action),
      targetLayerId: "line-path-flow",
    })),
  });
};

export const compileTerminalSessionToSceneGraph = (
  generator: TerminalSessionGenerator,
): SceneGraph => {
  const durationInFrames = generator.durationInFrames;

  return sceneGraphSchema.parse({
    meta: {
      title: generator.title,
      fps: 30,
      width: 1280,
      height: 720,
    },
    theme: generator.theme,
    sceneType: "process",
    renderStrategy: "primitive_scene_graph",
    composition: "code-terminal",
    layout: "code-terminal-split",
    durationInFrames,
    camera: {
      movement: "drift",
      intensity: "subtle",
    },
    transitionIn: {
      type: "slide-up",
      durationInFrames: 12,
    },
    transitionOut: {
      type: "soft-wipe",
      durationInFrames: 12,
    },
    captionSafeZone: generator.captionSafeZone,
    layers: [
      {
        id: "terminal-session-bg",
        type: "background",
        treatment: "noise-grid",
      },
      {
        id: "terminal-session-title",
        type: "text",
        text: generator.title,
        role: "eyebrow",
        layout: "left",
        startFrame: 0,
        durationInFrames: Math.min(72, durationInFrames),
      },
      {
        id: "terminal-session-panel",
        type: "terminal-panel",
        title: generator.summary ?? generator.title,
        lines: generator.lines.slice(0, 8).map((line) => `${generator.prompt} ${line.text}`),
        status: generator.status,
        layout: "center",
        motionPreset: "type-text",
        startFrame: 18,
        durationInFrames: Math.max(36, durationInFrames - 44),
      },
      ...(generator.summary
        ? [
            {
              id: "terminal-session-summary",
              type: "callout" as const,
              text: generator.summary,
              anchor: "right" as const,
              motionPreset: "fade-in" as const,
              startFrame: Math.max(42, Math.floor(durationInFrames * 0.58)),
              durationInFrames: Math.max(30, Math.floor(durationInFrames * 0.32)),
            },
          ]
        : []),
      {
        id: "terminal-session-caption-zone",
        type: "caption",
        source: "segment-narration",
      },
    ],
    beats: generator.beats.slice(0, 16).map((beat, index) => ({
      id: `terminal-session-beat-${index + 1}`,
      atFrame: beat.atFrame,
      action: terminalBeatActionToSceneBeatAction(beat.action),
      targetLayerId: "terminal-session-panel",
    })),
  });
};

export const buildProceduralGeneratorDiagnostics = (
  generator: ProceduralGenerator,
  options: {
    compiledRenderStrategy?: ProceduralGeneratorCompiledRenderStrategy;
    fallback?: ProceduralGeneratorDiagnostics["fallback"];
  } = {},
): ProceduralGeneratorDiagnostics => ({
  compiledRenderStrategy: options.compiledRenderStrategy ?? "primitive_scene_graph",
  durationInFrames: generator.durationInFrames,
  executable: true,
  ...(options.fallback ? { fallback: options.fallback } : {}),
  fallbackStrategy: generator.fallbackStrategy,
  generatorId: generator.generatorId,
  renderStrategy: generator.renderStrategy,
});
