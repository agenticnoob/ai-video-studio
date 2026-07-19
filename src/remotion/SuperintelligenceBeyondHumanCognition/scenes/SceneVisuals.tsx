import type { CSSProperties, FC, ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";

import type { SuperintelligenceBeyondHumanCognitionSceneId } from "../types";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const WARM = "#ffad5b";
const COOL = "#6be7ff";
const INK = "#f8f4ea";
const MUTED = "#aeb9ca";

const SubjectFrame: FC<{ readonly children: ReactNode; readonly style?: CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      height: 810,
      left: 70,
      perspective: 1100,
      position: "absolute",
      top: 300,
      width: 940,
      ...style,
    }}
  >
    {children}
  </div>
);

const GlowSphere: FC<{
  readonly color: string;
  readonly left: number;
  readonly size: number;
  readonly top: number;
  readonly opacity?: number;
  readonly scale?: number;
}> = ({ color, left, size, top, opacity = 1, scale = 1 }) => (
  <div
    style={{
      background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${color} 16%, ${color}77 42%, ${color}11 68%, transparent 72%)`,
      border: `1px solid ${color}aa`,
      borderRadius: "50%",
      boxShadow: `0 0 34px ${color}aa, 0 0 110px ${color}44`,
      height: size,
      left,
      opacity,
      position: "absolute",
      scale,
      top,
      width: size,
    }}
  />
);

const SvgStage: FC<{ readonly children: ReactNode }> = ({ children }) => (
  <svg height="810" viewBox="0 0 940 810" width="940" style={{ overflow: "visible" }}>
    <defs>
      <filter id="soft-glow">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id="warm-cool" x1="0" x2="1">
        <stop offset="0" stopColor={WARM} />
        <stop offset="1" stopColor={COOL} />
      </linearGradient>
    </defs>
    {children}
  </svg>
);

const Node: FC<{ readonly x: number; readonly y: number; readonly active?: boolean; readonly r?: number }> = ({
  x,
  y,
  active = true,
  r = 12,
}) => (
  <circle
    cx={x}
    cy={y}
    fill={active ? COOL : "#172033"}
    filter={active ? "url(#soft-glow)" : undefined}
    r={r}
    stroke={active ? "#d9fbff" : "#52647c"}
    strokeWidth={2}
  />
);

export const SceneVisuals: FC<{
  readonly sceneId: SuperintelligenceBeyondHumanCognitionSceneId;
}> = ({ sceneId }) => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [0, 45], [0, 1], clamp);
  const drift = Math.sin(frame / 48);
  const pulse = 0.96 + Math.sin(frame / 34) * 0.04;
  const index = Number(sceneId.slice(-2));

  if (index === 1) {
    return (
      <SubjectFrame>
        <div style={{ opacity: reveal, translate: `0 ${(1 - reveal) * 45}px` }}>
          <GlowSphere color={WARM} left={390} size={128} top={346} scale={pulse} />
          {[0, 1, 2, 3].map((ring) => (
            <div
              key={ring}
              style={{
                border: `1px solid rgba(107,231,255,${0.32 - ring * 0.05})`,
                borderRadius: "50%",
                height: 300 + ring * 142,
                left: 304 - ring * 71,
                position: "absolute",
                top: 260 - ring * 71,
                width: 300 + ring * 142,
              }}
            />
          ))}
          <div
            style={{
              color: MUTED,
              fontSize: 24,
              left: 344,
              letterSpacing: 6,
              position: "absolute",
              textAlign: "center",
              top: 510,
              width: 220,
            }}
          >
            HUMAN SCALE
          </div>
        </div>
      </SubjectFrame>
    );
  }

  if (index === 2) {
    const points = [
      { x: 130, y: 580, label: "肌肉" },
      { x: 345, y: 420, label: "连接" },
      { x: 570, y: 275, label: "计算" },
      { x: 790, y: 130, label: "认知" },
    ];
    return (
      <SubjectFrame>
        <SvgStage>
          <path d="M130 580 C280 540 240 440 345 420 S470 310 570 275 S700 175 790 130" fill="none" stroke="url(#warm-cool)" strokeWidth="7" opacity={reveal} />
          {points.map((point, pointIndex) => (
            <g key={point.label} opacity={interpolate(reveal, [pointIndex * 0.18, pointIndex * 0.18 + 0.3], [0, 1], clamp)}>
              <Node x={point.x} y={point.y} r={pointIndex === 3 ? 48 : 22} />
              <text fill={pointIndex === 3 ? INK : MUTED} fontSize={pointIndex === 3 ? 34 : 28} textAnchor="middle" x={point.x} y={point.y + 76}>{point.label}</text>
            </g>
          ))}
        </SvgStage>
      </SubjectFrame>
    );
  }

  if (index === 3) {
    const layers = [
      { x: 135, y: 600, width: 540 },
      { x: 203, y: 488, width: 504 },
      { x: 271, y: 376, width: 468 },
      { x: 339, y: 264, width: 432 },
      { x: 407, y: 152, width: 396 },
    ];

    return (
      <SubjectFrame>
        <SvgStage>
          <g opacity={reveal} transform={`translate(0 ${drift * 5}) rotate(-7 470 405)`}>
            {layers.map((layer, layerIndex) => (
              <rect
                key={layerIndex}
                fill={layerIndex % 2 ? "rgba(107,231,255,0.12)" : "rgba(255,173,91,0.18)"}
                height="86"
                stroke={layerIndex % 2 ? COOL : WARM}
                strokeOpacity="0.64"
                width={layer.width}
                x={layer.x}
                y={layer.y}
              />
            ))}
            {[0, 1, 2, 3, 4, 5].map((star) => (
              <circle
                key={star}
                cx={540 + star * 52}
                cy={140 + star * 55}
                fill={COOL}
                opacity={0.55 + star * 0.06}
                r={9 + (star % 2) * 4}
                stroke="rgba(217,251,255,0.72)"
              />
            ))}
          </g>
        </SvgStage>
      </SubjectFrame>
    );
  }

  if (index === 4) {
    const progress = interpolate(frame, [20, 100], [0.05, 1], clamp);
    return (
      <SubjectFrame>
        <SvgStage>
          <path d="M470 145 L760 620 L180 620 Z" fill="rgba(23,32,51,0.55)" stroke="rgba(107,231,255,0.26)" strokeWidth="2" />
          <path d="M470 145 L760 620 L180 620 Z" fill="none" pathLength={1} stroke="url(#warm-cool)" strokeDasharray="1" strokeDashoffset={1 - progress} strokeWidth="9" filter="url(#soft-glow)" />
          <Node x={470} y={145} r={34} />
          <Node x={760} y={620} r={34} />
          <Node x={180} y={620} r={34} />
          <text fill={INK} fontSize="30" textAnchor="middle" x="470" y="95">认知</text>
          <text fill={INK} fontSize="30" textAnchor="middle" x="800" y="680">验证</text>
          <text fill={INK} fontSize="30" textAnchor="middle" x="130" y="680">行动</text>
        </SvgStage>
      </SubjectFrame>
    );
  }

  if (index === 5) {
    return (
      <SubjectFrame>
        <div style={{ height: "100%", opacity: reveal, position: "relative" }}>
          {[0, 1, 2, 3].map((level) => (
            <div
              key={level}
              style={{
                border: `2px solid ${level === 3 ? WARM : COOL}${level === 3 ? "cc" : "66"}`,
                borderRadius: "50%",
                boxShadow: `0 0 ${28 + level * 12}px ${level === 3 ? WARM : COOL}33`,
                height: 610 - level * 125,
                left: 165 + level * 62,
                position: "absolute",
                rotate: `${level % 2 ? -frame * 0.018 : frame * 0.014}deg`,
                top: 95 + level * 62,
                width: 610 - level * 125,
              }}
            />
          ))}
          <GlowSphere color={WARM} left={410} size={120} top={340} scale={pulse} />
        </div>
      </SubjectFrame>
    );
  }

  if (index === 6) {
    const labels = ["代码", "实验", "材料", "芯片", "能源"];
    return (
      <SubjectFrame>
        <div style={{ bottom: 80, left: 80, position: "absolute", right: 80, top: 60 }}>
          {labels.map((label, level) => {
            const stepReveal = interpolate(frame, [level * 16, level * 16 + 35], [0, 1], clamp);
            return (
              <div
                key={label}
                style={{
                  alignItems: "center",
                  background: `linear-gradient(110deg, rgba(23,32,51,0.96), ${level === 4 ? "rgba(255,173,91,0.28)" : "rgba(107,231,255,0.12)"})`,
                  border: `1px solid ${level === 4 ? WARM : COOL}88`,
                  bottom: level * 122,
                  boxShadow: `0 20px 46px rgba(0,0,0,0.38), 0 0 34px ${level === 4 ? WARM : COOL}22`,
                  color: INK,
                  display: "flex",
                  fontSize: 30,
                  fontWeight: 700,
                  height: 100,
                  justifyContent: "center",
                  left: level * 110,
                  opacity: stepReveal,
                  position: "absolute",
                  width: 300,
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      </SubjectFrame>
    );
  }

  if (index === 7) {
    const branches = Array.from({ length: 18 }, (_, branch) => ({
      angle: (branch / 18) * Math.PI * 2,
      length: 160 + (branch % 4) * 32,
    }));
    return (
      <SubjectFrame>
        <SvgStage>
          <circle cx="470" cy="400" fill="rgba(23,32,51,0.82)" r="220" stroke={WARM} strokeWidth="5" />
          <circle cx="470" cy="400" fill="none" r="170" stroke={COOL} strokeDasharray="16 18" strokeWidth="3" />
          <line x1="470" y1="400" x2={470 + Math.cos(frame / 22) * 145} y2={400 + Math.sin(frame / 22) * 145} stroke={INK} strokeLinecap="round" strokeWidth="9" />
          {branches.map((branch, branchIndex) => {
            const x = 470 + Math.cos(branch.angle) * branch.length;
            const y = 400 + Math.sin(branch.angle) * branch.length;
            return <line key={branchIndex} x1="470" y1="400" x2={x} y2={y} stroke={COOL} strokeOpacity={0.16 + (branchIndex % 3) * 0.08} strokeWidth="3" />;
          })}
          <text fill={INK} fontSize="66" fontWeight="800" textAnchor="middle" x="470" y="425">1 秒</text>
        </SvgStage>
      </SubjectFrame>
    );
  }

  if (index === 8) {
    return (
      <SubjectFrame>
        <div style={{ height: "100%", opacity: reveal, position: "relative", rotate: `${drift * 2}deg` }}>
          <div
            style={{
              background: "conic-gradient(from 45deg, #172033, #6be7ff, #030712, #ffad5b, #172033)",
              clipPath: "polygon(50% 0%, 92% 26%, 76% 84%, 25% 100%, 5% 38%)",
              filter: "drop-shadow(0 0 42px rgba(107,231,255,0.45))",
              height: 520,
              left: 230,
              position: "absolute",
              rotate: `${frame * 0.018}deg`,
              top: 120,
              width: 500,
            }}
          />
          {["E=mc²", "∇", "ψ", "Δ", "?"].map((symbol, symbolIndex) => (
            <div key={symbol} style={{ color: symbolIndex === 4 ? WARM : MUTED, fontSize: 48, left: 100 + symbolIndex * 170, opacity: 0.8, position: "absolute", top: 690 - (symbolIndex % 2) * 46 }}>{symbol}</div>
          ))}
        </div>
      </SubjectFrame>
    );
  }

  if (index === 9) {
    const orbitNodes = [
      [470, 105, "理论"],
      [805, 400, "仪器"],
      [470, 700, "实验"],
      [135, 400, "复核"],
    ] as const;
    return (
      <SubjectFrame>
        <SvgStage>
          <circle cx="470" cy="400" fill="none" r="300" stroke="rgba(107,231,255,0.28)" strokeDasharray="8 14" strokeWidth="3" />
          <rect x="310" y="235" width="320" height="330" rx="26" fill="#030712" stroke={WARM} strokeWidth="3" filter="url(#soft-glow)" />
          <text fill={INK} fontSize="44" fontWeight="800" textAnchor="middle" x="470" y="380">结果</text>
          <text fill={MUTED} fontSize="26" textAnchor="middle" x="470" y="432">有效，但推导不可见</text>
          {orbitNodes.map(([x, y, label], nodeIndex) => (
            <g key={label} opacity={interpolate(reveal, [nodeIndex * 0.16, nodeIndex * 0.16 + 0.35], [0, 1], clamp)}>
              <Node x={x} y={y} r={28} />
              <text fill={INK} fontSize="28" textAnchor="middle" x={x} y={y + (y < 200 ? -52 : 64)}>{label}</text>
            </g>
          ))}
        </SvgStage>
      </SubjectFrame>
    );
  }

  if (index === 10) {
    const systems = [
      [120, 180, "医疗"],
      [820, 170, "能源"],
      [100, 620, "生产"],
      [830, 630, "风险"],
    ] as const;
    return (
      <SubjectFrame>
        <SvgStage>
          {systems.map(([x, y, label], systemIndex) => (
            <g key={label}>
              <path d={`M${x} ${y} Q470 400 470 400`} fill="none" stroke={COOL} strokeOpacity={0.28 + systemIndex * 0.1} strokeWidth={4 + systemIndex} />
              <Node x={x} y={y} r={24} />
              <text fill={INK} fontSize="28" textAnchor="middle" x={x} y={y + 58}>{label}</text>
            </g>
          ))}
          <circle cx="470" cy="400" fill="#172033" filter="url(#soft-glow)" r={112 * pulse} stroke={WARM} strokeWidth="6" />
          <text fill={INK} fontSize="36" fontWeight="800" textAnchor="middle" x="470" y="415">核心</text>
          <path d="M390 535 Q470 590 550 535" fill="none" stroke={WARM} strokeWidth="4" />
          <text fill={MUTED} fontSize="25" textAnchor="middle" x="470" y="635">关闭成本持续上升</text>
        </SvgStage>
      </SubjectFrame>
    );
  }

  if (index === 11) {
    const labels = ["国家", "家庭", "财产", "身份", "生命"];
    return (
      <SubjectFrame>
        <div style={{ height: "100%", opacity: reveal, position: "relative" }}>
          <GlowSphere color={COOL} left={315} size={310} top={240} scale={pulse} />
          {labels.map((label, labelIndex) => {
            const angle = -1.8 + labelIndex * 0.9;
            const radius = 260 + reveal * 95;
            return (
              <div key={label} style={{ background: "rgba(23,32,51,0.86)", border: `1px solid ${labelIndex % 2 ? COOL : WARM}88`, borderRadius: 999, color: INK, fontSize: 28, left: 430 + Math.cos(angle) * radius - 55, padding: "13px 24px", position: "absolute", top: 385 + Math.sin(angle) * radius }}>{label}</div>
            );
          })}
        </div>
      </SubjectFrame>
    );
  }

  if (index === 12) {
    return (
      <SubjectFrame>
        <div style={{ height: "100%", opacity: reveal, position: "relative" }}>
          {[0, 1, 2, 3, 4].map((depth) => (
            <div key={depth} style={{ background: `linear-gradient(145deg, rgba(107,231,255,${0.03 + depth * 0.025}), rgba(255,173,91,0.04))`, border: `2px solid ${depth % 2 ? WARM : COOL}${depth === 4 ? "bb" : "55"}`, boxShadow: "0 22px 55px rgba(0,0,0,0.36)", height: 560 - depth * 85, left: 145 + depth * 70, position: "absolute", top: 115 + depth * 62, width: 650 - depth * 140 }} />
          ))}
          <GlowSphere color={WARM} left={424} size={92} top={355} scale={pulse} />
          <div style={{ color: MUTED, fontSize: 26, left: 270, letterSpacing: 4, position: "absolute", textAlign: "center", top: 700, width: 400 }}>观察者 / 被观察者</div>
        </div>
      </SubjectFrame>
    );
  }

  if (index === 13) {
    const rings = [
      { size: 650, label: "尺度" },
      { size: 470, label: "目的" },
      { size: 290, label: "边界" },
    ];
    return (
      <SubjectFrame>
        <div style={{ height: "100%", opacity: reveal, position: "relative" }}>
          {rings.map((ring, ringIndex) => (
            <div key={ring.label} style={{ alignItems: "flex-start", border: `2px solid ${ringIndex % 2 ? WARM : COOL}${ringIndex === 2 ? "cc" : "66"}`, borderRadius: 38, boxShadow: `0 0 45px ${ringIndex % 2 ? WARM : COOL}22`, color: ringIndex === 2 ? INK : MUTED, display: "flex", fontSize: 28, height: ring.size, justifyContent: "center", left: (940 - ring.size) / 2, paddingTop: 22, position: "absolute", top: (790 - ring.size) / 2, width: ring.size }}>{ring.label}</div>
          ))}
          <div style={{ color: WARM, fontSize: 50, fontWeight: 800, left: 300, position: "absolute", textAlign: "center", top: 360, width: 340 }}>问题框架</div>
        </div>
      </SubjectFrame>
    );
  }

  if (index === 14) {
    return (
      <SubjectFrame>
        <div style={{ height: "100%", opacity: reveal, position: "relative" }}>
          {[0, 1, 2, 3, 4, 5].map((tower) => (
            <div key={tower} style={{ background: `linear-gradient(180deg, rgba(107,231,255,${0.42 - tower * 0.035}), rgba(23,32,51,0.95))`, border: "1px solid rgba(107,231,255,0.55)", bottom: 80, boxShadow: "0 -20px 52px rgba(107,231,255,0.12)", height: 330 + tower * 58, left: 270 + tower * 82, position: "absolute", transformOrigin: "bottom", width: 58 }} />
          ))}
          <GlowSphere color={COOL} left={430} size={210} top={70} opacity={0.75} scale={pulse} />
          <div style={{ background: WARM, borderRadius: "50%", bottom: 84, boxShadow: `0 0 28px ${WARM}`, height: 24, left: 120, position: "absolute", width: 24 }} />
          <div style={{ background: WARM, bottom: 34, height: 52, left: 129, position: "absolute", width: 6 }} />
          <div style={{ color: MUTED, fontSize: 22, left: 66, letterSpacing: 3, position: "absolute", top: 705 }}>HUMAN SCALE</div>
        </div>
      </SubjectFrame>
    );
  }

  return (
    <SubjectFrame>
      <div style={{ height: "100%", opacity: reveal, position: "relative" }}>
        {[0, 1, 2, 3, 4, 5].map((step) => (
          <div key={step} style={{ background: step === 0 ? WARM : COOL, borderRadius: "50%", boxShadow: `0 0 ${step === 0 ? 55 : 34}px ${step === 0 ? WARM : COOL}aa`, height: 96 - step * 8, left: 90 + step * 145, opacity: 1 - step * 0.1, position: "absolute", top: 610 - step * 106, width: 96 - step * 8 }} />
        ))}
        <div style={{ background: "linear-gradient(25deg, transparent 44%, rgba(107,231,255,0.4) 45% 48%, transparent 49%)", inset: 0, position: "absolute" }} />
        <div style={{ color: INK, fontSize: 30, left: 94, position: "absolute", top: 740 }}>人类知识</div>
        <div style={{ color: MUTED, fontSize: 26, letterSpacing: 5, position: "absolute", right: 30, top: 72 }}>BEYOND FRAME ↑</div>
      </div>
    </SubjectFrame>
  );
};
