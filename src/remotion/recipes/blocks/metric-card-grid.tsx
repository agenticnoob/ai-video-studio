import type { CSSProperties, FC } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { recipeBlockClamp, recipeBlockEnter, recipeBlockFocusedOut } from "./block-animation";

export type MetricCardDatum = {
  label: string;
  suffix?: string;
  tint: string;
  value: number;
};

export type MetricCardProps = {
  height?: number;
  index: number;
  metric: MetricCardDatum;
  mutedColor: string;
  panelColor?: string;
  textColor: string;
  width?: number;
};

export type MetricCardGridProps = {
  cardHeight?: number;
  cardWidth?: number;
  gap?: number;
  metrics: MetricCardDatum[];
  mutedColor: string;
  panelColor?: string;
  style?: CSSProperties;
  textColor: string;
};

export const MetricCard: FC<MetricCardProps> = ({
  height = 250,
  index,
  metric,
  mutedColor,
  panelColor = "rgba(16,27,45,0.9)",
  textColor,
  width = 320,
}) => {
  const frame = useCurrentFrame();
  const cardIn = recipeBlockEnter(frame, 34 + index * 20, 74 + index * 20);
  const drift = interpolate(frame, [90, 260], [-4, 4], recipeBlockClamp) * (index % 2 ? -1 : 1);
  const value = Math.round(
    interpolate(frame, [72 + index * 14, 160 + index * 14], [0, metric.value], {
      ...recipeBlockClamp,
      easing: recipeBlockFocusedOut,
    }),
  );
  const progressWidth = `${Math.max(18, Math.min(100, value))}%`;

  return (
    <div
      style={{
        background: `linear-gradient(180deg, ${metric.tint}22, ${panelColor})`,
        border: `1px solid ${metric.tint}66`,
        borderRadius: 24,
        boxShadow: `0 24px 80px ${metric.tint}20`,
        height,
        opacity: cardIn,
        padding: 28,
        transform: `translateY(${interpolate(
          cardIn,
          [0, 1],
          [34, drift],
          recipeBlockClamp,
        )}px) rotateX(${drift}deg)`,
        width,
      }}
    >
      <div style={{ color: mutedColor, fontSize: 18, fontWeight: 850 }}>{metric.label}</div>
      <div
        style={{
          color: textColor,
          fontSize: 78,
          fontWeight: 950,
          lineHeight: 1,
          marginTop: 42,
        }}
      >
        {value}
        {metric.suffix ?? ""}
      </div>
      <div
        style={{
          backgroundColor: metric.tint,
          borderRadius: 999,
          height: 6,
          marginTop: 34,
          width: progressWidth,
        }}
      />
    </div>
  );
};

export const MetricCardGrid: FC<MetricCardGridProps> = ({
  cardHeight,
  cardWidth,
  gap = 26,
  metrics,
  mutedColor,
  panelColor,
  style,
  textColor,
}) => (
  <div style={{ display: "flex", gap, ...style }}>
    {metrics.map((metric, index) => (
      <MetricCard
        height={cardHeight}
        index={index}
        key={metric.label}
        metric={metric}
        mutedColor={mutedColor}
        panelColor={panelColor}
        textColor={textColor}
        width={cardWidth}
      />
    ))}
  </div>
);
