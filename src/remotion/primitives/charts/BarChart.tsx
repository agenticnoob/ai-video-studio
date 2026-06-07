import type { FC } from "react";
import { interpolate, useCurrentFrame } from "remotion";

export type BarChartDatum = {
  label: string;
  value: number;
};

export type BarChartProps = {
  background?: string;
  colors?: string[];
  data?: BarChartDatum[];
  subtitle?: string;
  title?: string;
};

const defaultData: BarChartDatum[] = [
  { label: "Jan", value: 50 },
  { label: "Feb", value: 80 },
  { label: "Mar", value: 30 },
  { label: "Apr", value: 70 },
  { label: "May", value: 45 },
  { label: "Jun", value: 90 },
  { label: "Jul", value: 60 },
  { label: "Aug", value: 75 },
  { label: "Sep", value: 40 },
  { label: "Oct", value: 85 },
];

const defaultColors = [
  "#4361ee",
  "#0f766e",
  "#7c3aed",
  "#db2777",
  "#0891b2",
  "#2563eb",
  "#9333ea",
  "#be185d",
  "#0d9488",
  "#0284c7",
];

export const BarChart: FC<BarChartProps> = ({
  background = "linear-gradient(to bottom right, #111827, #1f2937)",
  colors = defaultColors,
  data = defaultData,
  subtitle = "Data visualization for 2023",
  title = "Monthly Performance",
}) => {
  const frame = useCurrentFrame();
  const chartWidth = 900;
  const chartHeight = 500;
  const padding = 60;
  const safeData = data.length > 0 ? data : defaultData;
  const maxValue = Math.max(...safeData.map((point) => point.value), 1);
  const barWidth = ((chartWidth - padding * 2) / safeData.length) * 0.7;
  const xScale = (index: number) =>
    (index / Math.max(safeData.length - 1, 1)) * (chartWidth - padding * 2) + padding;
  const yScale = (value: number) =>
    chartHeight - padding - (value / maxValue) * (chartHeight - padding * 2);

  return (
    <div
      style={{
        alignItems: "center",
        background,
        display: "flex",
        fontFamily: "Inter, system-ui, sans-serif",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          borderRadius: 8,
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          height: chartHeight,
          overflow: "hidden",
          padding: 20,
          position: "relative",
          width: chartWidth,
        }}
      >
        <svg height={chartHeight} width={chartWidth}>
          <line
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="2"
            x1={padding}
            x2={chartWidth - padding}
            y1={chartHeight - padding}
            y2={chartHeight - padding}
          />
          {safeData.map((point, index) => (
            <text
              fill="rgba(255, 255, 255, 0.8)"
              fontSize="14"
              fontWeight="500"
              key={`x-label-${point.label}-${index}`}
              textAnchor="middle"
              x={xScale(index)}
              y={chartHeight - padding + 25}
            >
              {point.label}
            </text>
          ))}
          {safeData.map((point, index) => {
            const fullHeight = (point.value / maxValue) * (chartHeight - padding * 2);
            const progress = interpolate(frame, [index * 3, 15 + index * 3], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const currentHeight = fullHeight * progress;
            const currentY = yScale(point.value) + fullHeight - currentHeight;

            return (
              <g key={`bar-${point.label}-${index}`}>
                <rect
                  fill={colors[index % colors.length] ?? defaultColors[0]}
                  height={currentHeight}
                  rx="6"
                  ry="6"
                  width={barWidth}
                  x={xScale(index) - barWidth / 2}
                  y={currentY}
                />
                <text
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  opacity={progress > 0.9 ? 1 : 0}
                  textAnchor="middle"
                  x={xScale(index)}
                  y={currentY - 10}
                >
                  {point.value}
                </text>
              </g>
            );
          })}
        </svg>
        <div
          style={{
            color: "white",
            fontSize: 28,
            fontWeight: 700,
            left: "50%",
            letterSpacing: 0,
            position: "absolute",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            top: 25,
            transform: "translateX(-50%)",
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: 16,
            left: "50%",
            position: "absolute",
            textShadow: "0 1px 2px rgba(0,0,0,0.2)",
            top: 60,
            transform: "translateX(-50%)",
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
};
