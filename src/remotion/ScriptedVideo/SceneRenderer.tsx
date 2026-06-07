import React from "react";
import { AbsoluteFill } from "remotion";
import type { VideoScene, VideoSpec } from "../../lib/video-schema";
import { CJK_SANS_FONT_STACK } from "../font-stack";
import { BulletScene, QuoteScene, TitleScene, useEntranceProgress, VideoPanel } from "../primitives";

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
        {scene.type === "title" ? (
          <TitleScene
            kicker={scene.kicker}
            subtitle={scene.subtitle}
            theme={theme}
            title={scene.title}
          />
        ) : null}

        {scene.type === "bullets" ? (
          <BulletScene
            bullets={scene.bullets}
            kicker={scene.kicker}
            theme={theme}
            title={scene.title}
          />
        ) : null}

        {scene.type === "quote" ? (
          <QuoteScene
            author={scene.author}
            kicker={scene.kicker}
            quote={scene.quote}
            theme={theme}
          />
        ) : null}
      </VideoPanel>
    </AbsoluteFill>
  );
};
