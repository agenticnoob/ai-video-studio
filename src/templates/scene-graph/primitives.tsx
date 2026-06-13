import type { CSSProperties, FC } from "react";
import { Easing, interpolate, spring, useCurrentFrame } from "remotion";

import type { SceneGraphSpec } from "./schema";

type SceneLayer = SceneGraphSpec["layers"][number];
type SceneTheme = SceneGraphSpec["theme"];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const toneColor = (
  theme: SceneTheme,
  tone: "primary" | "secondary" | "success" | "warning" | "muted" | "dark",
) => {
  switch (tone) {
    case "secondary":
      return theme.secondary;
    case "success":
      return "#22c55e";
    case "warning":
      return "#f59e0b";
    case "muted":
      return theme.muted;
    case "dark":
      return theme.background;
    case "primary":
    default:
      return theme.primary;
  }
};

const layerBox = (layout: "left" | "right" | "wide" | "bottom"): CSSProperties => {
  switch (layout) {
    case "left":
      return { left: 76, top: 148, width: 500 };
    case "right":
      return { right: 76, top: 148, width: 500 };
    case "wide":
      return { left: 120, right: 120, top: 150 };
    case "bottom":
    default:
      return { bottom: 118, left: 120, right: 120 };
  }
};

const terminalStatusColor = (
  theme: SceneTheme,
  status: Extract<SceneLayer, { type: "terminal-panel" }>["status"],
) => {
  switch (status) {
    case "success":
      return "#22c55e";
    case "error":
      return "#ef4444";
    case "idle":
      return theme.muted;
    case "running":
    default:
      return theme.primary;
  }
};

export const TechnicalPanelFrame: FC<{
  children: React.ReactNode;
  progress: number;
  style?: CSSProperties;
  theme: SceneTheme;
  title: string;
}> = ({ children, progress, style, theme, title }) => (
  <div
    style={{
      background: `linear-gradient(135deg, rgba(2,6,23,0.88), ${theme.panel})`,
      border: `1px solid ${theme.text}24`,
      borderRadius: 6,
      boxShadow: `0 26px 80px ${theme.background}99`,
      color: theme.text,
      opacity: progress,
      overflow: "hidden",
      position: "absolute",
      transform: `translateY(${(1 - progress) * 18}px) scale(${0.985 + progress * 0.015})`,
      ...style,
    }}
  >
    <div
      style={{
        alignItems: "center",
        borderBottom: `1px solid ${theme.text}1c`,
        display: "flex",
        gap: 8,
        height: 36,
        padding: "0 14px",
      }}
    >
      {[theme.primary, theme.secondary, theme.muted].map((color) => (
        <span
          key={color}
          style={{
            background: color,
            borderRadius: 999,
            height: 8,
            opacity: 0.88,
            width: 8,
          }}
        />
      ))}
      <span style={{ color: theme.muted, fontSize: 12, fontWeight: 800, marginLeft: 8 }}>
        {title}
      </span>
    </div>
    {children}
  </div>
);

export const CodePanelLayer: FC<{
  layer: Extract<SceneLayer, { type: "code-panel" }>;
  progress: number;
  spec: SceneGraphSpec;
}> = ({ layer, progress, spec }) => {
  const frame = useCurrentFrame();
  const visibleLines = Math.max(
    1,
    Math.ceil(
      interpolate(frame - (layer.startFrame ?? 0), [0, 42], [1, layer.lines.length], {
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    ),
  );
  const highlights = new Set(layer.highlightLines ?? []);

  return (
    <TechnicalPanelFrame
      progress={progress}
      style={layerBox(layer.layout)}
      theme={spec.theme}
      title={`${layer.title} · ${layer.language}`}
    >
      <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", padding: 18 }}>
        {layer.lines.slice(0, visibleLines).map((line, index) => {
          const lineNumber = index + 1;
          const highlighted = highlights.has(lineNumber);
          return (
            <div
              key={`${lineNumber}-${line}`}
              style={{
                background: highlighted ? `${spec.theme.primary}18` : "transparent",
                color: highlighted ? spec.theme.text : spec.theme.muted,
                display: "grid",
                fontSize: 16,
                fontWeight: highlighted ? 800 : 650,
                gridTemplateColumns: "34px 1fr",
                lineHeight: 1.55,
                padding: "2px 8px",
              }}
            >
              <span style={{ color: `${spec.theme.muted}99` }}>{lineNumber}</span>
              <span>{line}</span>
            </div>
          );
        })}
      </div>
    </TechnicalPanelFrame>
  );
};

export const TerminalPanelLayer: FC<{
  layer: Extract<SceneLayer, { type: "terminal-panel" }>;
  progress: number;
  spec: SceneGraphSpec;
}> = ({ layer, progress, spec }) => {
  const frame = useCurrentFrame();
  const activeColor = terminalStatusColor(spec.theme, layer.status);
  const visibleLines = Math.max(
    1,
    Math.ceil(
      interpolate(frame - (layer.startFrame ?? 0), [0, 38], [1, layer.lines.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    ),
  );

  return (
    <TechnicalPanelFrame
      progress={progress}
      style={layerBox(layer.layout)}
      theme={spec.theme}
      title={layer.title}
    >
      <div
        style={{
          color: spec.theme.text,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 17,
          fontWeight: 700,
          lineHeight: 1.6,
          padding: "18px 20px 22px",
        }}
      >
        {layer.lines.slice(0, visibleLines).map((line, index) => (
          <div
            key={`${index}-${line}`}
            style={{ color: index === visibleLines - 1 ? activeColor : spec.theme.muted }}
          >
            <span style={{ color: activeColor, marginRight: 10 }}>$</span>
            {line}
          </div>
        ))}
      </div>
    </TechnicalPanelFrame>
  );
};

const nodePosition = (
  node: Extract<SceneLayer, { type: "node-graph" }>["nodes"][number],
  index: number,
  total: number,
) => {
  const laneX: Record<typeof node.lane, number> = {
    input: 0.08,
    plan: 0.28,
    build: 0.5,
    verify: 0.72,
    output: 0.9,
  };
  const baseX = laneX[node.lane] ?? (index + 1) / (total + 1);
  const yPattern = [0.28, 0.58, 0.42, 0.72, 0.22, 0.64, 0.36, 0.52];
  return { x: baseX, y: yPattern[index % yPattern.length] };
};

export const NodeGraphLayer: FC<{
  layer: Extract<SceneLayer, { type: "node-graph" }>;
  progress: number;
  spec: SceneGraphSpec;
}> = ({ layer, progress, spec }) => {
  const frame = useCurrentFrame();
  const pulse = spring({
    frame: frame - (layer.startFrame ?? 0),
    fps: spec.meta.fps,
    config: { damping: 14 },
  });
  const positions = new Map(
    layer.nodes.map((node, index) => [node.id, nodePosition(node, index, layer.nodes.length)]),
  );

  return (
    <div style={{ inset: "96px 72px 126px", opacity: progress, position: "absolute" }}>
      {layer.title ? (
        <div
          style={{
            color: spec.theme.text,
            fontSize: 24,
            fontWeight: 900,
            left: 8,
            position: "absolute",
            top: -34,
          }}
        >
          {layer.title}
        </div>
      ) : null}
      <svg
        height="100%"
        style={{ inset: 0, position: "absolute" }}
        width="100%"
        viewBox="0 0 1000 410"
      >
        {layer.edges.map((edge) => {
          const from = positions.get(edge.from);
          const to = positions.get(edge.to);
          if (!from || !to) {
            return null;
          }
          const stroke =
            edge.status === "success"
              ? "#22c55e"
              : edge.status === "error"
                ? "#ef4444"
                : spec.theme.primary;
          const pathLength = interpolate(progress, [0, 1], [0.001, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <path
              d={`M ${from.x * 1000} ${from.y * 410} C ${(from.x + 0.12) * 1000} ${from.y * 410}, ${(to.x - 0.12) * 1000} ${to.y * 410}, ${to.x * 1000} ${to.y * 410}`}
              fill="none"
              key={`${edge.from}-${edge.to}`}
              pathLength={1}
              stroke={stroke}
              strokeDasharray="1"
              strokeDashoffset={1 - pathLength}
              strokeLinecap="round"
              strokeWidth={edge.status === "active" ? 5 : 3}
              opacity={edge.status === "idle" ? 0.4 : 0.9}
            />
          );
        })}
      </svg>
      {layer.nodes.map((node) => {
        const position = positions.get(node.id) ?? { x: 0.5, y: 0.5 };
        const active = node.status === "active";
        const success = node.status === "success";
        const errored = node.status === "error";
        const color = success
          ? "#22c55e"
          : errored
            ? "#ef4444"
            : active
              ? spec.theme.secondary
              : spec.theme.primary;
        const scale = active ? 1 + pulse * 0.035 : 1;

        return (
          <div
            key={node.id}
            style={{
              background: `linear-gradient(135deg, rgba(15,23,42,0.94), ${color}18)`,
              border: `1px solid ${color}99`,
              borderRadius: 999,
              boxShadow: `0 18px 60px ${color}22`,
              color: spec.theme.text,
              left: `${position.x * 100}%`,
              minWidth: 150,
              opacity: progress,
              padding: "16px 18px",
              position: "absolute",
              top: `${position.y * 100}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 950, lineHeight: 1.05 }}>{node.label}</div>
            {node.detail ? (
              <div style={{ color: spec.theme.muted, fontSize: 12, fontWeight: 750, marginTop: 5 }}>
                {node.detail}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export const LinePathLayer: FC<{
  layer: Extract<SceneLayer, { type: "line-path" }>;
  progress: number;
  spec: SceneGraphSpec;
}> = ({ layer, progress, spec }) => {
  const color = toneColor(spec.theme, layer.tone);
  const points = layer.points.map((point) => `${point.x * 1000},${point.y * 410}`).join(" ");

  return (
    <svg
      height="410"
      style={{ inset: "130px 95px auto", opacity: progress, position: "absolute" }}
      viewBox="0 0 1000 410"
      width="1090"
    >
      <polyline
        fill="none"
        pathLength={1}
        points={points}
        stroke={color}
        strokeDasharray="1"
        strokeDashoffset={1 - progress}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={5}
      />
      {layer.showNodes
        ? layer.points.map((point, index) => (
            <g key={`${point.x}-${point.y}-${index}`} opacity={progress}>
              <circle
                cx={point.x * 1000}
                cy={point.y * 410}
                fill={spec.theme.background}
                r={13}
                stroke={color}
                strokeWidth={4}
              />
              {point.label ? (
                <text
                  fill={spec.theme.text}
                  fontSize="20"
                  fontWeight="800"
                  textAnchor="middle"
                  x={point.x * 1000}
                  y={point.y * 410 - 24}
                >
                  {point.label}
                </text>
              ) : null}
            </g>
          ))
        : null}
    </svg>
  );
};

export const BrowserWindowLayer: FC<{
  layer: Extract<SceneLayer, { type: "browser-window" }>;
  progress: number;
  spec: SceneGraphSpec;
}> = ({ layer, progress, spec }) => (
  <TechnicalPanelFrame
    progress={progress}
    style={{
      ...(layer.layout === "left"
        ? { left: 84, top: 132, width: 520 }
        : layer.layout === "right"
          ? { right: 84, top: 132, width: 520 }
          : { left: 180, right: 180, top: 136 }),
      minHeight: 320,
    }}
    theme={spec.theme}
    title={layer.title}
  >
    <div style={{ padding: 20 }}>
      <div
        style={{
          background: `${spec.theme.text}12`,
          borderRadius: 999,
          color: spec.theme.muted,
          fontSize: 13,
          fontWeight: 800,
          padding: "10px 14px",
        }}
      >
        {layer.url}
      </div>
      <div
        style={{
          background: `linear-gradient(135deg, ${spec.theme.primary}24, ${spec.theme.secondary}1a)`,
          border: `1px solid ${spec.theme.text}1f`,
          borderRadius: 4,
          height: 190,
          marginTop: 16,
          position: "relative",
        }}
      >
        {layer.callouts.map((callout, index) => (
          <div
            key={callout}
            style={{
              background: "rgba(2,6,23,0.72)",
              border: `1px solid ${index % 2 ? spec.theme.secondary : spec.theme.primary}55`,
              color: spec.theme.text,
              fontSize: 14,
              fontWeight: 850,
              left: 28 + index * 110,
              padding: "9px 11px",
              position: "absolute",
              top: 38 + index * 42,
            }}
          >
            {callout}
          </div>
        ))}
      </div>
    </div>
  </TechnicalPanelFrame>
);

export const CursorLayer: FC<{
  layer: Extract<SceneLayer, { type: "cursor" }>;
  progress: number;
  spec: SceneGraphSpec;
}> = ({ layer, progress, spec }) => {
  const frame = useCurrentFrame();
  const clickProgress =
    typeof layer.clickFrame === "number"
      ? interpolate(frame - layer.clickFrame, [0, 8, 16], [0, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;
  const travel = interpolate(progress, [0, 1], [0, layer.path.length - 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const currentIndex = clamp(Math.floor(travel), 0, layer.path.length - 2);
  const nextIndex = clamp(currentIndex + 1, 0, layer.path.length - 1);
  const local = travel - currentIndex;
  const from = layer.path[currentIndex];
  const to = layer.path[nextIndex];
  const x = ((from?.x ?? 0.5) + ((to?.x ?? 0.5) - (from?.x ?? 0.5)) * local) * 1280;
  const y = ((from?.y ?? 0.5) + ((to?.y ?? 0.5) - (from?.y ?? 0.5)) * local) * 720;

  return (
    <div style={{ left: x, opacity: progress, position: "absolute", top: y }}>
      <div
        style={{
          background: spec.theme.text,
          border: `2px solid ${spec.theme.background}`,
          borderRadius: "60% 45% 55% 45%",
          boxShadow: `0 0 0 ${8 + clickProgress * 18}px ${spec.theme.primary}${clickProgress ? "33" : "00"}`,
          height: 22,
          transform: "rotate(-18deg)",
          width: 15,
        }}
      />
      {layer.label ? (
        <div
          style={{
            background: spec.theme.background,
            border: `1px solid ${spec.theme.primary}55`,
            color: spec.theme.text,
            fontSize: 12,
            fontWeight: 850,
            marginLeft: 18,
            marginTop: 6,
            padding: "5px 8px",
            whiteSpace: "nowrap",
          }}
        >
          {layer.label}
        </div>
      ) : null}
    </div>
  );
};
