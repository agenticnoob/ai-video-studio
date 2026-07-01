import React, {type CSSProperties} from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  NARRATIONS,
  SCENE_DURATIONS,
  SCENE_KEYS,
  type SceneKey,
} from "./constants";

// SCENE_COUNT: 5
// RESOLUTION: 1080x1920

type TeamCard = {
  name: string;
  label: string;
  probability: string;
  note: string;
};

const TOTAL_WIDTH = 1080;
const TOTAL_HEIGHT = 1920;

const TEAMS: TeamCard[] = [
  {
    name: "法国",
    label: "冠军模型",
    probability: "22%",
    note: "阵容深度 + 淘汰赛稳定性",
  },
  {
    name: "阿根廷",
    label: "经验强队",
    probability: "18%",
    note: "核心经验 + 大赛气质",
  },
  {
    name: "巴西",
    label: "上限最高",
    probability: "16%",
    note: "进攻天赋 + 单点爆破",
  },
  {
    name: "英格兰",
    label: "纸面豪阵",
    probability: "14%",
    note: "中前场厚度 + 年轻冲击",
  },
];

const DARK_HORSES = [
  "葡萄牙：个人能力强，节奏转换快",
  "西班牙：控球压制强，但终结效率是变量",
  "摩洛哥：防守韧性强，淘汰赛很难踢",
];

export const WorldCupPrediction: React.FC = () => {
  let cursor = 0;

  return (
    <AbsoluteFill style={styles.root}>
      <DynamicBackground />

      {SCENE_KEYS.map((sceneKey) => {
        const from = cursor;
        const duration = SCENE_DURATIONS[sceneKey];
        cursor += duration;

        return (
          <Sequence key={sceneKey} from={from} durationInFrames={duration}>
            <SceneRenderer sceneKey={sceneKey} />
            <Audio
              src={staticFile(`standalone-samples/audio/world-cup-prediction-${sceneKey}.wav`)}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const SceneRenderer: React.FC<{sceneKey: SceneKey}> = ({sceneKey}) => {
  switch (sceneKey) {
    case "opening":
      return <OpeningScene />;
    case "favorites":
      return <FavoritesScene />;
    case "dark_horse":
      return <DarkHorseScene />;
    case "data_model":
      return <DataModelScene />;
    case "final_pick":
      return <FinalPickScene />;
    default:
      return null;
  }
};

const OpeningScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleY = interpolate(frame, [0, 24], [90, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ballScale = interpolate(frame, [8, 42], [0.75, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ringRotate = frame * 0.55;

  return (
    <AbsoluteFill style={styles.scene}>
      <div style={styles.topTag}>WORLD CUP 2026</div>

      <div style={styles.centerStage}>
        <div
          style={{
            ...styles.glowRing,
            transform: `rotate(${ringRotate}deg)`,
          }}
        />

        <div
          style={{
            ...styles.footballOrb,
            transform: `scale(${ballScale})`,
          }}
        >
          <div style={styles.orbGrid} />
          <div style={styles.orbHighlight} />
        </div>

        <div
          style={{
            ...styles.openingTitleWrap,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          <div style={styles.kicker}>冠军预测</div>
          <h1 style={styles.mainTitle}>谁最像冠军？</h1>
          <p style={styles.subTitle}>
            阵容厚度 / 晋级路径 / 大赛稳定性 / 爆冷风险
          </p>
        </div>
      </div>

      <MetricStrip
        items={[
          ["模型变量", "4"],
          ["候选强队", "8+"],
          ["核心结论", "法国更稳"],
        ]}
      />

      <Subtitle sceneKey="opening" />
    </AbsoluteFill>
  );
};

const FavoritesScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={styles.scene}>
      <SceneHeader
        eyebrow="TIER 1"
        title="第一梯队争冠候选"
        desc="传统强队不是一定夺冠，但容错率更高。"
      />

      <div style={styles.teamGrid}>
        {TEAMS.map((team, index) => {
          const enter = interpolate(frame, [index * 8, index * 8 + 22], [80, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const opacity = interpolate(
            frame,
            [index * 8, index * 8 + 20],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          );

          return (
            <div
              key={team.name}
              style={{
                ...styles.teamCard,
                opacity,
                transform: `translateY(${enter}px)`,
              }}
            >
              <div style={styles.teamCardTop}>
                <div>
                  <div style={styles.teamName}>{team.name}</div>
                  <div style={styles.teamLabel}>{team.label}</div>
                </div>
                <div style={styles.probability}>{team.probability}</div>
              </div>

              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: team.probability,
                  }}
                />
              </div>

              <div style={styles.teamNote}>{team.note}</div>
            </div>
          );
        })}
      </div>

      <Subtitle sceneKey="favorites" />
    </AbsoluteFill>
  );
};

const DarkHorseScene: React.FC = () => {
  const frame = useCurrentFrame();

  const pulse = interpolate(frame % 60, [0, 30, 60], [0.92, 1.05, 0.92]);

  return (
    <AbsoluteFill style={styles.scene}>
      <SceneHeader
        eyebrow="DARK HORSE"
        title="黑马要看结构"
        desc="不是名气小就叫黑马，关键是有没有淘汰赛武器。"
      />

      <div style={styles.darkHorseLayout}>
        <div
          style={{
            ...styles.tacticalBoard,
            transform: `scale(${pulse})`,
          }}
        >
          <div style={styles.pitchLineVertical} />
          <div style={styles.pitchCircle} />
          <div style={{...styles.playerDot, left: 160, top: 210}} />
          <div style={{...styles.playerDot, left: 330, top: 360}} />
          <div style={{...styles.playerDot, left: 520, top: 250}} />
          <div style={{...styles.playerDotHot, left: 690, top: 410}} />
          <div style={styles.attackArrow} />
        </div>

        <div style={styles.darkHorseList}>
          {DARK_HORSES.map((text, index) => {
            const x = interpolate(frame, [index * 10, index * 10 + 24], [70, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            const opacity = interpolate(
              frame,
              [index * 10, index * 10 + 20],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            );

            return (
              <div
                key={text}
                style={{
                  ...styles.darkHorseItem,
                  opacity,
                  transform: `translateX(${x}px)`,
                }}
              >
                <span style={styles.darkHorseIndex}>0{index + 1}</span>
                <span>{text}</span>
              </div>
            );
          })}
        </div>
      </div>

      <Subtitle sceneKey="dark_horse" />
    </AbsoluteFill>
  );
};

const DataModelScene: React.FC = () => {
  const frame = useCurrentFrame();

  const pathProgress = interpolate(frame, [0, 80], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={styles.scene}>
      <SceneHeader
        eyebrow="MODEL"
        title="冠军概率 = 晋级路径"
        desc="单场强不够，要连续赢下高压比赛。"
      />

      <div style={styles.modelBox}>
        <div style={styles.formula}>
          <span>冠军概率</span>
          <b>=</b>
          <span>R32</span>
          <b>×</b>
          <span>R16</span>
          <b>×</b>
          <span>QF</span>
          <b>×</b>
          <span>SF</span>
          <b>×</b>
          <span>FINAL</span>
        </div>

        <div style={styles.pathPanel}>
          <div style={styles.pathLineBase} />
          <div
            style={{
              ...styles.pathLineActive,
              width: `${pathProgress}%`,
            }}
          />

          {["32强", "16强", "8强", "4强", "决赛", "冠军"].map(
            (label, index) => {
              const active = pathProgress >= index * 20;

              return (
                <div
                  key={label}
                  style={{
                    ...styles.pathNode,
                    left: `${index * 20}%`,
                    opacity: active ? 1 : 0.4,
                    transform: active ? "scale(1)" : "scale(0.82)",
                  }}
                >
                  <div style={styles.pathDot} />
                  <div style={styles.pathLabel}>{label}</div>
                </div>
              );
            },
          )}
        </div>

        <div style={styles.modelCards}>
          <ModelCard title="阵容厚度" value="高" />
          <ModelCard title="防线稳定" value="关键" />
          <ModelCard title="爆冷风险" value="路径决定" />
        </div>
      </div>

      <Subtitle sceneKey="data_model" />
    </AbsoluteFill>
  );
};

const FinalPickScene: React.FC = () => {
  const frame = useCurrentFrame();

  const trophyY = interpolate(frame, [0, 36], [120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const trophyOpacity = interpolate(frame, [0, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const shineX = interpolate(frame % 90, [0, 90], [-260, 420]);

  return (
    <AbsoluteFill style={styles.finalScene}>
      <div style={styles.finalCard}>
        <div
          style={{
            ...styles.shine,
            transform: `translateX(${shineX}px) rotate(18deg)`,
          }}
        />

        <div
          style={{
            ...styles.trophy,
            opacity: trophyOpacity,
            transform: `translateY(${trophyY}px)`,
          }}
        >
          <div style={styles.trophyCup} />
          <div style={styles.trophyStem} />
          <div style={styles.trophyBase} />
        </div>

        <div style={styles.finalEyebrow}>FINAL PICK</div>
        <div style={styles.finalCountry}>法国</div>
        <div style={styles.finalTitle}>更接近冠军模型</div>

        <div style={styles.reasonGrid}>
          <div style={styles.reasonItem}>阵容深度</div>
          <div style={styles.reasonItem}>对抗强度</div>
          <div style={styles.reasonItem}>淘汰赛经验</div>
          <div style={styles.reasonItem}>容错率高</div>
        </div>
      </div>

      <Subtitle sceneKey="final_pick" />
    </AbsoluteFill>
  );
};

const SceneHeader: React.FC<{
  eyebrow: string;
  title: string;
  desc: string;
}> = ({eyebrow, title, desc}) => {
  const frame = useCurrentFrame();

  const y = interpolate(frame, [0, 20], [48, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        ...styles.sceneHeader,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div style={styles.headerEyebrow}>{eyebrow}</div>
      <div style={styles.headerTitle}>{title}</div>
      <div style={styles.headerDesc}>{desc}</div>
    </div>
  );
};

const Subtitle: React.FC<{sceneKey: SceneKey}> = ({sceneKey}) => {
  return (
    <div style={styles.subtitleBar}>
      <div style={styles.subtitleText}>{NARRATIONS[sceneKey]}</div>
    </div>
  );
};

const MetricStrip: React.FC<{items: Array<[string, string]>}> = ({items}) => {
  return (
    <div style={styles.metricStrip}>
      {items.map(([label, value]) => (
        <div key={label} style={styles.metricItem}>
          <div style={styles.metricValue}>{value}</div>
          <div style={styles.metricLabel}>{label}</div>
        </div>
      ))}
    </div>
  );
};

const ModelCard: React.FC<{title: string; value: string}> = ({title, value}) => {
  return (
    <div style={styles.modelCard}>
      <div style={styles.modelCardTitle}>{title}</div>
      <div style={styles.modelCardValue}>{value}</div>
    </div>
  );
};

const DynamicBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();

  const moveY = frame * 0.9;
  const rotate = frame * 0.03;

  return (
    <AbsoluteFill style={styles.background}>
      <div
        style={{
          ...styles.bgGrid,
          transform: `translateY(${moveY % 120}px)`,
          height: height + 240,
        }}
      />
      <div
        style={{
          ...styles.bgOrbOne,
          transform: `rotate(${rotate}deg)`,
        }}
      />
      <div
        style={{
          ...styles.bgOrbTwo,
          transform: `rotate(${-rotate * 1.4}deg)`,
        }}
      />
      <div style={styles.vignette} />
    </AbsoluteFill>
  );
};

const styles: Record<string, CSSProperties> = {
  root: {
    width: TOTAL_WIDTH,
    height: TOTAL_HEIGHT,
    backgroundColor: "#07111f",
    overflow: "hidden",
    fontFamily:
      '"Inter", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
    color: "#f7fbff",
  },

  background: {
    background:
      "radial-gradient(circle at 50% 18%, rgba(65, 140, 255, 0.26), transparent 34%), linear-gradient(180deg, #07111f 0%, #0b1728 52%, #050910 100%)",
  },

  bgGrid: {
    position: "absolute",
    inset: "-120px 0 auto 0",
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
    backgroundSize: "64px 64px",
    opacity: 0.55,
  },

  bgOrbOne: {
    position: "absolute",
    width: 780,
    height: 780,
    left: -250,
    top: 160,
    borderRadius: "50%",
    border: "1px solid rgba(125, 179, 255, 0.2)",
    boxShadow: "0 0 120px rgba(61, 132, 255, 0.22)",
  },

  bgOrbTwo: {
    position: "absolute",
    width: 920,
    height: 920,
    right: -410,
    bottom: 160,
    borderRadius: "50%",
    border: "1px solid rgba(255, 215, 120, 0.18)",
    boxShadow: "0 0 130px rgba(255, 196, 80, 0.12)",
  },

  vignette: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.22), transparent 30%, rgba(0,0,0,0.52) 100%)",
  },

  scene: {
    padding: "96px 72px 260px",
  },

  finalScene: {
    padding: "120px 72px 260px",
    justifyContent: "center",
    alignItems: "center",
  },

  topTag: {
    position: "absolute",
    top: 72,
    left: 72,
    padding: "14px 22px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.08)",
    color: "#c6d7ff",
    fontSize: 28,
    letterSpacing: 4,
    fontWeight: 700,
  },

  centerStage: {
    position: "absolute",
    left: 72,
    right: 72,
    top: 210,
    bottom: 520,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  glowRing: {
    position: "absolute",
    width: 760,
    height: 760,
    borderRadius: "50%",
    border: "2px dashed rgba(198, 215, 255, 0.28)",
    boxShadow: "0 0 120px rgba(73, 139, 255, 0.22)",
  },

  footballOrb: {
    position: "absolute",
    width: 470,
    height: 470,
    borderRadius: "50%",
    overflow: "hidden",
    background:
      "radial-gradient(circle at 35% 28%, #ffffff 0%, #dbe7ff 22%, #42618f 58%, #101c30 100%)",
    boxShadow:
      "0 40px 110px rgba(0,0,0,0.45), inset -30px -50px 80px rgba(0,0,0,0.42)",
  },

  orbGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(90deg, rgba(8,16,30,0.18) 1px, transparent 1px), linear-gradient(rgba(8,16,30,0.18) 1px, transparent 1px)",
    backgroundSize: "58px 58px",
    transform: "rotate(14deg) scale(1.2)",
  },

  orbHighlight: {
    position: "absolute",
    width: 160,
    height: 160,
    left: 90,
    top: 70,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.48)",
    filter: "blur(24px)",
  },

  openingTitleWrap: {
    position: "absolute",
    bottom: -70,
    left: 0,
    right: 0,
    textAlign: "center",
  },

  kicker: {
    display: "inline-block",
    padding: "12px 28px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.11)",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#ffd889",
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: 4,
    marginBottom: 26,
  },

  mainTitle: {
    margin: 0,
    fontSize: 106,
    lineHeight: 1.05,
    fontWeight: 950,
    letterSpacing: "-6px",
    textShadow: "0 18px 60px rgba(0,0,0,0.48)",
  },

  subTitle: {
    margin: "28px auto 0",
    maxWidth: 760,
    color: "#b9c8e7",
    fontSize: 32,
    lineHeight: 1.45,
    fontWeight: 600,
  },

  metricStrip: {
    position: "absolute",
    left: 72,
    right: 72,
    bottom: 310,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 18,
  },

  metricItem: {
    padding: "18px 14px",
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    textAlign: "center",
  },

  metricValue: {
    fontSize: 34,
    fontWeight: 900,
    color: "#ffd889",
    marginBottom: 4,
  },

  metricLabel: {
    fontSize: 22,
    color: "#93a6c9",
  },

  sceneHeader: {
    textAlign: "center",
    marginBottom: 44,
  },

  headerEyebrow: {
    fontSize: 24,
    letterSpacing: 6,
    color: "#7da0e8",
    fontWeight: 700,
    marginBottom: 12,
  },

  headerTitle: {
    fontSize: 62,
    fontWeight: 900,
    letterSpacing: "-1px",
    marginBottom: 8,
  },

  headerDesc: {
    fontSize: 28,
    color: "#93a6c9",
  },

  teamGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    marginTop: 20,
  },

  teamCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "26px 28px",
  },

  teamCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  teamName: {
    fontSize: 42,
    fontWeight: 900,
  },

  teamLabel: {
    fontSize: 22,
    color: "#7da0e8",
    marginTop: 4,
  },

  probability: {
    fontSize: 44,
    fontWeight: 900,
    color: "#ffd889",
  },

  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    marginBottom: 12,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#3d84ff",
    borderRadius: 999,
  },

  teamNote: {
    fontSize: 24,
    color: "#93a6c9",
  },

  darkHorseLayout: {
    display: "flex",
    flexDirection: "column",
    gap: 28,
  },

  tacticalBoard: {
    position: "relative",
    height: 500,
    backgroundColor: "rgba(0, 30, 20, 0.50)",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.08)",
    overflow: "hidden",
  },

  pitchLineVertical: {
    position: "absolute",
    left: "50%",
    top: 20,
    bottom: 20,
    width: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  pitchCircle: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 140,
    height: 140,
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.15)",
    transform: "translate(-50%, -50%)",
  },

  playerDot: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: "50%",
    backgroundColor: "#3d84ff",
    boxShadow: "0 0 20px rgba(61,132,255,0.5)",
  },

  playerDotHot: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: "50%",
    backgroundColor: "#ff6b3d",
    boxShadow: "0 0 30px rgba(255,107,61,0.6)",
  },

  attackArrow: {
    position: "absolute",
    right: 30,
    top: "50%",
    width: 80,
    height: 3,
    backgroundColor: "#ff6b3d",
    boxShadow: "0 0 20px rgba(255,107,61,0.8)",
  },

  darkHorseList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  darkHorseItem: {
    fontSize: 28,
    color: "#d0dcf5",
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "16px 24px",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.06)",
  },

  darkHorseIndex: {
    fontSize: 20,
    fontWeight: 800,
    color: "#ffd889",
    minWidth: 36,
  },

  modelBox: {
    display: "flex",
    flexDirection: "column",
    gap: 32,
  },

  formula: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    fontSize: 32,
    fontWeight: 700,
    color: "#c6d7ff",
  },

  pathPanel: {
    position: "relative",
    height: 90,
    margin: "30px 0",
  },

  pathLineBase: {
    position: "absolute",
    top: 8,
    left: "5%",
    right: "5%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
  },

  pathLineActive: {
    position: "absolute",
    top: 8,
    left: "5%",
    height: 4,
    backgroundColor: "#3d84ff",
    borderRadius: 999,
  },

  pathNode: {
    position: "absolute",
    top: 0,
    transform: "translateX(-50%)",
    textAlign: "center",
  },

  pathDot: {
    width: 16,
    height: 16,
    borderRadius: "50%",
    backgroundColor: "#3d84ff",
    marginBottom: 8,
    marginLeft: "auto",
    marginRight: "auto",
  },

  pathLabel: {
    fontSize: 20,
    color: "#93a6c9",
  },

  modelCards: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
  },

  modelCard: {
    padding: "24px 18px",
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    textAlign: "center",
  },

  modelCardTitle: {
    fontSize: 24,
    color: "#93a6c9",
    marginBottom: 8,
  },

  modelCardValue: {
    fontSize: 34,
    fontWeight: 900,
    color: "#ffd889",
  },

  finalCard: {
    position: "relative",
    overflow: "hidden",
    width: 700,
    padding: "80px 60px",
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,215,120,0.3)",
    textAlign: "center",
  },

  shine: {
    position: "absolute",
    top: "-60%",
    left: 0,
    width: 200,
    height: "200%",
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
  },

  trophy: {
    marginBottom: 30,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  trophyCup: {
    width: 120,
    height: 100,
    borderRadius: "50% 50% 30% 30%",
    backgroundColor: "#ffd889",
    boxShadow: "0 0 50px rgba(255, 216, 137, 0.5)",
  },

  trophyStem: {
    width: 16,
    height: 40,
    backgroundColor: "#ffd889",
    borderRadius: 4,
  },

  trophyBase: {
    width: 100,
    height: 14,
    backgroundColor: "#ffd889",
    borderRadius: 4,
  },

  finalEyebrow: {
    fontSize: 24,
    letterSpacing: 8,
    color: "#ffd889",
    fontWeight: 700,
    marginBottom: 16,
  },

  finalCountry: {
    fontSize: 90,
    fontWeight: 950,
    lineHeight: 1,
    marginBottom: 8,
  },

  finalTitle: {
    fontSize: 36,
    color: "#b9c8e7",
    marginBottom: 40,
  },

  reasonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 14,
  },

  reasonItem: {
    padding: "18px 14px",
    borderRadius: 14,
    backgroundColor: "rgba(61,132,255,0.12)",
    border: "1px solid rgba(61,132,255,0.2)",
    fontSize: 28,
    fontWeight: 700,
    color: "#c6d7ff",
  },

  subtitleBar: {
    position: "absolute",
    bottom: 80,
    left: 72,
    right: 72,
    padding: "22px 36px",
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.65)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.1)",
    textAlign: "center",
  },

  subtitleText: {
    fontSize: 28,
    fontWeight: 600,
    color: "#f0f4ff",
    lineHeight: 1.4,
  },
};
