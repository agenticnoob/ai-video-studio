import type { CSSProperties, FC } from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";

import {
  CodeDiffBlock,
  MetricCardGrid,
  TerminalSessionBlock,
  TimelineProgressBlock,
  WorkflowMapBlock,
  type CodeDiffLine,
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

export const CodeDiffHighlightScene: FC<
  TechnicalExplainerSceneProps<
    Extract<TechnicalExplainerSection, { recipeId: "code-diff-highlight" }>
  >
> = ({ section, theme }) => {
  const lines: CodeDiffLine[] = section.lines.map((line) => ({
    focus: line.focus,
    mode: line.mode,
    text:
      line.mode === "add"
        ? `+ ${line.text}`
        : line.mode === "remove"
          ? `- ${line.text}`
          : `  ${line.text}`,
  }));

  return (
    <div style={panelStyle(theme)}>
      <div style={{ display: "flex", gap: 42, marginTop: 44 }}>
        <div style={{ flex: 1, paddingTop: 42 }}>
          <div style={{ color: theme.primary, fontSize: 20, fontWeight: 900, marginBottom: 18 }}>
            {section.beforeLabel ?? "Change"}
          </div>
          <div style={{ color: theme.secondary, fontSize: 16, fontWeight: 850, marginBottom: 12 }}>
            {section.afterLabel ?? "After"}
          </div>
          <div style={{ fontSize: 46, fontWeight: 930, lineHeight: 1.05 }}>{section.title}</div>
          {section.subtitle ? (
            <div
              style={{
                color: theme.muted,
                fontSize: 22,
                fontWeight: 760,
                lineHeight: 1.35,
                marginTop: 24,
              }}
            >
              {section.subtitle}
            </div>
          ) : null}
          {section.note ? (
            <div
              style={{
                borderLeft: `4px solid ${theme.secondary}`,
                color: theme.muted,
                fontSize: 19,
                lineHeight: 1.35,
                marginTop: 28,
                paddingLeft: 16,
              }}
            >
              {section.note}
            </div>
          ) : null}
        </div>
        <CodeDiffBlock
          accentColor={theme.primary}
          addColor="#22c55e"
          fileLabel={section.fileLabel}
          lines={lines}
          mutedColor={theme.muted}
          neutralColor={theme.muted}
          removeColor="#fb7185"
        />
      </div>
    </div>
  );
};

const ComparePanel: FC<{
  accentColor: string;
  label: string;
  headline: string;
  points: string[];
  mutedColor: string;
  panelColor: string;
  textColor: string;
}> = ({ accentColor, headline, label, mutedColor, panelColor, points, textColor }) => (
  <div
    style={{
      background: panelColor,
      border: `1px solid ${accentColor}66`,
      borderRadius: 22,
      boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
      flex: 1,
      minHeight: 360,
      padding: "34px 36px",
    }}
  >
    <div style={{ color: accentColor, fontSize: 18, fontWeight: 900, marginBottom: 22 }}>
      {label}
    </div>
    <div style={{ color: textColor, fontSize: 38, fontWeight: 920, lineHeight: 1.04 }}>
      {headline}
    </div>
    <div style={{ display: "grid", gap: 14, marginTop: 32 }}>
      {points.map((point) => (
        <div
          key={point}
          style={{
            color: mutedColor,
            fontSize: 20,
            fontWeight: 760,
            lineHeight: 1.28,
          }}
        >
          {point}
        </div>
      ))}
    </div>
  </div>
);

export const BeforeAfterCompareScene: FC<
  TechnicalExplainerSceneProps<
    Extract<TechnicalExplainerSection, { recipeId: "before-after-compare" }>
  >
> = ({ section, theme }) => {
  const frame = useCurrentFrame();
  const afterIn = interpolate(frame, [36, 96], [0, 1], clamp);

  return (
    <div style={panelStyle(theme)}>
      <div style={{ fontSize: 44, fontWeight: 930, lineHeight: 1.04, marginTop: 24 }}>
        {section.title}
      </div>
      {section.subtitle ? (
        <div
          style={{ color: theme.muted, fontSize: 23, lineHeight: 1.32, marginTop: 16, width: 760 }}
        >
          {section.subtitle}
        </div>
      ) : null}
      <div style={{ display: "flex", gap: 26, marginTop: 40 }}>
        <ComparePanel
          accentColor="#fb7185"
          headline={section.before.headline}
          label={section.before.label}
          mutedColor={theme.muted}
          panelColor={theme.panel}
          points={section.before.points}
          textColor={theme.text}
        />
        <div
          style={{
            flex: 1,
            opacity: afterIn,
            transform: `translateX(${interpolate(afterIn, [0, 1], [34, 0], clamp)}px)`,
          }}
        >
          <ComparePanel
            accentColor={theme.primary}
            headline={section.after.headline}
            label={section.after.label}
            mutedColor={theme.muted}
            panelColor={theme.panel}
            points={section.after.points}
            textColor={theme.text}
          />
        </div>
      </div>
      {section.emphasis ? (
        <div
          style={{
            border: `1px solid ${theme.secondary}66`,
            borderRadius: 999,
            color: theme.secondary,
            display: "inline-flex",
            fontSize: 18,
            fontWeight: 900,
            marginTop: 28,
            padding: "11px 18px",
          }}
        >
          {section.emphasis}
        </div>
      ) : null}
    </div>
  );
};

const ratingColor = (rating: "low" | "medium" | "high", theme: TechnicalExplainerSpec["theme"]) => {
  if (rating === "high") {
    return "#22c55e";
  }
  if (rating === "medium") {
    return theme.secondary;
  }
  return "#fb7185";
};

export const DecisionMatrixScene: FC<
  TechnicalExplainerSceneProps<Extract<TechnicalExplainerSection, { recipeId: "decision-matrix" }>>
> = ({ section, theme }) => {
  const frame = useCurrentFrame();
  const tableIn = interpolate(frame, [24, 76], [0, 1], clamp);

  return (
    <div style={panelStyle(theme)}>
      <div style={{ fontSize: 44, fontWeight: 930, lineHeight: 1.04, marginTop: 16 }}>
        {section.title}
      </div>
      {section.subtitle ? (
        <div
          style={{ color: theme.muted, fontSize: 22, lineHeight: 1.32, marginTop: 14, width: 820 }}
        >
          {section.subtitle}
        </div>
      ) : null}
      <div
        style={{
          background: theme.panel,
          border: `1px solid ${theme.primary}55`,
          borderRadius: 22,
          marginTop: 34,
          opacity: tableIn,
          overflow: "hidden",
          transform: `translateY(${interpolate(tableIn, [0, 1], [28, 0], clamp)}px)`,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `220px repeat(${section.criteria.length}, 1fr)`,
          }}
        >
          <div style={{ color: theme.muted, fontSize: 16, fontWeight: 900, padding: "18px 20px" }}>
            Option
          </div>
          {section.criteria.map((criterion) => (
            <div
              key={criterion}
              style={{ color: theme.muted, fontSize: 16, fontWeight: 900, padding: "18px 16px" }}
            >
              {criterion}
            </div>
          ))}
          {section.options.map((option) => (
            <div
              key={option.label}
              style={{
                display: "contents",
              }}
            >
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.10)",
                  color: option.recommended ? theme.primary : theme.text,
                  fontSize: 20,
                  fontWeight: 900,
                  padding: "18px 20px",
                }}
              >
                {option.label}
                {option.summary ? (
                  <div style={{ color: theme.muted, fontSize: 14, fontWeight: 700, marginTop: 6 }}>
                    {option.summary}
                  </div>
                ) : null}
              </div>
              {section.criteria.map((criterion) => {
                const score =
                  option.scores.find((candidate) => candidate.criterion === criterion) ??
                  option.scores[0]!;

                return (
                  <div
                    key={`${option.label}-${criterion}`}
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.10)",
                      color: ratingColor(score.rating, theme),
                      fontSize: 18,
                      fontWeight: 850,
                      padding: "18px 16px",
                    }}
                  >
                    {score.rating.toUpperCase()}
                    {score.note ? (
                      <div
                        style={{ color: theme.muted, fontSize: 13, fontWeight: 700, marginTop: 5 }}
                      >
                        {score.note}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {section.decision ? (
        <div style={{ color: theme.secondary, fontSize: 20, fontWeight: 900, marginTop: 24 }}>
          {section.decision}
        </div>
      ) : null}
    </div>
  );
};

const layerToneColor = (
  tone: "foundation" | "runtime" | "interface" | "provider" | undefined,
  theme: TechnicalExplainerSpec["theme"],
) => {
  if (tone === "foundation") {
    return "#64748b";
  }
  if (tone === "runtime") {
    return theme.primary;
  }
  if (tone === "interface") {
    return theme.secondary;
  }
  if (tone === "provider") {
    return "#22c55e";
  }
  return theme.primary;
};

export const ArchitectureLayerStackScene: FC<
  TechnicalExplainerSceneProps<
    Extract<TechnicalExplainerSection, { recipeId: "architecture-layer-stack" }>
  >
> = ({ section, theme }) => {
  const frame = useCurrentFrame();
  const stackIn = interpolate(frame, [20, 78], [0, 1], clamp);

  return (
    <div style={panelStyle(theme)}>
      <div style={{ display: "flex", gap: 48, marginTop: 24 }}>
        <div style={{ flex: 1, paddingTop: 34 }}>
          <div style={{ fontSize: 44, fontWeight: 930, lineHeight: 1.04 }}>{section.title}</div>
          {section.subtitle ? (
            <div style={{ color: theme.muted, fontSize: 22, lineHeight: 1.32, marginTop: 18 }}>
              {section.subtitle}
            </div>
          ) : null}
          {section.dataFlow?.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 30 }}>
              {section.dataFlow.map((step) => (
                <div
                  key={step}
                  style={{
                    border: `1px solid ${theme.primary}55`,
                    borderRadius: 999,
                    color: theme.primary,
                    fontSize: 15,
                    fontWeight: 850,
                    padding: "8px 12px",
                  }}
                >
                  {step}
                </div>
              ))}
            </div>
          ) : null}
          {section.emphasis ? (
            <div style={{ color: theme.secondary, fontSize: 20, fontWeight: 900, marginTop: 26 }}>
              {section.emphasis}
            </div>
          ) : null}
        </div>
        <div style={{ flex: 1, opacity: stackIn }}>
          {section.layers.map((layer, index) => {
            const layerIn = interpolate(frame, [34 + index * 16, 78 + index * 16], [0, 1], clamp);
            const color = layerToneColor(layer.tone, theme);

            return (
              <div
                key={layer.label}
                style={{
                  background: theme.panel,
                  border: `1px solid ${color}66`,
                  borderRadius: 20,
                  boxShadow: "0 22px 70px rgba(0,0,0,0.24)",
                  marginBottom: 14,
                  opacity: layerIn,
                  padding: "18px 22px",
                  transform: `translateX(${interpolate(layerIn, [0, 1], [32, 0], clamp)}px)`,
                }}
              >
                <div style={{ color, fontSize: 18, fontWeight: 900 }}>{layer.label}</div>
                {layer.detail ? (
                  <div style={{ color: theme.muted, fontSize: 16, lineHeight: 1.32, marginTop: 6 }}>
                    {layer.detail}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const resolveProductUiZoomAssetSrc = (
  asset: Extract<TechnicalExplainerSection, { recipeId: "product-ui-zoom" }>["asset"],
): string | null => {
  if (!asset?.src) {
    return null;
  }

  if (asset.sourceType === "public") {
    return staticFile(asset.src.replace(/^\/+/, ""));
  }

  return asset.src;
};

export const ProductUiZoomScene: FC<
  TechnicalExplainerSceneProps<Extract<TechnicalExplainerSection, { recipeId: "product-ui-zoom" }>>
> = ({ durationInFrames, section, theme }) => {
  const frame = useCurrentFrame();
  const assetSrc = resolveProductUiZoomAssetSrc(section.asset);
  const timing = getRecipeBeatTiming({ durationInFrames });
  const reveal = interpolate(frame, [0, timing.revealEndFrame], [0, 1], clamp);
  const focus = interpolate(frame, [timing.revealEndFrame, timing.holdEndFrame], [0, 1], clamp);
  const focalPoint = section.focalPoint ?? { xPercent: 50, yPercent: 50, zoomPercent: 126 };
  const zoomScale = interpolate(focus, [0, 1], [1, focalPoint.zoomPercent / 100], clamp);
  const translateX = (50 - focalPoint.xPercent) * 3.2 * focus;
  const translateY = (50 - focalPoint.yPercent) * 1.8 * focus;

  return (
    <div style={panelStyle(theme)}>
      <div style={{ display: "grid", gap: 38, gridTemplateColumns: "430px 1fr", height: "100%" }}>
        <div style={{ paddingTop: 38 }}>
          <div style={{ color: theme.primary, fontSize: 18, fontWeight: 900, marginBottom: 18 }}>
            {section.asset?.frameLabel ?? "Product surface"}
          </div>
          <div style={{ fontSize: 48, fontWeight: 930, lineHeight: 1.04 }}>{section.title}</div>
          {section.subtitle ? (
            <div style={{ color: theme.muted, fontSize: 22, lineHeight: 1.32, marginTop: 20 }}>
              {section.subtitle}
            </div>
          ) : null}
          <div
            style={{
              borderLeft: `4px solid ${theme.secondary}`,
              color: theme.muted,
              fontSize: 19,
              lineHeight: 1.35,
              marginTop: 30,
              paddingLeft: 16,
            }}
          >
            {section.fallbackSummary}
          </div>
          {section.callouts?.length ? (
            <div style={{ display: "grid", gap: 10, marginTop: 28 }}>
              {section.callouts.map((callout) => (
                <div
                  key={callout}
                  style={{
                    background: theme.panel,
                    border: `1px solid ${theme.primary}55`,
                    borderRadius: 999,
                    color: theme.text,
                    fontSize: 17,
                    fontWeight: 850,
                    padding: "10px 14px",
                  }}
                >
                  {callout}
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div
          style={{
            alignSelf: "center",
            background: assetSrc ? "#020617" : theme.panel,
            border: `1px solid ${theme.primary}66`,
            borderRadius: 28,
            boxShadow: "0 30px 90px rgba(0,0,0,0.36)",
            height: 470,
            opacity: reveal,
            overflow: "hidden",
            position: "relative",
            transform: `translateY(${(1 - reveal) * 28}px)`,
          }}
        >
          {assetSrc ? (
            <Img
              alt={section.asset?.alt}
              src={assetSrc}
              style={{
                height: "100%",
                objectFit: "cover",
                transform: `translate(${translateX}px, ${translateY}px) scale(${zoomScale})`,
                transformOrigin: `${focalPoint.xPercent}% ${focalPoint.yPercent}%`,
                width: "100%",
              }}
            />
          ) : (
            <div
              style={{
                alignItems: "center",
                color: theme.text,
                display: "flex",
                fontSize: 28,
                fontWeight: 900,
                height: "100%",
                justifyContent: "center",
                lineHeight: 1.2,
                padding: 48,
                textAlign: "center",
              }}
            >
              {section.fallbackSummary}
            </div>
          )}
          {section.focalPoint?.label ? (
            <div
              style={{
                background: theme.secondary,
                borderRadius: 999,
                bottom: 24,
                color: "#111827",
                fontSize: 16,
                fontWeight: 900,
                left: 24,
                padding: "10px 14px",
                position: "absolute",
              }}
            >
              {section.focalPoint.label}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
