import type { CSSProperties, ReactNode } from "react";
import { Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { SegmentCaptions } from "./caption-types";
import { buildStandaloneSceneStartFrames, getActiveStandaloneCaption } from "./timeline";
import type { StandaloneTimedScene } from "./types";

type StandaloneTimelineProps<TScene extends StandaloneTimedScene> = {
  readonly overlapFrames?: number;
  readonly renderAudio?: (scene: TScene) => ReactNode;
  readonly renderOverlay?: ReactNode;
  readonly renderScene: (scene: TScene) => ReactNode;
  readonly scenes: readonly TScene[];
};

export const StandaloneTimeline = <TScene extends StandaloneTimedScene>({
  overlapFrames,
  renderAudio,
  renderOverlay,
  renderScene,
  scenes,
}: StandaloneTimelineProps<TScene>) => {
  const starts = buildStandaloneSceneStartFrames(scenes, { overlapFrames });

  return (
    <>
      {scenes.map((scene, index) => (
        <Sequence key={scene.id} from={starts[index]} durationInFrames={scene.durationInFrames}>
          {renderScene(scene)}
          {renderAudio?.(scene)}
        </Sequence>
      ))}
      {renderOverlay}
    </>
  );
};

type StandaloneVoiceoverProps = {
  readonly audioFile: string;
  readonly playbackRate?: number;
};

export const StandaloneVoiceover = ({ audioFile, playbackRate }: StandaloneVoiceoverProps) => (
  <Audio pauseWhenBuffering playbackRate={playbackRate} src={staticFile(audioFile)} />
);

type StandaloneBottomCaptionProps = {
  readonly captions: SegmentCaptions | undefined;
  readonly style?: CSSProperties;
  readonly variant: "landscape" | "portrait";
};

const landscapeCaptionStyle: CSSProperties = {
  background: "rgba(3, 7, 18, 0.82)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  bottom: 40,
  boxShadow: "0 18px 48px rgba(0,0,0,0.32)",
  color: "#ffffff",
  fontSize: 30,
  fontWeight: 700,
  left: 160,
  lineHeight: 1.35,
  padding: "14px 26px",
  position: "absolute",
  right: 160,
  textAlign: "center",
};

const portraitCaptionStyle: CSSProperties = {
  ...landscapeCaptionStyle,
  bottom: 72,
  fontSize: 30,
  left: 54,
  padding: "20px 30px",
  right: 54,
};

export const StandaloneBottomCaption = ({
  captions,
  style,
  variant,
}: StandaloneBottomCaptionProps) => {
  const frame = useCurrentFrame();
  const cue = getActiveStandaloneCaption(captions, frame);

  if (!cue) {
    return null;
  }

  return (
    <div
      style={{
        ...(variant === "portrait" ? portraitCaptionStyle : landscapeCaptionStyle),
        ...style,
      }}
    >
      {cue.text}
    </div>
  );
};
