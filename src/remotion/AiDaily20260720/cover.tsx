import type { FC } from "react";
import { AbsoluteFill } from "remotion";
import { getProducerStyleProfile } from "../styles";

const profile = getProducerStyleProfile("hand-drawn-explainer");
const ink = profile.palette.ink;
const paper = profile.palette.background;
const coral = profile.palette.accent;
const teal = profile.palette.secondary;

const SystemBuilding: FC<{ readonly portrait: boolean }> = ({ portrait }) => (
  <div
    style={{
      height: portrait ? 900 : 760,
      position: "relative",
      transform: `rotate(${portrait ? 1.2 : 1.8}deg)`,
      width: portrait ? 820 : 760,
    }}
  >
    <svg viewBox="0 0 820 900" style={{ height: "100%", overflow: "visible", width: "100%" }}>
      <path
        d="M84 214 L410 48 L738 214 Z"
        fill="#f7d7cc"
        stroke={ink}
        strokeLinejoin="round"
        strokeWidth="11"
      />
      <text x="410" y="159" textAnchor="middle" fontSize="58" fontWeight="950">
        模型
      </text>
      <text x="410" y="200" textAnchor="middle" fontSize="24" fontWeight="850" fill="#756b62">
        只是屋顶
      </text>

      {[
        { y: 215, label: "专用芯片", sub: "效率", fill: "#dceced" },
        { y: 355, label: "推理容量", sub: "交付", fill: "#f6e5b7" },
        { y: 495, label: "电力与土地", sub: "扩张", fill: "#d9edd7" },
        { y: 635, label: "内容溯源", sub: "合规", fill: "#ead9e7" },
      ].map((floor, index) => (
        <g key={floor.label}>
          <path
            d={`M${84 + index * 26} ${floor.y} L${736 - index * 26} ${floor.y} L${690 - index * 20} ${floor.y + 125} L${128 + index * 20} ${floor.y + 125} Z`}
            fill={floor.fill}
            stroke={ink}
            strokeLinejoin="round"
            strokeWidth="9"
          />
          <text x="350" y={floor.y + 76} textAnchor="middle" fontSize="43" fontWeight="950">
            {floor.label}
          </text>
          <rect
            x="552"
            y={floor.y + 35}
            width="112"
            height="56"
            rx="28"
            fill={index % 2 === 0 ? teal : coral}
            stroke={ink}
            strokeWidth="6"
          />
          <text
            x="608"
            y={floor.y + 73}
            textAnchor="middle"
            fontSize="24"
            fontWeight="950"
            fill={paper}
          >
            {floor.sub}
          </text>
        </g>
      ))}

      <path
        d="M110 810 Q410 870 710 810"
        fill="none"
        stroke={coral}
        strokeLinecap="round"
        strokeWidth="15"
      />
      <path
        d="M116 834 Q410 890 700 837"
        fill="none"
        stroke={teal}
        strokeLinecap="round"
        strokeWidth="7"
      />
    </svg>

    <div
      style={{
        background: "#fff8e8",
        border: `5px solid ${ink}`,
        boxShadow: "8px 9px 0 rgba(232,84,62,.18)",
        fontSize: portrait ? 27 : 25,
        fontWeight: 950,
        left: portrait ? -10 : -34,
        padding: "13px 18px",
        position: "absolute",
        rotate: "-7deg",
        top: portrait ? 314 : 300,
      }}
    >
      6—10× 效率目标
    </div>
    <div
      style={{
        background: "#fff8e8",
        border: `5px solid ${ink}`,
        boxShadow: "8px 9px 0 rgba(40,127,143,.18)",
        fontSize: portrait ? 27 : 25,
        fontWeight: 950,
        padding: "13px 18px",
        position: "absolute",
        right: portrait ? -4 : -24,
        rotate: "6deg",
        top: portrait ? 594 : 565,
      }}
    >
      1 GW 园区锁定
    </div>
  </div>
);

const TopicRail: FC<{ readonly portrait: boolean }> = ({ portrait }) => (
  <div
    style={{
      alignItems: "center",
      display: "flex",
      flexWrap: "wrap",
      gap: portrait ? 16 : 14,
      justifyContent: portrait ? "center" : "flex-start",
    }}
  >
    {["GOOGLE 芯片", "KIMI 容量", "NVIDIA 仿真", "EU 溯源"].map((topic, index) => (
      <div
        key={topic}
        style={{
          background: index === 1 ? coral : index === 3 ? teal : "#fff8e8",
          border: `4px solid ${ink}`,
          color: index === 1 || index === 3 ? paper : ink,
          fontSize: portrait ? 24 : 22,
          fontWeight: 950,
          padding: portrait ? "12px 18px" : "10px 15px",
          rotate: `${index % 2 === 0 ? -1.5 : 1.5}deg`,
        }}
      >
        {topic}
      </div>
    ))}
  </div>
);

export const AiDaily20260720Cover: FC<{ readonly portrait: boolean }> = ({ portrait }) => (
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
          AI DAILY · 2026.07.20
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
          5 MIN
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
            模型只是
            <span
              style={{
                color: coral,
                display: "inline-block",
                marginLeft: 18,
                position: "relative",
              }}
            >
              屋顶
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
            真正的竞争
            <br />
            在芯片、电力、容量和溯源
          </div>
          {!portrait ? (
            <div style={{ marginTop: 52 }}>
              <TopicRail portrait={false} />
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
          <SystemBuilding portrait={portrait} />
        </div>
      </div>

      {portrait ? (
        <div style={{ bottom: 48, left: 56, position: "absolute", right: 56, zIndex: 4 }}>
          <TopicRail portrait />
        </div>
      ) : null}
    </div>
  </AbsoluteFill>
);

export const AiDaily20260720Cover16x9 = () => <AiDaily20260720Cover portrait={false} />;
export const AiDaily20260720Cover9x16 = () => <AiDaily20260720Cover portrait />;
