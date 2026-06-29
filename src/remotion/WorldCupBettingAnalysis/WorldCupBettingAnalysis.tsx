import type { CSSProperties, FC, ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { CJK_SANS_FONT_STACK } from "../font-stack";
import { StandaloneTimeline, StandaloneVoiceover } from "../standalone-video";
import { worldCupBettingAudio } from "./audio.generated";
import { worldCupBettingData } from "./data";
import {
  WORLD_CUP_BETTING_ANALYSIS_DURATION_IN_FRAMES,
  WORLD_CUP_BETTING_ANALYSIS_FPS,
  WORLD_CUP_BETTING_ANALYSIS_VOICEOVER_PLAYBACK_RATE,
  type MatchAnalysis,
  type OutcomeKey,
  type SceneId,
  type SceneTiming,
} from "./types";

const palette = {
  background: "#08111F",
  panel: "#101B2E",
  panelDeep: "#07101D",
  ice: "#9ED8FF",
  green: "#27D17F",
  red: "#FF5A5F",
  gold: "#FFD166",
  white: "#F5F7FA",
  muted: "#9AA7B8",
  line: "rgba(158, 216, 255, 0.32)",
  field: "rgba(39, 209, 127, 0.16)",
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const outcomeLabels: Record<OutcomeKey, string> = {
  win: "胜",
  draw: "平",
  loss: "负",
};

const audioTracksBySceneId = new Map(worldCupBettingAudio.map((track) => [track.sceneId, track]));

const getMatch = (id: MatchAnalysis["id"]) => {
  const match = worldCupBettingData.matches.find((candidate) => candidate.id === id);

  if (!match) {
    throw new Error(`Missing match data for ${id}`);
  }

  return match;
};

const formatOdds = (value: number) => value.toFixed(value % 1 === 0 ? 1 : 2);

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const useEnter = (delay = 0, duration = 24) => {
  const frame = useCurrentFrame();

  return interpolate(frame, [delay, delay + duration], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
};

const useSpringEnter = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return spring({
    fps,
    frame: Math.max(0, frame - delay),
    config: {
      damping: 180,
      mass: 0.72,
      stiffness: 180,
    },
  });
};

const panelStyle: CSSProperties = {
  background: "linear-gradient(180deg, rgba(16,27,46,0.96), rgba(7,16,29,0.98))",
  border: `1px solid ${palette.line}`,
  borderRadius: 8,
  boxShadow: "0 26px 80px rgba(0,0,0,0.34)",
};

const SceneShell: FC<{
  readonly timing: SceneTiming;
  readonly children: ReactNode;
  readonly dense?: boolean;
}> = ({ timing, children, dense = false }) => {
  const frame = useCurrentFrame();
  const exit = interpolate(
    frame,
    [Math.max(timing.durationInFrames - 18, 1), timing.durationInFrames],
    [1, 0],
    clamp,
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette.background,
        color: palette.white,
        fontFamily: CJK_SANS_FONT_STACK,
        overflow: "hidden",
      }}
    >
      <TacticalBackground />
      <AbsoluteFill
        style={{
          opacity: exit,
        }}
      >
        <SceneLabel label={timing.label} />
        <main
          style={{
            inset: dense ? "118px 58px 230px" : "142px 76px 248px",
            position: "absolute",
          }}
        >
          {children}
        </main>
        <Subtitle text={timing.subtitle} />
      </AbsoluteFill>
      <FieldLineSweep durationInFrames={timing.durationInFrames} />
    </AbsoluteFill>
  );
};

const SceneLabel: FC<{ readonly label: string }> = ({ label }) => {
  const enter = useEnter(0, 18);

  return (
    <div
      style={{
        color: palette.ice,
        fontSize: 31,
        fontWeight: 800,
        left: 56,
        letterSpacing: 0,
        opacity: enter,
        position: "absolute",
        top: 46,
        transform: `translateY(${(1 - enter) * -18}px)`,
      }}
    >
      {label}
    </div>
  );
};

const Subtitle: FC<{ readonly text: string }> = ({ text }) => {
  const enter = useEnter(8, 16);

  return (
    <div
      style={{
        ...panelStyle,
        alignItems: "center",
        bottom: 58,
        color: palette.white,
        display: "flex",
        fontSize: 30,
        fontWeight: 700,
        justifyContent: "center",
        left: 56,
        lineHeight: 1.38,
        minHeight: 108,
        opacity: enter,
        padding: "20px 34px",
        position: "absolute",
        right: 56,
        textAlign: "center",
        transform: `translateY(${(1 - enter) * 24}px)`,
      }}
    >
      {text}
    </div>
  );
};

const TacticalBackground: FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 80) * 10;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #08111F 0%, #0A1424 52%, #050A12 100%)",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(158,216,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(158,216,255,0.055) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          opacity: 0.4,
          transform: `translate3d(${drift}px, ${drift * 0.4}px, 0)`,
        }}
      />
      <PitchLines opacity={0.24} />
      <div
        style={{
          background:
            "linear-gradient(90deg, rgba(8,17,31,0.92), rgba(8,17,31,0.48) 48%, rgba(8,17,31,0.92))",
          inset: 0,
          position: "absolute",
        }}
      />
    </AbsoluteFill>
  );
};

const PitchLines: FC<{ readonly opacity?: number }> = ({ opacity = 1 }) => (
  <svg
    viewBox="0 0 1080 1920"
    style={{
      height: "100%",
      left: 0,
      opacity,
      position: "absolute",
      top: 0,
      width: "100%",
    }}
  >
    <defs>
      <filter id="fieldGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect
      x="74"
      y="170"
      width="932"
      height="1580"
      rx="22"
      fill="none"
      stroke={palette.ice}
      strokeWidth="3"
    />
    <line x1="74" y1="960" x2="1006" y2="960" stroke={palette.ice} strokeWidth="2" />
    <circle
      cx="540"
      cy="960"
      r="148"
      fill="none"
      stroke={palette.ice}
      strokeWidth="2"
      filter="url(#fieldGlow)"
    />
    <circle cx="540" cy="960" r="8" fill={palette.ice} />
    <rect
      x="298"
      y="170"
      width="484"
      height="170"
      fill="none"
      stroke={palette.ice}
      strokeWidth="2"
    />
    <rect
      x="388"
      y="170"
      width="304"
      height="72"
      fill="none"
      stroke={palette.ice}
      strokeWidth="2"
    />
    <rect
      x="298"
      y="1580"
      width="484"
      height="170"
      fill="none"
      stroke={palette.ice}
      strokeWidth="2"
    />
    <rect
      x="388"
      y="1678"
      width="304"
      height="72"
      fill="none"
      stroke={palette.ice}
      strokeWidth="2"
    />
    <path d="M424 340 A148 148 0 0 0 656 340" fill="none" stroke={palette.ice} strokeWidth="2" />
    <path d="M424 1580 A148 148 0 0 1 656 1580" fill="none" stroke={palette.ice} strokeWidth="2" />
    <path
      d="M74 360 L164 300 M1006 360 L916 300 M74 1560 L164 1620 M1006 1560 L916 1620"
      stroke={palette.ice}
      strokeWidth="2"
    />
  </svg>
);

const FieldLineSweep: FC<{ readonly durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [Math.max(durationInFrames - 18, 1), durationInFrames],
    [0, 1],
    {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    },
  );

  if (progress <= 0 || progress >= 1) {
    return null;
  }

  return (
    <div
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(158,216,255,0.82) 46%, rgba(245,247,250,0.98) 50%, rgba(158,216,255,0.82) 54%, transparent 100%)",
        height: 10,
        left: -220,
        opacity: 0.86,
        position: "absolute",
        top: 958,
        transform: `translateX(${progress * 1520}px) rotate(-8deg)`,
        width: 300,
      }}
    />
  );
};

const TitleScene: FC<{ readonly timing: SceneTiming }> = ({ timing }) => {
  const frame = useCurrentFrame();
  const titleEnter = useSpringEnter(5);
  const odds = [
    { value: "1.20", x: 160, y: 250, color: palette.gold, delay: 10 },
    { value: "1.49", x: 108, y: 640, color: palette.ice, delay: 18 },
    { value: "1.97", x: 520, y: 805, color: palette.green, delay: 24 },
    { value: "3.72", x: 780, y: 930, color: palette.ice, delay: 30 },
    { value: "5.28", x: 820, y: 355, color: palette.ice, delay: 36 },
    { value: "9.70", x: 870, y: 705, color: palette.gold, delay: 42 },
  ];

  return (
    <SceneShell timing={timing}>
      <AbsoluteFill>
        <PitchLines opacity={0.34} />
        {odds.map((odd, index) => {
          const enter = interpolate(frame, [odd.delay, odd.delay + 20], [0, 1], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          });
          const floatY = Math.sin((frame + index * 17) / 24) * 8;

          return (
            <div
              key={odd.value}
              style={{
                color: odd.color,
                fontSize: 48,
                fontWeight: 900,
                left: odd.x,
                opacity: enter * 0.96,
                position: "absolute",
                textShadow: `0 0 24px ${odd.color}66`,
                top: odd.y + floatY,
                transform: `scale(${0.82 + enter * 0.18})`,
              }}
            >
              {odd.value}
            </div>
          );
        })}
        <div
          style={{
            left: 88,
            position: "absolute",
            right: 88,
            textAlign: "center",
            top: 486,
            transform: `scale(${0.86 + titleEnter * 0.14})`,
          }}
        >
          <div
            style={{
              color: palette.white,
              fontSize: 88,
              fontWeight: 950,
              lineHeight: 1.18,
              textShadow: "0 18px 46px rgba(0,0,0,0.58)",
            }}
          >
            胜率最高
          </div>
          <div
            style={{
              color: palette.red,
              fontSize: 78,
              fontWeight: 950,
              lineHeight: 1.08,
              textShadow: `0 0 34px ${palette.red}66`,
            }}
          >
            不等于
          </div>
          <div
            style={{
              color: palette.white,
              fontSize: 82,
              fontWeight: 950,
              lineHeight: 1.18,
            }}
          >
            数学期望最高
          </div>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};

const SourceScene: FC<{ readonly timing: SceneTiming }> = ({ timing }) => {
  const enter = useSpringEnter(4);
  const frame = useCurrentFrame();
  const activeIndex = Math.min(2, Math.floor(frame / 48));

  return (
    <SceneShell timing={timing}>
      <div
        style={{
          display: "grid",
          gap: 28,
          gridTemplateRows: "1fr 248px",
          height: "100%",
        }}
      >
        <div
          style={{
            ...panelStyle,
            overflow: "hidden",
            padding: 28,
            transform: `translateY(${(1 - enter) * 56}px)`,
          }}
        >
          <div style={{ display: "grid", gap: 20, gridTemplateRows: "1fr auto", height: "100%" }}>
            <OddsTable activeIndex={activeIndex} />
            <div
              style={{
                ...panelStyle,
                padding: "18px 22px",
              }}
            >
              <div
                style={{
                  color: palette.ice,
                  fontSize: 22,
                  fontWeight: 900,
                  marginBottom: 12,
                }}
              >
                当前高亮场次百家去水概率
              </div>
              <ProbabilityBar
                values={worldCupBettingData.matches[activeIndex].noVigProbabilities}
              />
            </div>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          {["竞彩赔率", "百家平均", "ModelVerify", "积分情绪"].map((label, index) => {
            const itemEnter = interpolate(frame, [20 + index * 8, 40 + index * 8], [0, 1], {
              ...clamp,
              easing: Easing.out(Easing.cubic),
            });
            return (
              <div
                key={label}
                style={{
                  ...panelStyle,
                  alignItems: "center",
                  color: index === activeIndex ? palette.gold : palette.ice,
                  display: "flex",
                  fontSize: 32,
                  fontWeight: 900,
                  gap: 18,
                  opacity: itemEnter,
                  padding: "24px 28px",
                  transform: `translateX(${(1 - itemEnter) * 36}px)`,
                }}
              >
                <DataIcon index={index} />
                {label}
              </div>
            );
          })}
        </div>
      </div>
    </SceneShell>
  );
};

const OddsTable: FC<{ readonly activeIndex: number }> = ({ activeIndex }) => {
  const rows = worldCupBettingData.matches;

  return (
    <div
      style={{
        background: "#EAF1F8",
        border: "1px solid rgba(158,216,255,0.36)",
        borderRadius: 8,
        color: "#142033",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "#F8FBFF",
          borderBottom: "1px solid #C8D4E4",
          display: "grid",
          fontSize: 24,
          fontWeight: 900,
          gridTemplateColumns: "120px 120px 1fr 118px 118px 118px",
          padding: "18px 14px",
        }}
      >
        <span>编号</span>
        <span>赛事</span>
        <span>主队 VS 客队</span>
        <span>胜</span>
        <span>平</span>
        <span>负</span>
      </div>
      {rows.map((match, index) => (
        <div
          key={match.id}
          style={{
            alignItems: "center",
            background: activeIndex === index ? "rgba(158,216,255,0.28)" : "#F1F6FC",
            borderBottom: index === rows.length - 1 ? "none" : "1px solid #C8D4E4",
            boxShadow:
              activeIndex === index
                ? `inset 0 0 0 4px ${palette.ice}`
                : "inset 0 0 0 0 transparent",
            display: "grid",
            fontSize: 25,
            fontWeight: 800,
            gridTemplateColumns: "120px 120px 1fr 118px 118px 118px",
            minHeight: 154,
            padding: "18px 14px",
          }}
        >
          <span>周-0{74 + index}</span>
          <span
            style={{
              background: "#1967D2",
              borderRadius: 5,
              color: "#fff",
              display: "inline-block",
              padding: "6px 10px",
              textAlign: "center",
              width: 78,
            }}
          >
            世界杯
          </span>
          <span>
            [{index + 5}]{match.homeTeam} VS {match.awayTeam}[{15 - index}]
          </span>
          <strong>{formatOdds(match.marketOdds.win)}</strong>
          <strong>{formatOdds(match.marketOdds.draw)}</strong>
          <strong>{formatOdds(match.marketOdds.loss)}</strong>
        </div>
      ))}
    </div>
  );
};

const DataIcon: FC<{ readonly index: number }> = ({ index }) => {
  const colors = [palette.ice, palette.green, palette.ice, palette.red];

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
      <rect
        x="5"
        y="5"
        width="38"
        height="38"
        rx="10"
        fill="rgba(158,216,255,0.08)"
        stroke={colors[index]}
      />
      {index === 0 ? (
        <>
          <rect x="13" y="26" width="5" height="10" fill={colors[index]} />
          <rect x="22" y="20" width="5" height="16" fill={colors[index]} />
          <rect x="31" y="13" width="5" height="23" fill={colors[index]} />
        </>
      ) : index === 1 ? (
        <path d="M24 10 A14 14 0 1 1 10 24 H24 Z" fill={colors[index]} />
      ) : index === 2 ? (
        <text x="24" y="30" fill={colors[index]} fontSize="17" fontWeight="900" textAnchor="middle">
          AI
        </text>
      ) : (
        <path
          d="M24 36 C13 29 10 22 13 16 C16 11 22 13 24 17 C26 13 32 11 35 16 C38 22 35 29 24 36 Z"
          fill={colors[index]}
        />
      )}
    </svg>
  );
};

const FormulaScene: FC<{ readonly timing: SceneTiming }> = ({ timing }) => {
  const frame = useCurrentFrame();
  const cardEnter = useSpringEnter(6);
  const pointer = interpolate(frame, [42, 82], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <SceneShell timing={timing}>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: 74,
          height: "100%",
          justifyContent: "center",
          transform: `scale(${0.9 + cardEnter * 0.1})`,
        }}
      >
        <div
          style={{
            ...panelStyle,
            borderColor: "rgba(158,216,255,0.78)",
            boxShadow: `0 0 56px ${palette.ice}22, 0 26px 80px rgba(0,0,0,0.42)`,
            color: palette.white,
            fontSize: 68,
            fontWeight: 950,
            padding: "50px 68px",
          }}
        >
          EV = P × Odds - 1
        </div>
        <div
          style={{
            position: "relative",
            width: 850,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              height: 24,
              overflow: "hidden",
            }}
          >
            <div style={{ background: "linear-gradient(90deg, #F54242, #FFB347)" }} />
            <div style={{ background: "linear-gradient(90deg, #FFD166, #27D17F)" }} />
          </div>
          <div
            style={{
              background: palette.white,
              height: 82,
              left: `calc(50% - ${(1 - pointer) * 180}px)`,
              position: "absolute",
              top: -29,
              width: 4,
            }}
          />
          <div
            style={{
              color: palette.muted,
              display: "flex",
              fontSize: 24,
              fontWeight: 800,
              justifyContent: "space-between",
              marginTop: 22,
            }}
          >
            <span>-100%</span>
            <span>-50%</span>
            <span>0</span>
            <span>+50%</span>
            <span>+100%</span>
          </div>
          <div
            style={{
              color: palette.ice,
              fontSize: 30,
              fontWeight: 900,
              marginTop: 42,
              textAlign: "center",
            }}
          >
            当前多数在负区
          </div>
        </div>
      </div>
    </SceneShell>
  );
};

const MatchScene: FC<{ readonly timing: SceneTiming; readonly match: MatchAnalysis }> = ({
  timing,
  match,
}) => {
  if (match.id === "germany-paraguay") {
    return <GermanyScene timing={timing} match={match} />;
  }

  if (match.id === "netherlands-morocco") {
    return <NetherlandsScene timing={timing} match={match} />;
  }

  return <BrazilScene timing={timing} match={match} />;
};

const BrazilScene: FC<{ readonly timing: SceneTiming; readonly match: MatchAnalysis }> = ({
  timing,
  match,
}) => {
  const enter = useSpringEnter(4);

  return (
    <SceneShell timing={timing} dense>
      <div
        style={{
          alignItems: "center",
          display: "grid",
          gap: 28,
          gridTemplateColumns: "1fr 86px 1fr",
          height: "100%",
          transform: `translateY(${(1 - enter) * 56}px)`,
        }}
      >
        <TeamPanel
          accent={palette.green}
          ev={match.expectedValues.win}
          flagCode={match.homeCode}
          label="胜率方向"
          odds={match.marketOdds.win}
          probability={match.noVigProbabilities.win}
          team={match.homeTeam}
          note="ModelVerify 多数看 2-1"
        />
        <div
          style={{
            color: palette.ice,
            fontSize: 48,
            fontWeight: 950,
            textAlign: "center",
          }}
        >
          VS
        </div>
        <TeamPanel
          accent={palette.gold}
          ev={match.expectedValues.loss}
          flagCode={match.awayCode}
          label="冷门期望方向"
          odds={match.marketOdds.loss}
          probability={match.noVigProbabilities.loss}
          team={match.awayTeam}
          note="有冷门气质"
        />
      </div>
    </SceneShell>
  );
};

const TeamPanel: FC<{
  readonly accent: string;
  readonly ev: number;
  readonly flagCode: string;
  readonly label: string;
  readonly note: string;
  readonly odds: number;
  readonly probability: number;
  readonly team: string;
}> = ({ accent, ev, flagCode, label, note, odds, probability, team }) => (
  <div
    style={{
      ...panelStyle,
      borderColor: `${accent}99`,
      display: "flex",
      flexDirection: "column",
      gap: 26,
      height: 1070,
      justifyContent: "center",
      padding: "44px 36px",
      textAlign: "center",
    }}
  >
    <div style={{ alignItems: "center", display: "flex", gap: 20, justifyContent: "center" }}>
      <FlagBadge code={flagCode} />
      <div style={{ fontSize: 46, fontWeight: 950 }}>{team}</div>
    </div>
    <div style={{ color: palette.white, fontSize: 34, fontWeight: 850 }}>{label}</div>
    <div
      style={{
        borderBottom: `1px solid ${palette.line}`,
        borderTop: `1px solid ${palette.line}`,
        fontSize: 82,
        fontWeight: 950,
        padding: "26px 0",
      }}
    >
      {formatOdds(odds)}
    </div>
    <div style={{ color: palette.muted, fontSize: 28, fontWeight: 800 }}>
      百家概率{" "}
      <strong style={{ color: palette.white, fontSize: 42 }}>{formatPercent(probability)}</strong>
    </div>
    <div style={{ color: palette.ice, fontSize: 25, fontWeight: 780 }}>{note}</div>
    <EVBar value={ev} closest={Math.abs(ev) < 4} />
  </div>
);

const GermanyScene: FC<{ readonly timing: SceneTiming; readonly match: MatchAnalysis }> = ({
  timing,
  match,
}) => {
  const frame = useCurrentFrame();
  const bigEnter = useSpringEnter(5);
  const warningEnter = interpolate(frame, [26, 52], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <SceneShell timing={timing} dense>
      <div
        style={{
          ...panelStyle,
          display: "grid",
          gap: 30,
          gridTemplateRows: "430px 250px 1fr",
          height: "100%",
          padding: 34,
        }}
      >
        <div style={{ display: "grid", gap: 26, gridTemplateColumns: "1fr 1fr" }}>
          <div
            style={{
              ...panelStyle,
              alignItems: "center",
              borderColor: "rgba(158,216,255,0.5)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: 34,
            }}
          >
            <div style={{ alignItems: "center", display: "flex", gap: 20 }}>
              <FlagBadge code={match.homeCode} />
              <span style={{ fontSize: 50, fontWeight: 950 }}>{match.homeTeam}</span>
              <span style={{ color: palette.gold, fontSize: 28, fontWeight: 900 }}>胜率最高</span>
            </div>
            <div
              style={{
                color: palette.red,
                fontSize: 132,
                fontWeight: 950,
                lineHeight: 1.08,
                marginTop: 28,
                textShadow: `0 0 38px ${palette.red}66`,
                transform: `scale(${0.88 + bigEnter * 0.12})`,
              }}
            >
              {formatOdds(match.marketOdds.win)}
            </div>
          </div>
          <div
            style={{
              ...panelStyle,
              borderColor: `rgba(255,90,95,${0.4 + warningEnter * 0.5})`,
              boxShadow: `0 0 ${warningEnter * 48}px ${palette.red}33`,
              color: palette.red,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              justifyContent: "center",
              opacity: warningEnter,
              padding: 40,
            }}
          >
            <div style={{ fontSize: 56, fontWeight: 950 }}>赔率太低</div>
            <div style={{ color: palette.white, fontSize: 31, fontWeight: 760, lineHeight: 1.3 }}>
              需要极高真实胜率
              <br />
              才能有价值
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 1fr" }}>
          <MetricTile label="百家概率" value={formatPercent(match.noVigProbabilities.win)} />
          <MetricTile
            label="德国胜 EV"
            value={formatPercent(match.expectedValues.win)}
            tone="red"
          />
        </div>
        <div
          style={{
            ...panelStyle,
            alignItems: "center",
            display: "grid",
            gap: 26,
            gridTemplateColumns: "1.1fr 0.9fr",
            padding: "26px 30px",
          }}
        >
          <div style={{ alignItems: "center", display: "flex", gap: 18 }}>
            <FlagBadge code={match.awayCode} />
            <div>
              <div style={{ fontSize: 38, fontWeight: 950 }}>{match.awayTeam}</div>
              <div style={{ color: palette.ice, fontSize: 26, fontWeight: 800 }}>冷门方向</div>
            </div>
          </div>
          <EVBar value={match.expectedValues.loss} closest />
        </div>
      </div>
    </SceneShell>
  );
};

const NetherlandsScene: FC<{ readonly timing: SceneTiming; readonly match: MatchAnalysis }> = ({
  timing,
  match,
}) => {
  const frame = useCurrentFrame();
  const balance = Math.sin(frame / 46) * 1.8;
  const enter = useSpringEnter(5);

  return (
    <SceneShell timing={timing} dense>
      <div
        style={{
          alignItems: "center",
          display: "grid",
          gap: 26,
          gridTemplateRows: "1fr 270px",
          height: "100%",
          transform: `translateY(${(1 - enter) * 46}px)`,
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            style={{
              background: "rgba(158,216,255,0.28)",
              height: 16,
              left: 170,
              position: "absolute",
              right: 170,
              top: 574,
              transform: `rotate(${balance}deg)`,
            }}
          />
          <div
            style={{
              background: palette.muted,
              border: `8px solid ${palette.panel}`,
              borderRadius: "50%",
              height: 58,
              left: "50%",
              position: "absolute",
              top: 552,
              transform: "translateX(-50%)",
              width: 58,
            }}
          />
          <BalanceSide
            accent={palette.gold}
            flagCode={match.homeCode}
            label="胜率略高"
            side="left"
            team={match.homeTeam}
          />
          <BalanceSide
            accent={palette.red}
            flagCode={match.awayCode}
            label="情绪强 / 韧性强"
            side="right"
            team={match.awayTeam}
          />
          <div
            style={{
              color: palette.muted,
              fontSize: 58,
              fontWeight: 950,
              left: 0,
              position: "absolute",
              right: 0,
              textAlign: "center",
              top: 370,
            }}
          >
            VS
          </div>
        </div>
        <div
          style={{
            ...panelStyle,
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            justifySelf: "center",
            padding: "36px 62px",
            textAlign: "center",
            width: 520,
          }}
        >
          <div style={{ color: palette.white, fontSize: 58, fontWeight: 950 }}>
            {match.likelyScores.join(" / ")}
          </div>
          <div style={{ color: palette.muted, fontSize: 30, fontWeight: 800, marginTop: 8 }}>
            大模型预测比分
          </div>
        </div>
      </div>
    </SceneShell>
  );
};

const BalanceSide: FC<{
  readonly accent: string;
  readonly flagCode: string;
  readonly label: string;
  readonly side: "left" | "right";
  readonly team: string;
}> = ({ accent, flagCode, label, side, team }) => (
  <div
    style={{
      ...panelStyle,
      background: `linear-gradient(180deg, ${accent}AA, ${palette.panel})`,
      borderColor: `${accent}AA`,
      height: 310,
      left: side === "left" ? 40 : undefined,
      padding: "46px 34px",
      position: "absolute",
      right: side === "right" ? 40 : undefined,
      textAlign: "center",
      top: 210,
      width: 370,
    }}
  >
    <div style={{ alignItems: "center", display: "flex", gap: 18, justifyContent: "center" }}>
      <FlagBadge code={flagCode} />
      <span style={{ fontSize: 42, fontWeight: 950 }}>{team}</span>
    </div>
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,0.24)",
        fontSize: 37,
        fontWeight: 900,
        lineHeight: 1.24,
        marginTop: 34,
        paddingTop: 28,
      }}
    >
      {label}
    </div>
  </div>
);

const MetricTile: FC<{
  readonly label: string;
  readonly tone?: "red" | "green";
  readonly value: string;
}> = ({ label, tone, value }) => (
  <div
    style={{
      ...panelStyle,
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "26px 22px",
    }}
  >
    <div style={{ color: palette.muted, fontSize: 27, fontWeight: 800 }}>{label}</div>
    <div
      style={{
        color: tone === "red" ? palette.red : tone === "green" ? palette.green : palette.white,
        fontSize: 52,
        fontWeight: 950,
        marginTop: 8,
      }}
    >
      {value}
    </div>
  </div>
);

const EVBar: FC<{ readonly closest?: boolean; readonly value: number }> = ({
  closest = false,
  value,
}) => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [24, 64], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const normalized = Math.min(Math.abs(value) / 50, 1);
  const width = normalized * 100 * grow;

  return (
    <div
      style={{
        border: `1px solid ${closest ? palette.green : palette.line}`,
        borderRadius: 7,
        padding: "18px 18px 20px",
        textAlign: "left",
      }}
    >
      <div style={{ color: palette.white, fontSize: 29, fontWeight: 900, marginBottom: 14 }}>
        EV {formatPercent(value)}
      </div>
      <div
        style={{
          background: "rgba(245,247,250,0.12)",
          height: 22,
          position: "relative",
        }}
      >
        <div
          style={{
            background: `linear-gradient(90deg, ${palette.red}, ${closest ? palette.gold : "#C03A4D"})`,
            height: "100%",
            position: "absolute",
            right: "50%",
            width: `${width / 2}%`,
          }}
        />
        <div
          style={{
            background: "rgba(245,247,250,0.68)",
            height: 36,
            left: "50%",
            position: "absolute",
            top: -7,
            width: 3,
          }}
        />
      </div>
      <div
        style={{
          color: palette.muted,
          display: "flex",
          fontSize: 18,
          fontWeight: 800,
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <span>-50%</span>
        <span>-25%</span>
        <span>0</span>
      </div>
    </div>
  );
};

const ProbabilityBar: FC<{
  readonly values: Record<OutcomeKey, number>;
}> = ({ values }) => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [16, 60], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const entries = [
    { key: "win" as const, color: palette.green },
    { key: "draw" as const, color: palette.gold },
    { key: "loss" as const, color: palette.red },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {entries.map(({ key, color }) => (
        <div key={key} style={{ display: "grid", gap: 12, gridTemplateColumns: "56px 1fr 86px" }}>
          <div style={{ color: palette.muted, fontSize: 22, fontWeight: 900 }}>
            {outcomeLabels[key]}
          </div>
          <div
            style={{
              background: "rgba(245,247,250,0.1)",
              height: 17,
              marginTop: 7,
            }}
          >
            <div
              style={{
                background: color,
                height: "100%",
                width: `${values[key] * grow}%`,
              }}
            />
          </div>
          <div style={{ color: palette.white, fontSize: 22, fontWeight: 900, textAlign: "right" }}>
            {formatPercent(values[key])}
          </div>
        </div>
      ))}
    </div>
  );
};

const RankingScene: FC<{ readonly timing: SceneTiming }> = ({ timing }) => {
  const frame = useCurrentFrame();

  return (
    <SceneShell timing={timing} dense>
      <div
        style={{
          display: "grid",
          gap: 20,
          gridTemplateColumns: "1fr 1fr 1fr",
          height: "100%",
        }}
      >
        {worldCupBettingData.rankings.map((column, columnIndex) => {
          const enter = interpolate(frame, [10 + columnIndex * 10, 34 + columnIndex * 10], [0, 1], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          });

          return (
            <div
              key={column.title}
              style={{
                ...panelStyle,
                borderColor:
                  columnIndex === 0
                    ? `${palette.ice}88`
                    : columnIndex === 1
                      ? `${palette.green}88`
                      : `${palette.gold}88`,
                opacity: enter,
                padding: "38px 26px",
                transform: `translateY(${(1 - enter) * 56}px)`,
              }}
            >
              <div
                style={{
                  borderBottom: `1px solid ${palette.line}`,
                  color:
                    columnIndex === 0
                      ? palette.ice
                      : columnIndex === 1
                        ? palette.green
                        : palette.gold,
                  fontSize: 42,
                  fontWeight: 950,
                  marginBottom: 36,
                  paddingBottom: 22,
                  textAlign: "center",
                }}
              >
                {column.title}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
                {column.items.map((item, index) => {
                  const itemEnter = interpolate(
                    frame,
                    [44 + columnIndex * 14 + index * 12, 64 + columnIndex * 14 + index * 12],
                    [0, 1],
                    {
                      ...clamp,
                      easing: Easing.out(Easing.cubic),
                    },
                  );
                  return (
                    <div
                      key={item}
                      style={{
                        alignItems: "center",
                        display: "grid",
                        gap: 12,
                        gridTemplateColumns: "44px 1fr",
                        opacity: itemEnter,
                        transform: `translateX(${(1 - itemEnter) * -24}px)`,
                      }}
                    >
                      <div
                        style={{
                          alignItems: "center",
                          background:
                            index === 0 ? palette.gold : index === 1 ? palette.muted : "#B86F30",
                          borderRadius: "50%",
                          color: "#07101D",
                          display: "flex",
                          fontSize: 25,
                          fontWeight: 950,
                          height: 44,
                          justifyContent: "center",
                          width: 44,
                        }}
                      >
                        {index + 1}
                      </div>
                      <div style={{ color: palette.white, fontSize: 33, fontWeight: 900 }}>
                        {item}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};

const DisclaimerScene: FC<{ readonly timing: SceneTiming }> = ({ timing }) => {
  const titleEnter = useSpringEnter(4);
  const detailEnter = useEnter(30, 22);
  const disclaimerEnter = useEnter(54, 22);

  return (
    <SceneShell timing={timing}>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: 58,
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: palette.white,
            fontSize: 86,
            fontWeight: 950,
            transform: `scale(${0.86 + titleEnter * 0.14})`,
          }}
        >
          {worldCupBettingData.summary.noBet.text}
        </div>
        <div
          style={{
            color: palette.red,
            fontSize: 36,
            fontWeight: 900,
            opacity: detailEnter,
          }}
        >
          {worldCupBettingData.summary.noBet.detail}
        </div>
        <div
          style={{
            ...panelStyle,
            alignItems: "center",
            display: "flex",
            gap: 26,
            opacity: disclaimerEnter,
            padding: "34px 56px",
          }}
        >
          <ShieldIcon />
          <div>
            <div
              style={{
                color: palette.ice,
                fontSize: 23,
                fontWeight: 900,
                marginBottom: 8,
              }}
            >
              免责声明
            </div>
            <div style={{ color: palette.white, fontSize: 42, fontWeight: 900 }}>
              {worldCupBettingData.summary.disclaimer}
            </div>
          </div>
        </div>
      </div>
    </SceneShell>
  );
};

const ShieldIcon: FC = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
    <path
      d="M36 8 L58 17 V34 C58 48 49 59 36 64 C23 59 14 48 14 34 V17 Z"
      fill="none"
      stroke={palette.white}
      strokeWidth="5"
    />
  </svg>
);

const FlagBadge: FC<{ readonly code: string }> = ({ code }) => {
  const style: CSSProperties = {
    border: "1px solid rgba(245,247,250,0.46)",
    borderRadius: 4,
    boxShadow: "0 8px 22px rgba(0,0,0,0.28)",
    height: 42,
    overflow: "hidden",
    position: "relative",
    width: 66,
  };

  if (code === "BRA") {
    return (
      <div style={{ ...style, background: "#159447" }}>
        <div
          style={{
            background: "#F5D04C",
            height: 34,
            left: 16,
            position: "absolute",
            top: 4,
            transform: "rotate(45deg)",
            width: 34,
          }}
        />
        <div
          style={{
            background: "#174EA6",
            borderRadius: "50%",
            height: 20,
            left: 23,
            position: "absolute",
            top: 11,
            width: 20,
          }}
        />
      </div>
    );
  }

  if (code === "JPN") {
    return (
      <div style={{ ...style, background: "#F5F7FA" }}>
        <div
          style={{
            background: "#B51222",
            borderRadius: "50%",
            height: 22,
            left: 22,
            position: "absolute",
            top: 10,
            width: 22,
          }}
        />
      </div>
    );
  }

  if (code === "GER") {
    return (
      <div style={style}>
        <div style={{ background: "#111", height: 14 }} />
        <div style={{ background: "#DD2C2C", height: 14 }} />
        <div style={{ background: "#FFD23F", height: 14 }} />
      </div>
    );
  }

  if (code === "PAR") {
    return (
      <div style={style}>
        <div style={{ background: "#D52B1E", height: 14 }} />
        <div style={{ background: "#F5F7FA", height: 14 }} />
        <div style={{ background: "#0038A8", height: 14 }} />
      </div>
    );
  }

  if (code === "NED") {
    return (
      <div style={style}>
        <div style={{ background: "#AE1C28", height: 14 }} />
        <div style={{ background: "#F5F7FA", height: 14 }} />
        <div style={{ background: "#21468B", height: 14 }} />
      </div>
    );
  }

  return (
    <div style={{ ...style, background: "#C1272D" }}>
      <svg width="66" height="42" viewBox="0 0 66 42" aria-hidden="true">
        <path d="M33 10 L37 24 L25 15 H41 L29 24 Z" fill="none" stroke="#138A36" strokeWidth="3" />
      </svg>
    </div>
  );
};

const SummaryStrip: FC = () => (
  <div
    style={{
      bottom: 0,
      color: palette.muted,
      display: "flex",
      fontSize: 19,
      fontWeight: 800,
      gap: 12,
      left: 0,
      opacity: 0.72,
      padding: "16px 22px",
      position: "absolute",
      right: 0,
    }}
  >
    <span>竞彩分析</span>
    <span>/</span>
    <span>负期望识别</span>
    <span>/</span>
    <span>胜率与赔率分离</span>
    <span>/</span>
    <span>理性分析</span>
  </div>
);

const SceneRenderer: FC<{ readonly timing: SceneTiming }> = ({ timing }) => {
  if (timing.id === "title") {
    return <TitleScene timing={timing} />;
  }

  if (timing.id === "source") {
    return <SourceScene timing={timing} />;
  }

  if (timing.id === "formula") {
    return <FormulaScene timing={timing} />;
  }

  if (timing.id === "brazil-japan") {
    return <MatchScene timing={timing} match={getMatch("brazil-japan")} />;
  }

  if (timing.id === "germany-paraguay") {
    return <MatchScene timing={timing} match={getMatch("germany-paraguay")} />;
  }

  if (timing.id === "netherlands-morocco") {
    return <MatchScene timing={timing} match={getMatch("netherlands-morocco")} />;
  }

  if (timing.id === "ranking") {
    return <RankingScene timing={timing} />;
  }

  return <DisclaimerScene timing={timing} />;
};

const SceneVoiceover: FC<{ readonly sceneId: SceneId }> = ({ sceneId }) => {
  const track = audioTracksBySceneId.get(sceneId);

  if (!track) {
    return null;
  }

  return (
    <StandaloneVoiceover
      audioFile={track.audioFile}
      playbackRate={WORLD_CUP_BETTING_ANALYSIS_VOICEOVER_PLAYBACK_RATE}
    />
  );
};

export const WorldCupBettingAnalysisVideo: FC = () => (
  <AbsoluteFill style={{ backgroundColor: palette.background }}>
    <StandaloneTimeline
      renderAudio={(timing) => <SceneVoiceover sceneId={timing.id} />}
      renderScene={(timing) => <SceneRenderer timing={timing} />}
      scenes={worldCupBettingData.scenes}
    />
    <Sequence durationInFrames={WORLD_CUP_BETTING_ANALYSIS_DURATION_IN_FRAMES}>
      <SummaryStrip />
    </Sequence>
  </AbsoluteFill>
);

export const worldCupBettingAnalysisMetadata = {
  durationInFrames: WORLD_CUP_BETTING_ANALYSIS_DURATION_IN_FRAMES,
  fps: WORLD_CUP_BETTING_ANALYSIS_FPS,
};
