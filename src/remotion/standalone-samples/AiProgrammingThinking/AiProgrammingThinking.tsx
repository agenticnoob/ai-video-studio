import type {CSSProperties} from "react";
import {
  AbsoluteFill, Audio, Easing, Sequence, interpolate, spring,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import {NARRATIONS, SCENE_DURATIONS} from "./constants";

const SCENE_STARTS = {
  title: 0,
  shift1: SCENE_DURATIONS.title,
  shift2: SCENE_DURATIONS.title + SCENE_DURATIONS.shift1,
  quote: SCENE_DURATIONS.title + SCENE_DURATIONS.shift1 + SCENE_DURATIONS.shift2,
};

export const AiProgrammingThinking = () => {
  return (
    <AbsoluteFill style={styles.root}>
      <DarkGridBackground />
      <Sequence from={SCENE_STARTS.title} durationInFrames={SCENE_DURATIONS.title}><TitleScene /></Sequence>
      <Sequence from={SCENE_STARTS.shift1} durationInFrames={SCENE_DURATIONS.shift1}><ShiftOneScene /></Sequence>
      <Sequence from={SCENE_STARTS.shift2} durationInFrames={SCENE_DURATIONS.shift2}><ShiftTwoScene /></Sequence>
      <Sequence from={SCENE_STARTS.quote} durationInFrames={SCENE_DURATIONS.quote}><QuoteScene /></Sequence>
    </AbsoluteFill>
  );
};

const TitleScene = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const title = "AI 时代的编程思维";
  const subtitleOpacity = interpolate(frame, [36, 62], [0, 1], { extrapolateRight: "clamp" });
  const subtitleY = interpolate(frame, [36, 62], [22, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const lineScale = spring({ frame, fps, config: { damping: 14, stiffness: 90 } });
  return (
    <AbsoluteFill style={styles.scene}>
      <Audio src={staticFile("standalone-samples/audio/ai-programming-title.wav")} />
      <div style={styles.sceneLabel}>AI PROGRAMMING MINDSET</div>
      <div style={styles.titleSceneWrap}>
        <div style={{ ...styles.titleUnderline, transform: `scaleX(${  lineScale  })` }} />
        <div style={styles.titleLine}>
          {title.split("").map((char, index) => {
            const pop = spring({ frame: frame - index * 3, fps, config: { damping: 12, stiffness: 180, mass: 0.8 } });
            const opacity = interpolate(frame - index * 3, [0, 10], [0, 1], { extrapolateRight: "clamp" });
            const y = interpolate(pop, [0, 1], [42, 0]);
            const scale = interpolate(pop, [0, 1], [0.72, 1]);
            return (<span key={`${char}-${index}`} style={{...styles.titleChar, opacity, transform: `translateY(${y}px) scale(${scale})`}}>{char}</span>);
          })}
        </div>
        <div style={{...styles.subtitle, opacity: subtitleOpacity, transform: `translateY(${subtitleY}px)`}}>从写代码，到设计智能协作</div>
        <div style={styles.titleHint}>Prompt Review Build Iterate</div>
      </div>
      <Caption text={NARRATIONS.title} duration={SCENE_DURATIONS.title} />
    </AbsoluteFill>
  );
};

const ShiftOneScene = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cards = [
    { number: "01", title: "定义目标", desc: "先明确你要解决什么问题，而不是直接冲进实现细节。" },
    { number: "02", title: "拆解任务", desc: "把复杂问题拆成一组清晰、可验证的小步骤。" },
    { number: "03", title: "驱动 AI", desc: "用准确描述去生成代码、文档和测试，然后快速迭代。" },
  ];
  return (
    <AbsoluteFill style={styles.scene}>
      <Audio src={staticFile("standalone-samples/audio/ai-programming-shift1.wav")} />
      <SectionHeader tag="SHIFT 01" title="从语法到意图" subtitle="先把问题说清楚，再让 AI 协助你完成实现。" />
      <div style={styles.cardGrid}>
        {cards.map((card, index) => {
          const enter = spring({ frame: frame - index * 10, fps, config: { damping: 18, stiffness: 120 } });
          const opacity = interpolate(frame - index * 10, [0, 18], [0, 1], { extrapolateRight: "clamp" });
          const x = interpolate(enter, [0, 1], [120, 0]);
          return (<div key={card.number} style={{...styles.card, opacity, transform: `translateX(${x}px)`}}>
            <div style={styles.cardNumber}>{card.number}</div>
            <div style={styles.cardTitle}>{card.title}</div>
            <div style={styles.cardDesc}>{card.desc}</div>
          </div>);
        })}
      </div>
      <Caption text={NARRATIONS.shift1} duration={SCENE_DURATIONS.shift1} />
    </AbsoluteFill>
  );
};

const ShiftTwoScene = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const items = [
    { icon: "?", title: "会提问", desc: "把模糊需求变成结构化、可执行的提示。" },
    { icon: String.fromCharCode(10003), title: "会验证", desc: "检查逻辑正确性、边界条件和潜在风险。" },
    { icon: String.fromCharCode(8594), title: "会取舍", desc: "判断哪些方案能落地，哪些结果必须重来。" },
  ];
  const rightPanelEnter = spring({ frame, fps, config: { damping: 17, stiffness: 95 } });
  return (
    <AbsoluteFill style={styles.scene}>
      <Audio src={staticFile("standalone-samples/audio/ai-programming-shift2.wav")} />
      <SectionHeader tag="SHIFT 02" title="从执行到判断" subtitle="AI 能快速生成答案，但判断力依然是人的核心价值。" />
      <div style={styles.splitLayout}>
        <div style={styles.iconPanel}>
          {items.map((item, index) => {
            const opacity = interpolate(frame - index * 12, [8, 24], [0, 1], { extrapolateRight: "clamp" });
            const x = interpolate(frame - index * 12, [8, 24], [-28, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
            return (<div key={item.title} style={{...styles.iconRow, opacity, transform: `translateX(${x}px)`}}>
              <div style={styles.iconBubble}>{item.icon}</div>
              <div><div style={styles.iconTitle}>{item.title}</div><div style={styles.iconDesc}>{item.desc}</div></div>
            </div>);
          })}
        </div>
        <div style={{...styles.codePanel, opacity: rightPanelEnter, transform: `translateY(${interpolate(rightPanelEnter, [0, 1], [52, 0])}px)`}}>
          <div style={styles.codeHeader}><span style={styles.dot} /><span style={styles.dot} /><span style={styles.dot} /></div>
          <div style={styles.codeBody}>
            {["const draft = await ai.generate(prompt);","const risks = review(draft);","const result = refine(draft, risks);","ship(result);"].map((line, index) => {
              const reveal = interpolate(frame - index * 12, [8, 28], [0, 100], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
              return (<div key={line} style={styles.codeLineWrap}>
                <div style={styles.codeLine}>{line}</div>
                <div style={{...styles.codeMask, width: `${100 - reveal  }%`}} />
              </div>);
            })}
          </div>
        </div>
      </div>
      <Caption text={NARRATIONS.shift2} duration={SCENE_DURATIONS.shift2} />
    </AbsoluteFill>
  );
};

const QuoteScene = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const quoteEnter = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const opacity = interpolate(frame, [0, 24], [0, 1], { extrapolateRight: "clamp" });
  const progress = interpolate(frame, [0, Math.max(1, SCENE_DURATIONS.quote - 1)], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={styles.scene}>
      <Audio src={staticFile("standalone-samples/audio/ai-programming-quote.wav")} />
      <div style={styles.quoteSceneWrap}>
        <div style={styles.quoteGlowRing} />
        <div style={styles.quoteMark}>{String.fromCharCode(8220)}</div>
        <div style={{...styles.quoteText, opacity, transform: `scale(${interpolate(quoteEnter, [0, 1], [0.92, 1])})`}}>
          未来的程序员<br />不是被 AI 替代<br />而是会用 AI 放大自己
        </div>
        <div style={{...styles.quoteAuthor, opacity}}>AI 编程思维</div>
        <div style={styles.progressTrack}><div style={{...styles.progressFill, width: `${progress  }%`}} /></div>
      </div>
      <Caption text={NARRATIONS.quote} duration={SCENE_DURATIONS.quote} />
    </AbsoluteFill>
  );
};

const DarkGridBackground = () => {
  const frame = useCurrentFrame();
  const glowX = interpolate(Math.sin(frame / 70), [-1, 1], [-90, 90]);
  const glowY = interpolate(Math.cos(frame / 90), [-1, 1], [-60, 60]);
  return (
    <AbsoluteFill style={styles.background}>
      <AbsoluteFill style={styles.grid} />
      <div style={{...styles.blueGlow, transform: `translate(${glowX}px,${glowY}px)`}} />
      <div style={{...styles.purpleGlow, transform: `translate(${-glowX}px,${-glowY}px)`}} />
      <div style={styles.vignette} />
    </AbsoluteFill>
  );
};

const SectionHeader = ({tag, title, subtitle}: {tag: string; title: string; subtitle: string}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(frame, [0, 20], [24, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (<div style={{...styles.sectionHeader, opacity, transform: `translateY(${y}px)`}}>
    <div style={styles.sectionTag}>{tag}</div>
    <div style={styles.sectionTitle}>{title}</div>
    <div style={styles.sectionSubtitle}>{subtitle}</div>
  </div>);
};

const Caption = ({text, duration}: {text: string; duration: number}) => {
  const frame = useCurrentFrame();
  const sd = Math.max(1, duration);
  const opacity = interpolate(frame, [0, 12, Math.max(13, sd - 16), sd], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(frame, [0, 12], [18, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (<div style={{...styles.caption, opacity, transform: `translateX(-50%) translateY(${y}px)`}}>{text}</div>);
};

const styles: Record<string, CSSProperties> = {
  root: { width: "100%", height: "100%", backgroundColor: "#09111f", color: "#f8fafc",
    fontFamily: 'Inter, "SF Pro Display", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
    overflow: "hidden" },
  background: { background: "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.08), transparent 30%), radial-gradient(circle at 80% 30%, rgba(168,85,247,0.08), transparent 35%), #09111f" },
  grid: { opacity: 0.28, backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
    backgroundSize: "44px 44px", maskImage: "linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)" },
  blueGlow: { position: "absolute", left: 60, top: 70, width: 420, height: 420, borderRadius: 999,
    background: "rgba(56,189,248,0.16)", filter: "blur(90px)" },
  purpleGlow: { position: "absolute", right: 90, bottom: 50, width: 440, height: 440, borderRadius: 999,
    background: "rgba(168,85,247,0.14)", filter: "blur(110px)" },
  vignette: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.18), transparent 36%, rgba(0,0,0,0.5))" },
  scene: { padding: "70px 86px", justifyContent: "center" },
  sceneLabel: { position: "absolute", left: 86, top: 74, fontSize: 18, fontWeight: 900, letterSpacing: 4, color: "#7dd3fc" },
  titleSceneWrap: { maxWidth: 1120, position: "relative" },
  titleUnderline: { position: "absolute", top: -24, left: 0, width: 180, height: 6, borderRadius: 999,
    background: "linear-gradient(90deg, #38bdf8, #a855f7)", transformOrigin: "left center", boxShadow: "0 0 24px rgba(56,189,248,0.35)" },
  titleLine: { display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" },
  titleChar: { display: "inline-block", fontSize: 90, lineHeight: 1.04, fontWeight: 950, letterSpacing: -4,
    textShadow: "0 24px 80px rgba(56,189,248,0.16)" },
  subtitle: { marginTop: 26, fontSize: 34, lineHeight: 1.35, color: "rgba(241,245,249,0.84)", fontWeight: 650 },
  titleHint: { marginTop: 30, display: "inline-flex", padding: "12px 18px", borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.2)", background: "rgba(15,23,42,0.48)", fontSize: 18,
    color: "rgba(191,219,254,0.82)", letterSpacing: 1.2 },
  sectionHeader: { position: "absolute", left: 86, top: 68, width: 820 },
  sectionTag: { color: "#7dd3fc", fontSize: 18, fontWeight: 900, letterSpacing: 4, marginBottom: 12 },
  sectionTitle: { fontSize: 58, lineHeight: 1.04, fontWeight: 950, letterSpacing: -2 },
  sectionSubtitle: { marginTop: 16, fontSize: 24, lineHeight: 1.45, color: "rgba(226,232,240,0.72)" },
  cardGrid: { position: "absolute", left: 86, right: 86, bottom: 138, display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)", gap: 26 },
  card: { minHeight: 230, borderRadius: 28, padding: 30,
    background: "linear-gradient(145deg, rgba(15,23,42,0.94), rgba(30,41,59,0.78))",
    border: "1px solid rgba(148,163,184,0.18)", boxShadow: "0 28px 90px rgba(0,0,0,0.28)" },
  cardNumber: { display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 72, height: 42, padding: "0 18px", borderRadius: 999, background: "rgba(56,189,248,0.14)",
    color: "#7dd3fc", fontSize: 21, fontWeight: 900, marginBottom: 24 },
  cardTitle: { fontSize: 32, fontWeight: 900, marginBottom: 14 },
  cardDesc: { fontSize: 21, lineHeight: 1.58, color: "rgba(226,232,240,0.72)" },
  splitLayout: { position: "absolute", left: 86, right: 86, bottom: 134,
    display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: 32, alignItems: "stretch" },
  iconPanel: { borderRadius: 30, padding: 28, background: "rgba(15,23,42,0.84)",
    border: "1px solid rgba(125,211,252,0.18)", boxShadow: "0 28px 80px rgba(0,0,0,0.26)" },
  iconRow: { display: "flex", gap: 20, alignItems: "center", minHeight: 92,
    borderBottom: "1px solid rgba(148,163,184,0.14)" },
  iconBubble: { width: 52, height: 52, borderRadius: 16, display: "inline-flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0, background: "rgba(56,189,248,0.16)", color: "#7dd3fc",
    fontSize: 28, fontWeight: 900 },
  iconTitle: { fontSize: 30, fontWeight: 900 },
  iconDesc: { marginTop: 6, fontSize: 19, lineHeight: 1.46, color: "rgba(226,232,240,0.68)" },
  codePanel: { overflow: "hidden", borderRadius: 30, background: "rgba(2,6,23,0.9)",
    border: "1px solid rgba(168,85,247,0.24)", boxShadow: "0 28px 90px rgba(0,0,0,0.3)" },
  codeHeader: { height: 54, display: "flex", alignItems: "center", gap: 10, paddingLeft: 24,
    background: "rgba(15,23,42,0.94)" },
  dot: { width: 12, height: 12, borderRadius: 999, background: "rgba(226,232,240,0.42)" },
  codeBody: { padding: "34px 30px" },
  codeLineWrap: { position: "relative", height: 50, marginBottom: 16, overflow: "hidden" },
  codeLine: { fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 23, whiteSpace: "nowrap", color: "#c4b5fd" },
  codeMask: { position: "absolute", top: 0, right: 0, height: "100%", background: "#020617" },
  quoteSceneWrap: { position: "relative", width: "100%", height: "100%",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" },
  quoteGlowRing: { position: "absolute", width: 620, height: 620, borderRadius: "50%",
    border: "1px solid rgba(125,211,252,0.12)",
    boxShadow: "0 0 140px rgba(56,189,248,0.08), inset 0 0 80px rgba(168,85,247,0.04)" },
  quoteMark: { position: "absolute", top: 88, left: 146, fontSize: 220, lineHeight: 1,
    fontWeight: 950, color: "rgba(125,211,252,0.12)" },
  quoteText: { fontSize: 68, lineHeight: 1.18, fontWeight: 950, letterSpacing: -3,
    textShadow: "0 24px 90px rgba(56,189,248,0.16)" },
  quoteAuthor: { marginTop: 34, fontSize: 24, fontWeight: 800, letterSpacing: 3, color: "rgba(226,232,240,0.68)" },
  progressTrack: { position: "absolute", left: 260, right: 260, bottom: 128, height: 8,
    borderRadius: 999, background: "rgba(148,163,184,0.16)", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999,
    background: "linear-gradient(90deg, #38bdf8, #a855f7)", boxShadow: "0 0 18px rgba(56,189,248,0.35)" },
  caption: { position: "absolute", left: "50%", bottom: 42, maxWidth: 1080,
    padding: "16px 24px", borderRadius: 18, background: "rgba(2,6,23,0.76)",
    border: "1px solid rgba(148,163,184,0.18)", color: "#f8fafc", fontSize: 24,
    lineHeight: 1.42, fontWeight: 650, textAlign: "center",
    boxShadow: "0 18px 60px rgba(0,0,0,0.3)", backdropFilter: "blur(16px)" },
};
