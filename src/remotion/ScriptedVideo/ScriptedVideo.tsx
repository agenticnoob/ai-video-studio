import React from "react";
import { Sequence } from "remotion";
import { SceneRenderer } from "./SceneRenderer";
import { getSceneStart, type VideoSpec } from "../../lib/video-schema";

export const ScriptedVideo: React.FC<VideoSpec> = (spec) => {
  return (
    <>
      {spec.scenes.map((scene, index) => {
        const from = getSceneStart(spec, index);
        return (
          <Sequence key={scene.id} from={from} durationInFrames={scene.duration}>
            <SceneRenderer scene={scene} theme={spec.theme} />
          </Sequence>
        );
      })}
    </>
  );
};
