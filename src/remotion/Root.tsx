import type { FC } from "react";
import { Composition } from "remotion";
import {
  COMP_NAME,
  CompositionProps,
  defaultMyCompProps,
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { getVideoDuration, videoSpecSchema, type VideoSpec } from "../lib/video-schema";
import { sampleVideo } from "../lib/sample-video";
import { Main } from "./MyComp/Main";
import { NextLogo } from "./MyComp/NextLogo";
import { ScriptedVideo } from "./ScriptedVideo/ScriptedVideo";

export const RemotionRoot: FC = () => {
  return (
    <>
      <Composition
        id={COMP_NAME}
        component={Main}
        schema={CompositionProps}
        durationInFrames={DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultMyCompProps}
      />
      <Composition
        id="ScriptedVideo"
        component={ScriptedVideo}
        schema={videoSpecSchema}
        defaultProps={sampleVideo}
        durationInFrames={getVideoDuration(sampleVideo)}
        fps={sampleVideo.meta.fps}
        width={sampleVideo.meta.width}
        height={sampleVideo.meta.height}
        calculateMetadata={({ props }) => {
          const spec = videoSpecSchema.parse(props) as VideoSpec;
          return {
            durationInFrames: getVideoDuration(spec),
            fps: spec.meta.fps,
            width: spec.meta.width,
            height: spec.meta.height,
          };
        }}
      />
      <Composition
        id="NextLogo"
        component={NextLogo}
        durationInFrames={300}
        fps={30}
        width={140}
        height={140}
        defaultProps={{
          outProgress: 0,
        }}
      />
    </>
  );
};
