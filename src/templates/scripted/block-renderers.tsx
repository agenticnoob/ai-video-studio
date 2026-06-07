import type { ReactNode } from "react";

import type { VideoScene, VideoSpec } from "../../lib/video-schema";
import { BulletScene, QuoteScene, TitleScene } from "../../remotion/primitives";

export const renderScriptedBlockContent = (
  scene: VideoScene,
  theme: VideoSpec["theme"],
): ReactNode => {
  switch (scene.type) {
    case "title":
      return (
        <TitleScene
          kicker={scene.kicker}
          subtitle={scene.subtitle}
          theme={theme}
          title={scene.title}
        />
      );
    case "bullets":
      return (
        <BulletScene
          bullets={scene.bullets}
          kicker={scene.kicker}
          theme={theme}
          title={scene.title}
        />
      );
    case "quote":
      return (
        <QuoteScene
          author={scene.author}
          kicker={scene.kicker}
          quote={scene.quote}
          theme={theme}
        />
      );
  }
};
