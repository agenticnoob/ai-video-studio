import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import {
  CalloutGrid,
  Kicker,
  VideoPanel,
  type RemotionTheme,
  useEntranceProgress,
} from "../primitives";
import { StandaloneBottomCaption, StandaloneTimeline } from "../standalone-video";
import { getStandaloneDurationInFrames } from "../standalone-video/timeline";
import { data } from "./data";
import {
  COMPOSITION_ID,
  DURATION_IN_FRAMES,
  FPS,
  HEIGHT,
  WIDTH,
  type Data,
  type Scene,
} from "./types";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const palette = {
  background: "#07090D",
  panel: "rgba(13, 18, 25, 0.82)",
  panelStrong: "rgba(18, 25, 34, 0.94)",
  text: "#F8FAFC",
  muted: "#A7B0BE",
  cyan: "#22D3EE",
  green: "#34D399",
  yellow: "#F5C542",
  red: "#FF5D5D",
  violet: "#A78BFA",
  rose: "#F472B6",
  orange: "#FDBA74",
  teal: "#78F3C4",
  line: "rgba(248,250,252,0.16)",
};

const fullFrame: CSSProperties = {
  background:
    "linear-gradient(135deg, #07090D 0%, #111827 46%, #15110D 100%), radial-gradient(circle at 84% 16%, rgba(34,211,238,0.16), transparent 25%)",
  color: palette.text,
  fontFamily: 'Inter, "Noto Sans SC", ui-sans-serif, system-ui, sans-serif',
  overflow: "hidden",
};

const primitiveThemeFor = (primary: string, secondary = palette.cyan): RemotionTheme => ({
  background: palette.background,
  muted: palette.muted,
  panel: "rgba(13, 18, 25, 0.78)",
  primary,
  secondary,
  text: palette.text,
});

export const getDuration = (_data: Data): number => getStandaloneDurationInFrames(_data.scenes);

// ─── Shared Components ──────────────────────────────────────────────

const SourceTag: FC<{ readonly children: ReactNode; readonly tint?: string }> = ({
  children,
  tint = palette.cyan,
}) => (
  <div
    style={{
      alignItems: "center",
      background: `${tint}18`,
      border: `1px solid ${tint}80`,
      borderRadius: 999,
      color: tint,
      display: "inline-flex",
      fontSize: 22,
      fontWeight: 900,
      letterSpacing: 0,
      padding: "10px 18px",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

const FrameAccents: FC<{ readonly accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const slide = interpolate(frame, [0, 160], [-80, 0], clamp);

  return (
    <>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 16% 20%, ${accent}22, transparent 23%), radial-gradient(circle at 88% 78%, ${palette.green}14, transparent 28%)`,
        }}
      />
      <div
        style={{
          background: `linear-gradient(180deg, ${accent}, ${palette.cyan})`,
          height: 460,
          left: 82,
          opacity: 0.72,
          position: "absolute",
          top: 170,
          translate: `${slide}px 0`,
          width: 5,
        }}
      />
      <div
        style={{
          border: `1px solid ${accent}40`,
          height: 720,
          opacity: 0.26,
          position: "absolute",
          right: 110,
          rotate: "8deg",
          top: 90,
          width: 260,
        }}
      />
    </>
  );
};

const SceneShell: FC<{
  readonly children: ReactNode;
  readonly scene: Scene;
  readonly compactHeader?: boolean;
}> = ({ children, compactHeader = false, scene }) => (
  <AbsoluteFill style={fullFrame}>
    <FrameAccents accent={scene.accent} />
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compactHeader ? 24 : 38,
        height: "100%",
        justifyContent: "center",
        padding: compactHeader ? "86px 124px 130px" : "104px 132px 140px",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
        <SourceTag tint={scene.accent}>{scene.kicker}</SourceTag>
        <div style={{ color: palette.muted, fontSize: 24, fontWeight: 850 }}>2026-07-13</div>
      </div>
      {children}
    </div>
    <StandaloneBottomCaption captions={scene.captions} variant="landscape" />
  </AbsoluteFill>
);

const ContentCard3D: FC<{
  readonly children: ReactNode;
  readonly index?: number;
  readonly style?: CSSProperties;
  readonly tint: string;
}> = ({ children, index = 0, style, tint }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [12 + index * 8, 48 + index * 8], [0, 1], clamp);
  const float = interpolate(frame, [80, 190], [-8, 7], clamp) * (index % 2 ? -1 : 1);
  const rotateX = interpolate(enter, [0, 1], [22, 0], clamp);
  const rotateY = interpolate(enter, [0, 1], [-24, 0], clamp);
  const scale = interpolate(enter, [0, 1], [0.9, 1], clamp);
  const y = interpolate(enter, [0, 1], [54, float], clamp);

  return (
    <div style={{ perspective: 900, ...style }}>
      <div
        style={{
          background: `linear-gradient(150deg, ${tint}20, ${palette.panelStrong} 58%, rgba(255,255,255,0.04))`,
          border: `1px solid ${tint}78`,
          borderRadius: 8,
          boxShadow: `0 28px 90px ${tint}22`,
          opacity: enter,
          padding: 30,
          transform: `translateY(${y}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const BigTitle: FC<{ readonly children: ReactNode; readonly maxWidth?: number }> = ({
  children,
  maxWidth = 1160,
}) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [10, 46], [0, 1], clamp);

  return (
    <h1
      style={{
        color: palette.text,
        fontSize: 94,
        fontWeight: 980,
        letterSpacing: 0,
        lineHeight: 1,
        margin: 0,
        maxWidth,
        opacity: enter,
        translate: `0 ${interpolate(enter, [0, 1], [34, 0], clamp)}px`,
      }}
    >
      {children}
    </h1>
  );
};

const CompactTitle: FC<{ readonly children: ReactNode; readonly maxWidth?: number }> = ({
  children,
  maxWidth = 1160,
}) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [10, 42], [0, 1], clamp);

  return (
    <h1
      style={{
        color: palette.text,
        fontSize: 76,
        fontWeight: 980,
        letterSpacing: 0,
        lineHeight: 1.02,
        margin: 0,
        maxWidth,
        opacity: enter,
        translate: `0 ${interpolate(enter, [0, 1], [28, 0], clamp)}px`,
      }}
    >
      {children}
    </h1>
  );
};

const SupportingCopy: FC<{ readonly children: ReactNode; readonly maxWidth?: number }> = ({
  children,
  maxWidth = 1040,
}) => (
  <div
    style={{
      color: palette.muted,
      fontSize: 34,
      fontWeight: 760,
      lineHeight: 1.32,
      maxWidth,
    }}
  >
    {children}
  </div>
);

const PrimitivePanel: FC<{
  readonly children: ReactNode;
  readonly padding?: number | string;
  readonly style?: CSSProperties;
  readonly theme: RemotionTheme;
}> = ({ children, padding = "32px 36px", style, theme }) => {
  const entrance = useEntranceProgress(42, 180);

  return (
    <VideoPanel
      entrance={entrance}
      maxWidth="100%"
      padding={padding}
      style={{
        borderRadius: 8,
        boxShadow: `0 26px 86px ${theme.primary}18`,
        ...style,
      }}
      theme={theme}
    >
      {children}
    </VideoPanel>
  );
};

// ─── Scene Renderers ─────────────────────────────────────────────────

const ThesisScene: FC<{ readonly scene: Scene }> = ({ scene }) => (
  <SceneShell scene={scene}>
    <div
      style={{
        alignItems: "center",
        display: "grid",
        gap: 74,
        gridTemplateColumns: "1.05fr 0.95fr",
      }}
    >
      <div>
        <BigTitle>{scene.headline}</BigTitle>
        <div style={{ marginTop: 36 }}>
          <SupportingCopy>{scene.supportingText}</SupportingCopy>
        </div>
      </div>
      <div style={{ display: "grid", gap: 22 }}>
        {[
          ["基础设施", "电力 / 芯片 / 数据中心", palette.yellow],
          ["资本集中", "500亿 / 57亿 / 18亿美元", palette.cyan],
          ["社会治理", "电价 / 版权 / 就业影响", palette.green],
        ].map(([label, text, tint], index) => (
          <ContentCard3D index={index} key={label} tint={tint}>
            <div style={{ color: tint, fontSize: 24, fontWeight: 950 }}>{label}</div>
            <div
              style={{
                color: palette.text,
                fontSize: 42,
                fontWeight: 960,
                lineHeight: 1.1,
                marginTop: 14,
              }}
            >
              {text}
            </div>
          </ContentCard3D>
        ))}
      </div>
    </div>
  </SceneShell>
);

const InfrastructureScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
  const theme = primitiveThemeFor(scene.accent, palette.cyan);

  return (
    <SceneShell compactHeader scene={scene}>
      <div
        style={{
          alignItems: "stretch",
          display: "grid",
          gap: 54,
          gridTemplateColumns: "0.95fr 1.05fr",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28, justifyContent: "center" }}>
          <CompactTitle maxWidth={820}>{scene.headline}</CompactTitle>
          <div style={{ marginTop: 8 }}>
            <SupportingCopy maxWidth={820}>{scene.supportingText}</SupportingCopy>
          </div>
          <PrimitivePanel padding="28px 32px" theme={theme}>
            <CalloutGrid
              callouts={["5GW", "500亿美元", "50亿欧元", "6000亿美元"]}
              theme={theme}
            />
          </PrimitivePanel>
        </div>
        <div style={{ display: "grid", gap: 22 }}>
          <ContentCard3D tint={scene.accent}>
            <Kicker
              style={{ color: scene.accent, fontSize: 22, letterSpacing: 1.4, marginBottom: 22 }}
              theme={theme}
            >
              基础设施投资
            </Kicker>
            <div style={{ display: "grid", gap: 16 }}>
              {[
                ["Meta", "5GW Hyperion 数据中心", "500亿美元+"],
                ["Intel", "爱尔兰 Leixlip 工厂", "50亿欧元"],
                ["Meta 三年计划", "美国基础设施和就业", "6000亿美元"],
              ].map(([company, project, amount], index) => (
                <div
                  key={company}
                  style={{
                    alignItems: "center",
                    background: `${index === 0 ? scene.accent : palette.cyan}14`,
                    border: `1px solid ${index === 0 ? scene.accent : palette.cyan}55`,
                    borderRadius: 8,
                    display: "grid",
                    gap: 22,
                    gridTemplateColumns: "130px 1fr 160px",
                    minHeight: 80,
                    padding: "16px 22px",
                  }}
                >
                  <div
                    style={{
                      color: index === 0 ? scene.accent : palette.cyan,
                      fontSize: 34,
                      fontWeight: 980,
                      lineHeight: 1,
                    }}
                  >
                    {company}
                  </div>
                  <div style={{ color: palette.text, fontSize: 28, fontWeight: 860, lineHeight: 1.1 }}>
                    {project}
                  </div>
                  <div
                    style={{
                      color: palette.yellow,
                      fontSize: 28,
                      fontWeight: 980,
                      lineHeight: 1,
                      textAlign: "right",
                    }}
                  >
                    {amount}
                  </div>
                </div>
              ))}
            </div>
          </ContentCard3D>
        </div>
      </div>
    </SceneShell>
  );
};

const ConsumerAiScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
  return (
    <SceneShell scene={scene}>
      <div
        style={{
          alignItems: "center",
          display: "grid",
          gap: 64,
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        <div>
          <BigTitle maxWidth={820}>{scene.headline}</BigTitle>
          <div style={{ marginTop: 30 }}>
            <SupportingCopy maxWidth={820}>{scene.supportingText}</SupportingCopy>
          </div>
        </div>
        <div style={{ display: "grid", gap: 22 }}>
          <ContentCard3D tint={scene.accent}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  color: scene.accent,
                  fontSize: 64,
                  fontWeight: 980,
                  lineHeight: 1,
                  marginBottom: 12,
                }}
              >
                Waze
              </div>
              <div
                style={{
                  background: `${scene.accent}18`,
                  border: `1px solid ${scene.accent}60`,
                  borderRadius: 999,
                  color: scene.accent,
                  display: "inline-block",
                  fontSize: 22,
                  fontWeight: 900,
                  padding: "8px 20px",
                }}
              >
                对话式 AI 导航
              </div>
              <div style={{ color: palette.muted, fontSize: 22, fontWeight: 760, marginTop: 20 }}>
                自然语言报告路况 · 个性化体验
              </div>
              <div
                style={{
                  borderTop: `1px solid ${palette.line}`,
                  color: palette.text,
                  fontSize: 28,
                  fontWeight: 860,
                  marginTop: 20,
                  paddingTop: 20,
                }}
              >
                AI 交互面从对话框扩展到每次日常使用
              </div>
            </div>
          </ContentCard3D>
        </div>
      </div>
    </SceneShell>
  );
};

const AgentArchScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
  const theme = primitiveThemeFor(scene.accent, palette.cyan);

  return (
    <SceneShell compactHeader scene={scene}>
      <div
        style={{
          alignItems: "stretch",
          display: "grid",
          gap: 54,
          gridTemplateColumns: "0.9fr 1.1fr",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28, justifyContent: "center" }}>
          <CompactTitle maxWidth={760}>{scene.headline}</CompactTitle>
          <div style={{ marginTop: 8 }}>
            <SupportingCopy maxWidth={760}>{scene.supportingText}</SupportingCopy>
          </div>
          <PrimitivePanel padding="24px 28px" theme={theme}>
            <CalloutGrid
              callouts={["多子Agent", "并行执行", "工具调用", "自动验证"]}
              theme={theme}
            />
          </PrimitivePanel>
        </div>
        <div style={{ display: "grid", gap: 22 }}>
          <ContentCard3D tint={scene.accent}>
            <Kicker
              style={{ color: scene.accent, fontSize: 22, letterSpacing: 1.4, marginBottom: 22 }}
              theme={theme}
            >
              GPT-5.6 Sol · Ultra 模式
            </Kicker>
            <div style={{ display: "grid", gap: 14 }}>
              {[
                ["规划", "自动分解任务"],
                ["并行", "子 Agent 同时执行"],
                ["工具调用", "搜索 / 代码 / 分析"],
                ["验证", "结果汇总与检查"],
              ].map(([step, desc], index) => (
                <div
                  key={step}
                  style={{
                    alignItems: "center",
                    background: `${index === 1 ? scene.accent : palette.cyan}14`,
                    border: `1px solid ${index === 1 ? scene.accent : palette.cyan}55`,
                    borderRadius: 8,
                    display: "grid",
                    gap: 18,
                    gridTemplateColumns: "100px 1fr",
                    minHeight: 68,
                    padding: "14px 20px",
                  }}
                >
                  <div
                    style={{
                      color: index === 1 ? scene.accent : palette.cyan,
                      fontSize: 30,
                      fontWeight: 980,
                      lineHeight: 1,
                    }}
                  >
                    {step}
                  </div>
                  <div style={{ color: palette.text, fontSize: 28, fontWeight: 860, lineHeight: 1.1 }}>
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </ContentCard3D>
        </div>
      </div>
    </SceneShell>
  );
};

const RealTimeArchScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
  const layers = [
    { name: "实时交互层", desc: "全双工 · 低延迟 · 持续对话", tint: palette.cyan },
    { name: "规划层", desc: "任务分解 · 路由 · 编排", tint: palette.yellow },
    { name: "执行层", desc: "搜索 Agent · 工具 Agent · 推理模型", tint: palette.violet },
    { name: "验证层", desc: "结果检查 · 汇总 · 返回用户", tint: palette.green },
  ];

  return (
    <SceneShell compactHeader scene={scene}>
      <div
        style={{
          alignItems: "stretch",
          display: "grid",
          gap: 48,
          gridTemplateColumns: "0.85fr 1.15fr",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24, justifyContent: "center" }}>
          <CompactTitle maxWidth={700}>{scene.headline}</CompactTitle>
          <div style={{ marginTop: 8 }}>
            <SupportingCopy maxWidth={700}>{scene.supportingText}</SupportingCopy>
          </div>
        </div>
        <div style={{ display: "grid", gap: 14, justifyContent: "stretch" }}>
          {layers.map((layer, index) => (
            <ContentCard3D index={index} key={layer.name} tint={layer.tint}>
              <div
                style={{
                  alignItems: "center",
                  display: "grid",
                  gap: 24,
                  gridTemplateColumns: "190px 1fr",
                }}
              >
                <div
                  style={{
                    color: layer.tint,
                    fontSize: 30,
                    fontWeight: 980,
                    lineHeight: 1,
                  }}
                >
                  {layer.name}
                </div>
                <div
                  style={{
                    color: palette.text,
                    fontSize: 26,
                    fontWeight: 860,
                    lineHeight: 1.2,
                  }}
                >
                  {layer.desc}
                </div>
              </div>
            </ContentCard3D>
          ))}
          <div
            style={{
              color: palette.muted,
              fontSize: 22,
              fontWeight: 760,
              lineHeight: 1.3,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            GPT-Live 全双工 → 委托后端深度推理模型 → 验证 → 实时返回
          </div>
        </div>
      </div>
    </SceneShell>
  );
};

const PolicyPowerScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
  const theme = primitiveThemeFor(scene.accent, palette.red);

  return (
    <SceneShell compactHeader scene={scene}>
      <div
        style={{
          alignItems: "stretch",
          display: "grid",
          gap: 48,
          gridTemplateColumns: "0.9fr 1.1fr",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24, justifyContent: "center" }}>
          <CompactTitle maxWidth={780}>{scene.headline}</CompactTitle>
          <div style={{ marginTop: 8 }}>
            <SupportingCopy maxWidth={780}>{scene.supportingText}</SupportingCopy>
          </div>
        </div>
        <div style={{ display: "grid", gap: 22 }}>
          <ContentCard3D tint={scene.accent}>
            <Kicker
              style={{ color: scene.accent, fontSize: 22, letterSpacing: 1.4, marginBottom: 22 }}
              theme={theme}
            >
              白宫自愿承诺框架
            </Kicker>
            <div style={{ display: "grid", gap: 16 }}>
              {[
                ["发电成本", "AI 公司承担新增电力"],
                ["电网升级", "数据中心支付扩容费用"],
                ["预留容量", "运营商承担备用成本"],
                ["居民保护", "不转嫁给普通用户"],
              ].map(([label, desc], index) => (
                <div
                  key={label}
                  style={{
                    alignItems: "center",
                    background: `${index === 0 ? scene.accent : palette.orange}14`,
                    border: `1px solid ${index === 0 ? scene.accent : palette.orange}55`,
                    borderRadius: 8,
                    display: "grid",
                    gap: 18,
                    gridTemplateColumns: "130px 1fr",
                    minHeight: 64,
                    padding: "14px 20px",
                  }}
                >
                  <div
                    style={{
                      color: index === 0 ? scene.accent : palette.orange,
                      fontSize: 28,
                      fontWeight: 980,
                      lineHeight: 1,
                    }}
                  >
                    {label}
                  </div>
                  <div style={{ color: palette.text, fontSize: 26, fontWeight: 860, lineHeight: 1.1 }}>
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </ContentCard3D>
        </div>
      </div>
    </SceneShell>
  );
};

const RegulationScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
  const theme = primitiveThemeFor(scene.accent, palette.orange);

  return (
    <SceneShell compactHeader scene={scene}>
      <div
        style={{
          alignItems: "stretch",
          display: "grid",
          gap: 44,
          gridTemplateColumns: "0.9fr 1.1fr",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24, justifyContent: "center" }}>
          <CompactTitle maxWidth={780}>{scene.headline}</CompactTitle>
          <div style={{ marginTop: 8 }}>
            <SupportingCopy maxWidth={780}>{scene.supportingText}</SupportingCopy>
          </div>
          <PrimitivePanel padding="24px 28px" theme={theme}>
            <CalloutGrid
              callouts={["版权退出", "机器可读", "经济影响", "政策制度"]}
              theme={theme}
            />
          </PrimitivePanel>
        </div>
        <div style={{ display: "grid", gap: 22 }}>
          <ContentCard3D tint={scene.accent}>
            <Kicker
              style={{ color: scene.accent, fontSize: 22, letterSpacing: 1.4, marginBottom: 22 }}
              theme={theme}
            >
              两条监管线
            </Kicker>
            <div style={{ display: "grid", gap: 16 }}>
              <div
                style={{
                  background: `${palette.orange}14`,
                  border: `1px solid ${palette.orange}55`,
                  borderRadius: 8,
                  padding: "18px 22px",
                }}
              >
                <div style={{ color: palette.orange, fontSize: 28, fontWeight: 980, marginBottom: 10 }}>
                  欧盟 · 训练数据版权退出
                </div>
                <div style={{ color: palette.text, fontSize: 24, fontWeight: 760, lineHeight: 1.3 }}>
                  建立统一登记系统，版权所有者可声明作品不可用于训练。未来数据合规不只是有没有版权，还包括能否机器化读取退出声明。
                </div>
              </div>
              <div
                style={{
                  background: `${palette.yellow}14`,
                  border: `1px solid ${palette.yellow}55`,
                  borderRadius: 8,
                  padding: "18px 22px",
                }}
              >
                <div style={{ color: palette.yellow, fontSize: 28, fontWeight: 980, marginBottom: 10 }}>
                  200+ 专家 · AI 经济影响
                </div>
                <div style={{ color: palette.text, fontSize: 24, fontWeight: 760, lineHeight: 1.3 }}>
                  包括 15 名诺贝尔奖得主，呼吁政府提前建立应对 AI 经济转型的政策制度。转型可能比工业革命更大，适应时间只有数年。
                </div>
              </div>
            </div>
          </ContentCard3D>
        </div>
      </div>
    </SceneShell>
  );
};

const DefenseCapitalScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
  const theme = primitiveThemeFor(scene.accent, palette.rose);

  return (
    <SceneShell compactHeader scene={scene}>
      <div
        style={{
          alignItems: "stretch",
          display: "grid",
          gap: 48,
          gridTemplateColumns: "0.9fr 1.1fr",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24, justifyContent: "center" }}>
          <CompactTitle maxWidth={780}>{scene.headline}</CompactTitle>
          <div style={{ marginTop: 8 }}>
            <SupportingCopy maxWidth={780}>{scene.supportingText}</SupportingCopy>
          </div>
          <PrimitivePanel padding="24px 28px" theme={theme}>
            <CalloutGrid
              callouts={["18亿美元", "180亿估值", "E轮融资", "国防AI赛道"]}
              theme={theme}
            />
          </PrimitivePanel>
        </div>
        <div style={{ display: "grid", gap: 22 }}>
          <ContentCard3D tint={scene.accent}>
            <Kicker
              style={{ color: scene.accent, fontSize: 22, letterSpacing: 1.4, marginBottom: 22 }}
              theme={theme}
            >
              Helsing 业务扩展
            </Kicker>
            <div style={{ display: "grid", gap: 14 }}>
              {[
                ["战场数据分析", "核心能力起点"],
                ["自主无人机", "空中作战系统"],
                ["水下监控", "海域防御"],
                ["军用航空系统", "实时目标识别"],
              ].map(([area, desc], index) => (
                <div
                  key={area}
                  style={{
                    alignItems: "center",
                    background: `${index === 0 ? scene.accent : palette.rose}14`,
                    border: `1px solid ${index === 0 ? scene.accent : palette.rose}55`,
                    borderRadius: 8,
                    display: "grid",
                    gap: 18,
                    gridTemplateColumns: "160px 1fr",
                    minHeight: 60,
                    padding: "12px 20px",
                  }}
                >
                  <div
                    style={{
                      color: index === 0 ? scene.accent : palette.rose,
                      fontSize: 26,
                      fontWeight: 980,
                      lineHeight: 1,
                    }}
                  >
                    {area}
                  </div>
                  <div style={{ color: palette.text, fontSize: 24, fontWeight: 860, lineHeight: 1.1 }}>
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </ContentCard3D>
        </div>
      </div>
    </SceneShell>
  );
};

const SovereigntyScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
  return (
    <SceneShell scene={scene}>
      <div
        style={{
          alignItems: "center",
          display: "grid",
          gap: 64,
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        <div>
          <BigTitle maxWidth={820}>{scene.headline}</BigTitle>
          <div style={{ marginTop: 30 }}>
            <SupportingCopy maxWidth={820}>{scene.supportingText}</SupportingCopy>
          </div>
        </div>
        <div style={{ display: "grid", gap: 22 }}>
          <ContentCard3D tint={scene.accent}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  color: palette.yellow,
                  fontSize: 36,
                  fontWeight: 980,
                  lineHeight: 1,
                  marginBottom: 16,
                }}
              >
                🇨🇳 中国
              </div>
              <div
                style={{
                  color: palette.text,
                  fontSize: 28,
                  fontWeight: 860,
                  lineHeight: 1.3,
                  marginBottom: 20,
                }}
              >
                习近平首次现场出席 WAIC 2026
              </div>
              <div
                style={{
                  borderTop: `1px solid ${palette.line}`,
                  color: palette.muted,
                  fontSize: 22,
                  fontWeight: 760,
                  paddingTop: 16,
                }}
              >
                AI 被提升到经济增长、产业竞争和全球规则制定层面
              </div>
              <div
                style={{
                  borderTop: `1px solid ${palette.line}`,
                  color: palette.muted,
                  fontSize: 22,
                  fontWeight: 760,
                  marginTop: 12,
                  paddingTop: 12,
                }}
              >
                讨论限制最先进模型向海外开放
              </div>
            </div>
          </ContentCard3D>
          <ContentCard3D index={1} tint={palette.cyan}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  color: palette.red,
                  fontSize: 28,
                  fontWeight: 980,
                  lineHeight: 1,
                  marginBottom: 10,
                }}
              >
                中美 AI 战略趋同
              </div>
              <div
                style={{
                  color: palette.text,
                  fontSize: 24,
                  fontWeight: 760,
                  lineHeight: 1.3,
                }}
              >
                先进模型 → 国家级战略资产 → 类似芯片和军事技术管控
              </div>
            </div>
          </ContentCard3D>
        </div>
      </div>
    </SceneShell>
  );
};

const SummaryMatrixScene: FC<{ readonly scene: Scene }> = ({ scene }) => (
  <SceneShell compactHeader scene={scene}>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        justifyContent: "center",
        height: "70%",
      }}
    >
      <CompactTitle maxWidth={1400}>{scene.headline}</CompactTitle>
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr", marginTop: 16 }}>
        {[
          ["AI 竞争基础设施化", "电力和芯片成为核心壁垒", palette.yellow, "Meta 5GW · Intel 57亿"],
          ["Agent 架构分层", "单模型→多模型编排", palette.cyan, "GPT-Live · GPT-5.6 Ultra"],
          ["监管对象扩大", "合规从模型层进入产业链", palette.orange, "电价 · 版权 · 就业"],
          ["资本继续集中", "国防 AI 成独立赛道", palette.rose, "Helsing 180亿估值"],
          ["AI 主权化", "全球统一模型可能分区", palette.green, "中美欧均强化控制"],
        ].map(([trend, impact, tint, signal], index) => (
          <ContentCard3D index={index} key={trend} tint={tint as string}>
            <div
              style={{
                alignItems: "center",
                display: "grid",
                gap: 16,
                gridTemplateColumns: "1.2fr 1fr 0.8fr",
              }}
            >
              <div>
                <div style={{ color: tint as string, fontSize: 22, fontWeight: 980, lineHeight: 1 }}>
                  {trend}
                </div>
                <div style={{ color: palette.muted, fontSize: 18, fontWeight: 760, marginTop: 6 }}>
                  {impact}
                </div>
              </div>
              <div style={{ color: palette.text, fontSize: 20, fontWeight: 860 }}>{signal}</div>
            </div>
          </ContentCard3D>
        ))}
      </div>
    </div>
  </SceneShell>
);

const ClosingScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
  return (
    <SceneShell scene={scene}>
      <div
        style={{
          alignItems: "center",
          display: "grid",
          gap: 64,
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        <div>
          <BigTitle maxWidth={840}>{scene.headline}</BigTitle>
          <div style={{ marginTop: 30 }}>
            <SupportingCopy maxWidth={840}>{scene.supportingText}</SupportingCopy>
          </div>
        </div>
        <div style={{ display: "grid", gap: 22 }}>
          <ContentCard3D tint={palette.teal}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  color: palette.teal,
                  fontSize: 28,
                  fontWeight: 980,
                  lineHeight: 1,
                  marginBottom: 16,
                }}
              >
                模型成可替换组件
              </div>
              <div
                style={{
                  borderTop: `1px solid ${palette.line}`,
                  color: palette.text,
                  fontSize: 24,
                  fontWeight: 860,
                  lineHeight: 1.3,
                  paddingTop: 16,
                }}
              >
                任务编排
              </div>
              <div
                style={{
                  color: palette.text,
                  fontSize: 24,
                  fontWeight: 860,
                  lineHeight: 1.3,
                  marginTop: 6,
                }}
              >
                工具与数据授权
              </div>
              <div
                style={{
                  color: palette.text,
                  fontSize: 24,
                  fontWeight: 860,
                  lineHeight: 1.3,
                  marginTop: 6,
                }}
              >
                执行验证
              </div>
              <div
                style={{
                  color: palette.text,
                  fontSize: 24,
                  fontWeight: 860,
                  lineHeight: 1.3,
                  marginTop: 6,
                }}
              >
                成本控制与可靠性交付
              </div>
            </div>
          </ContentCard3D>
          <ContentCard3D index={1} tint={palette.cyan}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  color: palette.cyan,
                  fontSize: 26,
                  fontWeight: 980,
                  lineHeight: 1,
                  marginBottom: 10,
                }}
              >
                比 prompt 壳更长期的竞争力
              </div>
              <div
                style={{
                  color: palette.muted,
                  fontSize: 22,
                  fontWeight: 760,
                  lineHeight: 1.3,
                }}
              >
                为其他 Agent 提供可靠能力服务
              </div>
            </div>
          </ContentCard3D>
        </div>
      </div>
    </SceneShell>
  );
};

// ─── Scene Router ────────────────────────────────────────────────────

const SceneRenderer: FC<{ readonly scene: Scene }> = ({ scene }) => {
  switch (scene.visual.kind) {
    case "thesis":
      return <ThesisScene scene={scene} />;
    case "infrastructure":
      return <InfrastructureScene scene={scene} />;
    case "consumer-ai":
      return <ConsumerAiScene scene={scene} />;
    case "agent-arch":
      return <AgentArchScene scene={scene} />;
    case "real-time-arch":
      return <RealTimeArchScene scene={scene} />;
    case "policy-power":
      return <PolicyPowerScene scene={scene} />;
    case "regulation":
      return <RegulationScene scene={scene} />;
    case "defense-capital":
      return <DefenseCapitalScene scene={scene} />;
    case "sovereignty":
      return <SovereigntyScene scene={scene} />;
    case "summary-matrix":
      return <SummaryMatrixScene scene={scene} />;
    case "closing":
      return <ClosingScene scene={scene} />;
    default:
      return <ThesisScene scene={scene} />;
  }
};

// ─── Main Composition ────────────────────────────────────────────────

export const AiDailyNews20260713Video: FC = () => {
  return (
    <AbsoluteFill style={fullFrame}>
      <StandaloneTimeline
        scenes={data.scenes}
        renderAudio={(scene) => (
          <Audio src={staticFile(scene.audioFile)} />
        )}
        renderScene={(scene) => <SceneRenderer scene={scene} />}
        renderOverlay={null}
      />
    </AbsoluteFill>
  );
};

export const aiDailyNews20260713Metadata = {
  compositionId: COMPOSITION_ID,
  durationInFrames: DURATION_IN_FRAMES,
  fps: FPS,
  height: HEIGHT,
  width: WIDTH,
  data,
  getDuration,
};