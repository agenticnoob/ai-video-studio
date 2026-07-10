import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import {
  CalloutGrid,
  GradientShiftBackground,
  GridPulse,
  Kicker,
  VideoPanel,
  useEntranceProgress,
  type RemotionTheme,
} from "../primitives";
import {
  StandaloneBottomCaption,
  StandaloneTimeline,
  StandaloneVoiceover,
} from "../standalone-video";
import { aiConceptsForBeginnersData } from "./data";
import {
  AI_CONCEPTS_FOR_BEGINNERS_DURATION_IN_FRAMES,
  AI_CONCEPTS_FOR_BEGINNERS_VOICEOVER_PLAYBACK_RATE,
  type AiConceptsForBeginnersData,
  type AiConceptsForBeginnersScene,
} from "./types";

const palette = {
  background: "#070B14",
  ink: "#F8FAFC",
  muted: "#B9C5D6",
  panel: "rgba(13, 20, 34, 0.9)",
  panelSoft: "rgba(255,255,255,0.065)",
};

const themeFor = (accent: string): RemotionTheme => ({
  background: palette.background,
  muted: palette.muted,
  panel: palette.panel,
  primary: accent,
  secondary: "#FFB45E",
  text: palette.ink,
});

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Background: FC<{ readonly accent: string }> = ({ accent }) => (
  <AbsoluteFill>
    <GradientShiftBackground colors={["#070B14", "#111A2B", accent, "#070B14"]} speed={0.06} />
    <AbsoluteFill style={{ opacity: 0.12 }}>
      <GridPulse />
    </AbsoluteFill>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 35%, transparent 0%, rgba(7,11,20,0.2) 46%, rgba(7,11,20,0.88) 100%)",
      }}
    />
  </AbsoluteFill>
);

const SceneShell: FC<{
  readonly children: ReactNode;
  readonly scene: AiConceptsForBeginnersScene;
}> = ({ children, scene }) => {
  const frame = useCurrentFrame();
  const fade = interpolate(
    frame,
    [0, 18, scene.durationInFrames - 18, scene.durationInFrames],
    [0, 1, 1, 0],
    clamp,
  );

  return (
    <AbsoluteFill style={{ background: palette.background, color: palette.ink, opacity: fade }}>
      <Background accent={scene.accent} />
      <AbsoluteFill style={{ padding: "62px 82px 122px" }}>
        <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
          <Kicker theme={themeFor(scene.accent)}>{scene.chapter}</Kicker>
          <div
            style={{
              border: `1px solid ${scene.accent}66`,
              borderRadius: 999,
              color: scene.accent,
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 1.2,
              padding: "10px 18px",
            }}
          >
            {scene.concept}
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
      </AbsoluteFill>
      <StandaloneBottomCaption
        captions={scene.captions}
        style={{ bottom: 30, fontSize: 27, left: 220, right: 220 }}
        variant="landscape"
      />
    </AbsoluteFill>
  );
};

const Title: FC<{ readonly children: ReactNode; readonly maxWidth?: number }> = ({
  children,
  maxWidth = 1120,
}) => {
  const entrance = useEntranceProgress(32, 170);
  return (
    <div
      style={{
        fontSize: 76,
        fontWeight: 980,
        letterSpacing: -3,
        lineHeight: 1.04,
        maxWidth,
        opacity: entrance,
        transform: `translateY(${(1 - entrance) * 42}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Supporting: FC<{ readonly children: ReactNode; readonly maxWidth?: number }> = ({
  children,
  maxWidth = 980,
}) => (
  <div style={{ color: palette.muted, fontSize: 31, fontWeight: 650, lineHeight: 1.45, maxWidth }}>
    {children}
  </div>
);

const Card: FC<{
  readonly accent: string;
  readonly children: ReactNode;
  readonly delay?: number;
  readonly style?: CSSProperties;
}> = ({ accent, children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120 } });
  return (
    <div
      style={{
        background: palette.panel,
        border: `1px solid ${accent}55`,
        borderRadius: 30,
        boxShadow: `0 28px 80px rgba(0,0,0,0.34), inset 0 1px 0 ${accent}22`,
        opacity: progress,
        padding: 30,
        transform: `translateY(${(1 - progress) * 36}px) scale(${0.96 + progress * 0.04})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const ConceptChip: FC<{
  readonly accent: string;
  readonly label: string;
  readonly delay: number;
}> = ({ accent, label, delay }) => (
  <Card accent={accent} delay={delay} style={{ padding: "18px 25px" }}>
    <div style={{ color: accent, fontSize: 27, fontWeight: 950 }}>{label}</div>
  </Card>
);

const OpenScene: FC<{ readonly scene: AiConceptsForBeginnersScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const labels = ["LLM", "Prompt", "Context", "RAG", "Tools", "Agent", "Workflow", "Skill"];
  const orbit = frame * 0.004;
  return (
    <SceneShell scene={scene}>
      <div
        style={{
          alignItems: "center",
          display: "grid",
          gap: 70,
          gridTemplateColumns: "1fr 0.9fr",
          height: "100%",
        }}
      >
        <div>
          <Title>{scene.headline}</Title>
          <div style={{ marginTop: 30 }}>
            <Supporting>{scene.supportingText}</Supporting>
          </div>
        </div>
        <div style={{ height: 590, position: "relative" }}>
          <div
            style={{
              alignItems: "center",
              background: `radial-gradient(circle, ${scene.accent}55, ${palette.panel})`,
              border: `2px solid ${scene.accent}`,
              borderRadius: "50%",
              boxShadow: `0 0 100px ${scene.accent}44`,
              display: "flex",
              fontSize: 62,
              fontWeight: 980,
              height: 230,
              justifyContent: "center",
              left: 250,
              position: "absolute",
              top: 170,
              width: 230,
            }}
          >
            AI 餐厅
          </div>
          {labels.map((label, index) => {
            const angle = orbit + (index / labels.length) * Math.PI * 2;
            const x = 365 + Math.cos(angle) * 300;
            const y = 285 + Math.sin(angle) * 235;
            return (
              <div key={label} style={{ left: x - 62, position: "absolute", top: y - 30 }}>
                <ConceptChip
                  accent={index % 2 ? "#62D8FF" : scene.accent}
                  delay={index * 4}
                  label={label}
                />
              </div>
            );
          })}
        </div>
      </div>
    </SceneShell>
  );
};

const LlmScene: FC<{ readonly scene: AiConceptsForBeginnersScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const tokens = ["菜谱", "代码", "文章", "对话", "下一词？"];
  return (
    <SceneShell scene={scene}>
      <div
        style={{
          display: "grid",
          gap: 60,
          gridTemplateColumns: "0.9fr 1.1fr",
          height: "100%",
          alignItems: "center",
        }}
      >
        <div>
          <Title>{scene.headline}</Title>
          <div style={{ marginTop: 30 }}>
            <Supporting>{scene.supportingText}</Supporting>
          </div>
        </div>
        <VideoPanel
          entrance={useEntranceProgress(34)}
          maxWidth={920}
          theme={themeFor(scene.accent)}
        >
          <div style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 30 }}>
            <div style={{ fontSize: 140, filter: `drop-shadow(0 0 26px ${scene.accent}77)` }}>
              🧠
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
              {tokens.map((token, index) => {
                const active = Math.floor(frame / 22) % tokens.length === index;
                return (
                  <div
                    key={token}
                    style={{
                      background: active ? scene.accent : palette.panelSoft,
                      borderRadius: 14,
                      color: active ? "#07101A" : palette.ink,
                      fontSize: 28,
                      fontWeight: 900,
                      padding: "15px 20px",
                    }}
                  >
                    {token}
                  </div>
                );
              })}
            </div>
            <CalloutGrid
              callouts={["训练形成广泛经验", "按上下文预测输出", "可能自信地猜错"]}
              theme={themeFor(scene.accent)}
            />
          </div>
        </VideoPanel>
      </div>
    </SceneShell>
  );
};

const PromptScene: FC<{ readonly scene: AiConceptsForBeginnersScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const ticketY = interpolate(frame, [0, 40], [-180, 0], clamp);
  return (
    <SceneShell scene={scene}>
      <div
        style={{
          display: "grid",
          gap: 70,
          gridTemplateColumns: "0.9fr 1.1fr",
          height: "100%",
          alignItems: "center",
        }}
      >
        <div>
          <Title>{scene.headline}</Title>
          <div style={{ marginTop: 30 }}>
            <Supporting>{scene.supportingText}</Supporting>
          </div>
        </div>
        <div style={{ display: "grid", gap: 22, transform: `translateY(${ticketY}px)` }}>
          <Card accent="#FF6B6B">
            <div style={{ color: "#FF9B9B", fontSize: 22, fontWeight: 900 }}>模糊订单</div>
            <div style={{ fontSize: 46, fontWeight: 950, marginTop: 16 }}>“做个网站。”</div>
          </Card>
          <Card accent={scene.accent} delay={15}>
            <div style={{ color: scene.accent, fontSize: 22, fontWeight: 900 }}>清楚订单</div>
            <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.5, marginTop: 16 }}>
              给 AI 新手做 16:9 中文科普视频
              <br />
              语气自然幽默 · 7–9 分钟 · 解释 11 个概念
            </div>
          </Card>
        </div>
      </div>
    </SceneShell>
  );
};

const ContextScene: FC<{ readonly scene: AiConceptsForBeginnersScene }> = ({ scene }) => {
  const items = ["系统规则", "本次 Prompt", "聊天记录", "RAG 资料", "工具结果", "文件内容"];
  return (
    <SceneShell scene={scene}>
      <div
        style={{
          display: "grid",
          gap: 54,
          gridTemplateColumns: "0.8fr 1.2fr",
          height: "100%",
          alignItems: "center",
        }}
      >
        <div>
          <Title>{scene.headline}</Title>
          <div style={{ marginTop: 30 }}>
            <Supporting>{scene.supportingText}</Supporting>
          </div>
        </div>
        <Card accent={scene.accent} style={{ padding: 34 }}>
          <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: 34, fontWeight: 950 }}>当前工作台 / Context Window</div>
            <div style={{ color: scene.accent, fontSize: 25, fontWeight: 900 }}>容量有限</div>
          </div>
          <div
            style={{
              display: "grid",
              gap: 17,
              gridTemplateColumns: "repeat(3, 1fr)",
              marginTop: 28,
            }}
          >
            {items.map((item, index) => (
              <Card
                accent={index < 3 ? scene.accent : "#72E6B1"}
                delay={index * 5}
                key={item}
                style={{ minHeight: 120, padding: 20 }}
              >
                <div style={{ fontSize: 27, fontWeight: 900 }}>{item}</div>
              </Card>
            ))}
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: 999,
              height: 18,
              marginTop: 30,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: `linear-gradient(90deg, ${scene.accent}, #FF8E72)`,
                height: "100%",
                width: "78%",
              }}
            />
          </div>
        </Card>
      </div>
    </SceneShell>
  );
};

const Arrow: FC<{ readonly accent: string; readonly label?: string }> = ({ accent, label }) => (
  <div style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 5 }}>
    <div style={{ color: accent, fontSize: 44, fontWeight: 950 }}>→</div>
    {label ? (
      <div style={{ color: palette.muted, fontSize: 18, fontWeight: 800 }}>{label}</div>
    ) : null}
  </div>
);

const RagScene: FC<{ readonly scene: AiConceptsForBeginnersScene }> = ({ scene }) => {
  const steps = ["问题", "搜索资料库", "相关片段", "放入 Context", "LLM 回答"];
  return (
    <SceneShell scene={scene}>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
        }}
      >
        <Title maxWidth={1400}>{scene.headline}</Title>
        <div
          style={{ alignItems: "center", display: "flex", gap: 14, marginTop: 64, width: "100%" }}
        >
          {steps.map((step, index) => (
            <div key={step} style={{ alignItems: "center", display: "flex", flex: 1, gap: 14 }}>
              <Card
                accent={index === 1 || index === 2 ? scene.accent : "#8BD5FF"}
                delay={index * 7}
                style={{ flex: 1, minHeight: 142, padding: 22 }}
              >
                <div
                  style={{
                    color: index === 1 || index === 2 ? scene.accent : "#8BD5FF",
                    fontSize: 21,
                    fontWeight: 900,
                  }}
                >
                  0{index + 1}
                </div>
                <div style={{ fontSize: 28, fontWeight: 950, marginTop: 14 }}>{step}</div>
              </Card>
              {index < steps.length - 1 ? <Arrow accent={scene.accent} /> : null}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40 }}>
          <Supporting>{scene.supportingText}</Supporting>
        </div>
      </div>
    </SceneShell>
  );
};

const FunctionScene: FC<{ readonly scene: AiConceptsForBeginnersScene }> = ({ scene }) => (
  <SceneShell scene={scene}>
    <div
      style={{
        display: "grid",
        gap: 54,
        gridTemplateColumns: "0.82fr 1.18fr",
        height: "100%",
        alignItems: "center",
      }}
    >
      <div>
        <Title>{scene.headline}</Title>
        <div style={{ marginTop: 30 }}>
          <Supporting>{scene.supportingText}</Supporting>
        </div>
      </div>
      <Card accent={scene.accent}>
        <div style={{ color: scene.accent, fontSize: 24, fontWeight: 900 }}>TOOL REQUEST</div>
        <pre
          style={{
            color: palette.ink,
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            fontSize: 31,
            fontWeight: 750,
            lineHeight: 1.5,
            margin: "25px 0 0",
            whiteSpace: "pre-wrap",
          }}
        >{`{
  "name": "book_room",
  "arguments": {
    "date": "星期五",
    "people": 6
  }
}`}</pre>
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.14)",
            display: "flex",
            gap: 18,
            marginTop: 25,
            paddingTop: 24,
          }}
        >
          <ConceptChip accent="#8BD5FF" delay={12} label="模型：提出调用" />
          <ConceptChip accent="#72E6B1" delay={20} label="程序：实际执行" />
        </div>
      </Card>
    </div>
  </SceneShell>
);

const McpScene: FC<{ readonly scene: AiConceptsForBeginnersScene }> = ({ scene }) => {
  const tools = ["文件", "数据库", "浏览器", "GitHub", "日历"];
  return (
    <SceneShell scene={scene}>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
        }}
      >
        <Title maxWidth={1440}>{scene.headline}</Title>
        <div
          style={{
            alignItems: "center",
            display: "grid",
            gap: 28,
            gridTemplateColumns: "0.7fr 1.5fr 0.7fr",
            marginTop: 58,
            width: "100%",
          }}
        >
          <Card accent="#F58BFF">
            <div style={{ fontSize: 38, fontWeight: 950, textAlign: "center" }}>MCP Client</div>
            <div style={{ color: palette.muted, fontSize: 23, marginTop: 12, textAlign: "center" }}>
              发现并使用能力
            </div>
          </Card>
          <Card accent={scene.accent} style={{ padding: 28 }}>
            <div
              style={{ color: scene.accent, fontSize: 25, fontWeight: 950, textAlign: "center" }}
            >
              统一协议 / 标准插座
            </div>
            <div style={{ display: "flex", gap: 13, justifyContent: "center", marginTop: 25 }}>
              {tools.map((tool, index) => (
                <ConceptChip
                  accent={index % 2 ? "#72E6B1" : scene.accent}
                  delay={index * 5}
                  key={tool}
                  label={tool}
                />
              ))}
            </div>
          </Card>
          <Card accent="#FFB45E">
            <div style={{ fontSize: 38, fontWeight: 950, textAlign: "center" }}>MCP Servers</div>
            <div style={{ color: palette.muted, fontSize: 23, marginTop: 12, textAlign: "center" }}>
              暴露工具与资源
            </div>
          </Card>
        </div>
        <div style={{ marginTop: 38 }}>
          <Supporting>{scene.supportingText}</Supporting>
        </div>
      </div>
    </SceneShell>
  );
};

const AgentScene: FC<{ readonly scene: AiConceptsForBeginnersScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const nodes = ["观察", "计划", "行动", "检查"];
  const active = Math.floor(frame / 34) % nodes.length;
  return (
    <SceneShell scene={scene}>
      <div
        style={{
          display: "grid",
          gap: 50,
          gridTemplateColumns: "0.78fr 1.22fr",
          height: "100%",
          alignItems: "center",
        }}
      >
        <div>
          <Title>{scene.headline}</Title>
          <div style={{ marginTop: 30 }}>
            <Supporting>{scene.supportingText}</Supporting>
          </div>
        </div>
        <div style={{ height: 610, position: "relative" }}>
          <div
            style={{
              border: `3px dashed ${scene.accent}77`,
              borderRadius: "50%",
              height: 480,
              left: 170,
              position: "absolute",
              top: 55,
              width: 480,
            }}
          />
          {nodes.map((node, index) => {
            const angle = -Math.PI / 2 + (index / nodes.length) * Math.PI * 2;
            const x = 410 + Math.cos(angle) * 240;
            const y = 295 + Math.sin(angle) * 240;
            const isActive = active === index;
            return (
              <div key={node} style={{ left: x - 85, position: "absolute", top: y - 52 }}>
                <Card
                  accent={isActive ? scene.accent : "#778399"}
                  style={{
                    background: isActive ? `${scene.accent}22` : palette.panel,
                    minWidth: 170,
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      color: isActive ? scene.accent : palette.ink,
                      fontSize: 32,
                      fontWeight: 950,
                      textAlign: "center",
                    }}
                  >
                    {node}
                  </div>
                </Card>
              </div>
            );
          })}
          <div
            style={{
              alignItems: "center",
              background: `${scene.accent}18`,
              border: `2px solid ${scene.accent}88`,
              borderRadius: "50%",
              color: scene.accent,
              display: "flex",
              fontSize: 42,
              fontWeight: 980,
              height: 180,
              justifyContent: "center",
              left: 320,
              position: "absolute",
              top: 205,
              width: 180,
            }}
          >
            经理
          </div>
        </div>
      </div>
    </SceneShell>
  );
};

const WorkflowScene: FC<{ readonly scene: AiConceptsForBeginnersScene }> = ({ scene }) => {
  const steps = ["接单", "查库存", "制作", "质检", "上菜"];
  return (
    <SceneShell scene={scene}>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
        }}
      >
        <Title maxWidth={1400}>{scene.headline}</Title>
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            height: 12,
            marginTop: 90,
            position: "relative",
            width: "90%",
          }}
        >
          {steps.map((step, index) => (
            <div
              key={step}
              style={{
                left: `${(index / (steps.length - 1)) * 100}%`,
                position: "absolute",
                top: -58,
                transform: "translateX(-50%)",
              }}
            >
              <Card accent={scene.accent} delay={index * 8} style={{ minWidth: 170, padding: 20 }}>
                <div style={{ color: scene.accent, fontSize: 18, fontWeight: 900 }}>
                  STEP {index + 1}
                </div>
                <div style={{ fontSize: 29, fontWeight: 950, marginTop: 8 }}>{step}</div>
              </Card>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gap: 24,
            gridTemplateColumns: "1fr 1fr",
            marginTop: 110,
            width: "85%",
          }}
        >
          <Card accent={scene.accent}>
            <div style={{ fontSize: 30, fontWeight: 950 }}>Workflow</div>
            <div style={{ color: palette.muted, fontSize: 24, marginTop: 10 }}>
              固定、可审计、可预测
            </div>
          </Card>
          <Card accent="#F58BFF">
            <div style={{ fontSize: 30, fontWeight: 950 }}>Agent</div>
            <div style={{ color: palette.muted, fontSize: 24, marginTop: 10 }}>
              动态、会判断、会探索
            </div>
          </Card>
        </div>
      </div>
    </SceneShell>
  );
};

const SkillScene: FC<{ readonly scene: AiConceptsForBeginnersScene }> = ({ scene }) => {
  const manuals = ["视频制作", "代码审查", "数据分析"];
  return (
    <SceneShell scene={scene}>
      <div
        style={{
          display: "grid",
          gap: 64,
          gridTemplateColumns: "0.85fr 1.15fr",
          height: "100%",
          alignItems: "center",
        }}
      >
        <div>
          <Title>{scene.headline}</Title>
          <div style={{ marginTop: 30 }}>
            <Supporting>{scene.supportingText}</Supporting>
          </div>
        </div>
        <div style={{ display: "flex", gap: 25, perspective: 1200 }}>
          {manuals.map((manual, index) => (
            <Card
              accent={index === 0 ? scene.accent : "#8BD5FF"}
              delay={index * 9}
              key={manual}
              style={{
                flex: 1,
                minHeight: 430,
                transform: `rotateY(${index === 0 ? -7 : index === 2 ? 7 : 0}deg)`,
              }}
            >
              <div
                style={{
                  color: index === 0 ? scene.accent : "#8BD5FF",
                  fontSize: 22,
                  fontWeight: 900,
                }}
              >
                SKILL MANUAL
              </div>
              <div style={{ fontSize: 39, fontWeight: 980, marginTop: 35 }}>{manual}</div>
              <div style={{ color: palette.muted, fontSize: 23, lineHeight: 1.6, marginTop: 35 }}>
                何时使用
                <br />
                执行步骤
                <br />
                工具清单
                <br />
                质量门槛
              </div>
            </Card>
          ))}
        </div>
      </div>
    </SceneShell>
  );
};

const SubagentScene: FC<{ readonly scene: AiConceptsForBeginnersScene }> = ({ scene }) => {
  const teams = [
    ["场地分队", "查地点与档期"],
    ["嘉宾分队", "整理背景资料"],
    ["预算分队", "核对价格风险"],
  ];
  return (
    <SceneShell scene={scene}>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
        }}
      >
        <Title maxWidth={1400}>{scene.headline}</Title>
        <Card accent={scene.accent} style={{ marginTop: 46, padding: 22, width: 360 }}>
          <div style={{ fontSize: 32, fontWeight: 950, textAlign: "center" }}>
            主 Agent
            <br />
            <span style={{ color: palette.muted, fontSize: 22 }}>拆分 · 审查 · 整合</span>
          </div>
        </Card>
        <div style={{ background: scene.accent, height: 55, opacity: 0.65, width: 4 }} />
        <div style={{ background: scene.accent, height: 4, opacity: 0.65, width: "68%" }} />
        <div
          style={{
            display: "grid",
            gap: 28,
            gridTemplateColumns: "repeat(3, 1fr)",
            marginTop: 0,
            width: "78%",
          }}
        >
          {teams.map(([name, task], index) => (
            <div key={name}>
              <div
                style={{
                  background: scene.accent,
                  height: 38,
                  margin: "0 auto",
                  opacity: 0.65,
                  width: 4,
                }}
              />
              <Card accent={index % 2 ? "#72E6B1" : scene.accent} delay={index * 9}>
                <div style={{ fontSize: 31, fontWeight: 950 }}>{name}</div>
                <div style={{ color: palette.muted, fontSize: 23, marginTop: 12 }}>{task}</div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </SceneShell>
  );
};

const LangChainScene: FC<{ readonly scene: AiConceptsForBeginnersScene }> = ({ scene }) => {
  const parts = ["Model", "Prompt", "Retriever", "Tools", "Agent", "Workflow"];
  return (
    <SceneShell scene={scene}>
      <div
        style={{
          display: "grid",
          gap: 60,
          gridTemplateColumns: "0.85fr 1.15fr",
          height: "100%",
          alignItems: "center",
        }}
      >
        <div>
          <Title>{scene.headline}</Title>
          <div style={{ marginTop: 30 }}>
            <Supporting>{scene.supportingText}</Supporting>
          </div>
        </div>
        <Card accent={scene.accent}>
          <div style={{ color: scene.accent, fontSize: 26, fontWeight: 950 }}>
            LANGCHAIN TOOLBOX
          </div>
          <div
            style={{
              display: "grid",
              gap: 18,
              gridTemplateColumns: "repeat(3, 1fr)",
              marginTop: 28,
            }}
          >
            {parts.map((part, index) => (
              <ConceptChip
                accent={index % 2 ? "#72E6B1" : scene.accent}
                delay={index * 6}
                key={part}
                label={part}
              />
            ))}
          </div>
          <div
            style={{
              background: "rgba(255,180,94,0.1)",
              border: "1px solid rgba(255,180,94,0.35)",
              borderRadius: 18,
              color: "#FFD5A2",
              fontSize: 25,
              fontWeight: 850,
              marginTop: 30,
              padding: 22,
            }}
          >
            工具箱能帮助搭建，但它不等于这些概念本身。
          </div>
        </Card>
      </div>
    </SceneShell>
  );
};

const CloseScene: FC<{ readonly scene: AiConceptsForBeginnersScene }> = ({ scene }) => {
  const groups = [
    ["大脑", "LLM"],
    ["信息", "Prompt · Context · RAG"],
    ["工具", "Function Calling · MCP"],
    ["决策", "Agent · Workflow"],
    ["组织", "Skill · Subagent · LangChain"],
  ];
  return (
    <SceneShell scene={scene}>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
        }}
      >
        <Title maxWidth={1500}>{scene.headline}</Title>
        <div
          style={{
            display: "grid",
            gap: 18,
            gridTemplateColumns: "repeat(5, 1fr)",
            marginTop: 60,
            width: "100%",
          }}
        >
          {groups.map(([group, concepts], index) => (
            <Card
              accent={["#8BD5FF", "#C9A7FF", "#5EE7F7", "#F58BFF", scene.accent][index]}
              delay={index * 7}
              key={group}
              style={{ minHeight: 250 }}
            >
              <div
                style={{
                  color: ["#8BD5FF", "#C9A7FF", "#5EE7F7", "#F58BFF", scene.accent][index],
                  fontSize: 27,
                  fontWeight: 950,
                }}
              >
                {group}
              </div>
              <div style={{ fontSize: 27, fontWeight: 900, lineHeight: 1.5, marginTop: 25 }}>
                {concepts}
              </div>
            </Card>
          ))}
        </div>
        <div style={{ marginTop: 36 }}>
          <Supporting>{scene.supportingText}</Supporting>
        </div>
      </div>
    </SceneShell>
  );
};

const Scene: FC<{ readonly scene: AiConceptsForBeginnersScene }> = ({ scene }) => {
  switch (scene.visual.kind) {
    case "open":
      return <OpenScene scene={scene} />;
    case "llm":
      return <LlmScene scene={scene} />;
    case "prompt":
      return <PromptScene scene={scene} />;
    case "context":
      return <ContextScene scene={scene} />;
    case "rag":
      return <RagScene scene={scene} />;
    case "function-calling":
      return <FunctionScene scene={scene} />;
    case "mcp":
      return <McpScene scene={scene} />;
    case "agent":
      return <AgentScene scene={scene} />;
    case "workflow":
      return <WorkflowScene scene={scene} />;
    case "skill":
      return <SkillScene scene={scene} />;
    case "subagent":
      return <SubagentScene scene={scene} />;
    case "langchain":
      return <LangChainScene scene={scene} />;
    case "close":
      return <CloseScene scene={scene} />;
    default:
      return <OpenScene scene={scene} />;
  }
};

export const AiConceptsForBeginnersVideo: FC<{
  readonly data?: AiConceptsForBeginnersData;
}> = ({ data = aiConceptsForBeginnersData }) => (
  <AbsoluteFill style={{ background: palette.background }}>
    <StandaloneTimeline
      renderAudio={(scene) => (
        <StandaloneVoiceover
          audioFile={scene.audioFile}
          playbackRate={AI_CONCEPTS_FOR_BEGINNERS_VOICEOVER_PLAYBACK_RATE}
        />
      )}
      renderScene={(scene) => <Scene scene={scene} />}
      scenes={data.scenes}
    />
  </AbsoluteFill>
);

export const aiConceptsForBeginnersMetadata = {
  durationInFrames: AI_CONCEPTS_FOR_BEGINNERS_DURATION_IN_FRAMES,
};
