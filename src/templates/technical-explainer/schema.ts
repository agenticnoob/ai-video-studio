import { z } from "zod";

import { themeSchema } from "../../lib/video-schema";
import { TECHNICAL_EXPLAINER_TEMPLATE_ID } from "../ids";
import { createTemplateSegmentSchema } from "../segment-schema";

export const technicalExplainerRecipeIdSchema = z.enum([
  "hero-title-reveal",
  "terminal-build-run",
  "workflow-node-map",
  "metric-countup",
  "timeline-progress",
]);

const sectionBaseSchema = z.object({
  id: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().min(1).max(240).optional(),
  durationInFrames: z.number().int().min(45).max(420).optional(),
});

const heroTitleRevealSectionSchema = sectionBaseSchema.extend({
  recipeId: z.literal("hero-title-reveal"),
  eyebrow: z.string().trim().min(1).max(80).optional(),
  primaryText: z.string().trim().min(1).max(120),
  secondaryText: z.string().trim().min(1).max(220).optional(),
  callouts: z.array(z.string().trim().min(1).max(64)).min(1).max(3).optional(),
});

const terminalBuildRunSectionSchema = sectionBaseSchema.extend({
  recipeId: z.literal("terminal-build-run"),
  command: z.string().trim().min(1).max(120),
  lines: z.array(z.string().trim().min(1).max(120)).min(2).max(6),
  statusLabel: z.string().trim().min(1).max(80).optional(),
});

const workflowNodeMapSectionSchema = sectionBaseSchema.extend({
  recipeId: z.literal("workflow-node-map"),
  nodes: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(60),
        label: z.string().trim().min(1).max(80),
        detail: z.string().trim().min(1).max(120).optional(),
      }),
    )
    .min(3)
    .max(6),
  activeNodeId: z.string().trim().min(1).max(60).optional(),
});

const metricCountupSectionSchema = sectionBaseSchema.extend({
  recipeId: z.literal("metric-countup"),
  metrics: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(80),
        value: z.string().trim().min(1).max(60),
        detail: z.string().trim().min(1).max(120).optional(),
      }),
    )
    .min(2)
    .max(4),
});

const timelineProgressSectionSchema = sectionBaseSchema.extend({
  recipeId: z.literal("timeline-progress"),
  checkpoints: z.array(z.string().trim().min(1).max(64)).min(3).max(5),
  note: z.string().trim().min(1).max(220).optional(),
});

export const technicalExplainerSectionSchema = z.discriminatedUnion("recipeId", [
  heroTitleRevealSectionSchema,
  terminalBuildRunSectionSchema,
  workflowNodeMapSectionSchema,
  metricCountupSectionSchema,
  timelineProgressSectionSchema,
]);

export const technicalExplainerSpecSchema = z.object({
  meta: z.object({
    title: z.string(),
    fps: z.number().int().positive().default(30),
    width: z.number().int().positive().default(1280),
    height: z.number().int().positive().default(720),
  }),
  theme: themeSchema.default({
    background: "#0b1020",
    panel: "rgba(255,255,255,0.10)",
    primary: "#38bdf8",
    secondary: "#f59e0b",
    text: "#f8fafc",
    muted: "#cbd5e1",
  }),
  durationInFrames: z.number().int().min(120).max(900).default(300),
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().min(1).max(260).optional(),
  sections: z.array(technicalExplainerSectionSchema).min(1).max(5),
});

export type TechnicalExplainerRecipeId = z.infer<typeof technicalExplainerRecipeIdSchema>;
export type TechnicalExplainerSpec = z.infer<typeof technicalExplainerSpecSchema>;
export type TechnicalExplainerSection = TechnicalExplainerSpec["sections"][number];

export const technicalExplainerSegmentSchema = createTemplateSegmentSchema(
  TECHNICAL_EXPLAINER_TEMPLATE_ID,
  technicalExplainerSpecSchema,
);

export type TechnicalExplainerSegment = z.infer<typeof technicalExplainerSegmentSchema>;

export const getTechnicalExplainerDuration = (spec: TechnicalExplainerSpec): number => {
  return spec.durationInFrames;
};
