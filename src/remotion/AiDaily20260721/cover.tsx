import type { FC } from "react";
import { AbsoluteFill } from "remotion";
import { getProducerStyleProfile } from "../styles";

const profile = getProducerStyleProfile("hand-drawn-explainer");
const ink = profile.palette.ink;
const paper = profile.palette.background;
const coral = profile.palette.accent;
const teal = profile.palette.secondary;

const ExpandingCircles: FC<{ readonly portrait: boolean }> = ({ portrait }) => (
  <div
    style={{
      height: portrait ? 580 : 480,
      position: "relative",
      transform: `rotate(${portrait ? 0.8 : 1.5}deg)`,
      width: portrait ? 580 : 480,
    }}
  >
    <svg viewBox="0 0 580 580" style={{ height: "100%", overflow: "visible", width: "100%" }}>
      {/* Concentric circles representing expanding competition scope */}
      <circle cx="290" cy="290" r="50" fill="#f7d7cc" stroke={ink} strokeWidth="8" />
      <text x="290" y="297" textAnchor="middle" fontSize="22" fontWeight="950">
        模型
      </text>
      <circle
        cx="290" cy="290" r="120"
        fill="none" stroke={coral} strokeWidth="7"
        strokeDasharray="8 6"
      />
      <text x="290" y="130" textAnchor="middle" fontSize="18" fontWeight="900" fill={coral}>
        算力
      </text>
      <circle
        cx="290" cy="290" r="190"
        fill="none" stroke={teal} strokeWidth="7"
        strokeDasharray="8 6"
      />
      <text x="290" y="70" textAnchor="middle" fontSize="18" fontWeight="900" fill={teal}>
        主权
      </text>
      <circle
        cx="290" cy="290" r="260"
        fill="none" stroke={ink} strokeWidth="7"
        strokeDasharray="8 6"
      />
      <text x="290" y="20" textAnchor="middle" fontSize="18" fontWeight="900" fill={ink}>
        部署
      </text>
    </svg>
  </div>
);

const TopicTags: FC<{ readonly portrait: boolean }> = ({ portrait }) => (
  <div
    style={{
      alignItems: "center",
      display: "flex",
      flexWrap: "wrap",
      gap: portrait ? 14 : 12,
      justifyContent: portrait ? "center" : "flex-start",
    }}
  >
    {["GEMINI 分化", "主权 AI", "AGENT 支付", "物理 AI", "EU 溯源", "$400 亿"].map((topic, index) => (
      <div
        key={topic}
        style={{
          background: index === 1 ? coral : index === 3 ? teal : index === 5 ? ink : "#fff8e8",
          border: `4px solid ${ink}`,
          color: index === 1 || index === 3 || index === 5 ? paper : ink,
          fontSize: portrait ? 22 : 20,
          fontWeight: 950,
          padding: portrait ? "10px 16px" : "8px 14px",
          rotate: `${index % 2 === 0 ? -1.5 : 1.5}deg`,
        }}
      >
        {topic}
      </div>
    ))}
  </div>
);

export const AiDaily20260721Cover: FC<{ readonly portrait: boolean }> = ({ portrait }) => (
  <AbsoluteFill
    style={{
      background: paper,
      backgroundImage:
        "radial-gradient(circle at 82% 18%, rgba(232,84,62,.12), transparent 26%), radial-gradient(circle at 16% 78%, rgba(40,127,143,.12), transparent 28%), repeating-linear-gradient(0deg, transparent 0 47px, rgba(41,38,36,.065) 48px 49px)",
      color: ink,
      fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", sans-serif',
      padding: portrait ? 112 : 118,
    }}
  >
    <div
      style={{
        border: `${portrait ? 7 : 6}px solid ${ink}`,
        boxShadow: `${portrait ? 15 : 13}px ${portrait ? 17 : 14}px 0 rgba(41,38,36,.15)`,
        height: "100%",
        overflow: "hidden",
        padding: portrait ? "58px 52px 66px" : "48px 58px",
        position: "relative",
        rotate: "-0.5deg",
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 3,
        }}
      >
        <div
          style={{ color: teal, fontSize: portrait ? 31 : 30, fontWeight: 950, letterSpacing: 3 }}
        >
          AI DAILY · 2026.07.21
        </div>
        <div
          style={{
            background: coral,
            border: `5px solid ${ink}`,
            borderRadius: 50,
            color: paper,
            display: "grid",
            fontSize: portrait ? 24 : 22,
            fontWeight: 950,
            height: portrait ? 68 : 60,
            placeItems: "center",
            rotate: "7deg",
            whiteSpace: "nowrap",
            width: portrait ? 118 : 108,
          }}
        >
          8 MIN
        </div>
      </div>

      <div
        style={
          portrait
            ? { position: "relative", zIndex: 2 }
            : {
                alignItems: "center",
                display: "grid",
                gridTemplateColumns: "1.02fr .98fr",
                height: "calc(100% - 70px)",
                position: "relative",
                zIndex: 2,
              }
        }
      >
        <div style={{ paddingTop: portrait ? 82 : 0 }}>
          <div style={{ fontSize: portrait ? 132 : 124, fontWeight: 950, lineHeight: 0.9 }}>
            AI 日报
          </div>
          <div
            style={{
              fontSize: portrait ? 70 : 62,
              fontWeight: 950,
              lineHeight: 1.08,
              marginTop: 38,
            }}
          >
            竞争单位
            <span
              style={{
                color: coral,
                display: "inline-block",
                marginLeft: 18,
                position: "relative",
              }}
            >
              正在扩大
              <span
                style={{
                  background: coral,
                  bottom: -8,
                  height: 10,
                  left: -8,
                  position: "absolute",
                  rotate: "-3deg",
                  width: "115%",
                }}
              />
            </span>
          </div>
          <div
            style={{
              fontSize: portrait ? 46 : 43,
              fontWeight: 900,
              lineHeight: 1.22,
              marginTop: 26,
            }}
          >
            模型 × 算力
            <br />
            × 主权 × 部署
          </div>
          {!portrait ? (
            <div style={{ marginTop: 52 }}>
              <TopicTags portrait={false} />
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "grid",
            justifyContent: "center",
            marginTop: portrait ? 50 : 55,
            transform: portrait ? "scale(.91)" : "scale(.91)",
            transformOrigin: "center top",
          }}
        >
          <ExpandingCircles portrait={portrait} />
        </div>
      </div>

      {portrait ? (
        <div style={{ bottom: 48, left: 56, position: "absolute", right: 56, zIndex: 4 }}>
          <TopicTags portrait />
        </div>
      ) : null}
    </div>
  </AbsoluteFill>
);

export const AiDaily20260721Cover16x9 = () => <AiDaily20260721Cover portrait={false} />;
export const AiDaily20260721Cover9x16 = () => <AiDaily20260721Cover portrait />;