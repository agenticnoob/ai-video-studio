import type { FC, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { getProducerStyleProfile } from "../styles";
import type { AiDaily20260720Scene } from "./types";

const p = getProducerStyleProfile("hand-drawn-explainer");
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const progress = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const Page: FC<{ children: ReactNode; color?: string }> = ({
  children,
  color = p.palette.background,
}) => (
  <AbsoluteFill
    style={{
      backgroundColor: color,
      backgroundImage:
        "repeating-linear-gradient(0deg,transparent 0 39px,rgba(41,38,36,.035) 40px 41px),radial-gradient(circle at 10% 20%,rgba(231,87,63,.07),transparent 26%),radial-gradient(circle at 88% 70%,rgba(40,127,143,.07),transparent 28%)",
      color: p.palette.ink,
      fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", sans-serif',
      overflow: "hidden",
    }}
  >
    {children}
  </AbsoluteFill>
);
const Title: FC<{ index: string; title: string; center?: boolean }> = ({
  index,
  title,
  center,
}) => {
  const f = useCurrentFrame();
  const e = progress(f, 0, 22);
  return (
    <div
      style={{
        left: 64,
        opacity: e,
        position: "absolute",
        right: 64,
        textAlign: center ? "center" : "left",
        top: 58,
        translate: `0 ${(1 - e) * -24}px`,
        zIndex: 10,
      }}
    >
      <div style={{ color: p.palette.secondary, fontSize: 27, fontWeight: 950, letterSpacing: 3 }}>
        {index}
      </div>
      <div style={{ fontSize: 70, fontWeight: 950, lineHeight: 1.06, marginTop: 14 }}>{title}</div>
    </div>
  );
};
const Stroke: FC<{ d: string; show: number; color?: string; width?: number }> = ({
  d,
  show,
  color = p.palette.ink,
  width = 8,
}) => (
  <path
    d={d}
    fill="none"
    pathLength={1}
    stroke={color}
    strokeDasharray={1}
    strokeDashoffset={1 - show}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={width}
  />
);
const Note: FC<{
  children: ReactNode;
  x: number;
  y: number;
  show?: number;
  rotate?: number;
  color?: string;
}> = ({ children, x, y, show = 1, rotate = 0, color = p.palette.accent }) => (
  <div
    style={{
      background: p.palette.surface,
      border: `4px solid ${p.palette.ink}`,
      boxShadow: `8px 9px 0 ${color}35`,
      fontSize: 28,
      fontWeight: 950,
      left: x,
      opacity: show,
      padding: "13px 20px",
      position: "absolute",
      rotate: `${rotate}deg`,
      top: y,
      zIndex: 8,
    }}
  >
    {children}
  </div>
);

const Opening: FC<{ scene: AiDaily20260720Scene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const reveal = progress(f, 10, 155);
  const zoom = interpolate(f, [0, scene.durationInFrames], [1.15, 0.94], clamp);
  const floors = [
    { y: 90, h: 170, label: "模型", sub: "只是最上面一层", fill: "#f7d7cc" },
    { y: 260, h: 190, label: "专用芯片", sub: "推理效率", fill: "#dceced" },
    { y: 450, h: 210, label: "运行容量", sub: "GPU 与调度", fill: "#f6e5b7" },
    { y: 660, h: 230, label: "电力与土地", sub: "基础设施", fill: "#d9edd7" },
    { y: 890, h: 190, label: "内容溯源", sub: "合规地基", fill: "#ead9e7" },
  ];
  return (
    <Page>
      <Title index="AI DAILY · 2026.07.20" title="模型，只是 AI 竞争的屋顶" />
      <div
        style={{ height: 1280, left: 90, position: "absolute", scale: zoom, top: 285, width: 900 }}
      >
        <svg viewBox="0 0 900 1280" style={{ height: "100%", width: "100%" }}>
          {floors.map((x, i) => {
            const q = progress(reveal, i * 0.14, i * 0.14 + 0.3);
            const inset = i * 52;
            return (
              <g key={x.label} opacity={q}>
                <rect
                  x={inset + 35}
                  y={x.y}
                  width={830 - inset * 2}
                  height={x.h}
                  rx="18"
                  fill={x.fill}
                  stroke={p.palette.ink}
                  strokeWidth="7"
                />
                <text
                  x="450"
                  y={x.y + x.h * 0.48}
                  textAnchor="middle"
                  fontSize={i === 0 ? 54 : 47}
                  fontWeight="950"
                >
                  {x.label}
                </text>
                <text
                  x="450"
                  y={x.y + x.h * 0.72}
                  textAnchor="middle"
                  fontSize="27"
                  fontWeight="800"
                  fill={p.palette.muted}
                >
                  {x.sub}
                </text>
              </g>
            );
          })}
          <Stroke d="M90 1120 L810 1120" show={reveal} color={p.palette.accent} width={14} />
        </svg>
      </div>
      <Note x={92} y={1435} rotate={-2} show={progress(f, 120, 160)}>
        决定扩张的是整栋楼
      </Note>
    </Page>
  );
};

const Google: FC<{ scene: AiDaily20260720Scene }> = () => {
  const f = useCurrentFrame();
  const d = progress(f, 10, 150);
  const pulse = (f % 80) / 80;
  return (
    <Page>
      <Title index="01 · GOOGLE FROZEN v2" title="少搬一次模型，少走一段能耗" />
      <div style={{ left: 45, position: "absolute", top: 300, width: 990 }}>
        <div style={{ display: "grid", gap: 34, gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ height: 1030, position: "relative" }}>
            <div style={{ fontSize: 32, fontWeight: 950, textAlign: "center" }}>传统路径</div>
            <svg viewBox="0 0 470 960" style={{ height: 960, width: 470 }}>
              <rect
                x="55"
                y="100"
                width="360"
                height="220"
                rx="24"
                fill="#e7decb"
                stroke={p.palette.ink}
                strokeWidth="7"
              />
              <text x="235" y="185" textAnchor="middle" fontSize="38" fontWeight="950">
                外部内存
              </text>
              <text x="235" y="240" textAnchor="middle" fontSize="28" fontWeight="800">
                Gemini 模型信息
              </text>
              <Stroke
                d="M235 320 C60 470 80 650 235 745"
                show={d}
                color={p.palette.accent}
                width={13}
              />
              {Array.from({ length: 8 }).map((_, i) => {
                const t = (pulse + i / 8) % 1;
                return (
                  <circle
                    key={i}
                    cx={235 - 135 * Math.sin(t * Math.PI)}
                    cy={320 + t * 425}
                    r="11"
                    fill={p.palette.accent}
                  />
                );
              })}
              <rect
                x="85"
                y="745"
                width="300"
                height="180"
                rx="26"
                fill="#dceced"
                stroke={p.palette.ink}
                strokeWidth="8"
              />
              <text x="235" y="840" textAnchor="middle" fontSize="42" fontWeight="950">
                AI 芯片
              </text>
            </svg>
            <div
              style={{
                color: p.palette.accent,
                fontSize: 31,
                fontWeight: 950,
                textAlign: "center",
              }}
            >
              长路径 · 频繁搬运
            </div>
          </div>
          <div style={{ height: 1030, position: "relative" }}>
            <div style={{ fontSize: 32, fontWeight: 950, textAlign: "center" }}>Frozen v2</div>
            <svg viewBox="0 0 470 960" style={{ height: 960, width: 470 }}>
              <rect
                x="45"
                y="170"
                width="380"
                height="570"
                rx="38"
                fill="#dceced"
                stroke={p.palette.ink}
                strokeWidth="9"
              />
              {Array.from({ length: 7 }).map((_, i) => (
                <line
                  key={i}
                  x1={90 + i * 48}
                  y1="135"
                  x2={90 + i * 48}
                  y2="170"
                  stroke={p.palette.ink}
                  strokeWidth="7"
                />
              ))}
              <rect
                x="105"
                y="315"
                width="260"
                height="260"
                rx="28"
                fill="#f7d7cc"
                stroke={p.palette.accent}
                strokeWidth="12"
              />
              <text x="235" y="405" textAnchor="middle" fontSize="36" fontWeight="950">
                GEMINI
              </text>
              <text x="235" y="470" textAnchor="middle" fontSize="48" fontWeight="950">
                写进芯片
              </text>
              <Stroke
                d="M130 650 Q235 580 340 650"
                show={progress(d, 0.4, 1)}
                color={p.palette.secondary}
                width={11}
              />
              <text x="235" y="705" textAnchor="middle" fontSize="29" fontWeight="900">
                模型 × 硬件联合设计
              </text>
            </svg>
            <div
              style={{
                color: p.palette.secondary,
                fontSize: 31,
                fontWeight: 950,
                textAlign: "center",
              }}
            >
              短路径 · 固定结构优化
            </div>
          </div>
        </div>
      </div>
      <Note x={300} y={1450} rotate={-1} show={progress(f, 100, 145)}>
        研发目标：单位功耗 6—10×
      </Note>
      <div
        style={{ color: p.palette.muted, fontSize: 26, left: 120, position: "absolute", top: 1530 }}
      >
        仍在设计阶段，不是已验证量产性能
      </div>
    </Page>
  );
};

const Nvidia: FC<{ scene: AiDaily20260720Scene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const stage = Math.min(2, Math.floor(f / 95));
  const travel = interpolate(f, [0, scene.durationInFrames], [5, -45], clamp);
  return (
    <Page>
      <Title index="02 · NVIDIA OMNIVERSE" title="Agent 把 CAD 变成可训练的世界" />
      <div
        style={{
          left: 0,
          position: "absolute",
          top: 320,
          translate: `${travel}px 0`,
          width: 1030,
        }}
      >
        <svg viewBox="0 0 1030 1180" style={{ height: 1180, width: 1030 }}>
          <Stroke
            d="M120 240 C280 240 300 510 500 540 C700 570 720 870 910 900"
            show={progress(f, 10, 170)}
            color={p.palette.secondary}
            width={15}
          />
          <g opacity={progress(f, 10, 55)}>
            <rect
              x="25"
              y="90"
              width="310"
              height="300"
              fill="#e9f0e8"
              stroke={p.palette.ink}
              strokeWidth="7"
            />
            <path
              d="M75 320 L165 150 L285 330 M95 260 L275 260"
              fill="none"
              stroke={p.palette.ink}
              strokeWidth="7"
            />
            <text x="180" y="365" textAnchor="middle" fontSize="34" fontWeight="950">
              CAD 蓝图
            </text>
          </g>
          <g opacity={progress(f, 55, 105)}>
            <circle
              cx="500"
              cy="550"
              r="160"
              fill="#f7d7cc"
              stroke={p.palette.ink}
              strokeWidth="8"
            />
            <text x="500" y="520" textAnchor="middle" fontSize="46" fontWeight="950">
              AGENT 工位
            </text>
            {["碰撞", "质量", "摩擦", "传感器"].map((x, i) => (
              <text
                key={x}
                x={500 + (i % 2 ? 75 : -75)}
                y={585 + Math.floor(i / 2) * 48}
                textAnchor="middle"
                fontSize="25"
                fontWeight="850"
                fill={i % 2 ? p.palette.secondary : p.palette.accent}
              >
                {x}
              </text>
            ))}
          </g>
          <g opacity={progress(f, 105, 165)}>
            <path
              d="M720 920 L895 800 L1010 900 L835 1020 Z"
              fill="#dceced"
              stroke={p.palette.ink}
              strokeWidth="8"
            />
            <rect
              x="820"
              y="650"
              width="150"
              height="230"
              fill="#fff8e8"
              stroke={p.palette.ink}
              strokeWidth="8"
            />
            <circle cx="895" cy="705" r="38" fill={p.palette.accent} />
            <path
              d="M895 748 L895 825 M895 770 L842 805 M895 770 L950 805 M895 825 L850 870 M895 825 L940 870"
              stroke={p.palette.ink}
              strokeLinecap="round"
              strokeWidth="10"
            />
            <path
              d="M760 850 L735 670 M970 845 L1010 665"
              stroke={p.palette.secondary}
              strokeWidth="10"
            />
            <text x="860" y="1100" textAnchor="middle" fontSize="40" fontWeight="950">
              机器人训练场
            </text>
          </g>
        </svg>
      </div>
      <div style={{ display: "flex", gap: 18, left: 75, position: "absolute", top: 1450 }}>
        {["1 读取 CAD", "2 补物理语义", "3 进入 SimReady"].map((x, i) => (
          <div
            key={x}
            style={{
              background: stage >= i ? (i === 1 ? "#dceced" : "#f7d7cc") : "#e9e0cf",
              border: `4px solid ${p.palette.ink}`,
              fontSize: 25,
              fontWeight: 900,
              padding: "14px 16px",
              rotate: `${i - 1}deg`,
            }}
          >
            {x}
          </div>
        ))}
      </div>
    </Page>
  );
};

const Kimi: FC<{ scene: AiDaily20260720Scene }> = () => {
  const f = useCurrentFrame();
  const queueOffset = (f * 2.2) % 95;
  const gauge = 0.72 + 0.24 * Math.abs(Math.sin(f / 16));
  return (
    <Page color="#efe4cf">
      <Title index="03 · KIMI K3" title="请求排成长队，算力柜台满了" />
      <svg
        viewBox="0 0 1080 1370"
        style={{ height: 1370, left: 0, position: "absolute", top: 255, width: 1080 }}
      >
        <rect
          x="575"
          y="420"
          width="390"
          height="650"
          rx="36"
          fill="#dceced"
          stroke={p.palette.ink}
          strokeWidth="9"
        />
        <rect
          x="620"
          y="500"
          width="300"
          height="120"
          fill="#fff8e8"
          stroke={p.palette.ink}
          strokeWidth="7"
        />
        <text x="770" y="575" textAnchor="middle" fontSize="48" fontWeight="950">
          KIMI K3
        </text>
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x="635"
            y={700 + i * 78}
            width="270"
            height="45"
            rx="10"
            fill={i === 3 ? "#f5c3b9" : "#c9e2e4"}
            stroke={p.palette.ink}
            strokeWidth="5"
          />
        ))}
        <path
          d="M610 350 A165 165 0 0 1 940 350"
          fill="none"
          stroke={p.palette.ink}
          strokeWidth="18"
        />
        <path
          d="M610 350 A165 165 0 0 1 940 350"
          fill="none"
          pathLength={1}
          stroke={p.palette.accent}
          strokeDasharray={1}
          strokeDashoffset={1 - gauge}
          strokeWidth="18"
        />
        <line
          x1="775"
          y1="350"
          x2={775 + 135 * Math.cos(Math.PI * (1.02 - gauge))}
          y2={350 - 135 * Math.sin(Math.PI * (1.02 - gauge))}
          stroke={p.palette.ink}
          strokeLinecap="round"
          strokeWidth="12"
        />
        <text x="775" y="405" textAnchor="middle" fontSize="30" fontWeight="950">
          集群容量
        </text>
        <path
          d="M70 1110 C240 960 310 1190 475 1040 C560 965 530 850 595 790"
          fill="none"
          stroke={p.palette.ink}
          strokeDasharray="18 18"
          strokeWidth="7"
        />
        {Array.from({ length: 10 }).map((_, i) => {
          const y = 1100 - ((i * 96 + queueOffset) % 650);
          const x = 110 + Math.sin(i * 1.8) * 75 + (i % 3) * 90;
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="30"
                fill={i % 2 ? "#dceced" : "#f7d7cc"}
                stroke={p.palette.ink}
                strokeWidth="5"
              />
              <rect
                x={x - 48}
                y={y + 38}
                width="96"
                height="48"
                rx="20"
                fill={i % 2 ? "#dceced" : "#f7d7cc"}
                stroke={p.palette.ink}
                strokeWidth="5"
              />
            </g>
          );
        })}
      </svg>
      <Note x={75} y={365} rotate={-4} show={progress(f, 70, 105)}>
        发布后 48 小时
      </Note>
      <Note x={90} y={1335} rotate={2} color={p.palette.accent} show={progress(f, 115, 150)}>
        新消费者订阅：暂停
      </Note>
    </Page>
  );
};

const Science: FC<{ scene: AiDaily20260720Scene }> = () => {
  const f = useCurrentFrame();
  const active = Math.floor((f / 105) % 4);
  const bob = Math.sin(f / 18) * 8;
  const stages = [
    { x: 120, y: 420, t: "模型电脑", sub: "提出候选", fill: "#f7d7cc" },
    { x: 600, y: 410, t: "仿真屏", sub: "筛选结构", fill: "#dceced" },
    { x: 145, y: 950, t: "自动实验台", sub: "规划合成", fill: "#f6e5b7" },
    { x: 620, y: 970, t: "培养皿", sub: "真实验证", fill: "#d9edd7" },
  ];
  return (
    <Page>
      <Title index="04 · AI FOR SCIENCE" title="不是给答案，而是把实验做完" />
      <svg
        viewBox="0 0 1080 1300"
        style={{ height: 1300, left: 0, position: "absolute", top: 275, width: 1080 }}
      >
        <Stroke
          d="M360 515 C460 470 520 470 600 505 M760 635 C780 780 670 840 610 960 M520 1050 C410 1080 350 1060 310 1030 M260 925 C210 760 210 650 260 590"
          show={progress(f, 8, 170)}
          color={p.palette.secondary}
          width={12}
        />
        {stages.map((s, i) => (
          <g
            key={s.t}
            opacity={progress(f, 20 + i * 35, 55 + i * 35)}
            transform={`translate(0 ${active === i ? bob : 0})`}
          >
            <rect
              x={s.x}
              y={s.y}
              width="350"
              height="230"
              rx="30"
              fill={s.fill}
              stroke={p.palette.ink}
              strokeWidth={active === i ? 11 : 7}
            />
            <text x={s.x + 175} y={s.y + 105} textAnchor="middle" fontSize="40" fontWeight="950">
              {s.t}
            </text>
            <text
              x={s.x + 175}
              y={s.y + 158}
              textAnchor="middle"
              fontSize="28"
              fontWeight="800"
              fill={p.palette.muted}
            >
              {s.sub}
            </text>
            {i === 0 ? (
              <path
                d={`M${s.x + 70} ${s.y + 45} Q${s.x + 130} ${s.y - 15} ${s.x + 190} ${s.y + 45}`}
                fill="none"
                stroke={p.palette.accent}
                strokeWidth="8"
              />
            ) : null}
            {i === 1 ? (
              <path
                d={`M${s.x + 55} ${s.y + 55} L${s.x + 295} ${s.y + 55}`}
                stroke={p.palette.secondary}
                strokeWidth="8"
              />
            ) : null}
            {i === 2 ? (
              <path
                d={`M${s.x + 70} ${s.y + 55} L${s.x + 135} ${s.y + 55} L${s.x + 160} ${s.y + 105} L${s.x + 45} ${s.y + 105} Z`}
                fill="none"
                stroke={p.palette.accent}
                strokeWidth="7"
              />
            ) : null}
            {i === 3 ? (
              <circle
                cx={s.x + 80}
                cy={s.y + 75}
                r="42"
                fill="none"
                stroke={p.palette.secondary}
                strokeWidth="8"
              />
            ) : null}
          </g>
        ))}
      </svg>
      <Note x={105} y={1410} rotate={-2} show={progress(f, 130, 170)}>
        模型 → 仿真 → 合成 → 实验
      </Note>
      <Note x={620} y={1480} rotate={2} color={p.palette.secondary} show={progress(f, 150, 195)}>
        形成验证闭环
      </Note>
    </Page>
  );
};

const Regulation: FC<{ scene: AiDaily20260720Scene }> = () => {
  const f = useCurrentFrame();
  const gate = progress(f, 20, 105);
  const scan = (f * 5) % 420;
  const files = [
    { x: 30, y: 360, t: "文本", icon: "TXT" },
    { x: 30, y: 600, t: "音频", icon: "WAV" },
    { x: 30, y: 840, t: "图像", icon: "IMG" },
    { x: 30, y: 1080, t: "视频", icon: "MP4" },
  ];
  return (
    <Page>
      <Title index="05 · EU AI ACT · ARTICLE 50" title="AI 内容，必须带着来源出门" />
      <svg
        viewBox="0 0 1080 1380"
        style={{ height: 1380, left: 0, position: "absolute", top: 250, width: 1080 }}
      >
        <rect
          x="330"
          y="110"
          width="100"
          height="1160"
          rx="28"
          fill="#e8deca"
          stroke={p.palette.ink}
          strokeWidth="8"
        />
        <text
          x="380"
          y="180"
          textAnchor="middle"
          fontSize="28"
          fontWeight="950"
          transform="rotate(90 380 180)"
        >
          导出闸门
        </text>
        <line
          x1="380"
          y1={430 + scan}
          x2="380"
          y2={520 + scan}
          stroke={p.palette.secondary}
          strokeWidth="14"
        />
        {files.map((x, i) => {
          const move = interpolate(gate, [i * 0.12, i * 0.12 + 0.42], [0, 1], clamp);
          const left = x.x + move * 440;
          return (
            <g key={x.t} opacity={progress(gate, i * 0.08, i * 0.08 + 0.22)}>
              <rect
                x={left}
                y={x.y}
                width="230"
                height="150"
                rx="22"
                fill={i % 2 ? "#dceced" : "#f7d7cc"}
                stroke={p.palette.ink}
                strokeWidth="7"
              />
              <text x={left + 52} y={x.y + 88} textAnchor="middle" fontSize="27" fontWeight="950">
                {x.icon}
              </text>
              <text x={left + 155} y={x.y + 88} textAnchor="middle" fontSize="35" fontWeight="950">
                {x.t}
              </text>
              {move > 0.72 ? (
                <g>
                  <rect
                    x={left + 250}
                    y={x.y + 8}
                    width="330"
                    height="134"
                    rx="18"
                    fill="#fff8e8"
                    stroke={p.palette.accent}
                    strokeWidth="6"
                  />
                  <text
                    x={left + 415}
                    y={x.y + 58}
                    textAnchor="middle"
                    fontSize="24"
                    fontWeight="900"
                  >
                    机器可读标记
                  </text>
                  <text
                    x={left + 415}
                    y={x.y + 99}
                    textAnchor="middle"
                    fontSize="23"
                    fontWeight="800"
                  >
                    来源 · 编辑记录
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>
      <Note x={58} y={255} rotate={-2} show={progress(f, 115, 150)}>
        2026.08.02 起适用
      </Note>
      <div
        style={{
          color: p.palette.accent,
          fontSize: 34,
          fontWeight: 950,
          left: 570,
          position: "absolute",
          top: 275,
        }}
      >
        不是一个 UI 标签
      </div>
    </Page>
  );
};

const Power: FC<{ scene: AiDaily20260720Scene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const light = (f % 100) / 100;
  const pull = interpolate(f, [0, scene.durationInFrames], [1.08, 0.92], clamp);
  return (
    <Page>
      <Title index="06 · HUT 8 · TEXAS" title="电力一接通，整座园区被锁定" />
      <div
        style={{
          height: 1260,
          left: -20,
          position: "absolute",
          scale: pull,
          top: 290,
          width: 1120,
        }}
      >
        <svg viewBox="0 0 1120 1260" style={{ height: "100%", width: "100%" }}>
          <path
            d="M80 850 L560 520 L1050 820 L570 1150 Z"
            fill="#e9dfca"
            stroke={p.palette.ink}
            strokeWidth="9"
          />
          <path
            d="M100 320 L155 510 M100 320 L45 510 M62 430 L138 430"
            fill="none"
            stroke={p.palette.ink}
            strokeWidth="10"
          />
          <text x="180" y="335" fontSize="34" fontWeight="950">
            SUBSTATION
          </text>
          <Stroke
            d="M120 500 C300 560 330 760 470 800 C650 850 720 760 940 850"
            show={progress(f, 10, 135)}
            color={p.palette.secondary}
            width={15}
          />
          {Array.from({ length: 9 }).map((_, i) => {
            const t = i / 8;
            const on = Math.max(0, 1 - Math.abs(light - t) * 7);
            return (
              <circle
                key={i}
                cx={125 + t * 810}
                cy={500 + Math.sin(t * Math.PI) * 320}
                r={10 + on * 18}
                fill={p.palette.accent}
                opacity={0.3 + on * 0.7}
              />
            );
          })}
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${300 + i * 170} ${760 + (i % 2) * 100})`}>
              <path
                d="M0 0 L130 -68 L245 -5 L115 65 Z"
                fill={i % 2 ? "#f7d7cc" : "#dceced"}
                stroke={p.palette.ink}
                strokeWidth="7"
              />
              <path
                d="M0 0 L0 120 L115 185 L115 65 M115 65 L245 -5 L245 110 L115 185"
                fill="none"
                stroke={p.palette.ink}
                strokeWidth="7"
              />
              <text x="120" y="32" textAnchor="middle" fontSize="26" fontWeight="950">
                DATA HALL
              </text>
            </g>
          ))}
        </svg>
      </div>
      <Note x={80} y={1340} rotate={-2} show={progress(f, 100, 140)}>
        园区容量：1 GW
      </Note>
      <Note x={545} y={1425} rotate={2} color={p.palette.secondary} show={progress(f, 125, 165)}>
        15 年 · 98 亿美元
      </Note>
      <div
        style={{
          border: `6px solid ${p.palette.accent}`,
          color: p.palette.accent,
          fontSize: 32,
          fontWeight: 950,
          left: 235,
          padding: "12px 26px",
          position: "absolute",
          rotate: "-6deg",
          top: 1515,
        }}
      >
        LONG-TERM LEASE · LOCKED
      </div>
    </Page>
  );
};

const Signals: FC<{ scene: AiDaily20260720Scene }> = () => {
  const f = useCurrentFrame();
  const spin = f * 0.35;
  const gears = [
    { x: 240, y: 620, r: 150, t: "芯片效率", c: "#f7d7cc" },
    { x: 650, y: 550, r: 175, t: "推理容量", c: "#dceced" },
    { x: 480, y: 950, r: 210, t: "电力", c: "#f6e5b7" },
    { x: 760, y: 1080, r: 145, t: "数据", c: "#d9edd7" },
    { x: 250, y: 1150, r: 140, t: "合规", c: "#ead9e7" },
  ];
  return (
    <Page>
      <Title index="TODAY'S CORE JUDGMENT" title="AI 服务，是一台完整机器" center />
      <svg
        viewBox="0 0 1080 1320"
        style={{ height: 1320, left: 0, position: "absolute", top: 290, width: 1080 }}
      >
        {gears.map((g, i) => {
          const q = progress(f, 20 + i * 28, 60 + i * 28);
          return (
            <g key={g.t} opacity={q} transform={`rotate(${(i % 2 ? 1 : -1) * spin} ${g.x} ${g.y})`}>
              <circle
                cx={g.x}
                cy={g.y}
                r={g.r}
                fill={g.c}
                stroke={p.palette.ink}
                strokeWidth="8"
                strokeDasharray="28 12"
              />
              <circle
                cx={g.x}
                cy={g.y}
                r={g.r * 0.62}
                fill="#fff8e8"
                stroke={p.palette.ink}
                strokeWidth="6"
              />
              <text
                x={g.x}
                y={g.y + 12}
                textAnchor="middle"
                fontSize="34"
                fontWeight="950"
                transform={`rotate(${(i % 2 ? -1 : 1) * spin} ${g.x} ${g.y})`}
              >
                {g.t}
              </text>
            </g>
          );
        })}
        <circle
          cx="540"
          cy="800"
          r="115"
          fill={p.palette.accent}
          stroke={p.palette.ink}
          strokeWidth="9"
        />
        <text x="540" y="785" textAnchor="middle" fontSize="36" fontWeight="950" fill="#fff8e8">
          稳定
        </text>
        <text x="540" y="835" textAnchor="middle" fontSize="36" fontWeight="950" fill="#fff8e8">
          交付
        </text>
      </svg>
      <Note x={245} y={1450} rotate={-2} show={progress(f, 150, 190)}>
        模型，只是这台机器的一个齿轮
      </Note>
    </Page>
  );
};

const Close: FC<{ scene: AiDaily20260720Scene }> = () => {
  const f = useCurrentFrame();
  const enabled = Math.min(6, Math.floor(f / 105) + 1);
  const switches = [
    "算力预算",
    "跨硬件路由",
    "恢复与重试",
    "工具来源记录",
    "机器可读标记",
    "真实结果验证",
  ];
  const pulse = 0.96 + 0.04 * Math.sin(f / 12);
  return (
    <Page>
      <Title index="FOR AGENT BUILDERS" title="六个开关打开，Agent 才能稳定跑" />
      <div
        style={{
          background: "#e7deca",
          border: `7px solid ${p.palette.ink}`,
          height: 1040,
          left: 90,
          position: "absolute",
          rotate: "-1deg",
          top: 330,
          width: 900,
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 950, left: 50, position: "absolute", top: 35 }}>
          AGENT OPERATIONS CONSOLE
        </div>
        {switches.map((x, i) => {
          const on = enabled > i;
          return (
            <div
              key={x}
              style={{
                alignItems: "center",
                display: "flex",
                left: 55,
                position: "absolute",
                top: 120 + i * 135,
                width: 780,
              }}
            >
              <div
                style={{
                  background: on ? p.palette.secondary : "#bdb4a5",
                  border: `5px solid ${p.palette.ink}`,
                  borderRadius: 40,
                  height: 65,
                  position: "relative",
                  width: 130,
                }}
              >
                <div
                  style={{
                    background: on ? "#fff8e8" : "#746b61",
                    border: `4px solid ${p.palette.ink}`,
                    borderRadius: "50%",
                    height: 49,
                    left: on ? 69 : 8,
                    position: "absolute",
                    top: 3,
                    width: 49,
                  }}
                />
              </div>
              <div style={{ fontSize: 36, fontWeight: 950, marginLeft: 35 }}>{x}</div>
              <div
                style={{
                  color: on ? p.palette.secondary : p.palette.muted,
                  fontSize: 28,
                  fontWeight: 950,
                  marginLeft: "auto",
                }}
              >
                {on ? "ON" : "OFF"}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          alignItems: "center",
          background: enabled === 6 ? "#d9edd7" : "#f7d7cc",
          border: `8px solid ${p.palette.ink}`,
          borderRadius: "50%",
          display: "flex",
          fontSize: 43,
          fontWeight: 950,
          height: 210,
          justifyContent: "center",
          left: 435,
          position: "absolute",
          scale: pulse,
          top: 1390,
          width: 210,
        }}
      >
        {enabled === 6 ? "稳定运行" : "启动中"}
      </div>
      <Stroke
        d="M540 1365 L540 1300"
        show={progress(f, 520, 620)}
        color={p.palette.accent}
        width={14}
      />
    </Page>
  );
};

export const AiDailySceneVisual: FC<{ scene: AiDaily20260720Scene }> = ({ scene }) => {
  if (scene.id === "open") return <Opening scene={scene} />;
  if (scene.id === "google") return <Google scene={scene} />;
  if (scene.id === "nvidia") return <Nvidia scene={scene} />;
  if (scene.id === "kimi") return <Kimi scene={scene} />;
  if (scene.id === "science") return <Science scene={scene} />;
  if (scene.id === "regulation") return <Regulation scene={scene} />;
  if (scene.id === "power") return <Power scene={scene} />;
  if (scene.id === "signals") return <Signals scene={scene} />;
  return <Close scene={scene} />;
};
