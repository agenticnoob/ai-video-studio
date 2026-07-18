import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";

import { StandaloneBottomCaption, StandaloneTimeline } from "../standalone-video";
import { getStandaloneDurationInFrames } from "../standalone-video/timeline";
import { data } from "./data";
import { type Data, type Scene } from "./types";
import { AiDailyNews20260717Soundtrack } from "./soundtrack";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const C = {
  bg: "#fff1bd", ink: "#24162d", muted: "#6a3b56",
  accent: "#ff3d6e", blue: "#2b8cff", white: "#fffbe6",
  green: "#34d399", gold: "#f5c542", purple: "#a78bfa",
  orange: "#fdba74", cyan: "#22d3ee", red: "#ff5d5d",
};

const fullFrame: CSSProperties = {
  background: C.bg, color: C.ink,
  fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", sans-serif',
  overflow: "hidden",
};

export const getDuration = (_data: Data): number => getStandaloneDurationInFrames(_data.scenes);

const PageBg: FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      backgroundImage: `
        radial-gradient(circle, ${C.accent}18 0%, transparent 60%),
        radial-gradient(circle at 92% 90%, ${C.blue}10 0%, transparent 50%),
        radial-gradient(circle, ${C.accent}20 1.5px, transparent 1.5px)
      `,
      backgroundSize: "28px 28px",
      backgroundPosition: `${(f * 0.5) % 28}px ${(f * 0.5) % 28}px`,
    }} />
  );
};

const Block: FC<{ children: ReactNode; color?: string; delay?: number; style?: CSSProperties }> = ({
  children, color = C.ink, delay = 0, style
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + 12], [0, 1], clamp);
  return (
    <div style={{
      background: `${color}10`, borderLeft: `10px solid ${color}`,
      opacity: interpolate(p, [0, 0.6, 1], [0, 0.3, 1], clamp),
      padding: "44px 36px",
      transform: `translateX(${(1 - p) * 12}px)`,
      ...style,
    }}>
      {children}
    </div>
  );
};

const Badge: FC<{ color: string; label: string; value: string; delay?: number }> = ({
  color, label, value, delay = 0
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + 12], [0, 1], clamp);
  return (
    <div style={{
      background: C.white, border: `5px solid ${color}`,
      borderRadius: 999, boxShadow: `5px 5px 0 ${color}55`,
      opacity: p, padding: "28px 18px", textAlign: "center",
      transform: `scale(${interpolate(p, [0, 0.7, 1], [0.7, 1.1, 1], clamp)})`,
    }}>
      <div style={{ color, fontSize: 40, fontWeight: 900, letterSpacing: 3, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ color: C.ink, fontSize: 72, fontWeight: 900 }}>{value}</div>
    </div>
  );
};

// ─── Scene content ────────────────────────────────────────

const renderBody = (scene: Scene, idx: number): ReactNode => {
  switch (idx) {
    case 0:
      return (
        <Block color={C.blue} delay={4} style={{ padding: "56px 44px" }}>
          <div style={{ fontSize: 48, lineHeight: 1.4 }}>
            「模型能力继续快速提升，但资本市场已经开始追问投入回报、基础设施成本和实际任务完成率。」
          </div>
        </Block>
      );
    case 1:
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
            <Badge color={C.accent} label="参数量" value="2.8T" delay={4} />
            <Badge color={C.blue} label="上下文" value="100万T" delay={8} />
            <Badge color={C.green} label="模式" value="开放权重" delay={12} />
            <Badge color={C.gold} label="架构" value="万亿MoE" delay={16} />
          </div>
          <Block color={C.muted} delay={10} style={{ padding: "24px 28px" }}>
            <div style={{ fontSize: 38, lineHeight: 1.4, color: C.muted }}>
              总参数量 ≠ 推理质量 · 开放权重 ≠ 可本地运行 · 基准 ≠ 生产可靠性
            </div>
          </Block>
        </div>
      );
    case 2:
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Block color={C.gold} delay={4} style={{ padding: "40px 36px" }}>
            <div style={{ color: C.gold, fontSize: 40, fontWeight: 900, marginBottom: 12 }}>▌ 美国银行</div>
            <div style={{ fontSize: 40, lineHeight: 1.35 }}>
              设立 AI 转型管理层，投入数十亿美元，AI 从员工工具进入核心业务流程
            </div>
          </Block>
          <Block color={C.blue} delay={10} style={{ padding: "40px 36px" }}>
            <div style={{ color: C.blue, fontSize: 40, fontWeight: 900, marginBottom: 12 }}>▌ OpenAI 新框架</div>
            <div style={{ fontSize: 40, lineHeight: 1.35 }}>
              成功任务总成本 → Token 单价不再是核心标准
            </div>
          </Block>
        </div>
      );
    case 3:
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Block color={C.purple} delay={4} style={{ padding: "40px 36px" }}>
            <div style={{ color: C.purple, fontSize: 40, fontWeight: 900, marginBottom: 12 }}>▌ 开放模型 → 闭源</div>
            <div style={{ fontSize: 40, lineHeight: 1.35 }}>
              Kimi K3 将开放权重推向 2.8T 参数级，与闭源差距加速缩小
            </div>
          </Block>
          <Block color={C.green} delay={10} style={{ padding: "40px 36px" }}>
            <div style={{ color: C.green, fontSize: 40, fontWeight: 900, marginBottom: 12 }}>▌ 软体机器人</div>
            <div style={{ fontSize: 40, lineHeight: 1.35 }}>
              气压驱动藤蔓结构，材料 + 传感器即可产生实际能力，无需大模型
            </div>
          </Block>
        </div>
      );
    case 4:
      return (
        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "1fr 1fr" }}>
          <Block color={C.accent} delay={4} style={{ padding: "32px 24px" }}>
            <div style={{ color: C.accent, fontSize: 40, fontWeight: 900, marginBottom: 16 }}>印尼版权法</div>
            <div style={{ fontSize: 36, lineHeight: 1.6 }}>
              • 训练需付费许可<br />• 禁止模仿独特风格<br />• AI 生成无版权
            </div>
          </Block>
          <Block color={C.orange} delay={10} style={{ padding: "32px 24px" }}>
            <div style={{ color: C.orange, fontSize: 40, fontWeight: 900, marginBottom: 16 }}>英国云监管</div>
            <div style={{ fontSize: 36, lineHeight: 1.6 }}>
              • AWS/Microsoft 关键第三方<br />• 韧性测试义务<br />• 中断必须报告
            </div>
          </Block>
        </div>
      );
    case 5:
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{
            background: `${C.orange}15`, borderLeft: `10px solid ${C.orange}`,
            padding: "40px 36px", textAlign: "center",
          }}>
            <div style={{ color: C.orange, fontSize: 40, fontWeight: 900, letterSpacing: 6, marginBottom: 8 }}>
              Databricks 估值
            </div>
            <div style={{ color: C.ink, fontSize: 140, fontWeight: 900, letterSpacing: -8, lineHeight: 1 }}>
              $1880亿
            </div>
          </div>
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
            <Badge color={C.gold} label="芯片拥挤度" value="82%" delay={6} />
            <Badge color={C.green} label="云资本支出" value="+76%" delay={10} />
          </div>
        </div>
      );
    case 6:
      return (
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
          <Badge color={C.cyan} label="开放模型" value="2.8T" delay={2} />
          <Badge color={C.green} label="企业 AI" value="组织化" delay={6} />
          <Badge color={C.gold} label="追赶闭源" value="差距缩小" delay={10} />
          <Badge color={C.red} label="版权监管" value="数据合规" delay={14} />
          <Badge color={C.orange} label="资本分化" value="$1880亿" delay={18} />
          <Badge color={C.purple} label="物理 AI" value="机器人" delay={22} />
        </div>
      );
    case 7:
      return (
        <Block color={C.accent} delay={4} style={{ borderLeftWidth: 12, padding: "56px 44px" }}>
          <div style={{ fontSize: 44, lineHeight: 1.4, fontWeight: 800 }}>
            「Agent 运行时、评估系统、权限控制、执行审计和模型路由，比单纯封装模型 API 更具长期价值。」
          </div>
        </Block>
      );
  }
};

const SceneRenderer: FC<{ scene: Scene; idx: number }> = ({ scene, idx }) => {
  const f = useCurrentFrame();
  const fade = interpolate(f, [0, 8], [0, 1], clamp);

  return (
    <AbsoluteFill style={fullFrame}>
      <PageBg />

      {/* ── TOP: Badge + Kicker ── */}
      <div style={{ left: 24, position: "absolute", top: 212, opacity: fade, zIndex: 10 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{
            background: C.accent, borderRadius: 4, color: C.white,
            fontSize: 40, fontWeight: 900, padding: "10px 24px", transform: "rotate(-2deg)",
          }}>
            {`#${idx + 1}`}
          </div>
          <div style={{
            background: C.blue, borderRadius: 4, color: C.white,
            fontSize: 40, fontWeight: 800, letterSpacing: 3, padding: "10px 24px", transform: "rotate(1deg)",
          }}>
            {scene.kicker}
          </div>
        </div>
      </div>

      {/* ── HEADLINE area ── */}
      <div style={{ left: 24, position: "absolute", top: 372, width: 1032, opacity: fade }}>
        <h1 style={{
          color: C.ink, fontSize: idx === 0 ? 96 : 86, fontWeight: 900,
          letterSpacing: -2, lineHeight: 1.06, margin: 0,
        }}>
          {scene.headline}
        </h1>
        <div style={{
          background: C.accent, borderRadius: 2, height: 8,
          margin: "16px 0 12px", width: interpolate(f, [0, 18], [0, 180], clamp),
        }} />
        <p style={{ color: C.muted, fontSize: 44, lineHeight: 1.3, margin: 0 }}>
          {scene.supportingText}
        </p>
      </div>

      {/* ── BODY: centered in the vast middle band ── */}
      <div style={{
        inset: "612px 24px 140px",
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        opacity: fade,
      }}>
        {renderBody(scene, idx)}
      </div>

      {/* ── CAPTION ── */}
      <StandaloneBottomCaption
        captions={scene.captions}
        variant="portrait"
        style={{
          background: C.white, border: `5px solid ${scene.accent}`,
          borderRadius: 999, bottom: 124, color: C.ink,
          fontSize: 44, fontWeight: 700, left: 16, right: 16, textAlign: "center",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Main ──────────────────────────────────────────────────

export const AiDailyNews20260717Video: FC = () => (
  <AbsoluteFill style={fullFrame}>
    <StandaloneTimeline
      scenes={data.scenes}
      renderAudio={(scene: Scene): ReactNode => (
        <Audio pauseWhenBuffering src={staticFile(scene.audioFile)} />
      )}
      renderScene={(scene: Scene): ReactNode => (
        <SceneRenderer scene={scene} idx={data.scenes.indexOf(scene)} />
      )}
      renderOverlay={<AiDailyNews20260717Soundtrack durationInFrames={getDuration(data)} />}
    />
  </AbsoluteFill>
);