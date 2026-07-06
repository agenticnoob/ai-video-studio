import type { FC } from "react";
import { AbsoluteFill } from "remotion";

import {
  StandaloneBottomCaption,
  StandaloneTimeline,
  StandaloneVoiceover,
} from "../../../standalone-video";
import type { SampleNameScene } from "./types";

const Scene: FC<{ readonly scene: SampleNameScene }> = ({ scene }) => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      background: "#101418",
      color: "#f8fafc",
      display: "flex",
      fontFamily: 'Inter, "Noto Sans SC", ui-sans-serif, system-ui, sans-serif',
      justifyContent: "center",
      padding: 72,
    }}
  >
    <h1 style={{ fontSize: 76, lineHeight: 1.05, margin: 0, maxWidth: 960 }}>
      {scene.headline}
    </h1>
    <StandaloneBottomCaption captions={scene.captions} variant="landscape" />
  </AbsoluteFill>
);

export const SampleNameVideo: FC<{ readonly scenes: readonly SampleNameScene[] }> = ({
  scenes,
}) => (
  <AbsoluteFill style={{ background: "#101418" }}>
    <StandaloneTimeline
      renderAudio={(scene) => <StandaloneVoiceover audioFile={scene.audioFile} />}
      renderScene={(scene) => <Scene scene={scene} />}
      scenes={scenes}
    />
  </AbsoluteFill>
);
