import type { FC } from "react";
import { AbsoluteFill } from "remotion";

const PALETTE = {
  bg: "#fff1bd",
  ink: "#24162d",
  muted: "#6a3b56",
  accent: "#ff3d6e",
  secondary: "#2b8cff",
  white: "#fffbe6",
};

const AiDailyNewsCover: FC<{ readonly portrait: boolean }> = ({ portrait }) => {
  const isP = portrait;

  return (
  <AbsoluteFill
    style={{
      background: PALETTE.bg,
      color: PALETTE.ink,
      fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", sans-serif',
      overflow: "hidden",
      padding: isP ? 120 : 80,
    }}
  >
    {/* Halftone dots */}
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(circle, ${PALETTE.accent}18 2px, transparent 2px)`,
        backgroundSize: "28px 28px",
      }}
    />

    {/* Speed line accent */}
    <AbsoluteFill
      style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 10px, ${PALETTE.ink}0A 10px, ${PALETTE.ink}0A 12px, transparent 12px, transparent 120px)`,
        opacity: 0.3,
      }}
    />

    <div
      style={{
        border: `6px solid ${PALETTE.accent}`,
        borderRadius: 16,
        boxShadow: `12px 12px 0 ${PALETTE.accent}44`,
        maxWidth: "100%",
        padding: isP ? "80px 60px" : "48px 60px",
        position: "relative",
        top: isP ? 200 : 0,
        background: PALETTE.white,
      }}
    >
      <div
        style={{
          background: PALETTE.accent,
          borderRadius: 4,
          color: PALETTE.white,
          display: "inline-block",
          fontSize: isP ? 48 : 28,
          fontWeight: 900,
          letterSpacing: 6,
          padding: isP ? "12px 32px" : "8px 22px",
          transform: "rotate(-2deg)",
          marginBottom: isP ? 30 : 16,
        }}
      >
        AI 日报 · 2026-07-17
      </div>

      <h1
        style={{
          fontSize: isP ? 200 : 96,
          fontWeight: 900,
          letterSpacing: isP ? -6 : -3,
          lineHeight: 0.96,
          margin: isP ? "40px 0" : "16px 0",
        }}
      >
        AI 行业{isP ? <br /> : " "}
        进入分化阶段
      </h1>

      <p
        style={{
          color: PALETTE.muted,
          fontSize: isP ? 60 : 32,
          lineHeight: 1.25,
          margin: 0,
        }}
      >
        模型继续快速提升，资本市场追问回报与成本
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: isP ? 20 : 12,
          marginTop: isP ? 60 : 24,
        }}
      >
        {[
          { label: "Kimi K3 2.8T", color: PALETTE.secondary },
          { label: "Databricks $1880亿", color: "#34d399" },
          { label: "印尼版权法", color: PALETTE.accent },
          { label: "Agent 成本指标", color: "#a78bfa" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: PALETTE.white,
              border: `4px solid ${item.color}`,
              borderRadius: 999,
              boxShadow: `4px 4px 0 ${item.color}44`,
              color: item.color,
              fontSize: isP ? 36 : 22,
              fontWeight: 900,
              padding: isP ? "16px 36px" : "10px 22px",
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  </AbsoluteFill>
);
};

export const AiDailyNews20260717Cover16x9 = () => <AiDailyNewsCover portrait={false} />;
export const AiDailyNews20260717Cover9x16 = () => <AiDailyNewsCover portrait />;