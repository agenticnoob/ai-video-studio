import { ThreeCanvas } from "@remotion/three";
import type { FC, ReactNode } from "react";
import {
  AbsoluteFill,
  interpolate,
  Series,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getProducerStyleProfile, type ProducerStyleProfileId } from "../styles";
import { STYLE_PROFILE_PAGE_DURATION_IN_FRAMES } from "./durations";

const MESSAGE = "同一主题，不同生产语言";
const FONT_FAMILY = '"Noto Sans CJK SC", "PingFang SC", "Microsoft YaHei", sans-serif';

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const ProfileLabel: FC<{ readonly id: ProducerStyleProfileId; readonly inverse?: boolean }> = ({
  id,
  inverse = false,
}) => {
  const profile = getProducerStyleProfile(id);
  return (
    <div
      style={{
        alignItems: "center",
        bottom: 48,
        color: inverse ? profile.palette.background : profile.palette.muted,
        display: "flex",
        fontFamily: FONT_FAMILY,
        fontSize: 24,
        fontWeight: 700,
        gap: 14,
        left: 120,
        letterSpacing: 2,
        position: "absolute",
      }}
    >
      <span style={{ color: inverse ? profile.palette.background : profile.palette.accent }}>
        08A
      </span>
      <span>{profile.label}</span>
      <span>·</span>
      <span>{profile.layout.grammar}</span>
    </div>
  );
};

const Frame: FC<{
  readonly children: ReactNode;
  readonly id: ProducerStyleProfileId;
  readonly style?: React.CSSProperties;
}> = ({ children, id, style }) => {
  const profile = getProducerStyleProfile(id);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: profile.palette.background,
        color: profile.palette.ink,
        fontFamily: FONT_FAMILY,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const EditorialTechFixture: FC = () => {
  const frame = useCurrentFrame();
  const profile = getProducerStyleProfile("editorial-tech");
  const titleProgress = interpolate(frame, [0, 18], [0, 1], clamp);
  const diagramProgress = interpolate(frame, [12, 52], [0, 1], clamp);
  const nodes = [
    { label: "FACT", x: 80, y: 80 },
    { label: "LOGIC", x: 330, y: 220 },
    { label: "PROOF", x: 590, y: 80 },
  ] as const;

  return (
    <Frame
      id="editorial-tech"
      style={{
        backgroundImage:
          "linear-gradient(rgba(85,220,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(85,220,255,0.055) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "grid",
          gap: 100,
          gridTemplateColumns: "0.9fr 1.1fr",
          inset: "100px 120px 120px",
          position: "absolute",
        }}
      >
        <div style={{ opacity: titleProgress, translate: `${(1 - titleProgress) * -42}px 0` }}>
          <div
            style={{
              color: profile.palette.accent,
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: 5,
              marginBottom: 24,
            }}
          >
            ARGUMENT / 01
          </div>
          <div style={{ fontSize: 104, fontWeight: 900, letterSpacing: -5, lineHeight: 1.03 }}>
            同一主题
            <br />
            <span style={{ color: profile.palette.secondary }}>不同生产语言</span>
          </div>
          <div
            style={{
              color: profile.palette.muted,
              fontSize: 34,
              lineHeight: 1.45,
              marginTop: 36,
              maxWidth: 620,
            }}
          >
            论点先行，图解支撑，证据最后落位。
          </div>
        </div>
        <div
          style={{
            backgroundColor: "rgba(16,37,54,0.88)",
            border: `1px solid ${profile.palette.accent}55`,
            borderRadius: 34,
            boxShadow: "0 36px 100px rgba(0,0,0,0.36)",
            height: 480,
            opacity: diagramProgress,
            position: "relative",
            scale: 0.94 + diagramProgress * 0.06,
          }}
        >
          <svg viewBox="0 0 760 380" style={{ inset: 50, position: "absolute" }}>
            <path
              d="M120 120 C240 120 230 260 370 260 C510 260 500 120 630 120"
              fill="none"
              pathLength={1}
              stroke={profile.palette.accent}
              strokeDasharray={1}
              strokeDashoffset={1 - diagramProgress}
              strokeWidth={8}
            />
          </svg>
          {nodes.map((node, index) => {
            const nodeProgress = interpolate(
              diagramProgress,
              [index * 0.22, index * 0.22 + 0.28],
              [0, 1],
              clamp,
            );
            return (
              <div
                key={node.label}
                style={{
                  alignItems: "center",
                  backgroundColor:
                    index === 1 ? profile.palette.secondary : profile.palette.background,
                  border: `3px solid ${index === 1 ? profile.palette.secondary : profile.palette.accent}`,
                  borderRadius: 24,
                  color: index === 1 ? profile.palette.background : profile.palette.ink,
                  display: "flex",
                  fontSize: 28,
                  fontWeight: 900,
                  height: 110,
                  justifyContent: "center",
                  left: node.x,
                  opacity: nodeProgress,
                  position: "absolute",
                  scale: 0.82 + nodeProgress * 0.18,
                  top: node.y,
                  width: 180,
                }}
              >
                {node.label}
              </div>
            );
          })}
        </div>
      </div>
      <ProfileLabel id="editorial-tech" />
    </Frame>
  );
};

export const ComicAnimeFixture: FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const profile = getProducerStyleProfile("comic-anime");
  const pop = spring({ frame, fps, config: { damping: 15, mass: 0.7, stiffness: 170 } });
  const speed = interpolate(frame, [0, 45], [0, 1], clamp);

  return (
    <Frame
      id="comic-anime"
      style={{
        backgroundImage: `radial-gradient(${profile.palette.ink}24 2px, transparent 2px)`,
        backgroundSize: "18px 18px",
      }}
    >
      <svg viewBox="0 0 1920 1080" style={{ inset: 0, position: "absolute" }}>
        {Array.from({ length: 18 }, (_, index) => {
          const angle = (-58 + index * 6.8) * (Math.PI / 180);
          const length = 980 * speed;
          return (
            <line
              key={index}
              x1="1040"
              y1="530"
              x2={1040 + Math.cos(angle) * length}
              y2={530 + Math.sin(angle) * length}
              stroke={index % 3 === 0 ? profile.palette.accent : profile.palette.ink}
              strokeWidth={index % 3 === 0 ? 12 : 5}
              opacity={0.22}
            />
          );
        })}
      </svg>
      <div
        style={{
          alignItems: "stretch",
          display: "grid",
          gap: 28,
          gridTemplateColumns: "1.35fr 0.65fr",
          inset: "90px 120px 130px",
          position: "absolute",
        }}
      >
        <div
          style={{
            backgroundColor: profile.palette.surface,
            border: `10px solid ${profile.palette.ink}`,
            boxShadow: `22px 22px 0 ${profile.palette.accent}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            overflow: "hidden",
            padding: "70px 76px",
            rotate: `${-2 + (1 - pop) * -8}deg`,
            scale: 0.82 + pop * 0.18,
          }}
        >
          <div style={{ color: profile.palette.accent, fontSize: 34, fontWeight: 900 }}>
            SCENE 01!
          </div>
          <div
            style={{
              fontSize: 118,
              fontWeight: 900,
              letterSpacing: -6,
              lineHeight: 1,
              marginTop: 20,
              textShadow: `6px 6px 0 ${profile.palette.ink}22`,
            }}
          >
            {MESSAGE}
          </div>
        </div>
        <div style={{ display: "grid", gap: 28, gridTemplateRows: "1fr 1fr" }}>
          {["构图", "节奏"].map((label, index) => {
            const panelProgress = interpolate(
              frame,
              [12 + index * 8, 28 + index * 8],
              [0, 1],
              clamp,
            );
            return (
              <div
                key={label}
                style={{
                  alignItems: "center",
                  backgroundColor: index === 0 ? profile.palette.accent : profile.palette.secondary,
                  border: `8px solid ${profile.palette.ink}`,
                  color: index === 0 ? "#fff7dd" : profile.palette.ink,
                  display: "flex",
                  flexDirection: "column",
                  fontSize: 44,
                  fontWeight: 900,
                  justifyContent: "center",
                  opacity: panelProgress,
                  rotate: `${index === 0 ? 3 : -3}deg`,
                  translate: `${(1 - panelProgress) * 70}px 0`,
                }}
              >
                <div style={{ fontSize: 80 }}>{index === 0 ? "01" : "02"}</div>
                <div>{label}必须变化</div>
              </div>
            );
          })}
        </div>
      </div>
      <ProfileLabel id="comic-anime" />
    </Frame>
  );
};

const CinematicGeometry: FC<{ readonly frame: number }> = ({ frame }) => {
  const rotation = frame * 0.012;
  const lift = Math.sin(frame / 18) * 0.16;
  return (
    <>
      <ambientLight intensity={0.42} />
      <directionalLight color="#ffad5b" intensity={1.35} position={[5, 6, 7]} />
      <directionalLight color="#6be7ff" intensity={0.8} position={[-6, -2, 4]} />
      <group position={[1.7, lift, 0]} rotation={[0.18, rotation, 0.08]}>
        <mesh position={[-1.45, 0.15, -0.6]} rotation={[rotation * 0.7, rotation, 0.2]}>
          <boxGeometry args={[1.6, 1.6, 1.6]} />
          <meshStandardMaterial color="#253a57" metalness={0.64} roughness={0.26} />
        </mesh>
        <mesh position={[0.65, -0.1, 0.45]} rotation={[rotation, rotation * 1.3, -0.12]}>
          <octahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial color="#ffad5b" metalness={0.35} roughness={0.32} />
        </mesh>
        <mesh position={[2.35, 0.45, -0.9]} rotation={[rotation * 1.2, -rotation, 0.3]}>
          <torusGeometry args={[0.78, 0.18, 20, 64]} />
          <meshStandardMaterial color="#6be7ff" metalness={0.72} roughness={0.2} />
        </mesh>
      </group>
    </>
  );
};

export const Cinematic3dFixture: FC = () => {
  const frame = useCurrentFrame();
  const profile = getProducerStyleProfile("cinematic-3d");
  const copyProgress = interpolate(frame, [8, 30], [0, 1], clamp);

  return (
    <Frame
      id="cinematic-3d"
      style={{
        background:
          "radial-gradient(circle at 72% 48%, rgba(255,173,91,0.16), transparent 34%), radial-gradient(circle at 54% 20%, rgba(107,231,255,0.12), transparent 28%), #030712",
      }}
    >
      <AbsoluteFill style={{ opacity: 0.9 }}>
        <ThreeCanvas width={1920} height={1080} camera={{ fov: 42, position: [0, 0, 8] }}>
          <CinematicGeometry frame={frame} />
        </ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(3,7,18,0.96) 0%, rgba(3,7,18,0.8) 35%, transparent 68%)",
        }}
      />
      <div
        style={{
          left: 120,
          maxWidth: 720,
          opacity: copyProgress,
          position: "absolute",
          top: 190,
          translate: `${(1 - copyProgress) * -36}px 0`,
        }}
      >
        <div
          style={{ color: profile.palette.accent, fontSize: 28, fontWeight: 800, letterSpacing: 6 }}
        >
          DEPTH / MATERIAL / LIGHT
        </div>
        <div
          style={{
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: -4,
            lineHeight: 1.14,
            marginTop: 28,
          }}
        >
          <div>同一主题，</div>
          <div>不同生产语言</div>
        </div>
        <div style={{ color: profile.palette.muted, fontSize: 34, lineHeight: 1.5, marginTop: 32 }}>
          镜头运动服务于空间关系，材质和光线共同建立尺度。
        </div>
      </div>
      <div
        style={{
          background: "linear-gradient(90deg, rgba(0,0,0,0.9), transparent, rgba(0,0,0,0.9))",
          height: 64,
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />
      <div
        style={{
          backgroundColor: "#000",
          bottom: 0,
          height: 54,
          left: 0,
          position: "absolute",
          right: 0,
        }}
      />
      <ProfileLabel id="cinematic-3d" />
    </Frame>
  );
};

export const RetroTerminalFixture: FC = () => {
  const frame = useCurrentFrame();
  const profile = getProducerStyleProfile("retro-terminal");
  const lines = [
    "> load topic.same",
    "> resolve composition.grammar",
    "> map motion.texture.media.sound",
    "> status: DISTINCT",
  ] as const;

  return (
    <Frame
      id="retro-terminal"
      style={{
        backgroundImage:
          "linear-gradient(rgba(84,255,136,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(84,255,136,0.05) 1px, transparent 1px)",
        backgroundSize: "38px 38px",
      }}
    >
      <div
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0 5px, rgba(84,255,136,0.055) 5px 7px)",
          inset: 0,
          pointerEvents: "none",
          position: "absolute",
        }}
      />
      <div
        style={{
          backgroundColor: "rgba(7,20,14,0.94)",
          border: `2px solid ${profile.palette.accent}88`,
          boxShadow: `0 0 80px ${profile.palette.accent}22`,
          inset: "105px 180px 145px",
          position: "absolute",
        }}
      >
        <div
          style={{
            alignItems: "center",
            borderBottom: `2px solid ${profile.palette.accent}44`,
            color: profile.palette.muted,
            display: "flex",
            fontFamily: "Menlo, Consolas, monospace",
            fontSize: 24,
            height: 68,
            padding: "0 30px",
          }}
        >
          PRODUCER_STYLE_PROFILE.SYS
        </div>
        <div style={{ padding: "54px 64px" }}>
          <div
            style={{
              color: profile.palette.accent,
              fontFamily: "Menlo, Consolas, monospace",
              fontSize: 76,
              fontWeight: 800,
            }}
          >
            {MESSAGE}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 54 }}>
            {lines.map((line, index) => {
              const visible = interpolate(frame, [index * 10 + 6, index * 10 + 16], [0, 1], clamp);
              return (
                <div
                  key={line}
                  style={{
                    color:
                      index === lines.length - 1 ? profile.palette.secondary : profile.palette.ink,
                    fontFamily: "Menlo, Consolas, monospace",
                    fontSize: 34,
                    opacity: visible,
                    translate: `${(1 - visible) * -20}px 0`,
                  }}
                >
                  {line}
                  {index === Math.min(Math.floor(frame / 10), lines.length - 1) ? (
                    <span
                      style={{
                        backgroundColor: profile.palette.accent,
                        color: profile.palette.background,
                        marginLeft: 10,
                      }}
                    >
                      _
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <ProfileLabel id="retro-terminal" />
    </Frame>
  );
};

export const DocumentaryMediaFixture: FC = () => {
  const frame = useCurrentFrame();
  const profile = getProducerStyleProfile("documentary-media");
  const push = interpolate(frame, [0, 89], [1.04, 1], clamp);
  const lowerThird = interpolate(frame, [12, 30], [0, 1], clamp);

  return (
    <Frame id="documentary-media">
      <div
        style={{
          background: "linear-gradient(145deg, #27333a, #10171c)",
          inset: "76px 120px 154px",
          overflow: "hidden",
          position: "absolute",
        }}
      >
        <div
          style={{
            background:
              "radial-gradient(circle at 68% 35%, rgba(233,180,76,0.34), transparent 22%), linear-gradient(160deg, #52646d 0%, #1c292f 60%, #0e1519 100%)",
            inset: 0,
            position: "absolute",
            scale: push,
          }}
        />
        <svg viewBox="0 0 1680 760" style={{ inset: 0, position: "absolute" }}>
          <path
            d="M0 570 C330 480 520 610 820 490 C1120 370 1390 460 1680 300 L1680 760 L0 760 Z"
            fill="#0a1115"
            opacity="0.74"
          />
          <path
            d="M0 610 C340 520 620 660 980 510 C1280 390 1470 420 1680 350"
            fill="none"
            stroke={profile.palette.secondary}
            strokeWidth="4"
            opacity="0.62"
          />
          <circle cx="1210" cy="260" r="96" fill={profile.palette.accent} opacity="0.22" />
        </svg>
        <div
          style={{
            color: "rgba(245,240,232,0.78)",
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 3,
            position: "absolute",
            right: 34,
            top: 28,
          }}
        >
          CODE-RENDERED CONTEXT · NOT A SOURCE CAPTURE
        </div>
        <div
          style={{
            backgroundColor: "rgba(18,23,28,0.94)",
            bottom: 0,
            left: 0,
            opacity: lowerThird,
            padding: "32px 48px 38px",
            position: "absolute",
            right: 0,
            translate: `0 ${(1 - lowerThird) * 80}px`,
          }}
        >
          <div
            style={{
              color: profile.palette.accent,
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: 3,
            }}
          >
            CONTEXT BEFORE CLAIM
          </div>
          <div style={{ fontSize: 66, fontWeight: 800, letterSpacing: -2, marginTop: 8 }}>
            {MESSAGE}
          </div>
          <div style={{ color: profile.palette.muted, fontSize: 28, marginTop: 12 }}>
            来源、时间与引文始终靠近画面证据。
          </div>
        </div>
      </div>
      <ProfileLabel id="documentary-media" />
    </Frame>
  );
};

export const HandDrawnExplainerFixture: FC = () => {
  const frame = useCurrentFrame();
  const profile = getProducerStyleProfile("hand-drawn-explainer");
  const draw = interpolate(frame, [8, 58], [0, 1], clamp);
  const reveal = interpolate(frame, [0, 20], [0, 1], clamp);

  return (
    <Frame
      id="hand-drawn-explainer"
      style={{
        backgroundImage:
          "linear-gradient(rgba(41,38,36,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(41,38,36,0.04) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
      }}
    >
      <div
        style={{
          display: "grid",
          gap: 72,
          gridTemplateColumns: "0.8fr 1.2fr",
          inset: "100px 120px 140px",
          position: "absolute",
        }}
      >
        <div
          style={{ alignSelf: "center", opacity: reveal, translate: `${(1 - reveal) * -34}px 0` }}
        >
          <div
            style={{
              color: profile.palette.accent,
              fontSize: 30,
              fontWeight: 900,
              letterSpacing: 4,
            }}
          >
            DRAW THE IDEA
          </div>
          <div
            style={{
              fontSize: 98,
              fontWeight: 900,
              letterSpacing: -4,
              lineHeight: 1.04,
              marginTop: 24,
            }}
          >
            {MESSAGE}
          </div>
          <div
            style={{ color: profile.palette.muted, fontSize: 34, lineHeight: 1.5, marginTop: 32 }}
          >
            一次只画一层关系，让时间替画面解围。
          </div>
        </div>
        <div
          style={{
            alignSelf: "center",
            backgroundColor: profile.palette.surface,
            border: `3px solid ${profile.palette.ink}`,
            boxShadow: `14px 16px 0 ${profile.palette.secondary}33`,
            height: 580,
            position: "relative",
            rotate: "-1deg",
          }}
        >
          <svg viewBox="0 0 900 580" style={{ inset: 0, position: "absolute" }}>
            <path
              d="M140 330 C250 190 360 190 455 290 C550 390 670 370 760 210"
              fill="none"
              pathLength={1}
              stroke={profile.palette.ink}
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
              strokeLinecap="round"
              strokeWidth="10"
            />
            <path
              d="M728 204 L772 202 L754 244"
              fill="none"
              pathLength={1}
              stroke={profile.palette.accent}
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="12"
            />
            {[
              { x: 150, y: 330 },
              { x: 455, y: 290 },
              { x: 760, y: 210 },
            ].map((point, index) => {
              const pointProgress = interpolate(
                draw,
                [index * 0.24, index * 0.24 + 0.24],
                [0, 1],
                clamp,
              );
              return (
                <circle
                  key={`${point.x}-${point.y}`}
                  cx={point.x}
                  cy={point.y}
                  fill={index === 1 ? profile.palette.secondary : profile.palette.accent}
                  r={34 * pointProgress}
                />
              );
            })}
          </svg>
          {[
            { label: "主题", left: 88, top: 378 },
            { label: "结构", left: 390, top: 338 },
            { label: "语言", left: 700, top: 258 },
          ].map((item, index) => {
            const noteProgress = interpolate(
              draw,
              [0.18 + index * 0.2, 0.42 + index * 0.2],
              [0, 1],
              clamp,
            );
            return (
              <div
                key={item.label}
                style={{
                  color: profile.palette.ink,
                  fontSize: 34,
                  fontWeight: 900,
                  left: item.left,
                  opacity: noteProgress,
                  position: "absolute",
                  rotate: `${index % 2 === 0 ? -4 : 3}deg`,
                  top: item.top,
                }}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      </div>
      <ProfileLabel id="hand-drawn-explainer" />
    </Frame>
  );
};

export const StyleProfileShowcase: FC = () => (
  <AbsoluteFill>
    <Series>
      <Series.Sequence durationInFrames={STYLE_PROFILE_PAGE_DURATION_IN_FRAMES}>
        <EditorialTechFixture />
      </Series.Sequence>
      <Series.Sequence durationInFrames={STYLE_PROFILE_PAGE_DURATION_IN_FRAMES}>
        <ComicAnimeFixture />
      </Series.Sequence>
      <Series.Sequence durationInFrames={STYLE_PROFILE_PAGE_DURATION_IN_FRAMES}>
        <Cinematic3dFixture />
      </Series.Sequence>
      <Series.Sequence durationInFrames={STYLE_PROFILE_PAGE_DURATION_IN_FRAMES}>
        <RetroTerminalFixture />
      </Series.Sequence>
      <Series.Sequence durationInFrames={STYLE_PROFILE_PAGE_DURATION_IN_FRAMES}>
        <DocumentaryMediaFixture />
      </Series.Sequence>
      <Series.Sequence durationInFrames={STYLE_PROFILE_PAGE_DURATION_IN_FRAMES}>
        <HandDrawnExplainerFixture />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);
