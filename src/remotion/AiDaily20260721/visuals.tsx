import type { FC, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { getProducerStyleProfile } from "../styles";
import type { AiDaily20260721Scene } from "./types";

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

const Title: FC<{ index: string; title: string }> = ({ index, title }) => {
  const f = useCurrentFrame();
  const e = progress(f, 0, 22);
  return (
    <div
      style={{
        left: 64,
        opacity: e,
        position: "absolute",
        right: 64,
        textAlign: "left",
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

/* ===== SCENE 1: OPEN - Competition scope expanding ===== */
const Opening: FC<{ scene: AiDaily20260721Scene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const reveal = progress(f, 10, scene.durationInFrames * 0.65);
  const zoom = interpolate(f, [0, scene.durationInFrames * 0.8], [1.12, 1], clamp);

  const layers = [
    { y: 90, h: 150, label: "模型", sub: "能力竞争", fill: "#f7d7cc" },
    { y: 245, h: 170, label: "轻量 & 专用模型", sub: "成本竞争", fill: "#dceced" },
    { y: 420, h: 190, label: "主权 AI & 算力", sub: "地域竞争", fill: "#f6e5b7" },
    { y: 615, h: 210, label: "物理 AI & Agent", sub: "场景竞争", fill: "#d9edd7" },
    { y: 830, h: 190, label: "数据中心 & 光通信", sub: "基础设施", fill: "#ead9e7" },
  ];

  return (
    <Page>
      <Title index="AI DAILY · 2026.07.21" title="竞争单位正在扩大" />
      <div
        style={{ height: 1300, left: 60, position: "absolute", scale: zoom, top: 250, width: 960 }}
      >
        <svg viewBox="0 0 960 1300" style={{ height: "100%", width: "100%" }}>
          {layers.map((x, i) => {
            const q = progress(reveal, i * 0.12, i * 0.12 + 0.3);
            const inset = i * 48;
            return (
              <g key={x.label} opacity={q}>
                <rect
                  x={inset + 30}
                  y={x.y}
                  width={900 - inset * 2}
                  height={x.h}
                  rx="18"
                  fill={x.fill}
                  stroke={p.palette.ink}
                  strokeWidth="7"
                />
                <text
                  x="480"
                  y={x.y + x.h * 0.48}
                  textAnchor="middle"
                  fontSize={i === 0 ? 54 : 47}
                  fontWeight="950"
                >
                  {x.label}
                </text>
                <text
                  x="480"
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
          <Stroke d="M90 1080 L870 1080" show={reveal} color={p.palette.accent} width={14} />
        </svg>
      </div>
      <Note x={60} y={1500} rotate={-2} show={progress(f, scene.durationInFrames * 0.5, scene.durationInFrames * 0.65)}>
        竞争单位 = 模型 × 算力 × 主权 × 部署
      </Note>
    </Page>
  );
};

/* ===== SCENE 2: GOOGLE - Two tracks diverging ===== */
const Google: FC<{ scene: AiDaily20260721Scene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const show = progress(f, 10, scene.durationInFrames * 0.6);

  const models = [
    { name: "Gemini 3.6 Flash", role: "高频低延迟", color: "#dceced" },
    { name: "3.5 Flash-Lite", role: "低成本推理", color: "#f6e5b7" },
    { name: "3.5 Flash Cyber", role: "网络安全专用", color: "#f7d7cc" },
    { name: "3.5 Pro (延期)", role: "旗舰延期中", color: "#e7decb" },
  ];

  return (
    <Page>
      <Title index="01 · GOOGLE GEMINI" title="两条路线开始分化" />
      <div style={{ left: 45, position: "absolute", top: 280, width: 990 }}>
        {/* Left: light models */}
        <div style={{ display: "flex", gap: 22, marginBottom: 40 }}>
          {models.slice(0, 3).map((m, i) => (
            <div
              key={m.name}
              style={{
                background: m.color,
                border: `5px solid ${p.palette.ink}`,
                borderRadius: 18,
                flex: 1,
                opacity: progress(f, 10 + i * 50, 10 + i * 50 + 60),
                padding: "20px 14px",
                rotate: `${i - 1}deg`,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 29, fontWeight: 950, lineHeight: 1.2 }}>{m.name}</div>
              <div
                style={{
                  fontSize: 23,
                  fontWeight: 850,
                  marginTop: 10,
                  color: p.palette.muted,
                }}
              >
                {m.role}
              </div>
            </div>
          ))}
        </div>
        {/* Diverging arrows */}
        <svg viewBox="0 0 990 400" style={{ height: 400, width: 990 }}>
          <Stroke
            d="M495 40 L495 180"
            show={show}
            color={p.palette.accent}
            width={10}
          />
          <Stroke
            d="M495 180 L200 380"
            show={progress(show, 0.3, 1)}
            color={p.palette.secondary}
            width={8}
          />
          <Stroke
            d="M495 180 L790 380"
            show={progress(show, 0.3, 1)}
            color={p.palette.accent}
            width={8}
          />
          <g opacity={progress(show, 0.5, 1)}>
            <rect
              x="42"
              y="200"
              width="280"
              height="130"
              rx="20"
              fill="#dceced"
              stroke={p.palette.ink}
              strokeWidth="6"
            />
            <text x="182" y="255" textAnchor="middle" fontSize="32" fontWeight="950">
              轻量模型
            </text>
            <text x="182" y="300" textAnchor="middle" fontSize="24" fontWeight="800" fill={p.palette.muted}>
              高并发 · 低成本 · 专用
            </text>
            <rect
              x="668"
              y="200"
              width="280"
              height="130"
              rx="20"
              fill="#f7d7cc"
              stroke={p.palette.ink}
              strokeWidth="6"
            />
            <text x="808" y="255" textAnchor="middle" fontSize="32" fontWeight="950">
              旗舰模型
            </text>
            <text x="808" y="300" textAnchor="middle" fontSize="24" fontWeight="800" fill={p.palette.muted}>
              复杂推理 · 前沿能力
            </text>
          </g>
        </svg>
      </div>
      <Note x={300} y={1480} rotate={-1} show={progress(f, scene.durationInFrames * 0.5, scene.durationInFrames * 0.7)}>
        Gemini 4 已开始训练
      </Note>
    </Page>
  );
};

/* ===== SCENE 3: MICROSOFT × MISTRAL ===== */
const Microsoft: FC<{ scene: AiDaily20260721Scene }> = ({ scene }) => {
  const f = useCurrentFrame();

  return (
    <Page>
      <Title index="02 · MICROSOFT × MISTRAL" title="主权 AI 商业化了" />
      <div style={{ left: 60, position: "absolute", top: 300, width: 960 }}>
        <svg viewBox="0 0 960 1100" style={{ height: 1100, width: 960 }}>
          {/* Microsoft side */}
          <g opacity={progress(f, 10, 80)}>
            <rect
              x="30"
              y="50"
              width="420"
              height="340"
              rx="24"
              fill="#dceced"
              stroke={p.palette.ink}
              strokeWidth="8"
            />
            <text x="240" y="140" textAnchor="middle" fontSize="42" fontWeight="950">
              Microsoft
            </text>
            <text x="240" y="200" textAnchor="middle" fontSize="28" fontWeight="850" fill={p.palette.muted}>
              软件 · 分发 · 企业客户
            </text>
            {["Azure 云", "Copilot Studio", "企业渠道"].map((x, i) => (
              <text
                key={x}
                x="240"
                y={270 + i * 50}
                textAnchor="middle"
                fontSize="26"
                fontWeight="900"
              >
                {x}
              </text>
            ))}
          </g>
          {/* Mistral side */}
          <g opacity={progress(f, 60, 130)}>
            <rect
              x="510"
              y="50"
              width="420"
              height="340"
              rx="24"
              fill="#f6e5b7"
              stroke={p.palette.ink}
              strokeWidth="8"
            />
            <text x="720" y="140" textAnchor="middle" fontSize="42" fontWeight="950">
              Mistral
            </text>
            <text x="720" y="200" textAnchor="middle" fontSize="28" fontWeight="850" fill={p.palette.muted}>
              模型 · 欧洲数据中心
            </text>
            {["Medium 3.5", "OCR 4", "法国数据中心"].map((x, i) => (
              <text
                key={x}
                x="720"
                y={270 + i * 50}
                textAnchor="middle"
                fontSize="26"
                fontWeight="900"
              >
                {x}
              </text>
            ))}
          </g>
          {/* Connection arrows */}
          <g opacity={progress(f, 100, 180)}>
            <Stroke
              d="M450 220 L510 220"
              show={progress(f, 100, 150)}
              color={p.palette.accent}
              width={10}
            />
            <text x="480" y="200" textAnchor="middle" fontSize="28" fontWeight="950" fill={p.palette.accent}>
              +
            </text>
          </g>
          {/* Result: hybrid cloud */}
          <g opacity={progress(f, 180, 260)}>
            <rect
              x="180"
              y="480"
              width="600"
              height="200"
              rx="30"
              fill="#d9edd7"
              stroke={p.palette.ink}
              strokeWidth="9"
            />
            <text x="480" y="555" textAnchor="middle" fontSize="44" fontWeight="950">
              主权云 + 全球云
            </text>
            <text x="480" y="630" textAnchor="middle" fontSize="28" fontWeight="850" fill={p.palette.muted}>
              数据驻留 · 私有部署 · 监管合规
            </text>
          </g>
        </svg>
      </div>
      <Note x={80} y={1500} rotate={2} show={progress(f, scene.durationInFrames * 0.6, scene.durationInFrames * 0.75)}>
        无新增股权投资
      </Note>
    </Page>
  );
};

/* ===== SCENE 4: ALPHABET CAPEX ===== */
const Alphabet: FC<{ scene: AiDaily20260721Scene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const gauge = 0.6 + 0.3 * Math.abs(Math.sin(f / 20));

  return (
    <Page>
      <Title index="03 · ALPHABET CAPEX" title="1800 亿，回报审视" />
      <div style={{ left: 60, position: "absolute", top: 300, width: 960 }}>
        <svg viewBox="0 0 960 1200" style={{ height: 1200, width: 960 }}>
          {/* Big number */}
          <g opacity={progress(f, 10, 80)}>
            <text x="480" y="200" textAnchor="middle" fontSize={120} fontWeight="950" fill={p.palette.accent}>
              $1800—1900
            </text>
            <text x="480" y="260" textAnchor="middle" fontSize={36} fontWeight="900" fill={p.palette.muted}>
              亿美元 · 2026 年资本支出预期
            </text>
          </g>
          {/* Equity financing */}
          <g opacity={progress(f, 60, 130)}>
            <rect
              x="180"
              y="340"
              width="600"
              height="120"
              rx="24"
              fill="#f7d7cc"
              stroke={p.palette.ink}
              strokeWidth="7"
            />
            <text x="480" y="410" textAnchor="middle" fontSize="36" fontWeight="950">
              股权融资 ~850 亿美元
            </text>
          </g>
          {/* Gauge */}
          <g opacity={progress(f, 120, 200)}>
            <path
              d="M60 700 A420 420 0 0 1 900 700"
              fill="none"
              stroke={p.palette.ink}
              strokeWidth="20"
            />
            <path
              d="M60 700 A420 420 0 0 1 900 700"
              fill="none"
              pathLength={1}
              stroke={p.palette.accent}
              strokeDasharray={1}
              strokeDashoffset={1 - gauge}
              strokeWidth="20"
            />
            <text x="480" y="750" textAnchor="middle" fontSize={32} fontWeight="950">
              资本回报审视
            </text>
            <text x="480" y="800" textAnchor="middle" fontSize={26} fontWeight="850" fill={p.palette.muted}>
              数据中心建了多少已经不够
            </text>
            <text x="480" y="850" textAnchor="middle" fontSize={26} fontWeight="850" fill={p.palette.muted}>
              投资者要求算力产生可持续收入
            </text>
          </g>
        </svg>
      </div>
      <Note x={400} y={1500} rotate={1} show={progress(f, scene.durationInFrames * 0.5, scene.durationInFrames * 0.7)}>
        Cloud 增长快，但 Gemini 延期
      </Note>
    </Page>
  );
};

/* ===== SCENE 5: SPECIALIZATION - Model routing ===== */
const Specialization: FC<{ scene: AiDaily20260721Scene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const route = [
    { label: "普通文本", model: "低成本模型", color: "#dceced" },
    { label: "编码任务", model: "编程模型", color: "#f6e5b7" },
    { label: "网络安全", model: "Cyber 模型", color: "#f7d7cc" },
    { label: "图像/文档", model: "多模态模型", color: "#d9edd7" },
    { label: "复杂任务", model: "旗舰推理模型", color: "#ead9e7" },
  ];

  return (
    <Page>
      <Title index="04 · MODEL SPECIALIZATION" title="模型路由取代单一 API" />
      <div style={{ left: 60, position: "absolute", top: 280, width: 960 }}>
        <svg viewBox="0 0 960 1400" style={{ height: 1400, width: 960 }}>
          {/* Entry point */}
          <g opacity={progress(f, 10, 50)}>
            <rect
              x="330"
              y="0"
              width="300"
              height="90"
              rx="45"
              fill={p.palette.accent}
              stroke={p.palette.ink}
              strokeWidth="8"
            />
            <text x="480" y="55" textAnchor="middle" fontSize="34" fontWeight="950" fill={p.palette.surface}>
              请求进入
            </text>
          </g>
          {/* Router */}
          <g opacity={progress(f, 40, 90)}>
            <rect
              x="280"
              y="130"
              width="400"
              height="60"
              rx="30"
              fill={p.palette.surface}
              stroke={p.palette.secondary}
              strokeWidth="7"
            />
            <text x="480" y="168" textAnchor="middle" fontSize="30" fontWeight="950" fill={p.palette.secondary}>
              任务分类路由
            </text>
          </g>
          {/* Route lines */}
          {route.map((r, i) => {
            const show = progress(f, 70 + i * 40, 70 + i * 40 + 60);
            return (
              <g key={r.label} opacity={show}>
                <path
                  d={`M480 190 L${i % 2 === 0 ? 170 + i * 50 : 790 - (i - 3) * 50} ${250 + i * 100}`}
                  fill="none"
                  stroke={r.color}
                  strokeWidth="6"
                />
                <rect
                  x={i < 2 ? 30 : 630}
                  y={i < 2 ? 230 + i * 100 : 230 + (i - 2) * 100}
                  width="280"
                  height="80"
                  rx="16"
                  fill={r.color}
                  stroke={p.palette.ink}
                  strokeWidth="5"
                />
                <text
                  x={i < 2 ? 170 : 770}
                  y={i < 2 ? 270 + i * 100 : 270 + (i - 2) * 100}
                  textAnchor="middle"
                  fontSize="22"
                  fontWeight="950"
                >
                  {r.label}
                </text>
                <text
                  x={i < 2 ? 170 : 770}
                  y={i < 2 ? 295 + i * 100 : 295 + (i - 2) * 100}
                  textAnchor="middle"
                  fontSize="18"
                  fontWeight="800"
                  fill={p.palette.muted}
                >
                  {r.model}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <Note x={60} y={1530} rotate={-1} show={progress(f, scene.durationInFrames * 0.6, scene.durationInFrames * 0.75)}>
        成本控制成为新壁垒
      </Note>
    </Page>
  );
};

/* ===== SCENE 6: AGENT PAYMENTS ===== */
const AgentPayments: FC<{ scene: AiDaily20260721Scene }> = ({ scene: _scene }) => {
  const f = useCurrentFrame();
  const steps = [
    "身份认证", "权限委托", "供应商选择",
    "合同/订单", "支付", "发票与审计", "争议处理",
  ];

  return (
    <Page>
      <Title index="05 · AGENT PAYMENTS" title="Agent 开始花钱了" />
      <div style={{ left: 60, position: "absolute", top: 280, width: 960 }}>
        <div style={{ fontSize: 32, fontWeight: 950, marginBottom: 30, textAlign: "center" }}>
          Natural · 3000 万美元
        </div>
        <svg viewBox="0 0 960 1200" style={{ height: 1200, width: 960 }}>
          {/* Old loop */}
          <g opacity={progress(f, 10, 80)}>
            <rect
              x="80"
              y="0"
              width="360"
              height="260"
              rx="22"
              fill="#e7decb"
              stroke={p.palette.ink}
              strokeWidth="7"
            />
            <text x="260" y="60" textAnchor="middle" fontSize="30" fontWeight="950">
              现有支付系统
            </text>
            <text x="260" y="110" textAnchor="middle" fontSize="24" fontWeight="850" fill={p.palette.muted}>
              围绕人类交易设计
            </text>
            <Stroke
              d="M100 150 C150 210 260 210 300 150"
              show={progress(f, 30, 70)}
              color={p.palette.accent}
              width={8}
            />
            <text x="200" y="200" textAnchor="middle" fontSize="22" fontWeight="900">
              银行卡 · ACH · 网关
            </text>
          </g>
          {/* New loop */}
          <g opacity={progress(f, 80, 180)}>
            <rect
              x="520"
              y="0"
              width="360"
              height="260"
              rx="22"
              fill="#d9edd7"
              stroke={p.palette.secondary}
              strokeWidth="7"
            />
            <text x="700" y="60" textAnchor="middle" fontSize="30" fontWeight="950" fill={p.palette.secondary}>
              Agent 支付
            </text>
            <text x="700" y="110" textAnchor="middle" fontSize="24" fontWeight="850" fill={p.palette.muted}>
              自动 · 授权 · 审计
            </text>
          </g>
          {/* Steps */}
          <g opacity={progress(f, 150, 280)}>
            {steps.map((s, i) => (
              <g key={s}>
                <rect
                  x={i % 2 === 0 ? 60 + (i / 2) * 420 : 280 + Math.floor(i / 2) * 420}
                  y={330 + Math.floor(i / 2) * 110}
                  width="180"
                  height="60"
                  rx="12"
                  fill={i % 2 === 0 ? "#f7d7cc" : "#dceced"}
                  stroke={p.palette.ink}
                  strokeWidth="5"
                  opacity={progress(f, 150 + i * 30, 150 + i * 30 + 40)}
                />
                <text
                  x={i % 2 === 0 ? 150 + (i / 2) * 420 : 370 + Math.floor(i / 2) * 420}
                  y={i % 2 === 0 ? 368 + Math.floor(i / 2) * 110 : 368 + Math.floor(i / 2) * 110}
                  textAnchor="middle"
                  fontSize="24"
                  fontWeight="950"
                  opacity={progress(f, 150 + i * 30, 150 + i * 30 + 40)}
                >
                  {s}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </Page>
  );
};

/* ===== SCENE 7: PHYSICAL AI ===== */
const PhysicalAi: FC<{ scene: AiDaily20260721Scene }> = ({ scene: _scene }) => {
  const f = useCurrentFrame();
  const customers = ["制造", "物流", "零售"];
  const investors = ["Schaeffler", "Bosch"];

  return (
    <Page>
      <Title index="06 · PHYSICAL AI" title="人形机器人进入客户现场" />
      <div style={{ left: 60, position: "absolute", top: 280, width: 960 }}>
        <svg viewBox="0 0 960 1400" style={{ height: 1400, width: 960 }}>
          {/* Robot */}
          <g opacity={progress(f, 10, 80)}>
            <rect
              x="330"
              y="50"
              width="300"
              height="350"
              rx="40"
              fill="#dceced"
              stroke={p.palette.ink}
              strokeWidth="8"
            />
            <circle cx="480" cy="150" r="50" fill={p.palette.surface} stroke={p.palette.ink} strokeWidth="7" />
            <text x="480" y="160" textAnchor="middle" fontSize="28" fontWeight="950">
              Humanoid
            </text>
            <rect x="365" y="230" width="230" height="60" rx="10" fill={p.palette.surface} stroke={p.palette.ink} strokeWidth="5" />
            <text x="480" y="270" textAnchor="middle" fontSize="26" fontWeight="950">
              $152M A 轮
            </text>
            <text x="480" y="340" textAnchor="middle" fontSize="24" fontWeight="850" fill={p.palette.muted}>
              估值 $13.5 亿
            </text>
          </g>
          {/* Customers */}
          <g opacity={progress(f, 80, 160)}>
            <text x="480" y="480" textAnchor="middle" fontSize="30" fontWeight="950">
              第四季度部署 →
            </text>
            {customers.map((c, i) => (
              <rect
                key={c}
                x={80 + i * 290}
                y="520"
                width="220"
                height="80"
                rx="18"
                fill="#f7d7cc"
                stroke={p.palette.ink}
                strokeWidth="6"
              >
                <animate attributeName="opacity" values="0;1" dur="1s" begin={`${i * 0.3}s`} />
              </rect>
            ))}
            {customers.map((c, i) => (
              <text
                key={`t-${c}`}
                x={190 + i * 290}
                y="572"
                textAnchor="middle"
                fontSize="30"
                fontWeight="950"
                opacity={progress(f, 100 + i * 40, 100 + i * 40 + 50)}
              >
                {c}
              </text>
            ))}
          </g>
          {/* Investors */}
          <g opacity={progress(f, 180, 260)}>
            <text x="480" y="680" textAnchor="middle" fontSize="28" fontWeight="950" fill={p.palette.secondary}>
              工业资本入场
            </text>
            {investors.map((inv, i) => (
              <rect
                key={inv}
                x={200 + i * 360}
                y="710"
                width="240"
                height="80"
                rx="20"
                fill="#d9edd7"
                stroke={p.palette.secondary}
                strokeWidth="7"
              >
                <animate attributeName="opacity" values="0;1" dur="1s" begin={`${i * 0.3}s`} />
              </rect>
            ))}
            {investors.map((inv, i) => (
              <text
                key={`t-${inv}`}
                x={320 + i * 360}
                y="762"
                textAnchor="middle"
                fontSize="32"
                fontWeight="950"
                fill={p.palette.secondary}
                opacity={progress(f, 200 + i * 40, 200 + i * 40 + 50)}
              >
                {inv}
              </text>
            ))}
          </g>
        </svg>
      </div>
    </Page>
  );
};

/* ===== SCENE 8: EU REGULATION ===== */
const EuRegulation: FC<{ scene: AiDaily20260721Scene }> = ({ scene: _scene }) => {
  const f = useCurrentFrame();
  const items = [
    "告知用户正在与 AI 交互",
    "AI 内容加机器可读标记",
    "披露 Deepfake 内容",
    "披露未审查的公共利益 AI",
    "情绪识别 & 生物特征分类",
  ];

  return (
    <Page>
      <Title index="07 · EU AI ACT" title="内容溯源成为法律义务" />
      <div style={{ left: 60, position: "absolute", top: 280, width: 960 }}>
        {/* Deadline badge */}
        <div
          style={{
            background: p.palette.accent,
            border: `5px solid ${p.palette.ink}`,
            color: p.palette.surface,
            display: "inline-block",
            fontSize: 32,
            fontWeight: 950,
            left: 250,
            padding: "14px 28px",
            position: "absolute",
            rotate: "-3deg",
            top: 0,
            zIndex: 5,
          }}
        >
          2026.08.02 生效
        </div>
        <svg viewBox="0 0 960 1400" style={{ height: 1400, marginTop: 80, width: 960 }}>
          {/* Document */}
          <g opacity={progress(f, 10, 70)}>
            <rect
              x="30"
              y="0"
              width="900"
              height="560"
              rx="20"
              fill={p.palette.surface}
              stroke={p.palette.ink}
              strokeWidth="7"
            />
            <text x="480" y="60" textAnchor="middle" fontSize="34" fontWeight="950">
              第 50 条实施指南
            </text>
            <line x1="80" y1="80" x2="880" y2="80" stroke={p.palette.ink} strokeWidth="5" />
            {items.map((item, i) => (
              <g key={item} opacity={progress(f, 30 + i * 30, 30 + i * 30 + 40)}>
                <circle cx="80" cy={140 + i * 90} r="14" fill={p.palette.accent} stroke={p.palette.ink} strokeWidth="4" />
                <text x="115" y={148 + i * 90} fontSize="28" fontWeight="900">
                  {item}
                </text>
              </g>
            ))}
          </g>
          {/* Bottom note */}
          <g opacity={progress(f, 200, 280)}>
            <rect
              x="80"
              y="620"
              width="800"
              height="160"
              rx="24"
              fill="#f7d7cc"
              stroke={p.palette.ink}
              strokeWidth="8"
            />
            <text x="480" y="690" textAnchor="middle" fontSize="30" fontWeight="950">
              标记必须进入内容生产与导出流程
            </text>
            <text x="480" y="740" textAnchor="middle" fontSize="24" fontWeight="850" fill={p.palette.muted}>
              不只是界面上的一个标签
            </text>
          </g>
        </svg>
      </div>
    </Page>
  );
};

/* ===== SCENE 9: BLACKROCK × MGX ===== */
const Blackrock: FC<{ scene: AiDaily20260721Scene }> = ({ scene: _scene }) => {
  const f = useCurrentFrame();

  return (
    <Page>
      <Title index="08 · DATA CENTER CAPITAL" title="400 亿美元锁定数据中心" />
      <div style={{ left: 60, position: "absolute", top: 280, width: 960 }}>
        {/* Big number */}
        <div style={{ fontSize: 96, fontWeight: 950, textAlign: "center", color: p.palette.accent }}>
          $400 亿
        </div>
        <svg viewBox="0 0 960 1200" style={{ height: 1200, width: 960 }}>
          {/* Aligned Data Centers */}
          <g opacity={progress(f, 10, 80)}>
            <rect
              x="180"
              y="80"
              width="600"
              height="180"
              rx="28"
              fill="#dceced"
              stroke={p.palette.ink}
              strokeWidth="8"
            />
            <text x="480" y="150" textAnchor="middle" fontSize="38" fontWeight="950">
              Aligned Data Centers
            </text>
            <text x="480" y="200" textAnchor="middle" fontSize="26" fontWeight="850" fill={p.palette.muted}>
              51 个园区 · 6.4 GW 容量
            </text>
          </g>
          {/* Investors */}
          <g opacity={progress(f, 80, 160)}>
            <rect x="80" y="320" width="340" height="100" rx="20" fill="#f7d7cc" stroke={p.palette.ink} strokeWidth="7" />
            <text x="250" y="380" textAnchor="middle" fontSize="32" fontWeight="950">
              BlackRock
            </text>
            <rect x="540" y="320" width="340" height="100" rx="20" fill="#f6e5b7" stroke={p.palette.ink} strokeWidth="7" />
            <text x="710" y="380" textAnchor="middle" fontSize="32" fontWeight="950">
              MGX
            </text>
          </g>
          {/* Total */}
          <g opacity={progress(f, 160, 240)}>
            <rect
              x="210"
              y="500"
              width="540"
              height="120"
              rx="60"
              fill="#d9edd7"
              stroke={p.palette.secondary}
              strokeWidth="9"
            />
            <text x="480" y="570" textAnchor="middle" fontSize="36" fontWeight="950" fill={p.palette.secondary}>
              总部署规模可达 $1000 亿
            </text>
          </g>
          {/* Flow to infra */}
          <g opacity={progress(f, 220, 300)}>
            <text x="480" y="720" textAnchor="middle" fontSize="28" fontWeight="950">
              资本流向 →
            </text>
            {["土地", "电力", "冷却系统", "数据中心"].map((x, i) => (
              <rect
                key={x}
                x={60 + i * 220}
                y="760"
                width="180"
                height="70"
                rx="14"
                fill="#ead9e7"
                stroke={p.palette.ink}
                strokeWidth="6"
                opacity={progress(f, 240 + i * 20, 240 + i * 20 + 40)}
              />
            ))}
            {["土地", "电力", "冷却系统", "数据中心"].map((x, i) => (
              <text
                key={`t-${x}`}
                x={150 + i * 220}
                y="805"
                textAnchor="middle"
                fontSize="26"
                fontWeight="950"
                opacity={progress(f, 240 + i * 20, 240 + i * 20 + 40)}
              >
                {x}
              </text>
            ))}
          </g>
        </svg>
      </div>
    </Page>
  );
};

/* ===== SCENE 10: IQE - Photonics ===== */
const Iqe: FC<{ scene: AiDaily20260721Scene }> = ({ scene: _scene }) => {
  const f = useCurrentFrame();
  const nodes = [
    { label: "GPU", x: 480, y: 80, color: "#f7d7cc" },
    { label: "光模块", x: 200, y: 350, color: "#dceced" },
    { label: "光子器件", x: 480, y: 480, color: "#f6e5b7" },
    { label: "高速网络", x: 760, y: 350, color: "#d9edd7" },
    { label: "先进封装", x: 480, y: 620, color: "#ead9e7" },
  ];

  return (
    <Page>
      <Title index="09 · PHOTONICS SUPPLY" title="光通信成为新瓶颈" />
      <div style={{ left: 60, position: "absolute", top: 280, width: 960 }}>
        {/* IQE revenue */}
        <div
          style={{
            background: p.palette.surface,
            border: `5px solid ${p.palette.ink}`,
            boxShadow: `8px 9px 0 ${p.palette.secondary}35`,
            display: "inline-block",
            fontSize: 36,
            fontWeight: 950,
            left: 220,
            padding: "16px 28px",
            position: "absolute",
            rotate: "2deg",
            top: 0,
            zIndex: 5,
          }}
        >
          IQE 营收预期 &gt;30%
        </div>
        <svg viewBox="0 0 960 1100" style={{ height: 1100, marginTop: 100, width: 960 }}>
          {/* Supply chain nodes */}
          {nodes.map((n, i) => {
            const show = progress(f, 30 + i * 40, 30 + i * 40 + 60);
            return (
              <g key={n.label} opacity={show}>
                <circle cx={n.x} cy={n.y} r={80} fill={n.color} stroke={p.palette.ink} strokeWidth="7" />
                <text x={n.x} y={n.y - 8} textAnchor="middle" fontSize="28" fontWeight="950">
                  {n.label}
                </text>
                {i > 0 ? (
                  <Stroke
                    d={`M${nodes[0].x} ${nodes[0].y + 80} Q${n.x} ${n.y - 120} ${n.x} ${n.y - 80}`}
                    show={show}
                    color={p.palette.accent}
                    width={6}
                  />
                ) : null}
              </g>
            );
          })}
          {/* Bottom note */}
          <g opacity={progress(f, 260, 320)}>
            <rect
              x="140"
              y="800"
              width="680"
              height="120"
              rx="22"
              fill="#f7d7cc"
              stroke={p.palette.ink}
              strokeWidth="7"
            />
            <text x="480" y="860" textAnchor="middle" fontSize="28" fontWeight="950">
              磷化铟需求驱动增长
            </text>
            <text x="480" y="900" textAnchor="middle" fontSize="22" fontWeight="850" fill={p.palette.muted}>
              服务器间数据传输成为瓶颈
            </text>
          </g>
        </svg>
      </div>
    </Page>
  );
};

/* ===== SCENE 11: TRENDS SUMMARY ===== */
const Trends: FC<{ scene: AiDaily20260721Scene }> = ({ scene: _scene }) => {
  const f = useCurrentFrame();
  const trends = [
    "模型走向专业化",
    "成本成为核心指标",
    "主权 AI 商业化",
    "Agent 形成交易闭环",
    "物理 AI 进入部署期",
    "资本继续流向算力",
    "内容溯源成为法律要求",
  ];

  return (
    <Page>
      <Title index="TODAY'S SIGNALS" title="Agent 运行环境快速完整化" />
      <div style={{ left: 60, position: "absolute", top: 280, width: 960 }}>
        <svg viewBox="0 0 960 1500" style={{ height: 1500, width: 960 }}>
          {trends.map((t, i) => {
            const show = progress(f, 20 + i * 40, 20 + i * 40 + 60);
            return (
              <g key={t} opacity={show}>
                <rect
                  x={i % 2 === 0 ? 30 : 490}
                  y={i * 80}
                  width="440"
                  height="60"
                  rx="14"
                  fill={i % 3 === 0 ? "#f7d7cc" : i % 3 === 1 ? "#dceced" : "#f6e5b7"}
                  stroke={p.palette.ink}
                  strokeWidth="5"
                />
                <text
                  x={i % 2 === 0 ? 250 : 710}
                  y={i * 80 + 38}
                  textAnchor="middle"
                  fontSize="26"
                  fontWeight="950"
                >
                  {t}
                </text>
              </g>
            );
          })}
          {/* Bottom synthesis */}
          <g opacity={progress(f, 360, 460)}>
            <rect
              x="80"
              y="620"
              width="800"
              height="200"
              rx="30"
              fill="#d9edd7"
              stroke={p.palette.secondary}
              strokeWidth="9"
            />
            <text x="480" y="690" textAnchor="middle" fontSize="34" fontWeight="950" fill={p.palette.secondary}>
              运行环境 {'>'} 模型能力
            </text>
            <text x="480" y="750" textAnchor="middle" fontSize="26" fontWeight="850" fill={p.palette.muted}>
              轻量模型降本 · 主权 AI 选址 · Agent 支付 · 内容溯源
            </text>
          </g>
        </svg>
      </div>
    </Page>
  );
};

/* ===== SCENE 12: CLOSE ===== */
const Close: FC<{ scene: AiDaily20260721Scene }> = ({ scene: _scene }) => {
  const f = useCurrentFrame();
  const items = ["模型路由", "权限", "支付", "溯源", "稳定执行"];

  return (
    <Page>
      <Title index="FOR AGENT BUILDERS" title="更持久的基础设施" />
      <div style={{ left: 60, position: "absolute", top: 300, width: 960 }}>
        <svg viewBox="0 0 960 1200" style={{ height: 1200, width: 960 }}>
          {/* Foundation */}
          <g opacity={progress(f, 10, 60)}>
            <rect
              x="30"
              y="500"
              width="900"
              height="200"
              rx="16"
              fill={p.palette.surface}
              stroke={p.palette.ink}
              strokeWidth="8"
            />
            <text x="480" y="560" textAnchor="middle" fontSize="36" fontWeight="950">
              模型仍在快速变化
            </text>
            <text x="480" y="620" textAnchor="middle" fontSize="28" fontWeight="850" fill={p.palette.muted}>
              但以下将成为更持久的基础设施
            </text>
          </g>
          {/* Pillars */}
          {items.map((item, i) => {
            const show = progress(f, 60 + i * 40, 60 + i * 40 + 50);
            return (
              <g key={item} opacity={show}>
                <rect
                  x={40 + i * 175}
                  y="250"
                  width="150"
                  height="220"
                  rx="18"
                  fill={i % 2 === 0 ? "#f7d7cc" : "#dceced"}
                  stroke={p.palette.ink}
                  strokeWidth="7"
                />
                <text
                  x={115 + i * 175}
                  y={380}
                  textAnchor="middle"
                  fontSize="32"
                  fontWeight="950"
                  rotate="-90"
                >
                  {item}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Page>
  );
};

/* ===== Scene Router ===== */
export const AiDailySceneVisual: FC<{ scene: AiDaily20260721Scene }> = ({ scene }) => {
  const visuals: Record<string, FC<{ scene: AiDaily20260721Scene }>> = {
    open: Opening,
    google: Google,
    microsoft: Microsoft,
    alphabet: Alphabet,
    specialization: Specialization,
    "agent-payments": AgentPayments,
    "physical-ai": PhysicalAi,
    "eu-regulation": EuRegulation,
    blackrock: Blackrock,
    iqe: Iqe,
    trends: Trends,
    close: Close,
  };
  const Visual = visuals[scene.id];
  if (!Visual) return null;
  return <Visual scene={scene} />;
};
