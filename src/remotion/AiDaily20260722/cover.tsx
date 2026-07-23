import type { FC } from "react";
import { AbsoluteFill } from "remotion";

const AiDaily20260722Cover: FC<{ readonly portrait: boolean }> = ({ portrait }) => (
  <AbsoluteFill
    style={{
      background: "linear-gradient(145deg, #071019 0%, #102536 52%, #0b3347 100%)",
      color: "#f4fbff",
      fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", sans-serif',
      overflow: "hidden",
      padding: portrait ? 104 : 124,
    }}
  >
    <div
      style={{
        backgroundImage:
          "linear-gradient(rgba(85,220,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(85,220,255,0.08) 1px, transparent 1px)",
        backgroundSize: portrait ? "72px 72px" : "84px 84px",
        inset: 0,
        position: "absolute",
      }}
    />
    <div
      style={{
        alignItems: portrait ? "flex-start" : "center",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        maxWidth: portrait ? 850 : 1450,
        position: "relative",
        zIndex: 2,
      }}
    >
      <div
        style={{
          color: "#55dcff",
          fontSize: portrait ? 34 : 30,
          fontWeight: 900,
          letterSpacing: 6,
          marginBottom: 20,
        }}
      >
        AI DAILY · 2026.07.22
      </div>
      <h1
        style={{
          fontSize: portrait ? 160 : 140,
          fontWeight: 900,
          letterSpacing: -6,
          lineHeight: 0.92,
          margin: "20px 0",
          textAlign: portrait ? "left" : "center",
        }}
      >
        AI 日报
      </h1>
      <div
        style={{
          fontSize: portrait ? 54 : 48,
          fontWeight: 900,
          lineHeight: 1.15,
          marginTop: 10,
          textAlign: portrait ? "left" : "center",
        }}
      >
        能力 · 算力 · 资本 · 风险
      </div>
      <div
        style={{
          color: "#55dcff",
          fontSize: portrait ? 36 : 32,
          fontWeight: 900,
          marginTop: 20,
        }}
      >
        同时升级
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          justifyContent: portrait ? "flex-start" : "center",
          marginTop: 50,
        }}
      >
        {["Agent 入侵", "2GW 算力", "50亿美元", "版权和解"].map((tag, i) => (
          <div
            key={tag}
            style={{
              background: i === 0 ? "#ff6b6b" : i === 1 ? "#55dcff" : i === 2 ? "#ffcf5a" : "#6bc7ff",
              borderRadius: 999,
              color: "#071019",
              fontSize: portrait ? 26 : 24,
              fontWeight: 900,
              padding: "12px 24px",
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>
  </AbsoluteFill>
);

export const AiDaily20260722Cover16x9 = () => <AiDaily20260722Cover portrait={false} />;
export const AiDaily20260722Cover9x16 = () => <AiDaily20260722Cover portrait />;