import { z } from "zod";

import { themeSchema } from "../../lib/video-schema";
import { STATS_DASHBOARD_TEMPLATE_ID } from "../ids";
import { createTemplateSegmentSchema } from "../segment-schema";

const dashboardLayoutSchema = z.enum(["single", "split", "grid", "hero-metric", "timeline"]);

const blockBaseSchema = z.object({
  id: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(120).optional(),
});

const chartSeriesSchema = z.object({
  name: z.string().trim().min(1).max(80),
  values: z.array(z.number()).min(1).max(8),
  color: z.string().trim().min(1).max(80).optional(),
});

const chartDataSchema = z.object({
  categories: z.array(z.string().trim().min(1).max(40)).min(1).max(8),
  series: z.array(chartSeriesSchema).min(1).max(3),
  unit: z.string().trim().min(1).max(40).optional(),
  maxValue: z.number().positive().optional(),
  highlightIndex: z.number().int().nonnegative().optional(),
});

const kpiBlockSchema = blockBaseSchema.extend({
  type: z.literal("kpi"),
  label: z.string().trim().min(1).max(80),
  value: z.string().trim().min(1).max(80),
  delta: z.string().trim().min(1).max(80).optional(),
  deltaDirection: z.enum(["up", "down", "flat"]).default("flat"),
});

const insightBlockSchema = blockBaseSchema.extend({
  type: z.literal("insight"),
  text: z.string().trim().min(1).max(320),
});

const barChartBlockSchema = blockBaseSchema.extend({
  type: z.literal("bar-chart"),
  chart: chartDataSchema,
});

const lineChartBlockSchema = blockBaseSchema.extend({
  type: z.literal("line-chart"),
  chart: chartDataSchema,
});

const donutChartBlockSchema = blockBaseSchema.extend({
  type: z.literal("donut-chart"),
  segments: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(60),
        value: z.number().nonnegative(),
        color: z.string().trim().min(1).max(80).optional(),
      }),
    )
    .min(1)
    .max(8),
  centerLabel: z.string().trim().min(1).max(80).optional(),
  centerValue: z.string().trim().min(1).max(80).optional(),
});

const dashboardBlockSchema = z.discriminatedUnion("type", [
  kpiBlockSchema,
  insightBlockSchema,
  barChartBlockSchema,
  lineChartBlockSchema,
  donutChartBlockSchema,
]);

const dashboardTimelineStepSchema = z.object({
  id: z.string().trim().min(1).max(80).optional(),
  from: z.number().int().nonnegative(),
  durationInFrames: z.number().int().positive(),
  blockIds: z.array(z.string().trim().min(1).max(80)).min(1).max(4),
  layout: dashboardLayoutSchema.exclude(["timeline"]).optional(),
});

export const statsDashboardSpecSchema = z.object({
  meta: z.object({
    title: z.string(),
    fps: z.number().int().positive().default(30),
    width: z.number().int().positive().default(1280),
    height: z.number().int().positive().default(720),
  }),
  theme: themeSchema.default({
    background: "#0f172a",
    panel: "rgba(248,250,252,0.10)",
    primary: "#38bdf8",
    secondary: "#f59e0b",
    text: "#f8fafc",
    muted: "#cbd5e1",
  }),
  durationInFrames: z.number().int().positive().default(210),
  layout: dashboardLayoutSchema.default("hero-metric"),
  kicker: z.string().trim().min(1).max(80).optional(),
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().min(1).max(240).optional(),
  blocks: z.array(dashboardBlockSchema).min(1).max(8),
  timeline: z.array(dashboardTimelineStepSchema).max(8).optional(),
  footerNote: z.string().trim().min(1).max(160).optional(),
});

export type StatsDashboardSpec = z.infer<typeof statsDashboardSpecSchema>;
export type StatsDashboardBlock = StatsDashboardSpec["blocks"][number];
export type StatsDashboardLayout = StatsDashboardSpec["layout"];
export type StatsDashboardTimelineStep = NonNullable<StatsDashboardSpec["timeline"]>[number];

export const statsDashboardSegmentSchema = createTemplateSegmentSchema(
  STATS_DASHBOARD_TEMPLATE_ID,
  statsDashboardSpecSchema,
);

export type StatsDashboardSegment = z.infer<typeof statsDashboardSegmentSchema>;

export const getStatsDashboardDuration = (spec: StatsDashboardSpec): number => {
  return spec.durationInFrames;
};
