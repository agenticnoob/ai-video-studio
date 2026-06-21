import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";

const WIDTH = 1280;
const HEIGHT = 720;
const SCENE_DURATION = 330;

export const RECIPE_SHOWCASE_DURATION_IN_FRAMES = SCENE_DURATION * 6;

const palette = {
  background: "#07111f",
  panel: "#101b2d",
  panelSoft: "#162338",
  text: "#f5f7fb",
  muted: "#9fb2c8",
  cyan: "#21d4fd",
  green: "#45f084",
  amber: "#ffb000",
  rose: "#ff4f87",
  violet: "#8f7cff",
};

const showcaseRecipes = [
  "hero-title-reveal",
  "workflow-node-map",
  "terminal-build-run",
  "metric-countup",
  "timeline-progress",
  "code-diff-highlight",
] as const;

const showcaseTransitions = ["light-sweep-bridge", "scanline-wipe", "panel-push"] as const;

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const softOut = Easing.bezier(0.16, 1, 0.3, 1);
const focusedOut = Easing.bezier(0.22, 1, 0.36, 1);

const enter = (frame: number, start = 0, end = 32) =>
  interpolate(frame, [start, end], [0, 1], { ...clamp, easing: softOut });

const exit = (frame: number, start = SCENE_DURATION - 36, end = SCENE_DURATION) =>
  interpolate(frame, [start, end], [1, 0], { ...clamp, easing: Easing.in(Easing.ease) });

const recipeShellStyle: CSSProperties = {
  background: "linear-gradient(135deg, #07111f 0%, #0b1524 42%, #1a1024 72%, #111827 100%)",
  color: palette.text,
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  overflow: "hidden",
};

const GridBackground: FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
      backgroundSize: "56px 56px",
      opacity: 0.35,
    }}
  />
);

const RecipeLabel: FC<{ index: number; name: string; tint: string }> = ({ index, name, tint }) => (
  <div
    style={{
      alignItems: "center",
      display: "flex",
      gap: 10,
      left: 54,
      position: "absolute",
      top: 36,
    }}
  >
    <div
      style={{
        backgroundColor: tint,
        borderRadius: 999,
        height: 8,
        width: 8,
      }}
    />
    <div
      style={{
        color: palette.muted,
        fontSize: 13,
        fontWeight: 800,
        letterSpacing: 0,
        textTransform: "uppercase",
      }}
    >
      Recipe {String(index).padStart(2, "0")} / {name}
    </div>
  </div>
);

const SceneFrame: FC<{
  children: ReactNode;
  index: number;
  name: string;
  tint: string;
}> = ({ children, index, name, tint }) => {
  const frame = useCurrentFrame();
  const sceneOpacity = Math.min(enter(frame, 0, 24), exit(frame));
  const y = interpolate(enter(frame, 0, 28), [0, 1], [18, 0], clamp);

  return (
    <AbsoluteFill style={recipeShellStyle}>
      <GridBackground />
      <div
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${tint}22 48%, transparent 100%)`,
          height: 2,
          left: 54,
          opacity: sceneOpacity,
          position: "absolute",
          right: 54,
          top: 96,
        }}
      />
      <RecipeLabel index={index} name={name} tint={tint} />
      <div
        style={{
          height: "100%",
          opacity: sceneOpacity,
          transform: `translateY(${y}px)`,
          width: "100%",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

const HeroTitleReveal: FC = () => {
  const frame = useCurrentFrame();
  const titleIn = enter(frame, 12, 58);
  const subtitleIn = enter(frame, 50, 90);
  const sweep = interpolate(frame, [42, 128], [-280, 800], clamp);

  return (
    <SceneFrame index={1} name={showcaseRecipes[0]} tint={palette.cyan}>
      <div
        style={{
          bottom: 92,
          left: 78,
          position: "absolute",
          right: 78,
          top: 122,
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${palette.cyan}22, ${palette.rose}18)`,
            border: "1px solid rgba(245,247,251,0.14)",
            borderRadius: 28,
            bottom: 0,
            boxShadow: "0 36px 110px rgba(0,0,0,0.36)",
            left: 0,
            overflow: "hidden",
            position: "absolute",
            right: 0,
            top: 0,
          }}
        >
          <div
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${palette.text}55 50%, transparent 100%)`,
              height: "100%",
              left: sweep,
              opacity: interpolate(frame, [42, 64, 112, 128], [0, 1, 1, 0], clamp),
              position: "absolute",
              top: 0,
              transform: "skewX(-18deg)",
              width: 180,
            }}
          />
          <div
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0))",
              bottom: 0,
              left: 0,
              position: "absolute",
              right: 0,
              top: 0,
            }}
          />
        </div>
        <div
          style={{
            left: 70,
            position: "absolute",
            top: 86,
            transform: `translateY(${interpolate(titleIn, [0, 1], [28, 0], clamp)}px)`,
          }}
        >
          <div
            style={{
              color: palette.cyan,
              fontSize: 21,
              fontWeight: 900,
              letterSpacing: 0,
              marginBottom: 18,
              opacity: titleIn,
              textTransform: "uppercase",
            }}
          >
            AI video compiler
          </div>
          <div
            style={{
              filter: `blur(${interpolate(titleIn, [0, 1], [18, 0], clamp)}px)`,
              fontSize: 78,
              fontWeight: 950,
              letterSpacing: 0,
              lineHeight: 0.95,
              opacity: titleIn,
              width: 760,
            }}
          >
            Turn rough ideas into directed motion.
          </div>
          <div
            style={{
              color: palette.muted,
              fontSize: 27,
              fontWeight: 750,
              lineHeight: 1.25,
              marginTop: 28,
              opacity: subtitleIn,
              transform: `translateY(${interpolate(subtitleIn, [0, 1], [18, 0], clamp)}px)`,
              width: 620,
            }}
          >
            Scene recipes give the model a polished visual grammar before it ever touches code.
          </div>
        </div>
      </div>
    </SceneFrame>
  );
};

const workflowNodes = [
  { id: "brief", label: "Brief", x: 155, y: 330, tint: palette.cyan },
  { id: "plan", label: "Plan", x: 330, y: 210, tint: palette.violet },
  { id: "voice", label: "Voice", x: 535, y: 330, tint: palette.green },
  { id: "recipe", label: "Recipe", x: 750, y: 210, tint: palette.amber },
  { id: "render", label: "Render", x: 950, y: 330, tint: palette.rose },
];

const WorkflowNodeMap: FC = () => {
  const frame = useCurrentFrame();
  const pan = interpolate(frame, [0, SCENE_DURATION], [0, -26], clamp);

  return (
    <SceneFrame index={2} name={showcaseRecipes[1]} tint={palette.violet}>
      <div
        style={{
          left: 92,
          position: "absolute",
          top: 138,
          transform: `translateX(${pan}px)`,
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontWeight: 930,
            letterSpacing: 0,
            marginBottom: 22,
          }}
        >
          Workflow map, not a bullet list.
        </div>
        <svg height={360} style={{ position: "absolute", top: 90 }} width={1050}>
          {workflowNodes.slice(0, -1).map((node, index) => {
            const next = workflowNodes[index + 1];
            const edgeProgress = enter(frame, 66 + index * 26, 96 + index * 26);
            return (
              <line
                key={`${node.id}-${next.id}`}
                stroke={node.tint}
                strokeDasharray="10 12"
                strokeLinecap="round"
                strokeWidth={4}
                x1={node.x + 58}
                x2={next.x - 58}
                y1={node.y}
                y2={next.y}
                opacity={edgeProgress}
              />
            );
          })}
        </svg>
        {workflowNodes.map((node, index) => {
          const nodeIn = enter(frame, 34 + index * 26, 68 + index * 26);
          const pulse = interpolate(frame, [130 + index * 12, 160 + index * 12], [0, 1], {
            ...clamp,
            easing: focusedOut,
          });
          return (
            <div
              key={node.id}
              style={{
                alignItems: "center",
                backgroundColor: palette.panel,
                border: `1px solid ${node.tint}88`,
                borderRadius: 20,
                boxShadow: `0 0 ${Math.round(18 + pulse * 22)}px ${node.tint}33`,
                color: palette.text,
                display: "flex",
                fontSize: 20,
                fontWeight: 900,
                height: 94,
                justifyContent: "center",
                left: node.x - 70,
                opacity: nodeIn,
                position: "absolute",
                top: 90 + node.y - 47,
                transform: `scale(${interpolate(nodeIn, [0, 1], [0.82, 1], clamp)})`,
                width: 140,
              }}
            >
              {node.label}
            </div>
          );
        })}
        <div
          style={{
            backgroundColor: "rgba(16,27,45,0.78)",
            border: "1px solid rgba(245,247,251,0.14)",
            borderRadius: 18,
            color: palette.muted,
            fontSize: 20,
            fontWeight: 800,
            left: 710,
            lineHeight: 1.35,
            padding: "18px 20px",
            position: "absolute",
            top: 430,
            width: 310,
          }}
        >
          Staggered reveals make the plan feel directed, even before live generation is wired in.
        </div>
      </div>
    </SceneFrame>
  );
};

const terminalLines = [
  { text: "$ npm run generate:video", status: "running", tint: palette.cyan },
  { text: "DeepSeek planned 5 recipe scenes", status: "info", tint: palette.violet },
  { text: "$ npm run voice:f5", status: "running", tint: palette.green },
  { text: "captions aligned to real duration", status: "success", tint: palette.green },
  { text: "$ npm run render", status: "running", tint: palette.amber },
  { text: "export complete: recipe-showcase.mp4", status: "success", tint: palette.green },
];

const TerminalBuildRun: FC = () => {
  const frame = useCurrentFrame();
  const panelIn = enter(frame, 18, 54);
  const scanY = interpolate(frame, [60, 280], [0, 390], clamp);

  return (
    <SceneFrame index={3} name={showcaseRecipes[2]} tint={palette.green}>
      <div
        style={{
          left: 112,
          position: "absolute",
          right: 112,
          top: 134,
        }}
      >
        <div
          style={{
            fontSize: 43,
            fontWeight: 930,
            letterSpacing: 0,
            marginBottom: 30,
            opacity: panelIn,
          }}
        >
          Terminal sessions should perform, not sit still.
        </div>
        <div
          style={{
            backgroundColor: "#070b12",
            border: `1px solid ${palette.green}77`,
            borderRadius: 24,
            boxShadow: "0 28px 100px rgba(0,0,0,0.44)",
            height: 405,
            opacity: panelIn,
            overflow: "hidden",
            position: "relative",
            transform: `scale(${interpolate(panelIn, [0, 1], [0.96, 1], clamp)})`,
          }}
        >
          <div
            style={{
              alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              gap: 10,
              height: 52,
              padding: "0 22px",
            }}
          >
            {[palette.rose, palette.amber, palette.green].map((color) => (
              <div
                key={color}
                style={{ backgroundColor: color, borderRadius: 99, height: 12, width: 12 }}
              />
            ))}
            <div style={{ color: palette.muted, fontSize: 14, fontWeight: 800, marginLeft: 12 }}>
              recipe-runner
            </div>
          </div>
          <div
            style={{
              background: `linear-gradient(180deg, transparent, ${palette.green}24, transparent)`,
              height: 80,
              left: 0,
              opacity: 0.75,
              position: "absolute",
              right: 0,
              top: scanY,
            }}
          />
          <div style={{ padding: "26px 32px" }}>
            {terminalLines.map((line, index) => {
              const lineStart = 58 + index * 28;
              const lineIn = enter(frame, lineStart, lineStart + 20);
              const chars = Math.round(
                interpolate(frame, [lineStart, lineStart + 28], [0, line.text.length], clamp),
              );
              return (
                <div
                  key={line.text}
                  style={{
                    color: line.tint,
                    fontFamily:
                      '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
                    fontSize: 22,
                    fontWeight: line.status === "success" ? 850 : 700,
                    height: 42,
                    opacity: lineIn,
                  }}
                >
                  {line.text.slice(0, chars)}
                  {chars < line.text.length ? "█" : ""}
                </div>
              );
            })}
          </div>
          <div
            style={{
              backgroundColor: `${palette.green}22`,
              border: `1px solid ${palette.green}88`,
              borderRadius: 999,
              bottom: 24,
              color: palette.green,
              fontSize: 15,
              fontWeight: 900,
              padding: "9px 16px",
              position: "absolute",
              right: 24,
            }}
          >
            checks passed
          </div>
        </div>
      </div>
    </SceneFrame>
  );
};

const metrics = [
  { label: "Render clarity", value: 92, suffix: "%", tint: palette.cyan },
  { label: "Motion beats", value: 18, suffix: "", tint: palette.amber },
  { label: "Recipe scenes", value: 6, suffix: "", tint: palette.rose },
];

const MetricCountUp: FC = () => {
  const frame = useCurrentFrame();

  return (
    <SceneFrame index={4} name={showcaseRecipes[3]} tint={palette.amber}>
      <div style={{ left: 92, position: "absolute", right: 92, top: 136 }}>
        <div
          style={{
            color: palette.text,
            fontSize: 46,
            fontWeight: 930,
            letterSpacing: 0,
            lineHeight: 1.05,
            width: 610,
          }}
        >
          Metrics need motion hierarchy, not just bigger numbers.
        </div>
        <div style={{ display: "flex", gap: 26, marginTop: 54 }}>
          {metrics.map((metric, index) => {
            const cardIn = enter(frame, 34 + index * 20, 74 + index * 20);
            const drift = interpolate(frame, [90, 260], [-4, 4], clamp) * (index % 2 ? -1 : 1);
            const value = Math.round(
              interpolate(frame, [72 + index * 14, 160 + index * 14], [0, metric.value], {
                ...clamp,
                easing: focusedOut,
              }),
            );
            return (
              <div
                key={metric.label}
                style={{
                  background: `linear-gradient(180deg, ${metric.tint}22, rgba(16,27,45,0.9))`,
                  border: `1px solid ${metric.tint}66`,
                  borderRadius: 24,
                  boxShadow: `0 24px 80px ${metric.tint}20`,
                  height: 250,
                  opacity: cardIn,
                  padding: 28,
                  transform: `translateY(${interpolate(cardIn, [0, 1], [34, drift], clamp)}px) rotateX(${drift}deg)`,
                  width: 320,
                }}
              >
                <div style={{ color: palette.muted, fontSize: 18, fontWeight: 850 }}>
                  {metric.label}
                </div>
                <div
                  style={{
                    color: palette.text,
                    fontSize: 78,
                    fontWeight: 950,
                    lineHeight: 1,
                    marginTop: 42,
                  }}
                >
                  {value}
                  {metric.suffix}
                </div>
                <div
                  style={{
                    backgroundColor: metric.tint,
                    borderRadius: 999,
                    height: 6,
                    marginTop: 34,
                    width: `${Math.max(18, value)}%`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </SceneFrame>
  );
};

const checkpoints = ["Prompt", "Voice", "Recipe", "Preview", "Export"];

const TimelineProgress: FC = () => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [42, 236], [0, 1], clamp);

  return (
    <SceneFrame index={5} name={showcaseRecipes[4]} tint={palette.rose}>
      <div style={{ left: 110, position: "absolute", right: 110, top: 150 }}>
        <div
          style={{
            fontSize: 44,
            fontWeight: 930,
            letterSpacing: 0,
            lineHeight: 1.08,
            width: 690,
          }}
        >
          A timeline recipe makes the pipeline legible at a glance.
        </div>
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.12)",
            borderRadius: 999,
            height: 8,
            marginTop: 114,
            position: "relative",
            width: 980,
          }}
        >
          <div
            style={{
              background: `linear-gradient(90deg, ${palette.rose}, ${palette.amber}, ${palette.green})`,
              borderRadius: 999,
              height: 8,
              width: `${fill * 100}%`,
            }}
          />
          {checkpoints.map((label, index) => {
            const ratio = index / (checkpoints.length - 1);
            const active = fill >= ratio ? 1 : 0;
            const pointIn = enter(frame, 54 + index * 34, 88 + index * 34);
            return (
              <div
                key={label}
                style={{
                  left: ratio * 980 - 48,
                  opacity: pointIn,
                  position: "absolute",
                  top: -42,
                  width: 96,
                }}
              >
                <div
                  style={{
                    backgroundColor: active ? palette.text : palette.panel,
                    border: `2px solid ${active ? palette.rose : "rgba(255,255,255,0.24)"}`,
                    borderRadius: 999,
                    height: 34,
                    margin: "0 auto",
                    width: 34,
                  }}
                />
                <div
                  style={{
                    color: active ? palette.text : palette.muted,
                    fontSize: 17,
                    fontWeight: 850,
                    marginTop: 18,
                    textAlign: "center",
                  }}
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            backgroundColor: "rgba(16,27,45,0.8)",
            border: `1px solid ${palette.rose}66`,
            borderRadius: 20,
            color: palette.text,
            fontSize: 25,
            fontWeight: 850,
            lineHeight: 1.3,
            marginTop: 118,
            padding: "22px 26px",
            width: 520,
          }}
        >
          Reveal, hold, and exit beats are compiled from real narration duration.
        </div>
      </div>
    </SceneFrame>
  );
};

const codeLines = [
  { text: "- template: simple spotlight", mode: "remove" },
  { text: "+ recipe: terminal-build-run", mode: "add" },
  { text: "+ motion: typewriter + scanline", mode: "add" },
  { text: "+ timing: narration duration", mode: "add" },
  { text: "  output: VideoProject", mode: "neutral" },
];

const CodeDiffHighlight: FC = () => {
  const frame = useCurrentFrame();
  const panelIn = enter(frame, 28, 62);
  const focusY = interpolate(frame, [90, 230], [92, 250], clamp);

  return (
    <SceneFrame index={6} name={showcaseRecipes[5]} tint={palette.cyan}>
      <div style={{ left: 104, position: "absolute", right: 104, top: 126 }}>
        <div
          style={{
            display: "flex",
            gap: 46,
          }}
        >
          <div style={{ flex: 1, paddingTop: 42 }}>
            <div
              style={{
                color: palette.cyan,
                fontSize: 20,
                fontWeight: 900,
                marginBottom: 18,
              }}
            >
              Code diff recipe
            </div>
            <div
              style={{
                fontSize: 47,
                fontWeight: 930,
                letterSpacing: 0,
                lineHeight: 1.05,
              }}
            >
              Show the change instead of explaining the change.
            </div>
            <div
              style={{
                color: palette.muted,
                fontSize: 22,
                fontWeight: 760,
                lineHeight: 1.35,
                marginTop: 26,
              }}
            >
              Semantic line color, focused sweep, and staged reveals make code content readable in a
              video frame.
            </div>
          </div>
          <div
            style={{
              backgroundColor: "#07101d",
              border: `1px solid ${palette.cyan}66`,
              borderRadius: 22,
              boxShadow: "0 26px 90px rgba(0,0,0,0.42)",
              height: 410,
              opacity: panelIn,
              overflow: "hidden",
              position: "relative",
              transform: `translateY(${interpolate(panelIn, [0, 1], [28, 0], clamp)}px)`,
              width: 570,
            }}
          >
            <div
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                color: palette.muted,
                fontFamily:
                  '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
                fontSize: 15,
                fontWeight: 800,
                padding: "17px 24px",
              }}
            >
              recipes/technical-explainer.ts
            </div>
            <div
              style={{
                background: `linear-gradient(90deg, transparent, ${palette.cyan}20, transparent)`,
                height: 54,
                left: 0,
                position: "absolute",
                right: 0,
                top: focusY,
              }}
            />
            <div style={{ padding: "24px 0" }}>
              {codeLines.map((line, index) => {
                const lineIn = enter(frame, 62 + index * 24, 92 + index * 24);
                const tint =
                  line.mode === "add"
                    ? palette.green
                    : line.mode === "remove"
                      ? palette.rose
                      : palette.muted;
                return (
                  <div
                    key={line.text}
                    style={{
                      backgroundColor:
                        line.mode === "add"
                          ? `${palette.green}10`
                          : line.mode === "remove"
                            ? `${palette.rose}12`
                            : "transparent",
                      color: tint,
                      fontFamily:
                        '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
                      fontSize: 21,
                      fontWeight: 760,
                      opacity: lineIn,
                      padding: "11px 28px",
                      transform: `translateX(${interpolate(lineIn, [0, 1], [20, 0], clamp)}px)`,
                    }}
                  >
                    {line.text}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </SceneFrame>
  );
};

const transitionProgress = (frame: number, center: number, radius = 34) => {
  const distance = Math.abs(frame - center);
  return interpolate(distance, [0, radius], [1, 0], clamp);
};

const LightSweepBridge: FC<{ center: number }> = ({ center }) => {
  const frame = useCurrentFrame();
  const progress = transitionProgress(frame, center, 38);
  const travel = interpolate(frame, [center - 38, center + 38], [-260, WIDTH + 220], clamp);

  if (progress <= 0) {
    return null;
  }

  return (
    <AbsoluteFill
      style={{
        opacity: progress,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: `linear-gradient(90deg, transparent, ${palette.text}dd, ${palette.cyan}66, transparent)`,
          filter: "blur(1px)",
          height: HEIGHT * 1.35,
          left: travel,
          position: "absolute",
          top: -120,
          transform: "rotate(16deg)",
          width: 160,
        }}
      />
      <div
        style={{
          background: `radial-gradient(circle at 50% 50%, ${palette.cyan}3b, transparent 64%)`,
          inset: 0,
          opacity: progress,
          position: "absolute",
        }}
      />
    </AbsoluteFill>
  );
};

const ScanlineWipe: FC<{ center: number }> = ({ center }) => {
  const frame = useCurrentFrame();
  const progress = transitionProgress(frame, center, 42);
  const wipe = interpolate(frame, [center - 42, center + 42], [-160, HEIGHT + 160], clamp);

  if (progress <= 0) {
    return null;
  }

  return (
    <AbsoluteFill style={{ opacity: progress, pointerEvents: "none" }}>
      <div
        style={{
          background: `linear-gradient(180deg, transparent, ${palette.green}55, ${palette.green}cc, ${palette.green}55, transparent)`,
          filter: "blur(0.4px)",
          height: 135,
          left: 0,
          position: "absolute",
          right: 0,
          top: wipe,
        }}
      />
      <div
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${palette.green}18 0px, ${palette.green}18 1px, transparent 1px, transparent 6px)`,
          inset: 0,
          opacity: progress * 0.7,
          position: "absolute",
        }}
      />
    </AbsoluteFill>
  );
};

const PanelPush: FC<{ center: number }> = ({ center }) => {
  const frame = useCurrentFrame();
  const progress = transitionProgress(frame, center, 40);
  const leftPanel = interpolate(frame, [center - 40, center + 40], [-WIDTH, WIDTH], clamp);
  const rightPanel = interpolate(frame, [center - 40, center + 40], [WIDTH, -WIDTH], clamp);

  if (progress <= 0) {
    return null;
  }

  return (
    <AbsoluteFill style={{ opacity: progress, pointerEvents: "none" }}>
      <div
        style={{
          background: `linear-gradient(90deg, ${palette.rose}dd, ${palette.violet}88)`,
          bottom: 0,
          left: leftPanel,
          position: "absolute",
          top: 0,
          transform: "skewX(-10deg)",
          width: WIDTH * 0.72,
        }}
      />
      <div
        style={{
          background: `linear-gradient(90deg, ${palette.cyan}88, ${palette.green}cc)`,
          bottom: 0,
          position: "absolute",
          right: rightPanel,
          top: 0,
          transform: "skewX(-10deg)",
          width: WIDTH * 0.5,
        }}
      />
      <div
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, ${palette.text}1a 0px, ${palette.text}1a 2px, transparent 2px, transparent 18px)`,
          inset: 0,
          opacity: progress * 0.45,
          position: "absolute",
        }}
      />
    </AbsoluteFill>
  );
};

const TransitionOverlay: FC = () => (
  <>
    <LightSweepBridge center={SCENE_DURATION - 8} />
    <ScanlineWipe center={SCENE_DURATION * 2 - 10} />
    <ScanlineWipe center={SCENE_DURATION * 3 - 10} />
    <LightSweepBridge center={SCENE_DURATION * 4 - 10} />
    <PanelPush center={SCENE_DURATION * 5 - 10} />
    <span style={{ display: "none" }}>{showcaseTransitions.join(" ")}</span>
  </>
);

export const RecipeShowcasePreview: FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: palette.background,
      height: HEIGHT,
      width: WIDTH,
    }}
  >
    <Sequence durationInFrames={SCENE_DURATION}>
      <HeroTitleReveal />
    </Sequence>
    <Sequence durationInFrames={SCENE_DURATION} from={SCENE_DURATION}>
      <WorkflowNodeMap />
    </Sequence>
    <Sequence durationInFrames={SCENE_DURATION} from={SCENE_DURATION * 2}>
      <TerminalBuildRun />
    </Sequence>
    <Sequence durationInFrames={SCENE_DURATION} from={SCENE_DURATION * 3}>
      <MetricCountUp />
    </Sequence>
    <Sequence durationInFrames={SCENE_DURATION} from={SCENE_DURATION * 4}>
      <TimelineProgress />
    </Sequence>
    <Sequence durationInFrames={SCENE_DURATION} from={SCENE_DURATION * 5}>
      <CodeDiffHighlight />
    </Sequence>
    <TransitionOverlay />
  </AbsoluteFill>
);
