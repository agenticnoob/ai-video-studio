import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const VIDEO_FPS = 30;
export const VIDEO_DURATION_IN_FRAMES = 60 * VIDEO_FPS;

type Shot = {
  id: string;
  label: string;
  title: string;
  durationInFrames: number;
  accent: string;
  caption: string;
  Visual: React.FC<ShotVisualProps>;
};

type ShotVisualProps = {
  shot: Shot;
  localFrame: number;
};

const FONT_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const SHOT_DURATIONS = [180, 270, 240, 270, 240, 300, 180, 120];

const fade = (
  frame: number,
  start: number,
  end: number,
  output: [number, number] = [0, 1]
) =>
  interpolate(frame, [start, end], output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

const flicker = (frame: number, amount = 1) =>
  Math.sin(frame * 0.71) * 0.5 * amount + Math.sin(frame * 0.19) * 0.5 * amount;

const Background: React.FC<{ accent: string; danger?: boolean }> = ({
  accent,
  danger = false,
}) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, VIDEO_DURATION_IN_FRAMES], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: danger
          ? "radial-gradient(circle at 42% 34%, rgba(239,68,68,0.28), transparent 28%), radial-gradient(circle at 82% 12%, rgba(248,113,113,0.13), transparent 24%), linear-gradient(180deg, #120305 0%, #07070a 52%, #010204 100%)"
          : `radial-gradient(circle at 20% 15%, ${accent}38, transparent 30%), radial-gradient(circle at 78% 24%, rgba(93, 121, 255, 0.18), transparent 28%), linear-gradient(180deg, #050b18 0%, #07111f 48%, #02040a 100%)`,
        overflow: "hidden",
        color: "white",
        fontFamily: FONT_STACK,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -160,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.052) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.052) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          transform: `translate(${drift * -80}px, ${drift * -180}px) rotate(-2deg)`,
          opacity: danger ? 0.2 : 0.32,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.32) 72%, rgba(0,0,0,0.72) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const TopHud: React.FC<{ shot: Shot; localFrame: number }> = ({ shot, localFrame }) => {
  const enter = fade(localFrame, 4, 22);

  return (
    <div
      style={{
        position: "absolute",
        top: 54,
        left: 58,
        right: 58,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        opacity: enter,
        color: "rgba(255,255,255,0.72)",
        fontSize: 23,
        fontWeight: 760,
        letterSpacing: 1.6,
      }}
    >
      <span>AI NEWS 60S</span>
      <span style={{ color: shot.accent }}>{shot.label}</span>
    </div>
  );
};

const Caption: React.FC<{ text: string; accent: string; localFrame: number }> = ({
  text,
  accent,
  localFrame,
}) => {
  const enter = fade(localFrame, 12, 32);

  return (
    <div
      style={{
        position: "absolute",
        left: 58,
        right: 58,
        bottom: 92,
        padding: "30px 34px",
        borderRadius: 32,
        background:
          "linear-gradient(180deg, rgba(4,8,18,0.88), rgba(4,8,18,0.72))",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: `0 24px 90px rgba(0,0,0,0.46), inset 0 0 0 1px ${accent}20`,
        color: "rgba(255,255,255,0.92)",
        fontSize: 37,
        lineHeight: 1.36,
        fontWeight: 740,
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [34, 0])}px)`,
      }}
    >
      <div
        style={{
          width: 78,
          height: 7,
          borderRadius: 999,
          background: accent,
          marginBottom: 18,
        }}
      />
      {text}
    </div>
  );
};

const ShotShell: React.FC<{ shot: Shot; children: React.ReactNode }> = ({
  shot,
  children,
}) => {
  const frame = useCurrentFrame();
  const exit = interpolate(
    frame,
    [shot.durationInFrames - 24, shot.durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    }
  );

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exit * 0.76,
        transform: `scale(${1 + exit * 0.035})`,
      }}
    >
      <Background accent={shot.accent} danger={shot.id === "security"} />
      <TopHud shot={shot} localFrame={frame} />
      {children}
      <Caption text={shot.caption} accent={shot.accent} localFrame={frame} />
    </AbsoluteFill>
  );
};

const KeywordRain: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const keywords = ["OpenAI", "Google", "Claude", "Agent", "芯片", "数据中心"];

  return (
    <>
      {keywords.map((keyword, index) => {
        const y = 1320 - ((localFrame * (1.4 + index * 0.08) + index * 180) % 1180);
        const opacity = fade(localFrame, 10 + index * 4, 48, [0, 0.58]);

        return (
          <div
            key={keyword}
            style={{
              position: "absolute",
              left: 82 + index * 146,
              top: y,
              color: "rgba(255,255,255,0.2)",
              fontSize: 26,
              fontWeight: 820,
              letterSpacing: 1.4,
              opacity,
              transform: `rotate(${index % 2 === 0 ? -8 : 8}deg)`,
            }}
          >
            {keyword}
          </div>
        );
      })}
    </>
  );
};

const Particles: React.FC<{ localFrame: number; accent: string; count?: number }> = ({
  localFrame,
  accent,
  count = 34,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => {
        const x = 64 + ((index * 73) % 950);
        const baseY = 1500 - ((localFrame * (2.1 + (index % 6) * 0.22) + index * 57) % 1280);
        const size = 4 + (index % 5) * 2;
        const opacity = 0.16 + (index % 4) * 0.08;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: baseY,
              width: size,
              height: size,
              borderRadius: 999,
              background: index % 3 === 0 ? accent : "rgba(255,255,255,0.72)",
              opacity,
              boxShadow: `0 0 28px ${accent}`,
            }}
          />
        );
      })}
    </>
  );
};

const TitleShot: React.FC<ShotVisualProps> = ({ shot, localFrame }) => {
  const titleChars = "今日 AI 圈 60 秒".split("");
  const glow = spring({
    frame: localFrame,
    fps: VIDEO_FPS,
    config: { damping: 16, stiffness: 86, mass: 0.9 },
  });

  return (
    <>
      <Particles localFrame={localFrame} accent={shot.accent} count={48} />
      <KeywordRain localFrame={localFrame} />

      <div
        style={{
          position: "absolute",
          left: 58,
          right: 58,
          top: 410,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            padding: "13px 21px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.16)",
            color: "rgba(255,255,255,0.7)",
            fontSize: 25,
            letterSpacing: 2,
            fontWeight: 760,
            opacity: fade(localFrame, 10, 32),
          }}
        >
          2026.06.30 / AI 快讯
        </div>

        <div
          style={{
            marginTop: 72,
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 10,
            filter: `drop-shadow(0 0 ${22 + glow * 30}px ${shot.accent}70)`,
          }}
        >
          {titleChars.map((char, index) => (
            <span
              key={`${char}-${index}`}
              style={{
                color: "white",
                fontSize: 118,
                lineHeight: 1.02,
                fontWeight: 950,
                letterSpacing: -2,
                opacity: fade(localFrame, 20 + index * 4, 30 + index * 4),
                transform: `translateY(${interpolate(
                  fade(localFrame, 20 + index * 4, 34 + index * 4),
                  [0, 1],
                  [52, 0]
                )}px)`,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 154,
          right: 154,
          top: 980,
          height: 8,
          borderRadius: 999,
          background: "rgba(255,255,255,0.1)",
          overflow: "hidden",
          opacity: fade(localFrame, 62, 84),
        }}
      >
        <div
          style={{
            width: `${fade(localFrame, 70, 150, [0, 100])}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${shot.accent}, #a78bfa, #22d3ee)`,
          }}
        />
      </div>
    </>
  );
};

const ModelCard: React.FC<{
  name: string;
  subtitle: string;
  index: number;
  localFrame: number;
  accent: string;
}> = ({ name, subtitle, index, localFrame, accent }) => {
  const enter = fade(localFrame, 70 + index * 18, 100 + index * 18);
  const rotate = interpolate(enter, [0, 1], [18, 0]);

  return (
    <div
      style={{
        width: 264,
        minHeight: 204,
        padding: 26,
        borderRadius: 30,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0.07))",
        border: "1px solid rgba(255,255,255,0.17)",
        boxShadow: "0 26px 80px rgba(0,0,0,0.38)",
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [68, 0])}px) rotateX(${rotate}deg)`,
      }}
    >
      <div style={{ color: accent, fontSize: 22, fontWeight: 900 }}>
        MODEL 0{index + 1}
      </div>
      <div
        style={{
          marginTop: 24,
          color: "white",
          fontSize: 44,
          fontWeight: 940,
          letterSpacing: -1.2,
        }}
      >
        {name}
      </div>
      <div
        style={{
          marginTop: 12,
          color: "rgba(255,255,255,0.64)",
          fontSize: 22,
          lineHeight: 1.25,
          fontWeight: 680,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
};

const OpenAiShot: React.FC<ShotVisualProps> = ({ shot, localFrame }) => {
  const zoom = interpolate(localFrame, [0, 210], [0.94, 1.08], {
    extrapolateRight: "clamp",
  });
  const sphere = spring({
    frame: localFrame - 8,
    fps: VIDEO_FPS,
    config: { damping: 18, stiffness: 72 },
  });

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 220,
          top: 250,
          width: 640,
          height: 640,
          borderRadius: 999,
          transform: `scale(${zoom})`,
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.72), rgba(125,211,252,0.18) 22%, rgba(99,102,241,0.12) 56%, rgba(255,255,255,0.03) 72%)",
          boxShadow: `0 0 120px ${shot.accent}46, inset 0 0 90px rgba(255,255,255,0.14)`,
          opacity: fade(localFrame, 0, 28),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 274,
          top: 304,
          width: 532,
          height: 532,
          borderRadius: 999,
          border: "2px solid rgba(255,255,255,0.12)",
          transform: `scale(${0.86 + sphere * 0.14}) rotate(${localFrame * 0.24}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 626,
          top: 300,
          padding: "14px 20px",
          borderRadius: 12,
          background: "#ef4444",
          color: "white",
          fontSize: 26,
          fontWeight: 960,
          letterSpacing: 1.6,
          opacity: fade(localFrame, 36, 54),
          transform: `translateX(${interpolate(fade(localFrame, 36, 54), [0, 1], [46, 0])}px) rotate(-4deg)`,
        }}
      >
        LIMITED PREVIEW
      </div>

      <div
        style={{
          position: "absolute",
          left: 94,
          right: 94,
          top: 925,
          display: "flex",
          justifyContent: "space-between",
          perspective: 1200,
        }}
      >
        <ModelCard
          name="Sol"
          subtitle="可信伙伴 / 前沿安全审查"
          index={0}
          localFrame={localFrame}
          accent={shot.accent}
        />
        <ModelCard
          name="Terra"
          subtitle="coding / science / tool use"
          index={1}
          localFrame={localFrame}
          accent={shot.accent}
        />
        <ModelCard
          name="Luna"
          subtitle="cybersecurity / risk scanning"
          index={2}
          localFrame={localFrame}
          accent={shot.accent}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 110,
          right: 110,
          top: 1220,
          height: 210,
          opacity: fade(localFrame, 112, 150, [0, 0.62]),
        }}
      >
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: index * 94,
              bottom: 0,
              width: 62,
              height: 70 + (index % 4) * 30,
              background: "rgba(255,255,255,0.1)",
              borderTop: `3px solid ${shot.accent}`,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 90 + flicker(localFrame, 8),
            height: 3,
            background: "#ef4444",
            boxShadow: "0 0 36px #ef4444",
          }}
        />
      </div>
    </>
  );
};

const AgentWindow: React.FC<{
  title: string;
  lines: string[];
  x: number;
  y: number;
  index: number;
  localFrame: number;
  accent: string;
}> = ({ title, lines, x, y, index, localFrame, accent }) => {
  const enter = fade(localFrame, 32 + index * 12, 62 + index * 12);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 380,
        minHeight: 238,
        borderRadius: 26,
        background:
          "linear-gradient(180deg, rgba(10,18,34,0.94), rgba(3,7,18,0.9))",
        border: "1px solid rgba(255,255,255,0.16)",
        boxShadow: "0 30px 100px rgba(0,0,0,0.46)",
        overflow: "hidden",
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [60, 0])}px) scale(${interpolate(
          enter,
          [0, 1],
          [0.92, 1]
        )})`,
      }}
    >
      <div
        style={{
          height: 50,
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "0 18px",
          background: "rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.8)",
          fontSize: 20,
          fontWeight: 780,
        }}
      >
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            style={{
              width: 11,
              height: 11,
              borderRadius: 999,
              background: dot === 0 ? "#fb7185" : dot === 1 ? "#facc15" : accent,
            }}
          />
        ))}
        <span style={{ marginLeft: 8 }}>{title}</span>
      </div>
      <div style={{ padding: 22, display: "grid", gap: 14 }}>
        {lines.map((line, lineIndex) => (
          <div
            key={line}
            style={{
              color: lineIndex === lines.length - 1 ? accent : "rgba(255,255,255,0.72)",
              fontSize: 22,
              lineHeight: 1.2,
              fontWeight: 690,
              opacity: fade(localFrame, 70 + index * 8 + lineIndex * 9, 86 + index * 8 + lineIndex * 9),
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

const AgentShot: React.FC<ShotVisualProps> = ({ shot, localFrame }) => {
  const connector = fade(localFrame, 20, 66);
  const headline = fade(localFrame, 158, 202);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 238,
          width: 276,
          height: 520,
          borderRadius: 54,
          background: "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))",
          border: "2px solid rgba(255,255,255,0.18)",
          opacity: fade(localFrame, 0, 28),
          transform: `translateX(${interpolate(fade(localFrame, 0, 28), [0, 1], [-46, 0])}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 26,
            right: 26,
            top: 64,
            bottom: 64,
            borderRadius: 34,
            background: "rgba(0,0,0,0.42)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {["brief", "plan", "run", "verify"].map((item, index) => (
            <div
              key={item}
              style={{
                margin: "28px 24px",
                height: 44,
                borderRadius: 14,
                background: index <= Math.floor(localFrame / 38) % 4 ? shot.accent : "rgba(255,255,255,0.12)",
                opacity: index <= Math.floor(localFrame / 38) % 4 ? 0.85 : 0.5,
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 380,
          top: 482,
          width: 230,
          height: 4,
          background: `linear-gradient(90deg, ${shot.accent}, transparent)`,
          opacity: connector,
          transform: `scaleX(${connector})`,
          transformOrigin: "left center",
        }}
      />

      <AgentWindow
        title="agent-write.ts"
        lines={["$ write component", "patch applied", "status: ready"]}
        x={560}
        y={244}
        index={0}
        localFrame={localFrame}
        accent={shot.accent}
      />
      <AgentWindow
        title="agent-test.ts"
        lines={["$ npm run test", "36 suites", "status: passing"]}
        x={470}
        y={535}
        index={1}
        localFrame={localFrame}
        accent={shot.accent}
      />
      <AgentWindow
        title="agent-fix.ts"
        lines={["trace error", "edit config", "status: patched"]}
        x={610}
        y={826}
        index={2}
        localFrame={localFrame}
        accent={shot.accent}
      />

      <div
        style={{
          position: "absolute",
          left: 82,
          right: 82,
          top: 1218,
          padding: "34px 38px",
          borderRadius: 30,
          background: "rgba(255,255,255,0.1)",
          border: `1px solid ${shot.accent}70`,
          color: "white",
          fontSize: 58,
          lineHeight: 1.08,
          fontWeight: 950,
          letterSpacing: -2.2,
          opacity: headline,
          transform: `translateY(${interpolate(headline, [0, 1], [50, 0])}px)`,
        }}
      >
        AI Agent 正在变成主工作流
      </div>
    </>
  );
};

const GeminiShot: React.FC<ShotVisualProps> = ({ localFrame }) => {
  const progress = fade(localFrame, 22, 104, [0, 95]);
  const raceEnter = fade(localFrame, 128, 168);
  const brands = [
    { name: "Google", color: "#60a5fa", lane: 0 },
    { name: "Anthropic", color: "#f59e0b", lane: 1 },
    { name: "OpenAI", color: "#22d3ee", lane: 2 },
  ];

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 92,
          right: 92,
          top: 316,
          height: 280,
          borderRadius: 46,
          padding: 42,
          background:
            "linear-gradient(135deg, rgba(66,133,244,0.2), rgba(234,67,53,0.16), rgba(251,188,5,0.16), rgba(52,168,83,0.18))",
          border: "1px solid rgba(255,255,255,0.16)",
          opacity: fade(localFrame, 0, 28),
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 54,
            lineHeight: 1.08,
            fontWeight: 940,
            letterSpacing: -1.8,
          }}
        >
          Gemini 3.5 Pro
          <br />
          launch progress
        </div>
        <div
          style={{
            marginTop: 42,
            height: 24,
            borderRadius: 999,
            background: "rgba(255,255,255,0.14)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background:
                "linear-gradient(90deg, #4285f4, #34a853, #fbbc05, #ea4335)",
              boxShadow: "0 0 34px rgba(96,165,250,0.6)",
            }}
          />
        </div>
        <div
          style={{
            marginTop: 22,
            color: progress >= 95 ? "#facc15" : "rgba(255,255,255,0.72)",
            fontSize: 33,
            fontWeight: 900,
          }}
        >
          {Math.round(progress)}% / holding for long-task eval
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 116,
          top: 640,
          padding: "18px 24px",
          borderRadius: 18,
          background: "#facc15",
          color: "#111827",
          fontSize: 34,
          fontWeight: 960,
          opacity: fade(localFrame, 92, 120),
          transform: `rotate(${flicker(localFrame, 2)}deg)`,
        }}
      >
        Gemini 3.5 Pro → July
      </div>

      <div
        style={{
          position: "absolute",
          left: 84,
          right: 84,
          top: 836,
          height: 418,
          borderRadius: 42,
          padding: "42px 38px",
          background: "rgba(0,0,0,0.28)",
          border: "1px solid rgba(255,255,255,0.13)",
          opacity: raceEnter,
          transform: `translateY(${interpolate(raceEnter, [0, 1], [50, 0])}px)`,
        }}
      >
        <div
          style={{
            color: "rgba(255,255,255,0.66)",
            fontSize: 24,
            fontWeight: 820,
            letterSpacing: 1.6,
            marginBottom: 28,
          }}
        >
          CODE AGENT RACEWAY
        </div>
        {brands.map((brand, index) => {
          const laneY = 82 + index * 96;
          const x = interpolate(
            (localFrame + index * 20) % 110,
            [0, 110],
            [0, 500],
            { extrapolateRight: "clamp" }
          );

          return (
            <div key={brand.name}>
              <div
                style={{
                  position: "absolute",
                  left: 38,
                  right: 38,
                  top: laneY + 34,
                  height: 2,
                  background: "rgba(255,255,255,0.12)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 56 + x,
                  top: laneY,
                  width: 214,
                  padding: "16px 18px",
                  borderRadius: 20,
                  background: brand.color,
                  color: "#020617",
                  fontSize: 24,
                  fontWeight: 950,
                  boxShadow: `0 0 36px ${brand.color}70`,
                }}
              >
                {brand.name}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

const IconChip: React.FC<{
  label: string;
  index: number;
  localFrame: number;
  accent: string;
}> = ({ label, index, localFrame, accent }) => {
  const angle = (-120 + index * 80) * (Math.PI / 180);
  const radius = 270;
  const enter = fade(localFrame, 48 + index * 8, 78 + index * 8);

  return (
    <div
      style={{
        position: "absolute",
        left: 540 + Math.cos(angle) * radius - 70,
        top: 705 + Math.sin(angle) * radius - 70,
        width: 140,
        height: 140,
        borderRadius: 32,
        background: "rgba(255,255,255,0.1)",
        border: `1px solid ${accent}70`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: 25,
        fontWeight: 930,
        opacity: enter,
        transform: `scale(${interpolate(enter, [0, 1], [0.72, 1])})`,
      }}
    >
      {label}
    </div>
  );
};

const ChipShot: React.FC<ShotVisualProps> = ({ shot, localFrame }) => {
  const chip = spring({
    frame: localFrame - 8,
    fps: VIDEO_FPS,
    config: { damping: 18, stiffness: 80 },
  });
  const bridge = fade(localFrame, 96, 132);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 294,
          top: 452,
          width: 492,
          height: 492,
          borderRadius: 72,
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(34,211,238,0.1), rgba(255,255,255,0.06))",
          border: `2px solid ${shot.accent}90`,
          boxShadow: `0 0 110px ${shot.accent}4d, inset 0 0 80px rgba(255,255,255,0.08)`,
          opacity: fade(localFrame, 0, 26),
          transform: `translateY(${interpolate(chip, [0, 1], [120, 0])}px) scale(${0.88 + chip * 0.12})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 58,
            borderRadius: 44,
            background: "#050b18",
            border: "1px solid rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 48,
            fontWeight: 950,
            letterSpacing: -1.6,
            textAlign: "center",
          }}
        >
          Qualcomm
          <br />
          AI Stack
        </div>
      </div>

      {["CPU", "GPU", "NPU", "ASIC"].map((label, index) => (
        <IconChip
          key={label}
          label={label}
          index={index}
          localFrame={localFrame}
          accent={shot.accent}
        />
      ))}

      <div
        style={{
          position: "absolute",
          left: 128,
          right: 128,
          top: 1058,
          height: 116,
          borderRadius: 28,
          border: `1px solid ${shot.accent}80`,
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.08), rgba(34,211,238,0.22), rgba(255,255,255,0.08))",
          opacity: bridge,
          overflow: "hidden",
          transform: `scaleX(${bridge})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 48,
            fontWeight: 950,
            letterSpacing: -1.4,
          }}
        >
          Modular bridges heterogeneous chips
        </div>
        <div
          style={{
            position: "absolute",
            left: `${(localFrame * 2.2) % 100}%`,
            top: 0,
            width: 90,
            height: "100%",
            background: "rgba(255,255,255,0.18)",
            filter: "blur(6px)",
          }}
        />
      </div>
    </>
  );
};

const SecurityNode: React.FC<{
  x: number;
  y: number;
  label: string;
  index: number;
  localFrame: number;
}> = ({ x, y, label, index, localFrame }) => {
  const enter = fade(localFrame, 34 + index * 9, 58 + index * 9);
  const pulse = 0.72 + Math.sin((localFrame + index * 12) * 0.13) * 0.18;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: enter,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 999,
          background: "#ef4444",
          boxShadow: `0 0 ${28 + pulse * 28}px #ef4444`,
          transform: `scale(${pulse})`,
        }}
      />
      <div
        style={{
          marginTop: 13,
          color: "rgba(255,255,255,0.78)",
          fontSize: 22,
          fontWeight: 820,
        }}
      >
        {label}
      </div>
    </div>
  );
};

const SecurityShot: React.FC<ShotVisualProps> = ({ localFrame }) => {
  const scanY = 308 + ((localFrame * 4) % 670);
  const shield = fade(localFrame, 198, 238);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 84,
          right: 84,
          top: 258,
          height: 790,
          borderRadius: 46,
          background:
            "radial-gradient(circle at 56% 46%, rgba(239,68,68,0.23), rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.48))",
          border: "1px solid rgba(248,113,113,0.28)",
          overflow: "hidden",
          opacity: fade(localFrame, 0, 28),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 250,
            top: 254,
            width: 380,
            height: 280,
            borderRadius: "48% 44% 42% 46%",
            border: "2px solid rgba(248,113,113,0.56)",
            background: "rgba(239,68,68,0.12)",
            transform: "rotate(-8deg)",
          }}
        />
        {[0, 1, 2, 3, 4, 5].map((line) => (
          <div
            key={line}
            style={{
              position: "absolute",
              left: 90 + line * 130,
              top: 110,
              width: 1,
              height: 570,
              background: "rgba(248,113,113,0.12)",
              transform: "rotate(34deg)",
            }}
          />
        ))}
        <SecurityNode x={206} y={300} label="CVE" index={0} localFrame={localFrame} />
        <SecurityNode x={515} y={362} label="360" index={1} localFrame={localFrame} />
        <SecurityNode x={620} y={610} label="Tulongfeng" index={2} localFrame={localFrame} />
        <SecurityNode x={310} y={642} label="Yitianzhen" index={3} localFrame={localFrame} />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: scanY,
            height: 4,
            background: "#f87171",
            boxShadow: "0 0 42px #ef4444",
            opacity: 0.82,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 208,
          right: 208,
          top: 1115,
          height: 248,
          opacity: shield,
          transform: `translateY(${interpolate(shield, [0, 1], [56, 0])}px)`,
        }}
      >
        <div
          style={{
            margin: "0 auto",
            width: 220,
            height: 248,
            clipPath: "polygon(50% 0, 88% 18%, 78% 78%, 50% 100%, 22% 78%, 12% 18%)",
            background:
              "linear-gradient(180deg, rgba(248,113,113,0.96), rgba(127,29,29,0.84))",
            boxShadow: "0 0 70px rgba(239,68,68,0.55)",
          }}
        />
        <div
          style={{
            marginTop: -146,
            textAlign: "center",
            color: "white",
            fontSize: 32,
            fontWeight: 950,
          }}
        >
          AUTO PATCH
        </div>
      </div>
    </>
  );
};

const DataCenterShot: React.FC<ShotVisualProps> = ({ shot, localFrame }) => {
  const flash = fade(localFrame, 82, 96) * (1 - fade(localFrame, 138, 164));

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 302,
          height: 760,
          perspective: 900,
          opacity: fade(localFrame, 0, 28),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 650,
            transform: `rotateX(58deg) translateY(${interpolate(localFrame, [0, 180], [70, -40], {
              extrapolateRight: "clamp",
            })}px)`,
            transformOrigin: "center bottom",
          }}
        >
          {Array.from({ length: 7 }).map((_, row) =>
            Array.from({ length: 8 }).map((__, col) => (
              <div
                key={`${row}-${col}`}
                style={{
                  position: "absolute",
                  left: 42 + col * 114,
                  top: row * 82,
                  width: 70,
                  height: 160 + row * 8,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(12,74,110,0.36))",
                  border: "1px solid rgba(125,211,252,0.22)",
                  boxShadow: "0 18px 50px rgba(0,0,0,0.36)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 10,
                    right: 10,
                    top: 18,
                    height: 5,
                    background: col % 2 === 0 ? shot.accent : "#a78bfa",
                    boxShadow: `0 0 18px ${shot.accent}`,
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {["bond", "dollar", "chip", "cloud"].map((label, index) => {
        const enter = fade(localFrame, 42 + index * 10, 72 + index * 10);

        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: 126 + index * 210,
              top: 1060 + Math.sin((localFrame + index * 20) * 0.05) * 24,
              width: 152,
              height: 152,
              borderRadius: 34,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 26,
              fontWeight: 930,
              opacity: enter,
              transform: `translateY(${interpolate(enter, [0, 1], [80, 0])}px)`,
            }}
          >
            {label}
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 58,
          right: 58,
          top: 594,
          textAlign: "center",
          color: "white",
          fontSize: 148,
          fontWeight: 980,
          letterSpacing: -6,
          opacity: flash,
          transform: `scale(${0.82 + flash * 0.18})`,
          textShadow: `0 0 80px ${shot.accent}`,
        }}
      >
        $725B
      </div>
    </>
  );
};

const MontageShot: React.FC<ShotVisualProps> = ({ shot, localFrame }) => {
  const tiles = ["GPT-5.6", "Gemini → July", "Agent", "Chips", "Security", "Data Center"];
  const title = fade(localFrame, 66, 96);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 68,
          right: 68,
          top: 230,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 22,
        }}
      >
        {tiles.map((tile, index) => {
          const enter = fade(localFrame, index * 8, index * 8 + 20);
          const active = Math.floor(localFrame / 14) % tiles.length === index;

          return (
            <div
              key={tile}
              style={{
                height: 188,
                borderRadius: 28,
                background: active
                  ? `linear-gradient(135deg, ${shot.accent}66, rgba(255,255,255,0.12))`
                  : "rgba(255,255,255,0.09)",
                border: active
                  ? `2px solid ${shot.accent}`
                  : "1px solid rgba(255,255,255,0.14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 35,
                fontWeight: 940,
                opacity: enter,
                transform: `scale(${interpolate(enter, [0, 1], [0.86, 1])})`,
              }}
            >
              {tile}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 58,
          right: 58,
          top: 1020,
          color: "white",
          fontSize: 82,
          lineHeight: 1.08,
          fontWeight: 980,
          letterSpacing: -3.2,
          textAlign: "center",
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [60, 0])}px)`,
          textShadow: `0 0 60px ${shot.accent}70`,
        }}
      >
        AI 从聊天工具，
        <br />
        进入基础设施战争
      </div>
    </>
  );
};

const SHOTS: Shot[] = [
  {
    id: "title",
    label: "SHOT 01 / 06S",
    title: "今日 AI 圈 60 秒",
    durationInFrames: SHOT_DURATIONS[0],
    accent: "#7dd3fc",
    caption: "今天 AI 圈的关键词很明确：更强模型、更强监管、更强 Agent，还有更贵的算力。",
    Visual: TitleShot,
  },
  {
    id: "openai",
    label: "SHOT 02 / 09S",
    title: "OpenAI GPT-5.6 limited preview",
    durationInFrames: SHOT_DURATIONS[1],
    accent: "#a78bfa",
    caption:
      "OpenAI 预览 GPT-5.6 系列，但不是直接全面开放。旗舰模型 Sol 先给少数可信伙伴测试，背后是美国政府对前沿模型安全风险的提前审查。",
    Visual: OpenAiShot,
  },
  {
    id: "agent",
    label: "SHOT 03 / 08S",
    title: "AI Agent workflow",
    durationInFrames: SHOT_DURATIONS[2],
    accent: "#34d399",
    caption:
      "另一个趋势是 Agent 化。AI 不只是聊天，而是开始接管长任务：写代码、调环境、改项目、跑验证。开发工作流正在被重新组织。",
    Visual: AgentShot,
  },
  {
    id: "gemini",
    label: "SHOT 04 / 09S",
    title: "Google Gemini delay",
    durationInFrames: SHOT_DURATIONS[3],
    accent: "#60a5fa",
    caption:
      "Google 的 Gemini 3.5 Pro 原计划 6 月推出，现在延到 7 月。核心原因是还要打磨长任务和 Agent 表现，尤其是代码能力这条赛道。",
    Visual: GeminiShot,
  },
  {
    id: "chip",
    label: "SHOT 05 / 08S",
    title: "Qualcomm + Modular chip stack",
    durationInFrames: SHOT_DURATIONS[4],
    accent: "#22d3ee",
    caption:
      "Qualcomm 收购 Modular，重点不是再造一个模型，而是抢 AI 软件基础设施。未来模型要跑在各种芯片上，谁能降低部署成本，谁就更有话语权。",
    Visual: ChipShot,
  },
  {
    id: "security",
    label: "SHOT 06 / 10S",
    title: "360 AI security tools",
    durationInFrames: SHOT_DURATIONS[5],
    accent: "#f87171",
    caption:
      "中国网络安全公司 360 推出 AI 安全工具，主打自动发现漏洞和自动化防御。AI 安全已经不是论文概念，而是国家级攻防能力的一部分。",
    Visual: SecurityShot,
  },
  {
    id: "datacenter",
    label: "SHOT 07 / 06S",
    title: "Data center capital race",
    durationInFrames: SHOT_DURATIONS[6],
    accent: "#facc15",
    caption:
      "但所有这些能力，都要靠算力买单。数据中心、芯片和云基础设施，正在把 AI 竞赛变成资本竞赛。",
    Visual: DataCenterShot,
  },
  {
    id: "montage",
    label: "SHOT 08 / 04S",
    title: "Montage recap",
    durationInFrames: SHOT_DURATIONS[7],
    accent: "#fb7185",
    caption:
      "今天的结论：AI 正从聊天工具，变成模型、安全、芯片、资本和 Agent 工作流的全面战争。",
    Visual: MontageShot,
  },
];

const ShotSequence: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const Visual = shot.Visual;

  return (
    <ShotShell shot={shot}>
      <Visual shot={shot} localFrame={frame} />
    </ShotShell>
  );
};

export const AiNews60sVideo: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const totalShotFrames = SHOTS.reduce(
    (sum, shot) => sum + shot.durationInFrames,
    0
  );

  if (fps !== VIDEO_FPS || durationInFrames !== VIDEO_DURATION_IN_FRAMES) {
    return (
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          background: "#020617",
          color: "white",
          fontFamily: FONT_STACK,
          fontSize: 44,
          padding: 80,
          textAlign: "center",
        }}
      >
        AiNews60s expects 30fps and 1800 frames.
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ background: "#020617", fontFamily: FONT_STACK }}>
      {SHOTS.map((shot, index) => {
        const from = SHOTS.slice(0, index).reduce(
          (sum, item) => sum + item.durationInFrames,
          0
        );

        return (
          <Sequence
            key={shot.id}
            from={from}
            durationInFrames={shot.durationInFrames}
            name={`${shot.label}: ${shot.title}`}
          >
            <ShotSequence shot={shot} />
            <Audio src={staticFile(`standalone-samples/audio/ai60s-${  shot.id  }.wav`)} />
          </Sequence>
        );
      })}
      {totalShotFrames !== VIDEO_DURATION_IN_FRAMES ? (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            background: "#7f1d1d",
            color: "white",
            fontFamily: FONT_STACK,
            fontSize: 44,
          }}
        >
          Shot durations do not add up to 1800 frames.
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export default AiNews60sVideo;
