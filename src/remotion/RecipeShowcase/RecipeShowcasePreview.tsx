import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import {
  getSceneContentPrerollFrom,
  getSceneTransitionSequenceTiming,
  SceneTransitionStage,
  type RecipeSceneTransitionMotion,
} from "../recipes/motion";
import {
  MetricCardGrid,
  TerminalSessionBlock,
  TimelineProgressBlock,
  WorkflowMapBlock,
  type MetricCardDatum,
  type TerminalSessionLine,
  type WorkflowMapNode,
} from "../recipes/blocks";
import { DEFAULT_RECIPE_CAPTION_SAFE_AREA } from "../recipes/timing";

const WIDTH = 1280;
const HEIGHT = 720;
const SCENE_DURATION = 330;
const SCENE_OVERLAP_IN_FRAMES = 48;
const STAGE_TRANSITION_IN_FRAMES = 56;

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

const showcaseTransitions = ["panel-push", "stage-push", "fly-through", "cube-turn"] as const;

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const softOut = Easing.bezier(0.16, 1, 0.3, 1);

const enter = (frame: number, start = 0, end = 32) =>
  interpolate(frame, [start, end], [0, 1], { ...clamp, easing: softOut });

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
  const sceneOpacity = enter(frame, 0, 24);
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

const workflowNodes: WorkflowMapNode[] = [
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
        <WorkflowMapBlock
          nodes={workflowNodes}
          panelColor={palette.panel}
          style={{ left: 0, position: "absolute", top: 0 }}
          textColor={palette.text}
        />
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

const terminalLines: TerminalSessionLine[] = [
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
        <TerminalSessionBlock
          accentColor={palette.green}
          dotColors={[palette.rose, palette.amber, palette.green]}
          lines={terminalLines}
          mutedColor={palette.muted}
          style={{
            opacity: panelIn,
          }}
        />
      </div>
    </SceneFrame>
  );
};

const metrics: MetricCardDatum[] = [
  { label: "Render clarity", value: 92, suffix: "%", tint: palette.cyan },
  { label: "Motion beats", value: 18, suffix: "", tint: palette.amber },
  { label: "Recipe scenes", value: 6, suffix: "", tint: palette.rose },
];

const MetricCountUp: FC = () => {
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
        <MetricCardGrid
          metrics={metrics}
          mutedColor={palette.muted}
          style={{ marginTop: 54 }}
          textColor={palette.text}
        />
      </div>
    </SceneFrame>
  );
};

const checkpoints = ["Prompt", "Voice", "Recipe", "Preview", "Export"];

const TimelineProgress: FC = () => {
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
        <TimelineProgressBlock
          accentGradient={`linear-gradient(90deg, ${palette.rose}, ${palette.amber}, ${palette.green})`}
          activeColor={palette.rose}
          captionSafeArea={DEFAULT_RECIPE_CAPTION_SAFE_AREA}
          checkpointLabels={checkpoints}
          durationInFrames={SCENE_DURATION}
          mutedColor={palette.muted}
          note="Reveal, hold, and exit beats are compiled from real narration duration."
          notePanelColor="rgba(16,27,45,0.8)"
          style={{ marginTop: 114 }}
          textColor={palette.text}
          trackColor="rgba(255,255,255,0.12)"
        />
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

const PanelPush: FC<{ center: number }> = ({ center }) => {
  const frame = useCurrentFrame();
  const progress = transitionProgress(frame, center, 40);
  const leftPanel = interpolate(frame, [center - 40, center + 40], [-WIDTH, WIDTH], clamp);
  const rightPanel = interpolate(frame, [center - 40, center + 40], [WIDTH, -WIDTH], clamp);

  if (progress <= 0) {
    return null;
  }

  return (
    <AbsoluteFill style={{ opacity: progress * 0.45, pointerEvents: "none" }}>
      <div
        style={{
          background: `linear-gradient(90deg, ${palette.rose}aa, ${palette.violet}55)`,
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
          background: `linear-gradient(90deg, ${palette.cyan}55, ${palette.green}aa)`,
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
          opacity: progress * 0.18,
          position: "absolute",
        }}
      />
    </AbsoluteFill>
  );
};

const TransitionOverlay: FC = () => (
  <>
    <PanelPush center={SCENE_DURATION * 5 - 10} />
    <span style={{ display: "none" }}>{showcaseTransitions.join(" ")}</span>
  </>
);

const showcaseScenes: Array<{
  component: FC;
  motion: RecipeSceneTransitionMotion;
}> = [
  { component: HeroTitleReveal, motion: "stage-push" },
  { component: WorkflowNodeMap, motion: "stage-push" },
  { component: TerminalBuildRun, motion: "fly-through" },
  { component: MetricCountUp, motion: "fly-through" },
  { component: TimelineProgress, motion: "stage-push" },
  { component: CodeDiffHighlight, motion: "cube-turn" },
];

export const RecipeShowcasePreview: FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: palette.background,
      height: HEIGHT,
      overflow: "hidden",
      perspective: 1200,
      width: WIDTH,
    }}
  >
    {showcaseScenes.map(({ component: SceneComponent, motion }, index) => {
      const sequenceTiming = getSceneTransitionSequenceTiming({
        index,
        overlapFrames: SCENE_OVERLAP_IN_FRAMES,
        sceneDurationInFrames: SCENE_DURATION,
      });

      return (
        <Sequence {...sequenceTiming} key={showcaseRecipes[index]}>
          <SceneTransitionStage
            height={HEIGHT}
            index={index}
            motion={motion}
            overlapFrames={SCENE_OVERLAP_IN_FRAMES}
            sceneCount={showcaseScenes.length}
            sceneDurationInFrames={SCENE_DURATION}
            transitionFrames={STAGE_TRANSITION_IN_FRAMES}
            width={WIDTH}
          >
            <Sequence from={getSceneContentPrerollFrom(index)}>
              <SceneComponent />
            </Sequence>
          </SceneTransitionStage>
        </Sequence>
      );
    })}
    <TransitionOverlay />
  </AbsoluteFill>
);
