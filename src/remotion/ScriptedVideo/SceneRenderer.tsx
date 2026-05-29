import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { VideoScene, VideoSpec } from "../../lib/video-schema";

const panelStyle = (theme: VideoSpec["theme"]): React.CSSProperties => ({
  backgroundColor: theme.panel,
  border: `1px solid ${theme.primary}33`,
  boxShadow: `0 30px 80px ${theme.background}55`,
  borderRadius: 36,
  padding: "48px 56px",
  maxWidth: 980,
  width: "100%",
});

const kickerStyle = (theme: VideoSpec["theme"]): React.CSSProperties => ({
  color: theme.secondary,
  fontSize: 26,
  fontWeight: 700,
  letterSpacing: 3,
  marginBottom: 18,
  textTransform: "uppercase",
});

const titleStyle = (theme: VideoSpec["theme"]): React.CSSProperties => ({
  color: theme.text,
  fontSize: 64,
  fontWeight: 800,
  lineHeight: 1.1,
  margin: 0,
});

const subtitleStyle = (theme: VideoSpec["theme"]): React.CSSProperties => ({
  color: theme.muted,
  fontSize: 28,
  lineHeight: 1.5,
  marginTop: 22,
});

const bulletStyle = (theme: VideoSpec["theme"]): React.CSSProperties => ({
  color: theme.text,
  fontSize: 30,
  lineHeight: 1.45,
  marginBottom: 18,
});

const quoteStyle = (theme: VideoSpec["theme"]): React.CSSProperties => ({
  color: theme.text,
  fontSize: 42,
  lineHeight: 1.45,
  fontWeight: 700,
  margin: 0,
});

const authorStyle = (theme: VideoSpec["theme"]): React.CSSProperties => ({
  color: theme.secondary,
  fontSize: 24,
  marginTop: 24,
});

export const SceneRenderer: React.FC<{
  scene: VideoScene;
  theme: VideoSpec["theme"];
}> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    fps,
    frame,
    config: { damping: 200 },
    durationInFrames: Math.min(40, scene.duration),
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at top, ${theme.primary}22 0%, ${theme.background} 55%)`,
        color: theme.text,
        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        justifyContent: "center",
        alignItems: "center",
        padding: 48,
      }}
    >
      <div
        style={{
          ...panelStyle(theme),
          transform: `translateY(${(1 - entrance) * 50}px) scale(${0.96 + entrance * 0.04})`,
          opacity: entrance,
        }}
      >
        {scene.kicker ? <div style={kickerStyle(theme)}>{scene.kicker}</div> : null}

        {scene.type === "title" ? (
          <>
            <h1 style={titleStyle(theme)}>{scene.title}</h1>
            {scene.subtitle ? <div style={subtitleStyle(theme)}>{scene.subtitle}</div> : null}
          </>
        ) : null}

        {scene.type === "bullets" ? (
          <>
            <h2 style={titleStyle(theme)}>{scene.title}</h2>
            <div style={{ marginTop: 28 }}>
              {scene.bullets.map((bullet) => (
                <div key={bullet} style={bulletStyle(theme)}>
                  • {bullet}
                </div>
              ))}
            </div>
          </>
        ) : null}

        {scene.type === "quote" ? (
          <>
            <p style={quoteStyle(theme)}>“{scene.quote}”</p>
            {scene.author ? <div style={authorStyle(theme)}>— {scene.author}</div> : null}
          </>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
