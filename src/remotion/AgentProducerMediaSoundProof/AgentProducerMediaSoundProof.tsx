import { Audio } from "@remotion/media";
import type { FC, ReactNode } from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";

import { ProducerAnimatedImage, ProducerLocalVideo, ProducerLottie } from "../media";
import { ProducerMotionTreatment } from "../motion";
import { agentProducerMediaSoundProofAudio } from "./audio.generated";
import {
  agentProducerMediaSoundProofAssets,
  agentProducerMediaSoundProofSceneStarts,
} from "./data";
import { AgentProducerMediaSoundProofSoundtrack } from "./soundtrack";
import { AGENT_PRODUCER_MEDIA_SOUND_PROOF_DURATION_IN_FRAMES } from "./types";

const SceneShell: FC<{
  readonly eyebrow: string;
  readonly title: string;
  readonly children: ReactNode;
}> = ({ eyebrow, title, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ background: "#07111f", color: "#f8fafc", opacity, padding: 72 }}>
      <div style={{ color: "#38bdf8", fontSize: 26, fontWeight: 800, letterSpacing: 4 }}>
        {eyebrow}
      </div>
      <h1 style={{ fontSize: 72, letterSpacing: -2, lineHeight: 1.04, margin: "16px 0 36px" }}>
        {title}
      </h1>
      {children}
    </AbsoluteFill>
  );
};

const Caption: FC<{ readonly text: string }> = ({ text }) => (
  <div
    style={{
      background: "rgba(3, 7, 18, 0.84)",
      border: "1px solid rgba(56, 189, 248, 0.35)",
      borderRadius: 18,
      bottom: 50,
      color: "#f8fafc",
      fontSize: 34,
      left: 180,
      lineHeight: 1.35,
      padding: "18px 28px",
      position: "absolute",
      right: 180,
      textAlign: "center",
    }}
  >
    {text}
  </div>
);

const OpeningScene = () => (
  <SceneShell eyebrow="MANIFEST-BACKED" title="现成素材，进入同一条可靠生产链">
    <ProducerMotionTreatment id="camera-natural">
      <div
        style={{
          display: "flex",
          gap: 28,
          height: 640,
          left: 72,
          position: "absolute",
          top: 270,
          width: 1776,
        }}
      >
        <Img
          src={staticFile(agentProducerMediaSoundProofAssets.image)}
          style={{ borderRadius: 28, objectFit: "cover", width: 1030 }}
        />
        <ProducerAnimatedImage
          height={640}
          src={agentProducerMediaSoundProofAssets.animatedImage}
          width={620}
          style={{ borderRadius: 28 }}
        />
      </div>
    </ProducerMotionTreatment>
  </SceneShell>
);

const MediaScene = () => (
  <SceneShell eyebrow="LOCAL VIDEO" title="裁切、循环、变速与声音 ducking">
    <ProducerMotionTreatment id="camera-natural">
      <div style={{ height: 640, left: 72, position: "absolute", top: 270, width: 1776 }}>
        <ProducerLocalVideo
          height={640}
          loop
          muted
          objectFit="cover"
          playbackRate={0.85}
          src={agentProducerMediaSoundProofAssets.video}
          trimAfter={108}
          trimBefore={12}
          width={1776}
          style={{ borderRadius: 28 }}
        />
      </div>
    </ProducerMotionTreatment>
  </SceneShell>
);

const SignalScene = () => (
  <SceneShell eyebrow="FRAME-DETERMINISTIC" title="Lottie、运动拖影与转场音效">
    <ProducerMotionTreatment id="particle-trail">
      <div style={{ height: 620, left: 650, position: "absolute", top: 280, width: 620 }}>
        <ProducerLottie
          height={620}
          loop
          src={agentProducerMediaSoundProofAssets.lottie}
          width={620}
        />
      </div>
    </ProducerMotionTreatment>
  </SceneShell>
);

const scenes = [OpeningScene, MediaScene, SignalScene] as const;

export const AgentProducerMediaSoundProof: FC = () => (
  <AbsoluteFill
    style={{
      background: "#07111f",
      fontFamily: 'Inter, "Noto Sans SC", ui-sans-serif, system-ui, sans-serif',
    }}
  >
    {agentProducerMediaSoundProofAudio.map((track, index) => {
      const Scene = scenes[index];
      const from = agentProducerMediaSoundProofSceneStarts[index];
      return (
        <Sequence key={track.sceneId} from={from} durationInFrames={track.durationInFrames}>
          <Scene />
          <Audio
            disallowFallbackToHtml5Audio
            onError={() => "fail"}
            src={staticFile(agentProducerMediaSoundProofAssets.narration[track.sceneId])}
          />
          <Caption text={track.narration} />
        </Sequence>
      );
    })}
    <AgentProducerMediaSoundProofSoundtrack
      durationInFrames={AGENT_PRODUCER_MEDIA_SOUND_PROOF_DURATION_IN_FRAMES}
      tracks={agentProducerMediaSoundProofAudio}
    />
  </AbsoluteFill>
);
