import type { FC } from "react";
import { AbsoluteFill } from "remotion";

const PALETTE = {
  bg: "#f4ead5",
  surface: "#fff8e8",
  ink: "#292624",
  muted: "#746b61",
  accent: "#e7573f",
  secondary: "#287f8f",
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
      {/* Paper fiber texture */}
      <AbsoluteFill
        style={{
          backgroundImage: `
            repeating-linear-gradient(2deg, ${PALETTE.ink}035 0 2px, transparent 2px 18px),
            radial-gradient(circle at 18% 22%, ${PALETTE.accent}0a 0%, transparent 32%),
            radial-gradient(circle at 82% 78%, ${PALETTE.secondary}08 0%, transparent 36%)
          `,
        }}
      />

      {/* Hand-drawn sketch frame */}
      <div
        style={{
          border: `6px solid ${PALETTE.ink}`,
          borderRadius: 24,
          boxShadow: `12px 12px 0 ${PALETTE.ink}18`,
          maxWidth: "100%",
          padding: isP ? "80px 60px" : "48px 60px",
          position: "relative",
          top: isP ? 200 : 0,
          background: PALETTE.surface,
          transform: "rotate(-0.5deg)",
        }}
      >
        {/* Kicker badge */}
        <div
          style={{
            background: PALETTE.accent,
            borderRadius: 4,
            color: "#fff",
            display: "inline-block",
            fontSize: isP ? 48 : 28,
            fontWeight: 900,
            letterSpacing: 6,
            padding: isP ? "12px 32px" : "8px 22px",
            transform: "rotate(-2deg)",
            marginBottom: isP ? 30 : 16,
          }}
        >
          AI 日报 · 2026-07-19
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
          进入四个竞争层
        </h1>

        {/* Underline accent */}
        <div
          style={{
            background: PALETTE.accent,
            borderRadius: 3,
            height: 6,
            margin: "0 0 10px",
            width: isP ? 280 : 160,
          }}
        />

        <p
          style={{
            color: PALETTE.muted,
            fontSize: isP ? 60 : 32,
            lineHeight: 1.25,
            margin: 0,
          }}
        >
          算力交易 · 开放模型 · Agent 安全 · 运行责任
        </p>

        {/* Tag badges */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: isP ? 20 : 12,
            marginTop: isP ? 60 : 24,
          }}
        >
          {[
            { label: "Meta→Anthropic $10B", color: PALETTE.secondary },
            { label: "Kimi K3 2.8T", color: PALETTE.ink },
            { label: "VulnHunter 开源", color: PALETTE.accent },
            { label: "Databricks $1880亿", color: PALETTE.muted },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: PALETTE.surface,
                border: `4px solid ${item.color}`,
                borderRadius: 999,
                boxShadow: `4px 4px 0 ${item.color}25`,
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

export const AiDailyNews20260719Cover16x9 = () => <AiDailyNewsCover portrait={false} />;
export const AiDailyNews20260719Cover9x16 = () => <AiDailyNewsCover portrait />;