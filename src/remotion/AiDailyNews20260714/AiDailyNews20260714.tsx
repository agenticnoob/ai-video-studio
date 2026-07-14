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
import { data as compositionData } from "./data";
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
        <div style={{ color: palette.muted, fontSize: 24, fontWeight: 850 }}>2026-07-14</div>
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
          ["预算转向", "企业 IT 从软件流向 GPU", palette.yellow],
          ["电力受限", "纽约禁令 / 每瓦指标", palette.cyan],
          ["监管收紧", "AI 搜索承担内容责任", palette.green],
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

const CompanyGridScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
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
              callouts={["-26% 股价", "+36% 营收", "+59% 利润"]}
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
              AI 预算冲击
            </Kicker>
            <div style={{ display: "grid", gap: 16 }}>
              {[
                ["IBM", "预算从软件转向 GPU 服务器", "股价跌 26%"],
                ["TSMC", "Q2 营收同比增 36%", "历史新高"],
                ["市场关注", "资本支出或进一步上调", "520-560亿+"],
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
                  <div style={{ color: palette.text, fontSize: 24, fontWeight: 700, lineHeight: 1.3 }}>
                    {project}
                  </div>
                  <div style={{ color: palette.muted, fontSize: 28, fontWeight: 850, textAlign: "right" }}>
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

const MetricsFrameworkScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
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
              callouts={["10-25x 每瓦提升", "40% 更多 GPU", "50% 芯片成本降"]}
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
              技术竞争新维度
            </Kicker>
            <div style={{ display: "grid", gap: 16 }}>
              {[
                ["过去", "单卡算力 → 训练速度", palette.muted],
                ["NVIDIA", "每瓦 Token / 液冷 / 动态电力", scene.accent],
                ["TYLsemi", "芯粒化：成本降 50%，时间减半", palette.violet],
              ].map(([era, desc, tint], index) => (
                <div
                  key={era}
                  style={{
                    alignItems: "center",
                    background: `${tint}14`,
                    border: `1px solid ${tint}55`,
                    borderRadius: 8,
                    display: "grid",
                    gap: 22,
                    gridTemplateColumns: index === 0 ? "1fr" : "130px 1fr",
                    minHeight: index === 0 ? 60 : 80,
                    padding: "16px 22px",
                    textAlign: index === 0 ? "center" : undefined,
                  }}
                >
                  {index === 0 ? (
                    <div
                      style={{
                        color: tint,
                        fontSize: 28,
                        fontWeight: 700,
                        lineHeight: 1.3,
                        textDecoration: "line-through",
                      }}
                    >
                      {desc}
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          color: tint,
                          fontSize: 34,
                          fontWeight: 980,
                          lineHeight: 1,
                        }}
                      >
                        {era}
                      </div>
                      <div
                        style={{
                          color: palette.text,
                          fontSize: 26,
                          fontWeight: 750,
                          lineHeight: 1.3,
                        }}
                      >
                        {desc}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </ContentCard3D>
        </div>
      </div>
    </SceneShell>
  );
};

const RegulationGridScene: FC<{ readonly scene: Scene }> = ({ scene }) => (
  <SceneShell compactHeader scene={scene}>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      <CompactTitle maxWidth={1260}>{scene.headline}</CompactTitle>
      <div style={{ marginTop: 4 }}>
        <SupportingCopy maxWidth={1260}>{scene.supportingText}</SupportingCopy>
      </div>
      <div
        style={{
          display: "grid",
          gap: 28,
          gridTemplateColumns: "1fr 1fr 1fr",
          marginTop: 28,
        }}
      >
        {[
          {
            label: "高置信度幻觉",
            value: "91% 虚构引用 ≥ 0.8 置信度",
            color: palette.red,
          },
          {
            label: "GDPR 准确率",
            value: "94-100%",
            color: palette.green,
          },
          {
            label: "稀缺法律误引率",
            value: "60-77%",
            color: palette.red,
          },
        ].map((item) => (
          <ContentCard3D key={item.label} tint={item.color}>
            <div style={{ color: item.color, fontSize: 22, fontWeight: 950 }}>{item.label}</div>
            <div
              style={{
                color: palette.text,
                fontSize: 36,
                fontWeight: 960,
                lineHeight: 1.1,
                marginTop: 16,
              }}
            >
              {item.value}
            </div>
          </ContentCard3D>
        ))}
      </div>
    </div>
  </SceneShell>
);

const PolicyGridScene: FC<{ readonly scene: Scene }> = ({ scene }) => (
  <SceneShell compactHeader scene={scene}>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      <CompactTitle maxWidth={1260}>{scene.headline}</CompactTitle>
      <div style={{ marginTop: 4 }}>
        <SupportingCopy maxWidth={1260}>{scene.supportingText}</SupportingCopy>
      </div>
      <div
        style={{
          display: "grid",
          gap: 28,
          gridTemplateColumns: "1fr 1fr",
          marginTop: 28,
        }}
      >
        <ContentCard3D tint={palette.orange}>
          <div style={{ color: palette.orange, fontSize: 24, fontWeight: 950 }}>
            🏛️ 纽约数据中心禁令
          </div>
          <div
            style={{
              color: palette.text,
              fontSize: 28,
              fontWeight: 760,
              lineHeight: 1.35,
              marginTop: 16,
            }}
          >
            50MW+ 数据中心停建一年，制定环境影响标准
          </div>
        </ContentCard3D>
        <ContentCard3D tint={palette.violet}>
          <div style={{ color: palette.violet, fontSize: 24, fontWeight: 950 }}>
            🇩🇪 德国：AI 搜索 = 平台内容
          </div>
          <div
            style={{
              color: palette.text,
              fontSize: 28,
              fontWeight: 760,
              lineHeight: 1.35,
              marginTop: 16,
            }}
          >
            AI Overviews 属于服务提供者内容，需为错误负责
          </div>
        </ContentCard3D>
      </div>
    </div>
  </SceneShell>
);

const GovernanceScene: FC<{ readonly scene: Scene }> = ({ scene }) => (
  <SceneShell compactHeader scene={scene}>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      <CompactTitle maxWidth={1260}>{scene.headline}</CompactTitle>
      <div style={{ marginTop: 4 }}>
        <SupportingCopy maxWidth={1260}>{scene.supportingText}</SupportingCopy>
      </div>
      <div
        style={{
          display: "grid",
          gap: 28,
          gridTemplateColumns: "1fr 1fr",
          marginTop: 28,
        }}
      >
        <ContentCard3D tint={scene.accent}>
          <div style={{ color: scene.accent, fontSize: 24, fontWeight: 950 }}>
            🇦🇺 澳大利亚 AI Office
          </div>
          <div
            style={{
              color: palette.text,
              fontSize: 28,
              fontWeight: 760,
              lineHeight: 1.35,
              marginTop: 16,
            }}
          >
            总理与内阁部内部设立中央 Office，统一 AI 标准与审批
          </div>
        </ContentCard3D>
        <ContentCard3D tint={palette.violet}>
          <div style={{ color: palette.violet, fontSize: 24, fontWeight: 950 }}>
            🌐 DeepMind 全球测试倡议
          </div>
          <div
            style={{
              color: palette.text,
              fontSize: 28,
              fontWeight: 760,
              lineHeight: 1.35,
              marginTop: 16,
            }}
          >
            美国主导、行业出资的全球 AI 测试机构，发布前 30 天检测
          </div>
        </ContentCard3D>
      </div>
    </div>
  </SceneShell>
);

const CapitalStackScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
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
              callouts={["$710亿 估值", "$12亿 翻倍", "$5万亿/年"]}
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
              资本集中趋势
            </Kicker>
            <div style={{ display: "grid", gap: 16 }}>
              {[
                ["DeepSeek", "$710亿 轮前估值", "或 2026 年 IPO"],
                ["Flex", "$7000万 / $12亿估值", "半年翻倍"],
                ["SoftBank", "预计 $5万亿/年", "2040 年 AI 投资"],
              ].map(([name, detail, note], index) => (
                <div
                  key={name}
                  style={{
                    alignItems: "center",
                    background: `${index === 0 ? scene.accent : palette.cyan}14`,
                    border: `1px solid ${index === 0 ? scene.accent : palette.cyan}55`,
                    borderRadius: 8,
                    display: "grid",
                    gap: 22,
                    gridTemplateColumns: "140px 1fr 140px",
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
                    {name}
                  </div>
                  <div style={{ color: palette.text, fontSize: 24, fontWeight: 700, lineHeight: 1.3 }}>
                    {detail}
                  </div>
                  <div style={{ color: palette.muted, fontSize: 26, fontWeight: 850, textAlign: "right" }}>
                    {note}
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

const ClosingScene: FC<{ readonly scene: Scene }> = ({ scene }) => {
  const items = [
    "Token 与电力成本下长期运行",
    "验证每一次引用、判断和操作",
    "接入真实业务系统并承担结果责任",
    "提供权限、审计、重试和人工接管",
    "把不稳定模型包装成稳定可交付服务",
  ];

  return (
    <SceneShell scene={scene}>
      <div
        style={{
          alignItems: "center",
          display: "grid",
          gap: 60,
          gridTemplateColumns: "1.1fr 0.9fr",
        }}
      >
        <div>
          <BigTitle maxWidth={920}>{scene.headline}</BigTitle>
          <div style={{ marginTop: 24 }}>
            <SupportingCopy maxWidth={920}>{scene.supportingText}</SupportingCopy>
          </div>
        </div>
        <ContentCard3D tint={palette.teal}>
          <div style={{ display: "grid", gap: 14 }}>
            {items.map((item, i) => (
              <div
                key={item}
                style={{
                  alignItems: "center",
                  display: "flex",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    background: palette.teal,
                    borderRadius: "50%",
                    color: palette.background,
                    fontSize: 22,
                    fontWeight: 980,
                    height: 34,
                    lineHeight: "34px",
                    textAlign: "center",
                    width: 34,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ color: palette.text, fontSize: 24, fontWeight: 720, lineHeight: 1.3 }}>
                  {item}
                </div>
              </div>
            ))}
          </div>
        </ContentCard3D>
      </div>
    </SceneShell>
  );
};

// ─── Scene Renderer Router ────────────────────────────────────────────

const SceneRenderer: FC<{ readonly scene: Scene }> = ({ scene }) => {
  switch (scene.visual.kind) {
    case "thesis":
      return <ThesisScene scene={scene} />;
    case "company-grid":
      return <CompanyGridScene scene={scene} />;
    case "metrics-framework":
      return <MetricsFrameworkScene scene={scene} />;
    case "regulation-grid":
      return <RegulationGridScene scene={scene} />;
    case "policy-grid":
      return <PolicyGridScene scene={scene} />;
    case "governance-scene":
      return <GovernanceScene scene={scene} />;
    case "capital-stack":
      return <CapitalStackScene scene={scene} />;
    case "closing":
      return <ClosingScene scene={scene} />;
    default:
      return <ThesisScene scene={scene} />;
  }
};

// ─── Main Composition ────────────────────────────────────────────────

export const AiDailyNews20260714Video: FC = () => {
  return (
    <AbsoluteFill style={fullFrame}>
      <StandaloneTimeline
        scenes={compositionData.scenes}
        renderAudio={(scene: Scene) => (
          <Audio src={staticFile(scene.audioFile)} />
        )}
        renderScene={(scene: Scene) => <SceneRenderer scene={scene} />}
        renderOverlay={null}
      />
    </AbsoluteFill>
  );
};

export const aiDailyNews20260714Metadata = {
  COMPOSITION_ID,
  FPS,
  WIDTH,
  HEIGHT,
  DURATION_IN_FRAMES,
};