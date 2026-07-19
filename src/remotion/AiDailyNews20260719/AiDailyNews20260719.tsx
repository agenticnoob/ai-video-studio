import { TransitionSeries } from "@remotion/transitions";
import type { FC, ReactNode } from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";

import { StandaloneBottomCaption } from "../standalone-video";
import { getProducerStyleProfile } from "../styles";
import { getProducerTransitionPreset } from "../transitions";
import { aiDailyNews20260719Audio } from "./audio.generated";
import { data, getDuration, buildSceneStarts } from "./data";
import { AiDailyNews20260719Soundtrack } from "./soundtrack";
import {
  AI_DAILY_NEWS_20260719_TRANSITION_IN_FRAMES,
  type Scene,
} from "./types";

const profile = getProducerStyleProfile("hand-drawn-explainer");
const sceneStarts = buildSceneStarts(data.scenes);

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const C = profile.palette;

// ── Paper background with hand-drawn texture ──

const PaperBackground: FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.background,
        backgroundImage: `
          radial-gradient(circle at 18% 22%, ${C.accent}0a 0%, transparent 32%),
          radial-gradient(circle at 82% 78%, ${C.secondary}08 0%, transparent 36%),
          repeating-linear-gradient(2deg, ${C.ink}035 0 2px, transparent 2px 18px)
        `,
        backgroundPosition: `${(f * 0.2) % 18}px ${(f * 0.2) % 18}px`,
      }}
    />
  );
};

// ── Hand-drawn sketchy border frame ──

const SketchFrame: FC<{ children: ReactNode; color?: string; delay?: number }> = ({
  children,
  color = C.ink,
  delay = 0,
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + 14], [0, 1], clamp);
  return (
    <div
      style={{
        border: `4px solid ${color}`,
        borderRadius: 24,
        boxShadow: `8px 8px 0 ${color}18`,
        opacity: interpolate(p, [0, 0.6, 1], [0, 0.3, 1], clamp),
        padding: "36px 32px",
        position: "relative",
        transform: `translateX(${(1 - p) * 14}px) rotate(${(1 - p) * 0.5}deg)`,
        width: "100%",
      }}
    >
      {children}
    </div>
  );
};

// ── Hand-drawn kicker label ──

const KickerTag: FC<{ text: string; color?: string; delay?: number }> = ({
  text,
  color = C.accent,
  delay = 0,
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + 10], [0, 1], clamp);
  return (
    <div
      style={{
        background: color,
        borderRadius: 4,
        color: "#fff",
        display: "inline-block",
        fontSize: 32,
        fontWeight: 800,
        letterSpacing: 3,
        opacity: p,
        padding: "8px 20px",
        transform: `rotate(-1.5deg) scale(${interpolate(p, [0, 0.7, 1], [0.8, 1.05, 1], clamp)})`,
      }}
    >
      {text}
    </div>
  );
};

// ── SVG annotation arrow ──

const AnnotationArrow: FC<{ delay?: number }> = ({ delay = 0 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + 12], [0, 1], clamp);
  return (
    <svg
      style={{
        height: 40,
        opacity: p,
        stroke: C.accent,
        strokeWidth: 3,
        fill: "none",
        strokeLinecap: "round",
        width: 100,
      }}
      viewBox="0 0 100 40"
    >
      <path
        d="M2,20 L98,20 M98,20 L80,4 M98,20 L80,36"
        strokeDasharray={p * 200}
        strokeDashoffset={200 - p * 200}
      />
    </svg>
  );
};

// ── Data badge (hand-drawn style) ──

const DataBadge: FC<{
  label: string;
  value: string;
  color?: string;
  delay?: number;
}> = ({ label, value, color = C.ink, delay = 0 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + 12], [0, 1], clamp);
  return (
    <div
      style={{
        background: C.surface,
        border: `4px solid ${color}`,
        borderRadius: 16,
        boxShadow: `6px 6px 0 ${color}25`,
        opacity: p,
        padding: "20px 16px",
        textAlign: "center" as const,
        transform: `scale(${interpolate(p, [0, 0.7, 1], [0.85, 1.08, 1], clamp)})`,
      }}
    >
      <div
        style={{
          color,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: 2,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ color: C.ink, fontSize: 56, fontWeight: 900 }}>{value}</div>
    </div>
  );
};

// ── Hand-drawn underline decoration ──

const DrawUnderline: FC<{ delay?: number; color?: string }> = ({
  delay = 0,
  color = C.accent,
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + 10], [0, 1], clamp);
  return (
    <div
      style={{
        background: color,
        borderRadius: 3,
        height: 6,
        margin: "12px 0 10px",
        width: `${p * 160}px`,
      }}
    />
  );
};

// ── Scene body renderer ──

const renderBody = (scene: Scene, idx: number): ReactNode => {
  switch (idx) {
    case 0: // open — thesis
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SketchFrame color={C.accent} delay={4}>
            <div style={{ color: C.ink, fontSize: 36, lineHeight: 1.5 }}>
              「模型竞赛 → 四个竞争层：算力交易 · 开放模型 · Agent 安全 · 运行责任」
            </div>
          </SketchFrame>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
            <DataBadge color={C.accent} label="算力交易" value="Meta→Anthropic" delay={10} />
            <DataBadge color={C.secondary} label="开放模型" value="Kimi K3" delay={14} />
            <DataBadge color={C.ink} label="Agent 安全" value="VulnHunter" delay={18} />
            <DataBadge color={C.muted} label="运行责任" value="澳洲监管" delay={22} />
          </div>
        </div>
      );

    case 1: // meta-anthropic compute deal
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SketchFrame color={C.secondary} delay={4}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ color: C.secondary, fontSize: 60, fontWeight: 900 }}>$10B</span>
              <AnnotationArrow delay={4} />
            </div>
            <div style={{ color: C.ink, fontSize: 34, lineHeight: 1.5, marginTop: 12 }}>
              Meta 从云客户变成云供应商，Anthropic 分散算力依赖
            </div>
          </SketchFrame>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
            <DataBadge color={C.secondary} label="金额" value="$100亿" delay={10} />
            <DataBadge color={C.ink} label="意义" value="算力商品化" delay={14} />
          </div>
        </div>
      );

    case 2: // vulnhunter
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SketchFrame color={C.accent} delay={4}>
            <div style={{ color: C.ink, fontSize: 34, lineHeight: 1.5 }}>
              Agent 安全分析链：<br />
              <span style={{ color: C.accent, fontWeight: 800 }}>
                理解代码 → 查找入口 → 追踪数据流 → 判断可利用性 → 构建攻击路径 → 修复
              </span>
            </div>
          </SketchFrame>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <DataBadge color={C.accent} label="许可证" value="Apache 2.0" delay={10} />
            <DataBadge color={C.ink} label="定位" value="Agent 安全" delay={14} />
          </div>
        </div>
      );

    case 3: // kimi k3
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
            <DataBadge color={C.accent} label="参数量" value="2.8T" delay={4} />
            <DataBadge color={C.secondary} label="上下文" value="100万T" delay={8} />
            <DataBadge color={C.ink} label="模式" value="开放权重" delay={12} />
            <DataBadge color={C.muted} label="架构" value="万亿MoE" delay={16} />
          </div>
          <SketchFrame color={C.muted} delay={10}>
            <div style={{ color: C.muted, fontSize: 30, lineHeight: 1.5 }}>
              总参数 ≠ 推理质量 · 开放 ≠ 可本地运行 · 基准 ≠ 生产可靠性
            </div>
          </SketchFrame>
        </div>
      );

    case 4: // australia regulation
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SketchFrame color={C.muted} delay={4}>
            <div style={{ color: C.ink, fontSize: 32, lineHeight: 1.5 }}>
              监管从模型安全扩展到完整运行环境
            </div>
            <DrawUnderline delay={8} color={C.muted} />
            <div style={{ color: C.muted, fontSize: 28, lineHeight: 1.6, marginTop: 8 }}>
              • 训练数据合法性<br />
              • 自动决策可申诉<br />
              • 人类保留最终责任<br />
              • 基础设施成本归属
            </div>
          </SketchFrame>
        </div>
      );

    case 5: // databricks
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SketchFrame color={C.secondary} delay={4}>
            <div style={{ color: C.secondary, fontSize: 40, fontWeight: 900, letterSpacing: 4, marginBottom: 8 }}>
              Databricks
            </div>
            <div style={{ color: C.ink, fontSize: 96, fontWeight: 900, letterSpacing: -4, lineHeight: 1 }}>
              $1880亿
            </div>
            <DrawUnderline delay={6} color={C.secondary} />
            <div style={{ color: C.muted, fontSize: 28, marginTop: 8 }}>
              数据层比模型更稳定
            </div>
          </SketchFrame>
        </div>
      );

    case 6: // csquare ipo
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
            <DataBadge color={C.accent} label="融资额" value="$10.5亿" delay={4} />
            <DataBadge color={C.muted} label="发行价" value="$21" delay={8} />
            <DataBadge color={C.ink} label="低于目标" value="-$2~6" delay={12} />
            <DataBadge color={C.secondary} label="估值" value="$32.5亿" delay={16} />
          </div>
          <SketchFrame color={C.muted} delay={10}>
            <div style={{ color: C.muted, fontSize: 30, lineHeight: 1.5 }}>
              「投资者仍然看好 AI 基建，但开始关注债务、利用率和盈利能力」
            </div>
          </SketchFrame>
        </div>
      );

    case 7: // trend summary
      return (
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <DataBadge color={C.secondary} label="算力商品化" value="Meta→Anthropic" delay={2} />
          <DataBadge color={C.accent} label="开放模型" value="2.8T 参数" delay={6} />
          <DataBadge color={C.ink} label="Agent 安全" value="VulnHunter" delay={10} />
          <DataBadge color={C.muted} label="监管重点" value="澳洲立法" delay={14} />
          <DataBadge color={C.secondary} label="数据平台" value="$1880亿" delay={18} />
          <DataBadge color={C.accent} label="基建纪律" value="Csquare IPO" delay={22} />
        </div>
      );

    case 8: // close — developer signals
      return (
        <SketchFrame color={C.accent} delay={4}>
          <div style={{ color: C.ink, fontSize: 34, lineHeight: 1.6, fontWeight: 800 }}>
            「Agent 的长期价值正在从自主性转向可验证的自主性。」
          </div>
          <DrawUnderline delay={8} />
          <div style={{ color: C.muted, fontSize: 28, lineHeight: 1.5, marginTop: 12 }}>
            ✓ 明确授权 → ✓ 证据链 → ✓ 人工确认 →<br />
            ✓ 系统可替换 → ✓ 完整记录 → ✓ 成本可计算
          </div>
        </SketchFrame>
      );
  }
};

// ── Scene renderer ──

const SceneRenderer: FC<{ scene: Scene; idx: number }> = ({ scene, idx }) => {
  const f = useCurrentFrame();
  const fade = interpolate(f, [0, 10], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: C.background, overflow: "hidden" }}>
      <PaperBackground />

      {/* Kicker tag */}
      <div
        style={{
          left: 120,
          opacity: fade,
          position: "absolute",
          top: 60,
          zIndex: 10,
        }}
      >
        <KickerTag text={scene.kicker} color={idx % 2 === 0 ? C.accent : C.secondary} />
      </div>

      {/* Headline */}
      <div
        style={{
          left: 120,
          opacity: fade,
          position: "absolute",
          top: 130,
          width: 1680,
        }}
      >
        <h1
          style={{
            color: C.ink,
            fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", sans-serif',
            fontSize: idx === 0 ? 82 : 72,
            fontWeight: 900,
            letterSpacing: -1,
            lineHeight: 1.08,
            margin: 0,
          }}
        >
          {scene.headline}
        </h1>
        <DrawUnderline
          color={idx % 2 === 0 ? C.accent : C.secondary}
          delay={4}
        />
        <p
          style={{
            color: C.muted,
            fontSize: 32,
            lineHeight: 1.3,
            margin: 0,
          }}
        >
          {scene.supportingText}
        </p>
      </div>

      {/* Body content */}
      <div
        style={{
          inset: "340px 120px 140px",
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          opacity: fade,
        }}
      >
        {renderBody(scene, idx)}
      </div>

      {/* Captions */}
      <StandaloneBottomCaption
        captions={scene.captions}
        variant="landscape"
        style={{
          background: C.surface,
          border: `4px solid ${scene.accent}`,
          borderRadius: 40,
          bottom: 60,
          color: C.ink,
          fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", sans-serif',
          fontSize: 36,
          fontWeight: 700,
          left: 120,
          padding: "12px 28px",
          right: 120,
          textAlign: "center",
        }}
      />
    </AbsoluteFill>
  );
};

// ── Transition preset helper ──

const getSlide = (direction: "from-right" | "from-left") =>
  getProducerTransitionPreset({
    id: "directional-slide",
    direction,
    durationInFrames: AI_DAILY_NEWS_20260719_TRANSITION_IN_FRAMES,
  });

// ── Main composition with explicit TransitionSeries children ──

export const AiDailyNews20260719Video: FC = () => {
  const totalDuration = getDuration(data);
  const audioTracks = aiDailyNews20260719Audio;
  const scenes = data.scenes;

  return (
    <AbsoluteFill style={{ background: C.background }}>
      <PaperBackground />
      {audioTracks.map((track, index) => (
        <Sequence
          key={track.sceneId}
          durationInFrames={track.durationInFrames}
          from={sceneStarts[index]}
        >
          <Audio
            src={staticFile(track.audioFile)}
          />
        </Sequence>
      ))}
      <TransitionSeries>
        <TransitionSeries.Sequence
          durationInFrames={scenes[0].durationInFrames + AI_DAILY_NEWS_20260719_TRANSITION_IN_FRAMES}
        >
          <SceneRenderer scene={scenes[0]} idx={0} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={getSlide("from-right").presentation}
          timing={getSlide("from-right").timing}
        />
        <TransitionSeries.Sequence
          durationInFrames={scenes[1].durationInFrames + AI_DAILY_NEWS_20260719_TRANSITION_IN_FRAMES}
        >
          <SceneRenderer scene={scenes[1]} idx={1} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={getSlide("from-left").presentation}
          timing={getSlide("from-left").timing}
        />
        <TransitionSeries.Sequence
          durationInFrames={scenes[2].durationInFrames + AI_DAILY_NEWS_20260719_TRANSITION_IN_FRAMES}
        >
          <SceneRenderer scene={scenes[2]} idx={2} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={getSlide("from-right").presentation}
          timing={getSlide("from-right").timing}
        />
        <TransitionSeries.Sequence
          durationInFrames={scenes[3].durationInFrames + AI_DAILY_NEWS_20260719_TRANSITION_IN_FRAMES}
        >
          <SceneRenderer scene={scenes[3]} idx={3} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={getSlide("from-left").presentation}
          timing={getSlide("from-left").timing}
        />
        <TransitionSeries.Sequence
          durationInFrames={scenes[4].durationInFrames + AI_DAILY_NEWS_20260719_TRANSITION_IN_FRAMES}
        >
          <SceneRenderer scene={scenes[4]} idx={4} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={getSlide("from-right").presentation}
          timing={getSlide("from-right").timing}
        />
        <TransitionSeries.Sequence
          durationInFrames={scenes[5].durationInFrames + AI_DAILY_NEWS_20260719_TRANSITION_IN_FRAMES}
        >
          <SceneRenderer scene={scenes[5]} idx={5} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={getSlide("from-left").presentation}
          timing={getSlide("from-left").timing}
        />
        <TransitionSeries.Sequence
          durationInFrames={scenes[6].durationInFrames + AI_DAILY_NEWS_20260719_TRANSITION_IN_FRAMES}
        >
          <SceneRenderer scene={scenes[6]} idx={6} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={getSlide("from-right").presentation}
          timing={getSlide("from-right").timing}
        />
        <TransitionSeries.Sequence
          durationInFrames={scenes[7].durationInFrames + AI_DAILY_NEWS_20260719_TRANSITION_IN_FRAMES}
        >
          <SceneRenderer scene={scenes[7]} idx={7} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={getSlide("from-left").presentation}
          timing={getSlide("from-left").timing}
        />
        <TransitionSeries.Sequence
          durationInFrames={scenes[8].durationInFrames + 8}
        >
          <SceneRenderer scene={scenes[8]} idx={8} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <AiDailyNews20260719Soundtrack durationInFrames={totalDuration} />
    </AbsoluteFill>
  );
};