import { defineTemplate } from "../definition";
import { STATS_DASHBOARD_TEMPLATE_ID } from "../ids";
import { createSegmentJsonSchema, metaJsonSchema, themeJsonSchema } from "../shared-json-schema";
import {
  getStatsDashboardDuration,
  statsDashboardSegmentSchema,
  statsDashboardSpecSchema,
} from "./schema";

const chartSeriesJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: "string" },
    values: {
      type: "array",
      minItems: 1,
      maxItems: 8,
      items: { type: "number" },
    },
    color: { type: "string" },
  },
  required: ["name", "values"],
} as const;

const chartDataJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    categories: {
      type: "array",
      minItems: 1,
      maxItems: 8,
      items: { type: "string" },
    },
    series: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: chartSeriesJsonSchema,
    },
    unit: { type: "string" },
    maxValue: { type: "number", exclusiveMinimum: 0 },
    highlightIndex: { type: "integer", minimum: 0 },
  },
  required: ["categories", "series"],
} as const;

const blockBaseJsonSchema = {
  id: { type: "string" },
  title: { type: "string" },
} as const;

const dashboardBlockJsonSchema = {
  oneOf: [
    {
      type: "object",
      additionalProperties: false,
      properties: {
        ...blockBaseJsonSchema,
        type: { type: "string", const: "kpi" },
        label: { type: "string" },
        value: { type: "string" },
        delta: { type: "string" },
        deltaDirection: { type: "string", enum: ["up", "down", "flat"] },
      },
      required: ["id", "type", "label", "value", "deltaDirection"],
    },
    {
      type: "object",
      additionalProperties: false,
      properties: {
        ...blockBaseJsonSchema,
        type: { type: "string", const: "insight" },
        text: { type: "string" },
      },
      required: ["id", "type", "text"],
    },
    {
      type: "object",
      additionalProperties: false,
      properties: {
        ...blockBaseJsonSchema,
        type: { type: "string", const: "bar-chart" },
        chart: chartDataJsonSchema,
      },
      required: ["id", "type", "chart"],
    },
    {
      type: "object",
      additionalProperties: false,
      properties: {
        ...blockBaseJsonSchema,
        type: { type: "string", const: "line-chart" },
        chart: chartDataJsonSchema,
      },
      required: ["id", "type", "chart"],
    },
    {
      type: "object",
      additionalProperties: false,
      properties: {
        ...blockBaseJsonSchema,
        type: { type: "string", const: "donut-chart" },
        segments: {
          type: "array",
          minItems: 1,
          maxItems: 8,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              label: { type: "string" },
              value: { type: "number", minimum: 0 },
              color: { type: "string" },
            },
            required: ["label", "value"],
          },
        },
        centerLabel: { type: "string" },
        centerValue: { type: "string" },
      },
      required: ["id", "type", "segments"],
    },
  ],
} as const;

const timelineStepJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string" },
    from: { type: "integer", minimum: 0 },
    durationInFrames: { type: "integer", minimum: 1 },
    blockIds: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: { type: "string" },
    },
    layout: { type: "string", enum: ["single", "split", "grid", "hero-metric"] },
  },
  required: ["from", "durationInFrames", "blockIds"],
} as const;

const statsDashboardImplementationJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    meta: metaJsonSchema,
    theme: themeJsonSchema,
    durationInFrames: { type: "integer", minimum: 1 },
    layout: { type: "string", enum: ["single", "split", "grid", "hero-metric", "timeline"] },
    kicker: { type: "string" },
    title: { type: "string" },
    subtitle: { type: "string" },
    blocks: {
      type: "array",
      minItems: 1,
      maxItems: 8,
      items: dashboardBlockJsonSchema,
    },
    timeline: {
      type: "array",
      maxItems: 8,
      items: timelineStepJsonSchema,
    },
    footerNote: { type: "string" },
  },
  required: ["meta", "theme", "durationInFrames", "layout", "title", "blocks"],
} as const;

export const statsDashboardTemplate = defineTemplate({
  id: STATS_DASHBOARD_TEMPLATE_ID,
  label: "Stats Dashboard",
  capabilities: {
    bestFor: [
      "KPI recap",
      "growth trend",
      "category comparison",
      "market share",
      "campaign results",
      "report summary",
      "multi-chart dashboard",
      "sequenced data story",
    ],
    textDensity: "medium",
    recommendedDurationFrames: {
      min: 150,
      max: 360,
    },
    supportsMedia: false,
    supportsBaseLayer: false,
  },
  planner: {
    description:
      "Composable dashboard-style segment for KPI summaries, trends, comparisons, market share, and sequenced data-backed recap moments.",
    avoidCases: [
      "story-first emotional scenes without concrete numbers",
      "testimonial or quote scenes",
      "unstructured prose that has no metric, category, trend, or share data",
    ],
    narrationFit:
      "Fits concise narration that introduces one data point, then explains one or more supporting chart blocks.",
    mediaExpectations:
      "No external media is required; visual output is generated from dashboard blocks, chart data, theme colors, and optional timeline steps.",
    examples: [
      "Show one KPI, reveal a line trend, then finish with a split summary",
      "Compare campaign channels in a bar chart beside a KPI block",
      "Show category share with a donut chart plus one insight block",
    ],
  },
  implementationSchema: statsDashboardSpecSchema,
  segmentSchema: statsDashboardSegmentSchema,
  implementationJsonSchema: statsDashboardImplementationJsonSchema,
  segmentJsonSchema: createSegmentJsonSchema(
    STATS_DASHBOARD_TEMPLATE_ID,
    statsDashboardImplementationJsonSchema,
  ),
  getDuration: getStatsDashboardDuration,
  selectionGuidance:
    "Use stats-dashboard for data-heavy KPI recaps, growth trends, category comparisons, market share summaries, multi-chart dashboard layouts, and short sequenced data stories.",
  implementationPrompt: `When segment.templateId is "stats-dashboard", segment.implementation
must have:
  meta: { title, fps=30, width=1280, height=720 }
  theme: { background, panel, primary, secondary, text, muted }
  durationInFrames: integer > 0, usually 150-360 frames
  layout: "single" | "split" | "grid" | "hero-metric" | "timeline"
  kicker?: short report label
  title: concise dashboard title
  subtitle?: short setup sentence
  blocks: 1-8 dashboard blocks
  timeline?: optional sequence steps for staged reveal
  footerNote?: short source or timeframe note

Block types:
  kpi: { id, type:"kpi", title?, label, value, delta?, deltaDirection:"up"|"down"|"flat" }
  insight: { id, type:"insight", title?, text }
  bar-chart: { id, type:"bar-chart", title?, chart:{ categories, series, unit?, maxValue?, highlightIndex? } }
  line-chart: { id, type:"line-chart", title?, chart:{ categories, series, unit?, maxValue?, highlightIndex? } }
  donut-chart: { id, type:"donut-chart", title?, segments:[{label,value,color?}], centerLabel?, centerValue? }

Timeline steps:
  { from, durationInFrames, blockIds, layout? }
Use timeline only when the data story should reveal blocks over time. Every blockId must match a block.id.
For chart blocks, each series.values length should match categories length. Keep data realistic and compact.`,
  revisionPrompt: `Stats dashboard implementation schema:
- implementation.meta: { title, fps=30, width=1280, height=720 }
- implementation.theme: { background, panel, primary, secondary, text, muted }
- implementation.durationInFrames: integer frames at 30fps
- implementation.layout: "single" | "split" | "grid" | "hero-metric" | "timeline"
- implementation.kicker?: string
- implementation.title: string
- implementation.subtitle?: string
- implementation.blocks: kpi | insight | bar-chart | line-chart | donut-chart blocks
- implementation.timeline?: { from, durationInFrames, blockIds, layout? }[]
- implementation.footerNote?: string`,
  preservationPrompt:
    "for stats-dashboard segments, durationInFrames, layout, kicker, title, subtitle, blocks, timeline, footerNote, and theme must match the input exactly",
  buildRevisionPayload: (implementation) => ({
    meta: implementation.meta,
    theme: implementation.theme,
    durationInFrames: implementation.durationInFrames,
    layout: implementation.layout,
    kicker: implementation.kicker,
    title: implementation.title,
    subtitle: implementation.subtitle,
    blocks: implementation.blocks,
    timeline: implementation.timeline,
    footerNote: implementation.footerNote,
  }),
});
