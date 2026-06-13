import { z } from "zod";

import { themeSchema } from "./video-schema";

export const NODE_GRAPH_FLOW_GENERATOR_ID = "node-graph-flow" as const;

const idSchema = z.string().trim().min(1).max(80);
const shortTextSchema = z.string().trim().min(1).max(120);
const mediumTextSchema = z.string().trim().min(1).max(240);

export const proceduralGeneratorIdSchema = z.enum([NODE_GRAPH_FLOW_GENERATOR_ID]);
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

export const proceduralGeneratorSchema = z.discriminatedUnion("generatorId", [
  nodeGraphFlowGeneratorSchema,
]);

export type ProceduralGenerator = z.infer<typeof proceduralGeneratorSchema>;
export type NodeGraphFlowGenerator = z.infer<typeof nodeGraphFlowGeneratorSchema>;

export const buildProceduralGeneratorDiagnostics = (generator: ProceduralGenerator) => ({
  durationInFrames: generator.durationInFrames,
  executable: false as const,
  fallbackStrategy: generator.fallbackStrategy,
  generatorId: generator.generatorId,
  renderStrategy: generator.renderStrategy,
});
