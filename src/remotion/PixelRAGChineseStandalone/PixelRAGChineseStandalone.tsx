import type { CSSProperties, FC } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  getStandaloneDurationInFrames,
  StandaloneBottomCaption,
  StandaloneTimeline,
  StandaloneVoiceover,
} from "../standalone-video";
import type { PixelRAGChineseScene, PixelRAGChineseStandaloneData } from "./types";
import { clamp, pixelragPalette } from "./styles";
import { PixelSpace3D, SceneText, SceneVisual } from "./visuals";

const SCENE_OVERLAP_FRAMES = 8;

const shellStyle: CSSProperties = {
  background: "linear-gradient(135deg, #070b10 0%, #101820 38%, #1a1630 70%, #071018 100%)",
  color: pixelragPalette.ink,
  fontFamily:
    'Inter, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", ui-sans-serif, system-ui, sans-serif',
  overflow: "hidden",
};

export const getPixelRAGChineseStandaloneDuration = (
  data: PixelRAGChineseStandaloneData,
): number => getStandaloneDurationInFrames(data.scenes, { overlapFrames: SCENE_OVERLAP_FRAMES });

const Atmosphere: FC<{ readonly scene: PixelRAGChineseScene }> = ({ scene }) => (
  <>
    <AbsoluteFill style={{ opacity: 0.46 }}>
      <PixelSpace3D scene={scene} />
    </AbsoluteFill>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 72% 26%, rgba(255,176,32,0.16), transparent 34%), radial-gradient(circle at 18% 72%, rgba(0,209,255,0.14), transparent 32%)",
      }}
    />
    <AbsoluteFill
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        opacity: 0.2,
      }}
    />
    <AbsoluteFill
      style={{
        background: `linear-gradient(90deg, rgba(7,11,16,0.94) 0%, rgba(7,11,16,0.76) 38%, ${scene.accent}18 100%)`,
      }}
    />
  </>
);

const Scene: FC<{ readonly scene: PixelRAGChineseScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const exit = interpolate(
    frame,
    [Math.max(scene.durationInFrames - 12, 1), scene.durationInFrames],
    [1, 0],
    {
      ...clamp,
    },
  );

  return (
    <AbsoluteFill style={{ ...shellStyle, opacity: exit }}>
      <Atmosphere scene={scene} />
      <div
        style={{
          display: "grid",
          gap: 38,
          gridTemplateColumns: "360px minmax(0, 1fr)",
          inset: "58px 72px 94px",
          position: "absolute",
        }}
      >
        <div style={{ alignSelf: "center", position: "relative", zIndex: 2 }}>
          <SceneText scene={scene} />
        </div>
        <div style={{ alignSelf: "center", minWidth: 0 }}>
          <SceneVisual scene={scene} />
        </div>
      </div>
      <StandaloneBottomCaption captions={scene.captions} variant="landscape" />
    </AbsoluteFill>
  );
};

export const PixelRAGChineseStandaloneVideo: FC<{
  readonly data: PixelRAGChineseStandaloneData;
}> = ({ data }) => (
  <AbsoluteFill style={{ background: pixelragPalette.background }}>
    <StandaloneTimeline
      overlapFrames={8}
      renderAudio={(scene) => <StandaloneVoiceover audioFile={scene.audioFile} />}
      renderScene={(scene) => <Scene scene={scene} />}
      scenes={data.scenes}
    />
  </AbsoluteFill>
);
