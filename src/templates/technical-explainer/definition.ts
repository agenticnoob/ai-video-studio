import { defineTemplate } from "../definition";
import { TECHNICAL_EXPLAINER_TEMPLATE_ID } from "../ids";
import { createSegmentJsonSchema, metaJsonSchema, themeJsonSchema } from "../shared-json-schema";
import {
  getTechnicalExplainerDuration,
  technicalExplainerSegmentSchema,
  technicalExplainerSpecSchema,
  type TechnicalExplainerRecipeId,
} from "./schema";

const technicalExplainerPlannerRecipes = [
  {
    recipeId: "hero-title-reveal",
    label: "Hero title reveal",
    bestFor: ["opening thesis", "promise framing", "concept introduction"],
    avoidCases: ["dense process details", "raw logs", "metric recap"],
    requiredInputsSummary: "primary text, optional eyebrow, supporting text, and up to 3 callouts",
    durationFit: "Works well as a short opener or thesis beat.",
  },
  {
    recipeId: "terminal-build-run",
    label: "Terminal build/run",
    bestFor: ["CLI flow", "logs", "build/test/deploy command", "developer workflow proof"],
    avoidCases: ["non-technical emotion", "chart-only recap", "timeline milestones"],
    requiredInputsSummary: "command, 2-6 terminal lines, optional status label",
    durationFit: "Works best for a medium beat with enough time to read command output.",
  },
  {
    recipeId: "workflow-node-map",
    label: "Workflow node map",
    bestFor: ["architecture", "pipeline", "dependencies", "multi-step system flow"],
    avoidCases: ["single-card punchline", "raw command output", "numeric-only recap"],
    requiredInputsSummary: "3-6 labeled nodes, optional detail text, optional active node",
    durationFit: "Works well for medium explanations with staged activation.",
  },
  {
    recipeId: "metric-countup",
    label: "Metric count-up",
    bestFor: ["outcomes", "signals", "KPI recap", "before/after numbers"],
    avoidCases: ["step-by-step process", "long prose", "CLI logs"],
    requiredInputsSummary: "2-4 metric labels, values, and optional details",
    durationFit: "Works well for concise recap beats.",
  },
  {
    recipeId: "timeline-progress",
    label: "Timeline progress",
    bestFor: ["milestones", "phase rollout", "implementation checkpoints", "delivery path"],
    avoidCases: ["raw code output", "single opening title", "dashboard-heavy analysis"],
    requiredInputsSummary: "3-5 checkpoints and optional note",
    durationFit: "Works well as a closing or progress-oriented beat.",
  },
  {
    recipeId: "code-diff-highlight",
    label: "Code diff highlight",
    bestFor: ["code changes", "schema changes", "config diffs", "before/after implementation snippets"],
    avoidCases: ["non-technical narrative", "numeric KPI recap", "media-heavy UI demos"],
    requiredInputsSummary:
      "3-8 semantic diff lines with add/remove/neutral modes, optional file label and note",
    durationFit: "Works best for a medium beat where viewers can read a focused change.",
  },
  {
    recipeId: "before-after-compare",
    label: "Before/after compare",
    bestFor: ["old vs new workflow", "problem/solution contrast", "quality improvement", "migration recap"],
    avoidCases: ["raw command output", "single opening thesis", "dense dashboard analysis"],
    requiredInputsSummary:
      "before and after panels with labels, headlines, and 2-4 compact points each",
    durationFit: "Works well for a medium-to-closing beat with clear contrast.",
  },
  {
    recipeId: "decision-matrix",
    label: "Decision matrix",
    bestFor: ["technical tradeoffs", "provider choices", "roadmap prioritization", "framework selection"],
    avoidCases: ["raw logs", "single thesis opener", "linear workflow explanation"],
    requiredInputsSummary:
      "2-4 criteria and 2-4 options with low/medium/high ratings and optional recommendation",
    durationFit: "Works best for a medium explanation where viewers compare options quickly.",
  },
  {
    recipeId: "architecture-layer-stack",
    label: "Architecture layer stack",
    bestFor: ["module boundaries", "platform layers", "data ownership", "system architecture"],
    avoidCases: ["chronological process", "raw command output", "simple metric recap"],
    requiredInputsSummary:
      "3-6 architecture layers, optional data-flow labels, and optional emphasis",
    durationFit: "Works well for medium architecture beats with clear ownership boundaries.",
  },
] satisfies {
  recipeId: TechnicalExplainerRecipeId;
  label: string;
  bestFor: string[];
  avoidCases: string[];
  requiredInputsSummary: string;
  durationFit: string;
}[];

const sectionBaseJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string" },
    recipeId: { type: "string" },
    title: { type: "string" },
    subtitle: { type: "string" },
    durationInFrames: { type: "integer", minimum: 45, maximum: 420 },
  },
  required: ["id", "recipeId", "title"],
} as const;

const technicalExplainerSectionJsonSchema = {
  oneOf: [
    {
      ...sectionBaseJsonSchema,
      properties: {
        ...sectionBaseJsonSchema.properties,
        recipeId: { type: "string", const: "hero-title-reveal" },
        eyebrow: { type: "string" },
        primaryText: { type: "string" },
        secondaryText: { type: "string" },
        callouts: { type: "array", minItems: 1, maxItems: 3, items: { type: "string" } },
      },
      required: ["id", "recipeId", "title", "primaryText"],
    },
    {
      ...sectionBaseJsonSchema,
      properties: {
        ...sectionBaseJsonSchema.properties,
        recipeId: { type: "string", const: "terminal-build-run" },
        command: { type: "string" },
        lines: { type: "array", minItems: 2, maxItems: 6, items: { type: "string" } },
        statusLabel: { type: "string" },
      },
      required: ["id", "recipeId", "title", "command", "lines"],
    },
    {
      ...sectionBaseJsonSchema,
      properties: {
        ...sectionBaseJsonSchema.properties,
        recipeId: { type: "string", const: "workflow-node-map" },
        nodes: {
          type: "array",
          minItems: 3,
          maxItems: 6,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              detail: { type: "string" },
            },
            required: ["id", "label"],
          },
        },
        activeNodeId: { type: "string" },
      },
      required: ["id", "recipeId", "title", "nodes"],
    },
    {
      ...sectionBaseJsonSchema,
      properties: {
        ...sectionBaseJsonSchema.properties,
        recipeId: { type: "string", const: "metric-countup" },
        metrics: {
          type: "array",
          minItems: 2,
          maxItems: 4,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              label: { type: "string" },
              value: { type: "string" },
              detail: { type: "string" },
            },
            required: ["label", "value"],
          },
        },
      },
      required: ["id", "recipeId", "title", "metrics"],
    },
    {
      ...sectionBaseJsonSchema,
      properties: {
        ...sectionBaseJsonSchema.properties,
        recipeId: { type: "string", const: "timeline-progress" },
        checkpoints: { type: "array", minItems: 3, maxItems: 5, items: { type: "string" } },
        note: { type: "string" },
      },
      required: ["id", "recipeId", "title", "checkpoints"],
    },
    {
      ...sectionBaseJsonSchema,
      properties: {
        ...sectionBaseJsonSchema.properties,
        recipeId: { type: "string", const: "code-diff-highlight" },
        fileLabel: { type: "string" },
        beforeLabel: { type: "string" },
        afterLabel: { type: "string" },
        lines: {
          type: "array",
          minItems: 3,
          maxItems: 8,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              text: { type: "string" },
              mode: { type: "string", enum: ["add", "remove", "neutral"] },
              focus: { type: "boolean" },
            },
            required: ["text", "mode"],
          },
        },
        note: { type: "string" },
      },
      required: ["id", "recipeId", "title", "lines"],
    },
    {
      ...sectionBaseJsonSchema,
      properties: {
        ...sectionBaseJsonSchema.properties,
        recipeId: { type: "string", const: "before-after-compare" },
        before: {
          type: "object",
          additionalProperties: false,
          properties: {
            label: { type: "string" },
            headline: { type: "string" },
            points: { type: "array", minItems: 2, maxItems: 4, items: { type: "string" } },
          },
          required: ["label", "headline", "points"],
        },
        after: {
          type: "object",
          additionalProperties: false,
          properties: {
            label: { type: "string" },
            headline: { type: "string" },
            points: { type: "array", minItems: 2, maxItems: 4, items: { type: "string" } },
          },
          required: ["label", "headline", "points"],
        },
        emphasis: { type: "string" },
      },
      required: ["id", "recipeId", "title", "before", "after"],
    },
    {
      ...sectionBaseJsonSchema,
      properties: {
        ...sectionBaseJsonSchema.properties,
        recipeId: { type: "string", const: "decision-matrix" },
        criteria: { type: "array", minItems: 2, maxItems: 4, items: { type: "string" } },
        options: {
          type: "array",
          minItems: 2,
          maxItems: 4,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              label: { type: "string" },
              summary: { type: "string" },
              scores: {
                type: "array",
                minItems: 2,
                maxItems: 4,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    criterion: { type: "string" },
                    rating: { type: "string", enum: ["low", "medium", "high"] },
                    note: { type: "string" },
                  },
                  required: ["criterion", "rating"],
                },
              },
              recommended: { type: "boolean" },
            },
            required: ["label", "scores"],
          },
        },
        decision: { type: "string" },
      },
      required: ["id", "recipeId", "title", "criteria", "options"],
    },
    {
      ...sectionBaseJsonSchema,
      properties: {
        ...sectionBaseJsonSchema.properties,
        recipeId: { type: "string", const: "architecture-layer-stack" },
        layers: {
          type: "array",
          minItems: 3,
          maxItems: 6,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              label: { type: "string" },
              detail: { type: "string" },
              tone: { type: "string", enum: ["foundation", "runtime", "interface", "provider"] },
            },
            required: ["label"],
          },
        },
        dataFlow: { type: "array", minItems: 2, maxItems: 5, items: { type: "string" } },
        emphasis: { type: "string" },
      },
      required: ["id", "recipeId", "title", "layers"],
    },
  ],
} as const;

export const technicalExplainerImplementationJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    meta: metaJsonSchema,
    theme: themeJsonSchema,
    durationInFrames: { type: "integer", minimum: 120, maximum: 900 },
    title: { type: "string" },
    subtitle: { type: "string" },
    sections: {
      type: "array",
      minItems: 1,
      maxItems: 9,
      items: technicalExplainerSectionJsonSchema,
    },
  },
  required: ["meta", "theme", "durationInFrames", "title", "sections"],
} as const;

export const technicalExplainerTemplate = defineTemplate({
  id: TECHNICAL_EXPLAINER_TEMPLATE_ID,
  label: "Technical Explainer",
  capabilities: {
    bestFor: [
      "technical walkthrough",
      "software architecture explanation",
      "workflow explanation",
      "developer tool demo",
      "process recap",
      "launch update",
    ],
    textDensity: "medium",
    recommendedDurationFrames: { min: 180, max: 720 },
    supportsMedia: false,
    supportsBaseLayer: false,
  },
  planner: {
    description:
      "Recipe-rich technical explainer segment for product walkthroughs, software architecture, build/run flows, workflow maps, KPI summaries, and implementation timelines.",
    avoidCases: [
      "pure emotional storytelling without technical steps",
      "dense financial dashboards that need several chart types",
      "single punchline cards that fit spotlight",
    ],
    narrationFit:
      "Fits concise narration that introduces a technical idea and explains it through 1-9 visual recipe sections.",
    mediaExpectations:
      "No external media is required; visual output is generated from bounded text, terminal lines, workflow nodes, metrics, timeline checkpoints, semantic diffs, comparison panels, decision matrices, architecture layers, theme colors, and duration.",
    examples: [
      "Open with a title, show a workflow map, then finish with implementation checkpoints",
      "Explain a CLI build flow with terminal output and a metric recap",
      "Describe a product architecture using node map, architecture layers, and timeline progress",
      "Compare an old workflow with a new implementation using a before/after panel or decision matrix",
    ],
    recipes: technicalExplainerPlannerRecipes,
  },
  implementationSchema: technicalExplainerSpecSchema,
  segmentSchema: technicalExplainerSegmentSchema,
  implementationJsonSchema: technicalExplainerImplementationJsonSchema,
  segmentJsonSchema: createSegmentJsonSchema(
    TECHNICAL_EXPLAINER_TEMPLATE_ID,
    technicalExplainerImplementationJsonSchema,
  ),
  getDuration: getTechnicalExplainerDuration,
  selectionGuidance:
    "Use technical-explainer for multi-beat software, product, workflow, architecture, CLI, process, and implementation explanations that need recipe-rich motion rather than one card or one dashboard.",
  implementationPrompt: `When segment.templateId is "technical-explainer", segment.implementation
must have:
  meta: { title, fps=30, width=1280, height=720 }
  theme: { background, panel, primary, secondary, text, muted }
  durationInFrames: integer 120-900, normally the narration-driven target duration
  title: concise segment title
  subtitle?: one supporting sentence
  sections: 1-9 recipe sections

Allowed recipeId values:
  hero-title-reveal
  terminal-build-run
  workflow-node-map
  metric-countup
  timeline-progress
  code-diff-highlight
  before-after-compare
  decision-matrix
  architecture-layer-stack

Rules:
  - Use hero-title-reveal for an opening promise or thesis.
  - Use terminal-build-run for CLI, logs, commands, build/test/deploy flows.
  - Use workflow-node-map for architecture, pipelines, dependencies, or staged processes.
  - Use metric-countup for 2-4 compact outcomes or signals.
  - Use timeline-progress for milestones, phases, rollout steps, or implementation progress.
  - Use code-diff-highlight for code, config, schema, or implementation changes where semantic add/remove/neutral lines make the difference legible.
  - Use before-after-compare for old/new workflows, problem/solution contrast, migrations, and quality improvements.
  - Use decision-matrix for technical tradeoffs, provider choices, roadmap prioritization, and framework selection.
  - Use architecture-layer-stack for module boundaries, platform layers, data ownership, and system architecture.
  - For code-diff-highlight, generate 3-8 short lines with mode add/remove/neutral; use focus=true on at most 2 lines.
  - For before-after-compare, generate before and after panels with 2-4 short points each.
  - For decision-matrix, generate 2-4 criteria and 2-4 options; each option needs low/medium/high ratings for the listed criteria.
  - For architecture-layer-stack, generate 3-6 layers and optional dataFlow labels only when they clarify ownership.
  - Keep section text short enough to read while narration plays.
  - If a section has durationInFrames, keep it between 45 and 420.
  - Total sections should fit the segment duration; use fewer sections for shorter narration.`,
  revisionPrompt: `Technical explainer implementation schema:
- implementation.meta: { title, fps=30, width=1280, height=720 }
- implementation.theme: { background, panel, primary, secondary, text, muted }
- implementation.durationInFrames: integer frames at 30fps, 120-900
- implementation.title: string
- implementation.subtitle?: string
- implementation.sections: 1-9 sections with recipeId:
  hero-title-reveal: eyebrow?, primaryText, secondaryText?, callouts?
  terminal-build-run: command, lines[2-6], statusLabel?
  workflow-node-map: nodes[3-6] with id, label, detail?, activeNodeId?
  metric-countup: metrics[2-4] with label, value, detail?
  timeline-progress: checkpoints[3-5], note?
  code-diff-highlight: fileLabel?, beforeLabel?, afterLabel?, lines[3-8] with text, mode add|remove|neutral, focus?, note?
  before-after-compare: before { label, headline, points[2-4] }, after { label, headline, points[2-4] }, emphasis?
  decision-matrix: criteria[2-4], options[2-4] with label, summary?, scores[2-4] { criterion, rating low|medium|high, note? }, recommended?, decision?
  architecture-layer-stack: layers[3-6] with label, detail?, tone foundation|runtime|interface|provider?, dataFlow?[2-5], emphasis?`,
  preservationPrompt:
    "for technical-explainer segments, durationInFrames, title, subtitle, sections, and theme must match the input exactly",
  buildRevisionPayload: (implementation) => ({
    meta: implementation.meta,
    theme: implementation.theme,
    durationInFrames: implementation.durationInFrames,
    title: implementation.title,
    subtitle: implementation.subtitle,
    sections: implementation.sections,
  }),
});
