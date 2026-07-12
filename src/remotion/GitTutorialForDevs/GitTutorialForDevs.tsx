import type { FC, ReactNode } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { GradientShiftBackground } from "../primitives/backgrounds/GradientShiftBackground";
import GridPulse from "../primitives/backgrounds/GridPulse";
import BokehCircles from "../primitives/backgrounds/BokehCircles";
import { StandaloneBottomCaption, StandaloneTimeline, StandaloneVoiceover } from "../standalone-video";
import {
  GIT_TUTORIAL_DURATION_IN_FRAMES,
  GIT_TUTORIAL_FPS,
  GIT_TUTORIAL_VOICEOVER_PLAYBACK_RATE,
  type GitTutorialData,
  type GitTutorialScene,
} from "./types";

const palette = {
  accent: "#4ADE80",
  background: "#0D1117",
  bg2: "#161B22",
  border: "#30363D",
  branch: "#FACC15",
  commit: "#22D3EE",
  green: "#4ADE80",
  ink: "#F0F6FC",
  merge: "#A78BFA",
  muted: "#8B949E",
  orange: "#FB923C",
  panel: "rgba(22, 27, 34, 0.88)",
  panelDense: "rgba(22, 27, 34, 0.95)",
  subtitle: "rgba(3, 7, 18, 0.82)",
  codeBg: "rgba(0,0,0,0.45)",
};

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const getGitTutorialDuration = (data: GitTutorialData): number =>
  data.scenes.reduce((sum, scene) => sum + scene.durationInFrames, 0);

/* ===== Camera drift ===== */
const CameraDrift: FC<{ readonly children: ReactNode; readonly durationInFrames: number }> = ({
  children, durationInFrames,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        scale: interpolate(frame, [0, durationInFrames], [1, 1.03], clamp),
        translate: `${interpolate(frame, [0, durationInFrames], [0, 8], clamp)}px ${interpolate(frame, [0, durationInFrames], [0, -4], clamp)}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/* ===== GitTagBar ===== */
const GitTagBar: FC<{ readonly delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 20, mass: 0.3, stiffness: 150 } });
  const tags = ["git init", "git add", "git commit", "git push", "git pull", "git branch", "git log", "git diff", "git status", "git merge"];
  return (
    <div
      style={{
        bottom: 130,
        display: "flex",
        gap: 10,
        justifyContent: "center",
        left: 0,
        opacity: interpolate(progress, [0, 1], [0, 0.8]),
        padding: "0 60px",
        position: "absolute",
        right: 0,
        flexWrap: "wrap",
      }}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          style={{
            border: `1px solid ${palette.border}`,
            borderRadius: 6,
            color: palette.ink,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 14,
            fontWeight: 700,
            opacity: 0.7,
            padding: "5px 12px",
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

/* ===== Scene Shell — tight padding for 60%+ fill rate ===== */
const SceneShell: FC<{
  readonly children: ReactNode;
  readonly scene: GitTutorialScene;
  readonly gradientColors?: [string, string, string, string];
  readonly showTagBar?: boolean;
  readonly showBokeh?: boolean;
}> = ({ children, scene, gradientColors, showTagBar, showBokeh }) => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [scene.durationInFrames - 14, scene.durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <CameraDrift durationInFrames={scene.durationInFrames}>
        <GradientShiftBackground
          colors={gradientColors ?? ["#0D1117", "#161B22", "#1C2128", "#0D1117"]}
          speed={0.15}
        />
      </CameraDrift>
      <GridPulse />
      {showBokeh && <BokehCircles />}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.65) 100%)" }} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 60px 170px",
        }}
      >
        {children}
      </AbsoluteFill>
      {showTagBar && <GitTagBar />}
      <StandaloneBottomCaption captions={scene.captions} variant="landscape" />
    </AbsoluteFill>
  );
};

/* ===== Entrance components ===== */
const EntranceKicker: FC<{ readonly text: string; readonly delay?: number }> = ({ delay = 0, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.5, stiffness: 100 } });
  return (
    <div
      style={{
        color: palette.green, fontSize: 28, fontWeight: 900, letterSpacing: "0.14em",
        marginBottom: 16, opacity: progress, textAlign: "center",
        translate: `0 ${interpolate(progress, [0, 1], [14, 0])}px`,
        width: "100%",
      }}
    >
      {text}
    </div>
  );
};

const EntranceHeadline: FC<{ readonly text: string; readonly delay?: number }> = ({ delay = 4, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 16, mass: 0.6, stiffness: 90 } });
  return (
    <div
      style={{
        color: palette.ink, fontSize: 84, fontWeight: 950, letterSpacing: "-0.025em",
        lineHeight: 1.08, marginBottom: 0, opacity: progress,
        scale: interpolate(progress, [0, 1], [0.92, 1]),
        textAlign: "center",
        translate: `0 ${interpolate(progress, [0, 1], [20, 0])}px`,
      }}
    >
      {text}
    </div>
  );
};

/* ===== Section title (smaller headline for sub-scenes) ===== */
const SectionTitle: FC<{ readonly text: string; readonly progress: number }> = ({ text, progress }) => (
  <div
    style={{
      color: palette.ink, fontSize: 84, fontWeight: 950, letterSpacing: "-0.025em",
      lineHeight: 1.08, marginBottom: 28, opacity: interpolate(progress, [0, 1], [0, 1]),
      scale: interpolate(progress, [0, 1], [0.94, 1]), textAlign: "center",
      translate: `0 ${interpolate(progress, [0, 1], [18, 0])}px`,
    }}
  >
    {text}
  </div>
);

/* ===== Scene 1: Hero ===== */
const HeroScene: FC<{ readonly scene: GitTutorialScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoP = spring({ frame: frame - 2, fps, config: { damping: 12, mass: 0.8, stiffness: 80 } });
  const glowPulse = Math.sin(frame * 0.04) * 0.5 + 0.5;

  const valueTags = ["版本控制", "团队协作", "分支管理", "安全回滚", "AI Agent"];

  return (
    <SceneShell gradientColors={["#0D1117", "#1a2e1a", "#0D1117", "#161B22"]} scene={scene} showBokeh showTagBar>
      {/* Logo */}
      <div
        style={{
          background: palette.panelDense, border: `1.5px solid ${palette.green}55`,
          borderRadius: 30, boxShadow: `0 0 ${100 + glowPulse * 80}px ${palette.green}22`,
          marginBottom: 36, padding: "30px 52px",
          scale: interpolate(logoP, [0, 1], [0.8, 1]), opacity: logoP,
        }}
      >
        <span style={{ color: palette.ink, fontSize: 78, fontWeight: 950, letterSpacing: "-0.02em" }}>git</span>
        <span style={{ color: palette.green, fontSize: 78, fontWeight: 300, marginLeft: 20 }}>init</span>
      </div>
      <EntranceKicker text={scene.kicker} />
      <EntranceHeadline delay={4} text={scene.headline} />
      {/* Value tag cloud */}
      <div
        style={{
          display: "flex", gap: 14, marginTop: 36,
          opacity: interpolate(frame, [20, 45], [0, 1], clamp),
          flexWrap: "wrap", justifyContent: "center",
        }}
      >
        {valueTags.map((tag) => (
          <span
            key={tag}
            style={{
              background: "rgba(74,222,128,0.08)", border: `1px solid ${palette.green}33`,
              borderRadius: 8, color: palette.green, fontSize: 22, fontWeight: 700, padding: "8px 18px",
            }}
          >
            # {tag}
          </span>
        ))}
      </div>
      {/* Subtitle */}
      <div
        style={{
          color: palette.muted, fontSize: 24, fontWeight: 700, marginTop: 30,
          opacity: interpolate(frame, [28, 55], [0, 1], clamp),
        }}
      >
        Every Developer's Essential Tool
      </div>
    </SceneShell>
  );
};

/* ===== Scene 2: What ===== */
const BulletsScene: FC<{ readonly scene: GitTutorialScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hP = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 0.6, stiffness: 90 } });

  const items = [
    { icon: "🕒", label: "版本追踪", line1: "每一次改动都有记录", line2: "git log / git diff → 查看变更", accent: palette.commit },
    { icon: "👥", label: "多人协作", line1: "互不干扰，并行开发", line2: "git branch / git merge → 分支管理", accent: palette.green },
    { icon: "🌿", label: "分支管理", line1: "新功能独立开发线", line2: "git checkout -b / git branch → 隔离开发", accent: palette.branch },
    { icon: "🛡️", label: "安全回滚", line1: "随时回到任意版本", line2: "git revert / git reset → 撤销操作", accent: palette.merge },
  ];

  const cmdTags = ["git init", "git add", "git commit", "git log", "git diff", "git status"];

  return (
    <SceneShell scene={scene} showBokeh showTagBar>
      <SectionTitle text={scene.headline} progress={hP} />
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr", width: "100%", maxWidth: 1440 }}>
        {items.map((item, index) => {
          const p = spring({ frame: frame - 8 - index * 5, fps, config: { damping: 14, mass: 0.5, stiffness: 100 } });
          return (
            <div
              key={item.label}
              style={{
                background: palette.panelDense, border: `1.5px solid ${item.accent}55`,
                borderRadius: 20, opacity: p, padding: "26px 28px 22px",
                scale: interpolate(p, [0, 1], [0.95, 1]),
                translate: `0 ${interpolate(p, [0, 1], [18, 0])}px`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                <span style={{ fontSize: 34 }}>{item.icon}</span>
                <span style={{ color: item.accent, fontSize: 32, fontWeight: 900 }}>{item.label}</span>
              </div>
              <div style={{ color: palette.ink, fontSize: 24, fontWeight: 600, marginBottom: 8, opacity: 0.9 }}>
                {item.line1}
              </div>
              <div style={{
                color: palette.muted, fontFamily: '"JetBrains Mono", monospace',
                fontSize: 18, fontWeight: 500,
              }}>
                ⚡ {item.line2}
              </div>
            </div>
          );
        })}
      </div>
      {/* Command tags */}
      <div
        style={{
          display: "flex", gap: 12, marginTop: 24,
          opacity: interpolate(frame, [28, 50], [0, 1], clamp),
          flexWrap: "wrap", justifyContent: "center",
        }}
      >
        {cmdTags.map((tag) => (
          <span
            key={tag}
            style={{
              background: "rgba(74,222,128,0.1)", border: `1px solid ${palette.green}44`,
              borderRadius: 10, color: palette.green, fontFamily: '"JetBrains Mono", monospace',
              fontSize: 20, fontWeight: 700, padding: "8px 18px",
            }}
          >
            $ {tag}
          </span>
        ))}
      </div>
    </SceneShell>
  );
};

/* ===== Scene 3: Core Concepts ===== */
const ConceptDiagramScene: FC<{ readonly scene: GitTutorialScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hP = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 0.6, stiffness: 90 } });

  const concepts = [
    { c: palette.green, emoji: "📂", label: "仓库 (Repository)", desc: "被 Git 管理的项目文件夹", cmd: "git init my-project" },
    { c: palette.commit, emoji: "📸", label: "提交 (Commit)", desc: "代码的一次完整快照，可追溯", cmd: 'git commit -m "feat: login"' },
    { c: palette.branch, emoji: "🌿", label: "分支 (Branch)", desc: "独立开发线，自由实验不干扰", cmd: "git branch feature-x" },
    { c: palette.merge, emoji: "🔀", label: "合并 (Merge)", desc: "整合不同分支的工作成果", cmd: "git merge feature-x" },
  ];

  return (
    <SceneShell scene={scene} showBokeh showTagBar>
      <SectionTitle text={scene.headline} progress={hP} />
      <div style={{ display: "flex", gap: 16, width: "100%", maxWidth: 1520 }}>
        {concepts.map((concept, index) => {
          const p = spring({ frame: frame - 6 - index * 7, fps, config: { damping: 13, mass: 0.5, stiffness: 100 } });
          return (
            <div
              key={concept.label}
              style={{
                background: palette.panelDense, border: `1.5px solid ${concept.c}55`,
                borderRadius: 24, opacity: p, padding: "28px 20px 22px",
                scale: interpolate(p, [0, 1], [0.9, 1]),
                rotate: `${interpolate(p, [0, 1], [4, 0])}deg`,
                textAlign: "center",
                translate: `0 ${interpolate(p, [0, 1], [24, 0])}px`,
                width: 270,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>{concept.emoji}</div>
              <div style={{ color: concept.c, fontSize: 26, fontWeight: 950, marginBottom: 10, lineHeight: 1.2 }}>
                {concept.label}
              </div>
              <div style={{ color: palette.ink, fontSize: 20, fontWeight: 600, lineHeight: 1.4, marginBottom: 14, opacity: 0.85 }}>
                {concept.desc}
              </div>
              <div style={{
                background: palette.codeBg, borderRadius: 10, color: concept.c,
                fontFamily: '"JetBrains Mono", monospace', fontSize: 16, fontWeight: 600,
                padding: "10px 12px", wordBreak: "break-word",
              }}>
                {concept.cmd}
              </div>
              <div style={{ color: palette.muted, fontFamily: '"JetBrains Mono", monospace', fontSize: 14, marginTop: 12, opacity: 0.6 }}>
                —— 常用命令
              </div>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};

/* ===== Scene 4: Terminal ===== */
const TerminalScene: FC<{ readonly scene: GitTutorialScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hP = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 0.6, stiffness: 90 } });
  const tP = spring({ frame: frame - 6, fps, config: { damping: 14, mass: 0.5, stiffness: 100 } });

  const cmds = [
    { cmd: "git clone https://github.com/...", desc: "克隆远程仓库" },
    { cmd: "git status", desc: "查看当前仓库状态" },
    { cmd: "git add .", desc: "暂存所有改动文件" },
    { cmd: "git commit -m \"feat: ...\"", desc: "提交成一个版本" },
    { cmd: "git push origin main", desc: "推送本地提交到远程" },
    { cmd: "git pull origin main", desc: "拉取远程最新代码" },
    { cmd: "git branch feature-x", desc: "创建新分支" },
    { cmd: "git checkout feature-x", desc: "切换分支" },
    { cmd: "git log --oneline --graph", desc: "查看提交历史树" },
    { cmd: "git diff", desc: "查看未暂存的改动" },
    { cmd: "git stash", desc: "临时保存工作区" },
    { cmd: "git merge feature-x", desc: "合并分支到当前" },
  ];

  const fileTree = [
    { name: "my-project/", d: true }, { name: "├── .git/", d: true }, { name: "├── src/", d: true },
    { name: "│   ├── components/", d: true }, { name: "│   │   ├── App.tsx", d: false },
    { name: "│   │   ├── Header.tsx", d: false }, { name: "│   │   └── Footer.tsx", d: false },
    { name: "│   ├── utils/", d: true }, { name: "│   │   ├── helpers.ts", d: false },
    { name: "│   │   └── api.ts", d: false }, { name: "│   ├── index.ts", d: false },
    { name: "│   └── main.ts", d: false }, { name: "├── public/", d: true },
    { name: "├── tests/", d: true }, { name: "├── package.json", d: false },
    { name: "└── README.md", d: false },
  ];

  return (
    <SceneShell gradientColors={["#0D1117", "#0a1a14", "#0D1117", "#161B22"]} scene={scene} showBokeh showTagBar>
      <SectionTitle text={scene.headline} progress={hP} />
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Terminal */}
        <div
          style={{
            background: "rgba(0,0,0,0.65)", border: `1px solid ${palette.border}`,
            borderRadius: 18, opacity: tP, overflow: "hidden",
            scale: interpolate(tP, [0, 1], [0.96, 1]),
            translate: `0 ${interpolate(tP, [0, 1], [14, 0])}px`,
            width: 680, flexShrink: 0,
          }}
        >
          <div style={{
            alignItems: "center", background: "rgba(255,255,255,0.06)",
            borderBottom: `1px solid ${palette.border}`, display: "flex", gap: 8, padding: "10px 16px",
          }}>
            <div style={{ background: "#F85149", borderRadius: "50%", height: 14, width: 14 }} />
            <div style={{ background: "#FACC15", borderRadius: "50%", height: 14, width: 14 }} />
            <div style={{ background: "#4ADE80", borderRadius: "50%", height: 14, width: 14 }} />
            <div style={{ color: palette.muted, fontSize: 14, fontWeight: 700, marginLeft: 14 }}>
              git-workflow — zsh — 80×24
            </div>
          </div>
          <div style={{ padding: "14px 18px" }}>
            {cmds.map((c, i) => {
              const p = spring({ frame: frame - 10 - i * 3, fps, config: { damping: 20, mass: 0.4, stiffness: 120 } });
              return (
                <div key={c.cmd} style={{
                  alignItems: "center", display: "flex", gap: 14, marginBottom: 4,
                  opacity: p, padding: "3px 0",
                  translate: `0 ${interpolate(p, [0, 1], [8, 0])}px`,
                }}>
                  <span style={{
                    color: palette.green, fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 16, fontWeight: 700, minWidth: 330,
                  }}>
                    $ {c.cmd}
                  </span>
                  <span style={{ color: palette.muted, fontSize: 15, fontWeight: 600 }}>
                    # {c.desc}
                  </span>
                  {i === cmds.length - 1 && Math.sin(frame * 0.3 + i * 2) > 0 && (
                    <span style={{ color: palette.green, fontFamily: 'monospace', fontSize: 16 }}>▊</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* File tree */}
        <div
          style={{
            background: "rgba(0,0,0,0.5)", border: `1px solid ${palette.border}`,
            borderRadius: 14, opacity: interpolate(tP, [0, 1], [0, 1]),
            padding: "14px 18px",
            translate: `0 ${interpolate(tP, [0, 1], [14, 0])}px`,
            width: 280,
          }}
        >
          <div style={{ color: palette.muted, fontSize: 12, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            📁 项目文件树
          </div>
          {fileTree.map((item, i) => {
            const p = spring({ frame: frame - 14 - i * 2, fps, config: { damping: 20, mass: 0.3, stiffness: 150 } });
            return (
              <div key={item.name} style={{
                color: item.d ? palette.commit : palette.ink,
                fontFamily: '"JetBrains Mono", monospace', fontSize: 13,
                fontWeight: item.d ? 700 : 500, marginBottom: 3,
                opacity: interpolate(p, [0, 1], [0, 0.85]),
                translate: `0 ${interpolate(p, [0, 1], [6, 0])}px`,
              }}>
                {item.name}
              </div>
            );
          })}
        </div>
      </div>
    </SceneShell>
  );
};

/* ===== Scene 5: Agent ===== */
const AgentFlowScene: FC<{ readonly scene: GitTutorialScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hP = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 0.6, stiffness: 90 } });

  const steps = [
    { c: palette.green, icon: "🔵", label: "1. main 分支", desc: "稳定的代码基 → 从这里开始开发" },
    { c: palette.branch, icon: "🟡", label: "2. 新建分支", desc: "git checkout -b feature/ai-task — 隔离 AI 改动" },
    { c: palette.commit, icon: "🟢", label: "3. Agent 运行", desc: "AI 自动编写代码 → 自动 git commit" },
    { c: palette.merge, icon: "🟣", label: "4. Review 合并", desc: "git diff 审查 → git merge 整合到 main" },
    { c: palette.orange, icon: "🟠", label: "5. 查看历史", desc: "git log --oneline — 追踪 AI 每次改动" },
  ];

  const diffLines = [
    { t: "header", text: "▶ git diff main..feature" },
    { t: "", text: "--- a/src/auth.ts" },
    { t: "", text: "+++ b/src/auth.ts" },
    { t: "plus", text: "+ import { auth } from \"@/lib/auth\"" },
    { t: "plus", text: "+ export function login(email, pwd) {" },
    { t: "plus", text: "+   return auth.verify(email, pwd);" },
    { t: "minus", text: "- // TODO: implement login function" },
    { t: "plus", text: "+ }" },
    { t: "context", text: " 3 files changed, 42 insertions(+), 1 deletion(-)" },
  ];

  return (
    <SceneShell gradientColors={["#0D1117", "#141a2e", "#0D1117", "#161B22"]} scene={scene} showBokeh showTagBar>
      <SectionTitle text={scene.headline} progress={hP} />
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Timeline */}
        <div style={{ alignItems: "flex-start", display: "flex", flexDirection: "column", gap: 0, flexShrink: 0 }}>
          {steps.map((step, i) => {
            const p = spring({ frame: frame - 6 - i * 9, fps, config: { damping: 14, mass: 0.5, stiffness: 100 } });
            return (
              <div key={step.label} style={{
                alignItems: "center", borderLeft: i > 0 ? `2px dashed ${step.c}55` : "none",
                display: "flex", gap: 16, marginLeft: 16, opacity: p,
                padding: "10px 0 10px 30px", position: "relative",
                scale: interpolate(p, [0, 1], [0.97, 1]),
                translate: `0 ${interpolate(p, [0, 1], [12, 0])}px`,
              }}>
                <div style={{
                  background: step.c, borderRadius: "50%", boxShadow: `0 0 14px ${step.c}88`,
                  height: 16, left: -8, position: "absolute", width: 16,
                }} />
                <div style={{
                  background: palette.panelDense, border: `1.5px solid ${step.c}55`,
                  borderRadius: 16, padding: "14px 22px", width: 520,
                }}>
                  <div style={{ color: step.c, fontSize: 24, fontWeight: 900, marginBottom: 4 }}>
                    {step.label}
                  </div>
                  <div style={{ color: palette.ink, fontSize: 20, fontWeight: 600, opacity: 0.8 }}>
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Code diff */}
        <div
          style={{
            background: "rgba(0,0,0,0.55)", border: `1px solid ${palette.border}`,
            borderRadius: 14, fontFamily: '"JetBrains Mono", monospace',
            opacity: spring({ frame: frame - 28, fps, config: { damping: 14, mass: 0.5, stiffness: 100 } }),
            padding: "14px 18px",
            translate: `0 ${interpolate(Math.min(1, frame / 55), [0, 1], [20, 0])}px`,
            width: 420,
          }}
        >
          <div style={{ color: palette.muted, fontSize: 12, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            📋 代码审查 (Code Review)
          </div>
          {diffLines.map((line, i) => {
            const p = spring({ frame: frame - 30 - i * 4, fps, config: { damping: 20, mass: 0.3, stiffness: 150 } });
            const lc = line.t === "plus" ? palette.green : line.t === "minus" ? "#F85149" : line.t === "header" ? palette.commit : palette.ink;
            return (
              <div key={i} style={{
                color: lc, fontSize: 14, fontWeight: line.t === "header" ? 700 : 500,
                marginBottom: 3, opacity: p, padding: "2px 8px",
                background: line.t === "plus" ? "rgba(74,222,128,0.08)" : line.t === "minus" ? "rgba(248,81,73,0.08)" : "transparent",
                borderRadius: 3,
                translate: `0 ${interpolate(p, [0, 1], [6, 0])}px`,
              }}>
                {line.text}
              </div>
            );
          })}
        </div>
      </div>
    </SceneShell>
  );
};

/* ===== Scene 6: Tips ===== */
const TipsScene: FC<{ readonly scene: GitTutorialScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hP = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 0.6, stiffness: 90 } });

  const tips = [
    { num: "01", accent: palette.green, text: "经常提交，每次改动专注一件事", sub: "每次提交后都有完整的变更记录，随时可以回退到任意版本" },
    { num: "02", accent: palette.commit, text: "提交信息写清楚，让未来看懂", sub: "好的提交信息能让团队协作效率翻倍，三个月后你自己也会感谢自己" },
    { num: "03", accent: palette.branch, text: "提交前 git diff 审查一遍", sub: "Review 能发现 80% 以上的潜在问题，养成习惯后能大幅减少 bug" },
    { num: "04", accent: palette.orange, text: "不确定时，先 git status", sub: "git status 是最安全的命令，随时查看当前仓库状态，永远不会出错" },
  ];

  return (
    <SceneShell scene={scene} showBokeh showTagBar>
      <SectionTitle text={scene.headline} progress={hP} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 1400 }}>
        {tips.map((tip, i) => {
          const p = spring({ frame: frame - 6 - i * 9, fps, config: { damping: 14, mass: 0.5, stiffness: 100 } });
          return (
            <div key={tip.num} style={{
              background: palette.panelDense, border: `1px solid ${tip.accent}44`,
              borderRadius: 16, opacity: p, padding: "20px 28px 18px",
              scale: interpolate(p, [0, 1], [0.97, 1]),
              translate: `0 ${interpolate(p, [0, 1], [14, 0])}px`,
            }}>
              <div style={{ alignItems: "center", display: "flex", gap: 20 }}>
                <div style={{
                  background: `${tip.accent}18`, borderRadius: 10, color: tip.accent,
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 24, fontWeight: 900,
                  padding: "6px 14px", minWidth: 44, textAlign: "center",
                }}>
                  {tip.num}
                </div>
                <div style={{ color: palette.ink, fontSize: 30, fontWeight: 700 }}>{tip.text}</div>
              </div>
              <div style={{
                borderTop: `1px solid ${tip.accent}22`, color: palette.muted, fontSize: 22,
                fontWeight: 500, lineHeight: 1.45, marginLeft: 78, marginTop: 10,
                opacity: interpolate(p, [0, 1], [0, 0.85]), paddingTop: 10,
              }}>
                💡 {tip.sub}
              </div>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};

/* ===== Scene 7: Closing ===== */
const ClosingScene: FC<{ readonly scene: GitTutorialScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoP = spring({ frame: frame - 2, fps, config: { damping: 12, mass: 0.8, stiffness: 80 } });
  const textP = spring({ frame: frame - 10, fps, config: { damping: 14, mass: 0.5, stiffness: 100 } });
  const glowPulse = Math.sin(frame * 0.04) * 0.5 + 0.5;
  const fadeOut = interpolate(frame, [scene.durationInFrames - 20, scene.durationInFrames], [1, 0], clamp);

  const finalTips = [
    "✓ git status 查看状态",
    "✓ git diff 审查改动",
    "✓ 写清晰提交信息",
    "✓ 分支隔离不同工作",
    "✓ 经常提交小改动",
    "✓ 用 git log 追踪历史",
  ];

  const stats = [
    { n: "87%", label: "开发者使用 Git" },
    { n: "100M+", label: "GitHub 仓库" },
    { n: "17年", label: "Git 历史" },
  ];

  return (
    <SceneShell gradientColors={["#0D1117", "#1a2e1a", "#0D1117", "#161B22"]} scene={scene} showBokeh showTagBar>
      <div style={{
        opacity: fadeOut, scale: interpolate(fadeOut, [0, 1], [0.97, 1]),
        display: "flex", flexDirection: "column", alignItems: "center", width: "100%",
      }}>
        {/* Logo */}
        <div style={{
          background: palette.panelDense, border: `1.5px solid ${palette.green}55`,
          borderRadius: 30, boxShadow: `0 0 ${80 + glowPulse * 60}px ${palette.green}22`,
          marginBottom: 28, padding: "28px 48px",
          scale: interpolate(logoP, [0, 1], [0.85, 1]), opacity: logoP,
        }}>
          <span style={{ color: palette.ink, fontSize: 72, fontWeight: 950, letterSpacing: "-0.02em" }}>git</span>
          <span style={{ color: palette.green, fontSize: 72, fontWeight: 300, marginLeft: 20 }}>--help</span>
        </div>
        <EntranceKicker delay={5} text={scene.kicker} />
        <EntranceHeadline delay={7} text={scene.headline} />
        <div style={{ color: palette.muted, fontSize: 26, fontWeight: 700, marginTop: 28, opacity: textP }}>
          Happy coding 🚀 现在就 git init 吧
        </div>
        {/* Stat row */}
        <div style={{
          display: "flex", gap: 24, marginTop: 24,
          opacity: interpolate(textP, [0, 1], [0, 1]),
        }}>
          {stats.map((s, i) => {
            const p = spring({ frame: frame - 14 - i * 6, fps, config: { damping: 14, mass: 0.4, stiffness: 120 } });
            return (
              <div key={s.label} style={{
                background: palette.panel, border: `1px solid ${palette.border}`,
                borderRadius: 12, opacity: p, padding: "12px 24px", textAlign: "center",
                scale: interpolate(p, [0, 1], [0.95, 1]),
              }}>
                <div style={{ color: palette.green, fontSize: 28, fontWeight: 950 }}>{s.n}</div>
                <div style={{ color: palette.muted, fontSize: 16, fontWeight: 600 }}>{s.label}</div>
              </div>
            );
          })}
        </div>
        {/* Final checklist */}
        <div style={{
          display: "flex", gap: 12, marginTop: 20,
          opacity: interpolate(textP, [0, 1], [0, 1]),
          flexWrap: "wrap", justifyContent: "center",
        }}>
          {finalTips.map((tip, i) => {
            const p = spring({ frame: frame - 18 - i * 5, fps, config: { damping: 14, mass: 0.4, stiffness: 120 } });
            return (
              <div key={tip} style={{
                background: palette.panel, border: `1px solid ${palette.border}`,
                borderRadius: 8, color: palette.ink, fontSize: 18, fontWeight: 600,
                opacity: p, padding: "8px 16px",
                scale: interpolate(p, [0, 1], [0.95, 1]),
              }}>
                {tip}
              </div>
            );
          })}
        </div>
      </div>
    </SceneShell>
  );
};

/* ===== Scene Router ===== */
const sceneComponents: Record<string, FC<{ readonly scene: GitTutorialScene }>> = {
  hero: HeroScene,
  bullets: BulletsScene,
  "concept-diagram": ConceptDiagramScene,
  "terminal-flow": TerminalScene,
  "agent-flow": AgentFlowScene,
  "checklist": TipsScene,
  "closing": ClosingScene,
};

/* ===== Main Composition ===== */
export const GitTutorialForDevsVideo: FC<{ readonly data: GitTutorialData }> = ({ data }) => {
  return (
    <StandaloneTimeline
      scenes={data.scenes}
      renderScene={(scene) => {
        const Component = sceneComponents[scene.visual.kind];
        return Component ? <Component scene={scene} /> : null;
      }}
      renderAudio={(scene) => (
        <StandaloneVoiceover audioFile={scene.audioFile} playbackRate={GIT_TUTORIAL_VOICEOVER_PLAYBACK_RATE} />
      )}
    />
  );
};

export const gitTutorialMetadata = {
  compositionId: "GitTutorialForDevs",
  durationInFrames: GIT_TUTORIAL_DURATION_IN_FRAMES,
  fps: GIT_TUTORIAL_FPS,
  height: 1080,
  width: 1920,
};