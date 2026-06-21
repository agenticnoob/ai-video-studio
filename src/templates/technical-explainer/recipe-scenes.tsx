import type { CSSProperties, FC } from "react";
import { interpolate, useCurrentFrame } from "remotion";

import {
  MetricCardGrid,
  TerminalSessionBlock,
  TimelineProgressBlock,
  WorkflowMapBlock,
  type MetricCardDatum,
  type TerminalSessionLine,
  type WorkflowMapNode,
} from "../../remotion/recipes/blocks";
import {
  DEFAULT_RECIPE_CAPTION_SAFE_AREA,
  getRecipeBeatTiming,
} from "../../remotion/recipes/timing";
import type { TechnicalExplainerSection, TechnicalExplainerSpec } from "./schema";

type TechnicalExplainerSceneProps<TSection extends TechnicalExplainerSection> = {
  durationInFrames: number;
  section: TSection;
  theme: TechnicalExplainerSpec["theme"];
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const panelStyle = (theme: TechnicalExplainerSpec["theme"]): CSSProperties => ({
  background: `linear-gradient(135deg, ${theme.background}, ${theme.panel})`,
  boxSizing: "border-box",
  color: theme.text,
  height: "100%",
  overflow: "hidden",
  padding: "72px 82px",
  width: "100%",
});

export const HeroTitleRevealScene: FC<
  TechnicalExplainerSceneProps<
    Extract<TechnicalExplainerSection, { recipeId: "hero-title-reveal" }>
  >
> = ({ durationInFrames, section, theme }) => {
  const frame = useCurrentFrame();
  const timing = getRecipeBeatTiming({ durationInFrames });
  const titleIn = interpolate(frame, [0, timing.revealEndFrame], [0, 1], clamp);
  const calloutIn = interpolate(frame, [timing.revealEndFrame, timing.holdEndFrame], [0, 1], clamp);

  return (
    <div style={panelStyle(theme)}>
      <div style={{ color: theme.primary, fontSize: 26, fontWeight: 800 }}>
        {section.eyebrow ?? section.title}
      </div>
      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          lineHeight: 0.98,
          marginTop: 36,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 28}px)`,
          width: 900,
        }}
      >
        {section.primaryText}
      </div>
      {section.secondaryText ? (
        <div
          style={{
            color: theme.muted,
            fontSize: 31,
            lineHeight: 1.25,
            marginTop: 30,
            width: 760,
          }}
        >
          {section.secondaryText}
        </div>
      ) : null}
      {section.callouts?.length ? (
        <div style={{ display: "flex", gap: 14, marginTop: 46, opacity: calloutIn }}>
          {section.callouts.map((callout) => (
            <div
              key={callout}
              style={{
                background: theme.panel,
                border: `1px solid ${theme.primary}66`,
                borderRadius: 18,
                color: theme.text,
                fontSize: 22,
                fontWeight: 800,
                padding: "14px 18px",
              }}
            >
              {callout}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const TerminalBuildRunScene: FC<
  TechnicalExplainerSceneProps<
    Extract<TechnicalExplainerSection, { recipeId: "terminal-build-run" }>
  >
> = ({ section, theme }) => {
  const lines: TerminalSessionLine[] = [
    {
      status: "running",
      text: `$ ${section.command}`,
      tint: theme.primary,
    },
    ...section.lines.map((line, index) => ({
      status: index === section.lines.length - 1 ? ("success" as const) : ("info" as const),
      text: line,
      tint: index === section.lines.length - 1 ? "#22c55e" : theme.text,
    })),
  ];

  return (
    <div style={panelStyle(theme)}>
      <TerminalSessionBlock
        accentColor={theme.primary}
        badgeLabel={section.statusLabel ?? "complete"}
        dotColors={["#fb7185", "#f59e0b", "#22c55e"]}
        lines={lines}
        mutedColor={theme.muted}
        style={{ marginTop: 42, width: 980 }}
        title={section.title}
      />
    </div>
  );
};

export const WorkflowNodeMapScene: FC<
  TechnicalExplainerSceneProps<
    Extract<TechnicalExplainerSection, { recipeId: "workflow-node-map" }>
  >
> = ({ section, theme }) => {
  const positions = [
    { x: 120, y: 120 },
    { x: 350, y: 220 },
    { x: 580, y: 120 },
    { x: 810, y: 220 },
    { x: 990, y: 120 },
    { x: 990, y: 300 },
  ];
  const nodes: WorkflowMapNode[] = section.nodes.map((node, index) => ({
    id: node.id,
    label: node.label,
    tint: node.id === section.activeNodeId ? theme.secondary : theme.primary,
    x: positions[index]?.x ?? 120 + index * 170,
    y: positions[index]?.y ?? 180,
  }));

  return (
    <div style={panelStyle(theme)}>
      <WorkflowMapBlock
        nodes={nodes}
        panelColor={theme.panel}
        style={{ marginTop: 52 }}
        textColor={theme.text}
      />
    </div>
  );
};

export const MetricCountupScene: FC<
  TechnicalExplainerSceneProps<Extract<TechnicalExplainerSection, { recipeId: "metric-countup" }>>
> = ({ section, theme }) => {
  const parseMetric = (value: string) => {
    const numericValue = Number(value.replace(/[^0-9.-]/g, ""));
    const suffix = value.replace(/[0-9.,\s+-]/g, "");

    return {
      suffix: suffix || undefined,
      value: Number.isFinite(numericValue) ? numericValue : 0,
    };
  };

  const metrics: MetricCardDatum[] = section.metrics.map((metric) => ({
    label: metric.label,
    tint: theme.primary,
    ...parseMetric(metric.value),
  }));

  return (
    <div style={panelStyle(theme)}>
      <MetricCardGrid
        metrics={metrics}
        mutedColor={theme.muted}
        panelColor={theme.panel}
        style={{ marginTop: 86 }}
        textColor={theme.text}
      />
    </div>
  );
};

export const TimelineProgressScene: FC<
  TechnicalExplainerSceneProps<
    Extract<TechnicalExplainerSection, { recipeId: "timeline-progress" }>
  >
> = ({ durationInFrames, section, theme }) => (
  <div style={panelStyle(theme)}>
    <TimelineProgressBlock
      accentGradient={`linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`}
      activeColor={theme.primary}
      captionSafeArea={DEFAULT_RECIPE_CAPTION_SAFE_AREA}
      checkpointLabels={section.checkpoints}
      durationInFrames={durationInFrames}
      mutedColor={theme.muted}
      note={section.note}
      noteBorderColor={theme.primary}
      notePanelColor={theme.panel}
      textColor={theme.text}
    />
  </div>
);
