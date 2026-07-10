import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EvidenceOverlayPanel } from "../producer-samples/evidence-lens";
import {
  BarChart,
  CalloutGrid,
  Kicker,
  VideoPanel,
  type RemotionTheme,
  useEntranceProgress,
} from "../primitives";
import {
  MetricCardGrid,
  TimelineProgressBlock,
  WorkflowMapBlock,
  type MetricCardDatum,
  type WorkflowMapNode,
} from "../recipes/blocks";
import {
  StandaloneBottomCaption,
  StandaloneTimeline,
  StandaloneVoiceover,
} from "../standalone-video";
import { getStandaloneDurationInFrames } from "../standalone-video/timeline";
import { aiNewsStrategicBrief20260709Data } from "./data";
import {
  AI_NEWS_STRATEGIC_BRIEF_20260709_DURATION_IN_FRAMES,
  AI_NEWS_STRATEGIC_BRIEF_20260709_VOICEOVER_PLAYBACK_RATE,
  type AiNewsStrategicBrief20260709Data,
  type AiNewsStrategicBrief20260709Scene,
} from "./types";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const palette = {
  background: "#07090D",
  graphite: "#111827",
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

export const getAiNewsStrategicBrief20260709Duration = (
  data: AiNewsStrategicBrief20260709Data,
): number => getStandaloneDurationInFrames(data.scenes);

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

const SceneShell: FC<{
  readonly children: ReactNode;
  readonly scene: AiNewsStrategicBrief20260709Scene;
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
        <div style={{ color: palette.muted, fontSize: 24, fontWeight: 850 }}>
          2026-06-17 - 07-09
        </div>
      </div>
      {children}
    </div>
    <StandaloneBottomCaption captions={scene.captions} variant="landscape" />
  </AbsoluteFill>
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
    <div
      style={{
        perspective: 900,
        ...style,
      }}
    >
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

const ThesisScene: FC<{ readonly scene: AiNewsStrategicBrief20260709Scene }> = ({ scene }) => (
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
          ["模型访问", "政府测试 / 白名单 / 分阶段公开", palette.yellow],
          ["推理基建", "CPU / 推理芯片 / HBM", palette.cyan],
          ["电力外溢", "数据中心进入地方能源账本", palette.green],
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

const ModelGateScene: FC<{ readonly scene: AiNewsStrategicBrief20260709Scene }> = ({ scene }) => {
  const theme = primitiveThemeFor(scene.accent, palette.cyan);
  const steps = [
    ["01", "临时限制", "高能力模型触发安全流程"],
    ["02", "可信访问", "按机构、用途、身份分层开放"],
    ["03", "安全加固", "jailbreak / cyber / bio 风险评估"],
    ["04", "恢复或扩围", "监控、降级、审计一起上线"],
  ];

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
        <div
          style={{ display: "flex", flexDirection: "column", gap: 28, justifyContent: "center" }}
        >
          <div>
            <BigTitle maxWidth={820}>{scene.headline}</BigTitle>
            <div style={{ marginTop: 26 }}>
              <SupportingCopy maxWidth={820}>{scene.supportingText}</SupportingCopy>
            </div>
          </div>
          <EvidenceOverlayPanel
            compact
            style={{ borderRadius: 8, maxWidth: 820, padding: "24px 30px" }}
          >
            <div style={{ color: palette.yellow, fontSize: 24, fontWeight: 950, marginBottom: 10 }}>
              口径约束
            </div>
            <div style={{ color: palette.text, fontSize: 30, fontWeight: 900, lineHeight: 1.22 }}>
              片中按“报道 / 用户材料口径”处理，不把快速变化的政策细节说成最终制度。
            </div>
            <div
              style={{
                color: palette.muted,
                fontSize: 22,
                fontWeight: 760,
                lineHeight: 1.32,
                marginTop: 10,
              }}
            >
              重点是访问权分层已经出现，而不是替某个监管模式下定论。
            </div>
          </EvidenceOverlayPanel>
        </div>
        <div style={{ display: "grid", gap: 22 }}>
          <ContentCard3D tint={scene.accent}>
            <Kicker
              style={{ color: scene.accent, fontSize: 22, letterSpacing: 1.4, marginBottom: 22 }}
              theme={theme}
            >
              访问闸门拆解
            </Kicker>
            <div style={{ display: "grid", gap: 16 }}>
              {steps.map(([number, label, copy], index) => (
                <div
                  key={label}
                  style={{
                    alignItems: "center",
                    background: `${index === 1 ? palette.yellow : scene.accent}14`,
                    border: `1px solid ${index === 1 ? palette.yellow : scene.accent}55`,
                    borderRadius: 8,
                    display: "grid",
                    gap: 22,
                    gridTemplateColumns: "76px 1fr",
                    minHeight: 96,
                    padding: "18px 22px",
                  }}
                >
                  <div
                    style={{
                      color: index === 1 ? palette.yellow : scene.accent,
                      fontSize: 34,
                      fontWeight: 980,
                      lineHeight: 1,
                    }}
                  >
                    {number}
                  </div>
                  <div>
                    <div
                      style={{ color: palette.text, fontSize: 34, fontWeight: 940, lineHeight: 1 }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        color: palette.muted,
                        fontSize: 22,
                        fontWeight: 760,
                        lineHeight: 1.25,
                        marginTop: 8,
                      }}
                    >
                      {copy}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ContentCard3D>
          <PrimitivePanel padding="28px 32px" theme={theme}>
            <CalloutGrid
              callouts={["临时限制", "可信名单", "用途审查", "持续监控"]}
              theme={theme}
            />
          </PrimitivePanel>
        </div>
      </div>
    </SceneShell>
  );
};

const ModelMatrixScene: FC<{ readonly scene: AiNewsStrategicBrief20260709Scene }> = ({ scene }) => (
  <SceneShell scene={scene}>
    <div style={{ display: "grid", gap: 58, gridTemplateColumns: "0.92fr 1.08fr" }}>
      <div>
        <BigTitle maxWidth={760}>{scene.headline}</BigTitle>
        <div style={{ marginTop: 34 }}>
          <SupportingCopy maxWidth={760}>{scene.supportingText}</SupportingCopy>
        </div>
      </div>
      <div style={{ display: "grid", gap: 22 }}>
        {[
          ["旗舰", "高能力", "复杂推理 / coding / cyber / 科研", palette.yellow],
          ["日常", "高性价比", "企业工作流 / 常规 agent", palette.cyan],
          ["低价", "低延迟", "摘要 / 分类 / 预处理 / 批量步骤", palette.green],
        ].map(([name, tier, copy, tint], index) => (
          <ContentCard3D index={index} key={name} tint={tint}>
            <div style={{ alignItems: "baseline", display: "flex", gap: 18 }}>
              <div style={{ color: tint, fontSize: 64, fontWeight: 980, lineHeight: 1 }}>
                {name}
              </div>
              <div style={{ color: palette.muted, fontSize: 24, fontWeight: 900 }}>{tier}</div>
            </div>
            <div style={{ color: palette.text, fontSize: 34, fontWeight: 860, marginTop: 14 }}>
              {copy}
            </div>
          </ContentCard3D>
        ))}
      </div>
    </div>
  </SceneShell>
);

const AccessMapScene: FC<{ readonly scene: AiNewsStrategicBrief20260709Scene }> = ({ scene }) => {
  const nodes: WorkflowMapNode[] = [
    { id: "access", label: "模型访问", tint: palette.yellow, x: 110, y: 100 },
    { id: "chips", label: "芯片许可", tint: scene.accent, x: 345, y: 220 },
    { id: "routing", label: "多模型路由", tint: palette.cyan, x: 590, y: 100 },
    { id: "local", label: "本地部署", tint: palette.rose, x: 835, y: 220 },
  ];

  return (
    <SceneShell scene={scene}>
      <div style={{ display: "grid", gap: 60, gridTemplateColumns: "0.95fr 1.05fr" }}>
        <div>
          <BigTitle maxWidth={780}>{scene.headline}</BigTitle>
          <div style={{ marginTop: 34 }}>
            <SupportingCopy>{scene.supportingText}</SupportingCopy>
          </div>
        </div>
        <ContentCard3D tint={scene.accent}>
          <WorkflowMapBlock
            nodes={nodes}
            panelColor={palette.panelStrong}
            textColor={palette.text}
            width={1010}
          />
        </ContentCard3D>
      </div>
    </SceneShell>
  );
};

const InfraStackScene: FC<{ readonly scene: AiNewsStrategicBrief20260709Scene }> = ({ scene }) => (
  <SceneShell scene={scene}>
    <div style={{ display: "grid", gap: 56, gridTemplateColumns: "1fr 1fr" }}>
      <div>
        <BigTitle maxWidth={850}>{scene.headline}</BigTitle>
        <div style={{ marginTop: 34 }}>
          <SupportingCopy>{scene.supportingText}</SupportingCopy>
        </div>
      </div>
      <div style={{ display: "grid", gap: 18 }}>
        {[
          ["GPU", "大模型推理", palette.green],
          ["CPU", "任务调度 / 工具调用 / 代码执行", scene.accent],
          ["HBM / DRAM", "长上下文 / 并发", palette.rose],
          ["网络 / 存储", "路由 / 缓存 / 日志", palette.cyan],
        ].map(([label, copy, tint], index) => (
          <ContentCard3D index={index} key={label} tint={tint}>
            <div style={{ color: tint, fontSize: 30, fontWeight: 950 }}>{label}</div>
            <div style={{ color: palette.text, fontSize: 38, fontWeight: 900, marginTop: 8 }}>
              {copy}
            </div>
          </ContentCard3D>
        ))}
      </div>
    </div>
  </SceneShell>
);

const SecurityAuditScene: FC<{ readonly scene: AiNewsStrategicBrief20260709Scene }> = ({
  scene,
}) => (
  <SceneShell compactHeader scene={scene}>
    <BigTitle>{scene.headline}</BigTitle>
    <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(4, 1fr)", marginTop: 10 }}>
      {[
        "最小权限",
        "本地部署",
        "出口控制",
        "日志审计",
        "上下文脱敏",
        "数据不出域",
        "供应链说明",
        "人工接管",
      ].map((item, index) => (
        <ContentCard3D index={index % 4} key={item} tint={index % 2 ? palette.red : scene.accent}>
          <div style={{ color: palette.text, fontSize: 38, fontWeight: 950, textAlign: "center" }}>
            {item}
          </div>
        </ContentCard3D>
      ))}
    </div>
    <SupportingCopy>{scene.supportingText}</SupportingCopy>
  </SceneShell>
);

const SovereigntyScene: FC<{ readonly scene: AiNewsStrategicBrief20260709Scene }> = ({ scene }) => (
  <SceneShell scene={scene}>
    <div style={{ display: "grid", gap: 62, gridTemplateColumns: "0.9fr 1.1fr" }}>
      <div>
        <BigTitle maxWidth={780}>{scene.headline}</BigTitle>
        <div style={{ marginTop: 34 }}>
          <SupportingCopy>{scene.supportingText}</SupportingCopy>
        </div>
      </div>
      <ContentCard3D tint={scene.accent}>
        <TimelineProgressBlock
          activeColor={scene.accent}
          accentGradient={`linear-gradient(90deg, ${scene.accent}, ${palette.cyan}, ${palette.yellow})`}
          checkpointLabels={["金融", "政务", "军事", "基建"]}
          durationInFrames={scene.durationInFrames}
          mutedColor={palette.muted}
          note="Kill switch、circuit breaker、人工接管，会从建议变成系统需求。"
          noteBorderColor={scene.accent}
          notePanelColor={palette.panel}
          textColor={palette.text}
          width={1020}
        />
      </ContentCard3D>
    </div>
  </SceneShell>
);

const CapitalStackScene: FC<{ readonly scene: AiNewsStrategicBrief20260709Scene }> = ({
  scene,
}) => {
  const metrics: MetricCardDatum[] = [
    { label: "长期租约", suffix: "MW", tint: scene.accent, value: 401 },
    { label: "主权算力", suffix: "MW", tint: palette.rose, value: 50 },
    { label: "GPU 部署", suffix: "GW", tint: palette.yellow, value: 14 },
  ];

  return (
    <SceneShell scene={scene}>
      <div style={{ display: "grid", gap: 60, gridTemplateColumns: "0.95fr 1.05fr" }}>
        <div>
          <BigTitle maxWidth={780}>{scene.headline}</BigTitle>
          <div style={{ marginTop: 34 }}>
            <SupportingCopy>{scene.supportingText}</SupportingCopy>
          </div>
        </div>
        <ContentCard3D tint={scene.accent}>
          <MetricCardGrid
            cardHeight={236}
            cardWidth={286}
            metrics={metrics}
            mutedColor={palette.muted}
            panelColor={palette.panelStrong}
            textColor={palette.text}
          />
          <div style={{ color: palette.muted, fontSize: 27, fontWeight: 780, marginTop: 28 }}>
            注：数值按用户材料中的代表性算力 / 容量口径视觉化，用于表达基础设施尺度。
          </div>
        </ContentCard3D>
      </div>
    </SceneShell>
  );
};

const PowerGridScene: FC<{ readonly scene: AiNewsStrategicBrief20260709Scene }> = ({ scene }) => {
  const theme = primitiveThemeFor(scene.accent, palette.green);

  return (
    <SceneShell compactHeader scene={scene}>
      <div style={{ display: "grid", gap: 30 }}>
        <div
          style={{ alignItems: "end", display: "grid", gap: 52, gridTemplateColumns: "1fr 0.62fr" }}
        >
          <div>
            <CompactTitle maxWidth={1120}>{scene.headline}</CompactTitle>
            <div style={{ marginTop: 24 }}>
              <SupportingCopy maxWidth={1100}>{scene.supportingText}</SupportingCopy>
            </div>
          </div>
          <PrimitivePanel padding="24px 28px" theme={theme}>
            <Kicker
              style={{ color: scene.accent, fontSize: 21, letterSpacing: 1.2, marginBottom: 18 }}
              theme={theme}
            >
              电力 / 设备信号
            </Kicker>
            <div style={{ color: palette.text, fontSize: 31, fontWeight: 920, lineHeight: 1.16 }}>
              电力容量、地方电价、制造业竞争力，开始进入 AI 成本表。
            </div>
          </PrimitivePanel>
        </div>
        <div
          style={{
            alignItems: "stretch",
            display: "grid",
            gap: 34,
            gridTemplateColumns: "1.08fr 0.92fr",
          }}
        >
          <ContentCard3D tint={scene.accent}>
            <div
              style={{
                background: "rgba(4, 10, 16, 0.48)",
                border: `1px solid ${scene.accent}42`,
                borderRadius: 8,
                height: 412,
                overflow: "hidden",
              }}
            >
              <BarChart
                background="linear-gradient(135deg, rgba(3,12,18,0.2), rgba(7,24,31,0.76))"
                colors={[scene.accent, palette.green, palette.yellow, palette.rose]}
                data={[
                  { label: "数据中心", value: 88 },
                  { label: "商业用电", value: 74 },
                  { label: "容量价格", value: 96 },
                  { label: "工厂电价", value: 67 },
                ]}
                height={370}
                padding={56}
                subtitle="视觉指数，用来表达压力方向，不代表精确百分比"
                title="电力外溢压力"
                width={790}
                yMax={100}
              />
            </div>
          </ContentCard3D>
          <div style={{ display: "grid", gap: 20 }}>
            {[
              ["需求端", "AI 数据中心把电力、天然气和冷却拉进核心成本。", scene.accent],
              ["价格端", "地方电价和容量费压力，会传导给制造业。", palette.yellow],
              ["工程端", "变压器、开关设备、并网速度，变成算力扩张前置条件。", palette.green],
            ].map(([label, copy, tint], index) => (
              <ContentCard3D index={index} key={label} tint={tint}>
                <Kicker
                  style={{ color: tint, fontSize: 20, letterSpacing: 1.2, marginBottom: 10 }}
                  theme={theme}
                >
                  {label}
                </Kicker>
                <div
                  style={{ color: palette.text, fontSize: 31, fontWeight: 920, lineHeight: 1.18 }}
                >
                  {copy}
                </div>
              </ContentCard3D>
            ))}
          </div>
        </div>
      </div>
    </SceneShell>
  );
};

const RiskBoardScene: FC<{ readonly scene: AiNewsStrategicBrief20260709Scene }> = ({ scene }) => (
  <SceneShell scene={scene}>
    <div
      style={{ alignItems: "center", display: "grid", gap: 56, gridTemplateColumns: "1fr 0.9fr" }}
    >
      <div>
        <BigTitle>{scene.headline}</BigTitle>
        <div style={{ marginTop: 34 }}>
          <SupportingCopy>{scene.supportingText}</SupportingCopy>
        </div>
      </div>
      <div style={{ display: "grid", gap: 20 }}>
        {[
          ["融资成本", "利率与债务结构"],
          ["利用率", "集群是否被真实需求吃满"],
          ["单位经济", "每 token 成本和毛利"],
          ["回本周期", "capex 何时转现金流"],
        ].map(([label, copy], index) => (
          <ContentCard3D index={index} key={label} tint={index % 2 ? palette.orange : scene.accent}>
            <div style={{ color: palette.text, fontSize: 38, fontWeight: 950 }}>{label}</div>
            <div style={{ color: palette.muted, fontSize: 27, fontWeight: 780, marginTop: 8 }}>
              {copy}
            </div>
          </ContentCard3D>
        ))}
      </div>
    </div>
  </SceneShell>
);

const PlaybookScene: FC<{ readonly scene: AiNewsStrategicBrief20260709Scene }> = ({ scene }) => {
  const nodes: WorkflowMapNode[] = [
    { id: "gateway", label: "模型网关", tint: scene.accent, x: 120, y: 95 },
    { id: "audit", label: "审计日志", tint: palette.cyan, x: 370, y: 210 },
    { id: "cost", label: "任务成本", tint: palette.yellow, x: 620, y: 95 },
    { id: "fallback", label: "本地回退", tint: palette.green, x: 870, y: 210 },
  ];

  return (
    <SceneShell scene={scene}>
      <div style={{ display: "grid", gap: 58, gridTemplateColumns: "0.92fr 1.08fr" }}>
        <div>
          <BigTitle maxWidth={820}>{scene.headline}</BigTitle>
          <div style={{ marginTop: 34 }}>
            <SupportingCopy>{scene.supportingText}</SupportingCopy>
          </div>
        </div>
        <ContentCard3D tint={scene.accent}>
          <WorkflowMapBlock
            nodes={nodes}
            panelColor={palette.panelStrong}
            textColor={palette.text}
            width={1030}
          />
        </ContentCard3D>
      </div>
    </SceneShell>
  );
};

const ClosingScene: FC<{ readonly scene: AiNewsStrategicBrief20260709Scene }> = ({ scene }) => (
  <SceneShell scene={scene}>
    <div style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 42 }}>
      <BigTitle maxWidth={1280}>{scene.headline}</BigTitle>
      <div
        style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(4, 1fr)", width: "100%" }}
      >
        {["可控", "可审计", "可切换", "可降本"].map((item, index) => (
          <ContentCard3D
            index={index}
            key={item}
            tint={[palette.green, palette.cyan, palette.yellow, palette.rose][index]}
          >
            <div
              style={{ color: palette.text, fontSize: 54, fontWeight: 980, textAlign: "center" }}
            >
              {item}
            </div>
          </ContentCard3D>
        ))}
      </div>
      <SupportingCopy maxWidth={1180}>{scene.supportingText}</SupportingCopy>
    </div>
  </SceneShell>
);

const Scene: FC<{ readonly scene: AiNewsStrategicBrief20260709Scene }> = ({ scene }) => {
  switch (scene.visual.kind) {
    case "thesis":
      return <ThesisScene scene={scene} />;
    case "evidence":
      return <ModelGateScene scene={scene} />;
    case "model-matrix":
      return <ModelMatrixScene scene={scene} />;
    case "access-map":
      return <AccessMapScene scene={scene} />;
    case "infra-stack":
      return <InfraStackScene scene={scene} />;
    case "security-audit":
      return <SecurityAuditScene scene={scene} />;
    case "sovereignty":
      return <SovereigntyScene scene={scene} />;
    case "capital-stack":
      return <CapitalStackScene scene={scene} />;
    case "power-grid":
      return <PowerGridScene scene={scene} />;
    case "risk-board":
      return <RiskBoardScene scene={scene} />;
    case "playbook":
      return <PlaybookScene scene={scene} />;
    case "closing":
      return <ClosingScene scene={scene} />;
    default:
      return <ThesisScene scene={scene} />;
  }
};

export const AiNewsStrategicBrief20260709Video: FC<{
  readonly data?: AiNewsStrategicBrief20260709Data;
}> = ({ data = aiNewsStrategicBrief20260709Data }) => (
  <AbsoluteFill style={{ background: palette.background }}>
    <StandaloneTimeline
      renderAudio={(scene) => (
        <StandaloneVoiceover
          audioFile={scene.audioFile}
          playbackRate={AI_NEWS_STRATEGIC_BRIEF_20260709_VOICEOVER_PLAYBACK_RATE}
        />
      )}
      renderScene={(scene) => <Scene scene={scene} />}
      scenes={data.scenes}
    />
  </AbsoluteFill>
);

export const aiNewsStrategicBrief20260709Metadata = {
  durationInFrames: AI_NEWS_STRATEGIC_BRIEF_20260709_DURATION_IN_FRAMES,
};
