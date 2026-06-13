import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";

import { CJK_SANS_FONT_STACK } from "../../remotion/font-stack";
import {
  BarChart,
  DonutChart,
  Kicker,
  LineChart,
  useEntranceProgress,
  VideoPanel,
} from "../../remotion/primitives";
import type { RuntimeTemplateEditorProps } from "../editor-types";
import { defineRuntimeTemplate } from "../runtime-definition";
import { StatsDashboardEditor } from "./editor";
import type {
  StatsDashboardBlock,
  StatsDashboardLayout,
  StatsDashboardSegment,
  StatsDashboardSpec,
  StatsDashboardTimelineStep,
} from "./schema";

const chartPalette = ["#38bdf8", "#f59e0b", "#22c55e", "#e879f9", "#fb7185", "#a78bfa"];

const chartContainerStyle: CSSProperties = {
  backgroundColor: "rgba(15, 23, 42, 0.32)",
  border: "1px solid rgba(248,250,252,0.12)",
  boxShadow: "none",
};

const compactChartSize = {
  height: 124,
  padding: 24,
  width: 500,
};

const shouldUseCompactText = (spec: StatsDashboardSpec, timelineSteps: StatsDashboardTimelineStep[]) => {
  const maxVisibleBlocks = Math.max(
    ...timelineSteps.map((step) => step.blockIds.length),
    spec.blocks.length,
  );

  return spec.layout === "grid" || spec.layout === "timeline" || maxVisibleBlocks > 2;
};

const getChartData = (
  block: Extract<StatsDashboardBlock, { type: "bar-chart" | "line-chart" }>,
) => {
  const series = block.chart.series[0];

  return block.chart.categories.map((category, index) => ({
    label: category,
    value: Math.max(series?.values[index] ?? 0, 0),
  }));
};

const getDeltaColor = (
  direction: Extract<StatsDashboardBlock, { type: "kpi" }>["deltaDirection"],
  theme: StatsDashboardSpec["theme"],
) => {
  if (direction === "down") {
    return "#fb7185";
  }
  if (direction === "up") {
    return "#22c55e";
  }
  return theme.muted;
};

const blockFrameStyle = (theme: StatsDashboardSpec["theme"], emphasis = false): CSSProperties => ({
  background: emphasis ? `${theme.primary}18` : "rgba(15, 23, 42, 0.36)",
  border: `1px solid ${theme.text}1f`,
  borderRadius: 20,
  boxSizing: "border-box",
  color: theme.text,
  height: "100%",
  overflow: "hidden",
  padding: emphasis ? 16 : 14,
  position: "relative",
  width: "100%",
});

const BlockTitle: FC<{
  children?: string;
  compact?: boolean;
  theme: StatsDashboardSpec["theme"];
}> = ({ children, compact = false, theme }) =>
  children ? (
    <div
      style={{
        color: theme.muted,
        fontSize: compact ? 12 : 15,
        fontWeight: 800,
        letterSpacing: 0,
        marginBottom: compact ? 5 : 8,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  ) : null;

const DashboardBlockRenderer: FC<{
  block: StatsDashboardBlock;
  compact?: boolean;
  theme: StatsDashboardSpec["theme"];
}> = ({ block, compact = false, theme }) => {
  if (block.type === "kpi") {
    return (
      <div style={blockFrameStyle(theme, true)}>
        <BlockTitle compact={compact} theme={theme}>
          {block.title}
        </BlockTitle>
        <div
          style={{
            color: theme.text,
            fontSize: compact ? 34 : 72,
            fontWeight: 950,
            lineHeight: 1,
          }}
        >
          {block.value}
        </div>
        <div
          style={{
            color: theme.muted,
            fontSize: compact ? 14 : 23,
            fontWeight: 800,
            marginTop: compact ? 9 : 13,
          }}
        >
          {block.label}
        </div>
        {block.delta ? (
          <div
            style={{
              color: getDeltaColor(block.deltaDirection, theme),
              fontSize: compact ? 13 : 22,
              fontWeight: 900,
              marginTop: compact ? 6 : 13,
            }}
          >
            {block.delta}
          </div>
        ) : null}
      </div>
    );
  }

  if (block.type === "insight") {
    return (
      <div style={blockFrameStyle(theme)}>
        <BlockTitle compact={compact} theme={theme}>
          {block.title ?? "Insight"}
        </BlockTitle>
        <div
          style={{
            color: theme.text,
            fontSize: compact ? 18 : 31,
            fontWeight: 850,
            lineHeight: 1.24,
          }}
        >
          {block.text}
        </div>
      </div>
    );
  }

  if (block.type === "line-chart") {
    const series = block.chart.series[0];

    return (
      <div style={blockFrameStyle(theme)}>
        {!compact ? (
          <BlockTitle theme={theme}>{block.title ?? series?.name ?? "Trend"}</BlockTitle>
        ) : null}
        <LineChart
          background="transparent"
          containerStyle={chartContainerStyle}
          data={getChartData(block)}
          gridColor={`${theme.text}1f`}
          height={compact ? compactChartSize.height : 300}
          lineColor={series?.color ?? theme.primary}
          padding={compact ? compactChartSize.padding : 54}
          pointColor={theme.secondary}
          title={compact ? "" : (block.title ?? series?.name ?? "Trend")}
          width={compact ? compactChartSize.width : 650}
          yMax={block.chart.maxValue}
        />
      </div>
    );
  }

  if (block.type === "donut-chart") {
    return (
      <div style={blockFrameStyle(theme)}>
        {!compact ? <BlockTitle theme={theme}>{block.title ?? "Share"}</BlockTitle> : null}
        <DonutChart
          background="transparent"
          centerLabel={block.centerLabel}
          centerValue={block.centerValue}
          containerStyle={chartContainerStyle}
          height={compact ? compactChartSize.height : 300}
          radius={compact ? 40 : 86}
          segments={block.segments.map((segment, index) => ({
            ...segment,
            color: segment.color ?? chartPalette[index % chartPalette.length],
          }))}
          showLegend={!compact}
          strokeWidth={compact ? 10 : 18}
          title={compact ? "" : (block.title ?? "Share")}
          width={compact ? compactChartSize.width : 650}
        />
      </div>
    );
  }

  const series = block.chart.series[0];

  return (
      <div style={blockFrameStyle(theme)}>
        {!compact ? (
          <BlockTitle theme={theme}>{block.title ?? series?.name ?? "Comparison"}</BlockTitle>
      ) : null}
      <BarChart
        background="transparent"
        colors={chartPalette}
        containerStyle={chartContainerStyle}
        data={getChartData(block)}
        height={compact ? compactChartSize.height : 300}
        padding={compact ? compactChartSize.padding : 54}
        subtitle={compact ? "" : block.chart.unit}
        title={compact ? "" : (block.title ?? series?.name ?? "Comparison")}
        width={compact ? compactChartSize.width : 650}
        yMax={block.chart.maxValue}
      />
    </div>
  );
};

const DashboardLayout: FC<{
  blocks: StatsDashboardBlock[];
  children: ReactNode[];
  layout: Exclude<StatsDashboardLayout, "timeline">;
}> = ({ blocks, children, layout }) => {
  const firstBlock = blocks[0];
  const hasHeroMetric = layout === "hero-metric" && firstBlock?.type === "kpi";
  const gridRows = Math.ceil(children.length / 2);

  if (layout === "single" || children.length === 1) {
    return <div style={{ height: "100%", width: "100%" }}>{children[0]}</div>;
  }

  if (layout === "split" || hasHeroMetric) {
    return (
      <div
        style={{
          display: "grid",
          gap: 22,
          gridTemplateColumns: hasHeroMetric ? "0.78fr 1.22fr" : "1fr 1fr",
          height: "100%",
          width: "100%",
        }}
      >
        <div>{children[0]}</div>
        <div
          style={{
            display: "grid",
            gap: 18,
            gridTemplateRows:
              children.length > 2 ? `repeat(${children.length - 1}, minmax(0, 1fr))` : "1fr",
            minHeight: 0,
          }}
        >
          {children.slice(1)}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 18,
        gridTemplateColumns:
          children.length <= 2 ? "repeat(2, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))",
        gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
        height: "100%",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
};

const renderBlockSet = ({
  blocks,
  layout,
  theme,
}: {
  blocks: StatsDashboardBlock[];
  layout: Exclude<StatsDashboardLayout, "timeline">;
  theme: StatsDashboardSpec["theme"];
}) => {
  const compact = blocks.length > 1;

  return (
    <DashboardLayout blocks={blocks} layout={layout}>
      {blocks.map((block) => (
        <DashboardBlockRenderer block={block} compact={compact} key={block.id} theme={theme} />
      ))}
    </DashboardLayout>
  );
};

const getTimelineSteps = (spec: StatsDashboardSpec): StatsDashboardTimelineStep[] => {
  if (spec.timeline?.length) {
    return spec.timeline;
  }

  return [
    {
      from: 0,
      durationInFrames: spec.durationInFrames,
      blockIds: spec.blocks.map((block) => block.id),
      layout: spec.layout === "timeline" ? "hero-metric" : spec.layout,
    },
  ];
};

const StatsDashboardVideo: FC<StatsDashboardSpec> = (spec) => {
  const frame = useCurrentFrame();
  const entrance = useEntranceProgress(36, 170);
  const sweep = interpolate(frame, [0, spec.durationInFrames], [-16, 116], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blocksById = new Map(spec.blocks.map((block) => [block.id, block]));
  const timelineSteps = getTimelineSteps(spec);
  const compactText = shouldUseCompactText(spec, timelineSteps);
  const showSubtitle = Boolean(spec.subtitle) && !compactText;
  const showFooter = Boolean(spec.footerNote) && !compactText;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${spec.theme.background} 0%, #020617 55%, ${spec.theme.primary}24 100%)`,
        color: spec.theme.text,
        fontFamily: CJK_SANS_FONT_STACK,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: `linear-gradient(105deg, transparent ${sweep - 14}%, ${spec.theme.secondary}1f ${sweep}%, transparent ${sweep + 14}%)`,
          inset: 0,
          position: "absolute",
        }}
      />
      <VideoPanel
        entrance={entrance}
        maxWidth="none"
        padding={compactText ? 34 : 44}
        style={{
          bottom: compactText ? 48 : 58,
          boxShadow: `0 36px 120px ${spec.theme.background}88`,
          display: "flex",
          flexDirection: "column",
          gap: compactText ? 18 : 28,
          left: 64,
          position: "absolute",
          right: 64,
          top: compactText ? 48 : 58,
          transform: `translateY(${(1 - entrance) * 38}px) scale(${0.97 + entrance * 0.03})`,
          width: "auto",
        }}
        theme={spec.theme}
      >
        <div>
          {spec.kicker ? (
            <Kicker
              style={{
                fontSize: compactText ? 13 : 18,
                letterSpacing: compactText ? 1.8 : 2.6,
                marginBottom: compactText ? 8 : 12,
              }}
              theme={spec.theme}
            >
              {spec.kicker}
            </Kicker>
          ) : null}
          <div
            style={{
              alignItems: "end",
              display: "grid",
              gap: compactText ? 16 : 24,
              gridTemplateColumns: showSubtitle ? "0.95fr 1.05fr" : "1fr",
            }}
          >
            <h1
              style={{
                color: spec.theme.text,
                fontSize: compactText ? 34 : 44,
                fontWeight: 950,
                lineHeight: 1.02,
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {spec.title}
            </h1>
            {showSubtitle ? (
              <p
                style={{
                  color: spec.theme.muted,
                  fontSize: 19,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  margin: 0,
                }}
              >
                {spec.subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          {timelineSteps.map((step, index) => {
            const stepBlocks = step.blockIds
              .map((blockId) => blocksById.get(blockId))
              .filter((block): block is StatsDashboardBlock => Boolean(block));

            if (!stepBlocks.length) {
              return null;
            }

            return (
              <Sequence
                durationInFrames={step.durationInFrames}
                from={step.from}
                key={step.id ?? `timeline-${index}`}
                layout="none"
              >
                <div style={{ bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }}>
                  {renderBlockSet({
                    blocks: stepBlocks,
                    layout:
                      step.layout ?? (spec.layout === "timeline" ? "hero-metric" : spec.layout),
                    theme: spec.theme,
                  })}
                </div>
              </Sequence>
            );
          })}
        </div>

        {showFooter ? (
          <div
            style={{
              borderTop: `1px solid ${spec.theme.text}22`,
              color: spec.theme.muted,
              fontSize: 15,
              fontWeight: 750,
              paddingTop: 12,
            }}
          >
            {spec.footerNote}
          </div>
        ) : null}
      </VideoPanel>
    </AbsoluteFill>
  );
};

const StatsDashboardRuntimeEditor: FC<RuntimeTemplateEditorProps> = (props) => (
  <StatsDashboardEditor
    inputClassName={props.inputClassName}
    parsePositiveInteger={props.parsePositiveInteger}
    segment={props.segment as StatsDashboardSegment}
    onSegmentChange={props.onSegmentChange as (segment: StatsDashboardSegment) => void}
  />
);

export const statsDashboardRuntimeTemplate = defineRuntimeTemplate({
  renderSegment: (segment) => (
    <StatsDashboardVideo {...(segment.implementation as StatsDashboardSpec)} />
  ),
  Editor: StatsDashboardRuntimeEditor,
});
