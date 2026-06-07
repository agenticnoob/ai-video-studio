import React from "react";
import { AbsoluteFill } from "remotion";
import type { VideoScene, VideoSpec } from "../../lib/video-schema";
import { renderScriptedBlockContent } from "../../templates/scripted/block-renderers";
import { CJK_SANS_FONT_STACK } from "../font-stack";
import { useEntranceProgress, VideoPanel } from "../primitives";

export const SceneRenderer: React.FC<{
  scene: VideoScene;
  theme: VideoSpec["theme"];
}> = ({ scene, theme }) => {
  const entrance = useEntranceProgress(Math.min(40, scene.duration));

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at top, ${theme.primary}22 0%, ${theme.background} 55%)`,
        color: theme.text,
        fontFamily: CJK_SANS_FONT_STACK,
        justifyContent: "center",
        alignItems: "center",
        padding: 48,
      }}
    >
      <VideoPanel entrance={entrance} theme={theme}>
        {renderScriptedBlockContent(scene, theme)}
      </VideoPanel>
    </AbsoluteFill>
  );
};
