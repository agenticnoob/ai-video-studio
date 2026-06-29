import type { CSSProperties, FC, ReactNode } from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { CalloutGrid, Kicker, VideoPanel, type RemotionTheme } from "../primitives";
import type { PixelRAGChineseAnimationStyle, PixelRAGChineseScene } from "./types";
import { clamp, fade, pixelragPalette } from "./styles";

const usePrimitive = <T,>(value: T): T => value;

const fit = {
  objectFit: "cover" as const,
};

const createTheme = (scene: PixelRAGChineseScene): RemotionTheme => ({
  background: pixelragPalette.background,
  muted: pixelragPalette.muted,
  panel: pixelragPalette.panel,
  primary: scene.accent,
  secondary: scene.secondaryAccent,
  text: pixelragPalette.ink,
});

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const getEntrance3D = ({
  frame,
  style,
  totalFrames,
}: {
  readonly frame: number;
  readonly style: PixelRAGChineseAnimationStyle;
  readonly totalFrames: number;
}): CSSProperties => {
  const enter = interpolate(frame, [0, 18], [0, 1], { ...clamp, easing: ease });
  const exit = interpolate(frame, [Math.max(totalFrames - 16, 1), totalFrames], [1, 0], {
    ...clamp,
    easing: Easing.bezier(0.7, 0, 0.84, 0),
  });
  const progress = Math.min(enter, exit);
  const drift = Math.sin(frame / 18) * 2.5;

  const base: CSSProperties = {
    opacity: progress,
    transformStyle: "preserve-3d",
  };

  switch (style) {
    case "flip-in":
      return {
        ...base,
        transform: `perspective(1200px) translate3d(0, ${(1 - progress) * 42}px, 0) rotateY(${
          (1 - progress) * -58 + drift
        }deg) rotateX(${(1 - progress) * 10}deg) scale(${0.9 + progress * 0.1})`,
      };
    case "stack-pop":
      return {
        ...base,
        transform: `perspective(1200px) translate3d(${(1 - progress) * 70}px, ${
          (1 - progress) * 28
        }px, ${(1 - progress) * -160}px) rotateZ(${(1 - progress) * 8}deg) scale(${
          0.84 + progress * 0.16
        })`,
      };
    case "slice-fan":
      return {
        ...base,
        transform: `perspective(1200px) translate3d(${(1 - progress) * -60}px, 0, ${
          (1 - progress) * -220
        }px) rotateY(${(1 - progress) * 42}deg) rotateZ(${(1 - progress) * -5}deg)`,
      };
    case "cube-orbit":
      return {
        ...base,
        transform: `perspective(1200px) translate3d(0, ${(1 - progress) * 48}px, ${
          (1 - progress) * -180
        }px) rotateX(${(1 - progress) * 32}deg) rotateY(${frame * 0.16}deg)`,
      };
    case "index-deck":
      return {
        ...base,
        transform: `perspective(1200px) translate3d(0, ${(1 - progress) * 64}px, ${
          (1 - progress) * -260
        }px) rotateX(${58 - progress * 48}deg) scale(${0.88 + progress * 0.12})`,
      };
    case "result-pull":
      return {
        ...base,
        transform: `perspective(1200px) translate3d(${(1 - progress) * 120}px, 0, ${
          (1 - progress) * -300
        }px) rotateY(${(1 - progress) * -32}deg) scale(${0.9 + progress * 0.1})`,
      };
    case "whip-slide":
      return {
        ...base,
        filter: `blur(${(1 - progress) * 8}px)`,
        transform: `perspective(1200px) translate3d(${(1 - progress) * -180}px, 0, 0) rotateY(${
          (1 - progress) * 20
        }deg) scaleX(${1 + (1 - progress) * 0.18})`,
      };
    case "zoom-dive":
      return {
        ...base,
        transform: `perspective(1200px) translate3d(0, 0, ${(1 - progress) * 360}px) rotateX(${
          (1 - progress) * -12
        }deg) scale(${1.18 - progress * 0.18})`,
      };
    case "tilt-rise":
      return {
        ...base,
        transform: `perspective(1200px) translate3d(0, ${(1 - progress) * 70}px, ${
          (1 - progress) * -180
        }px) rotateX(${(1 - progress) * 20}deg) rotateY(${(1 - progress) * -18}deg) scale(${
          0.9 + progress * 0.1
        })`,
      };
  }
};

export const PixelSpace3D: FC<{ readonly scene: PixelRAGChineseScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 42) * 0.16;
  const spin = frame * 0.003;
  const cubes = [
    [-4.8, -2.0, -2.4, 0.42],
    [-3.2, 1.8, -2.2, 0.28],
    [2.9, -1.9, -2.5, 0.34],
    [4.7, 1.8, -2.6, 0.26],
  ] as const;

  return (
    <ThreeCanvas width={1280} height={720}>
      <ambientLight intensity={0.36} />
      <directionalLight position={[5, 4, 7]} intensity={0.72} />
      <group rotation={[0.1 + drift, spin, -0.04]}>
        {cubes.map(([x, y, z, size], index) => (
          <mesh
            key={`${x}-${y}-${z}`}
            position={[x, y + Math.sin(frame / 24 + index) * 0.1, z]}
            rotation={[spin * 1.5 + index * 0.2, spin * 2.2 + index, 0.1]}
          >
            <boxGeometry args={[size, size, size]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? scene.accent : scene.secondaryAccent}
              metalness={0.1}
              roughness={0.58}
            />
          </mesh>
        ))}
      </group>
    </ThreeCanvas>
  );
};

export const CardStage3D: FC<{
  readonly children: ReactNode;
  readonly scene: PixelRAGChineseScene;
}> = ({ children, scene }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        height: 438,
        perspective: 1200,
        position: "relative",
        transformStyle: "preserve-3d",
        width: "100%",
        ...getEntrance3D({
          frame,
          style: scene.animationStyle,
          totalFrames: scene.durationInFrames,
        }),
      }}
    >
      {children}
    </div>
  );
};

const BrowserBar: FC<{ readonly scene: PixelRAGChineseScene; readonly label?: string }> = ({
  label = "GitHub / PixelRAG",
  scene,
}) => (
  <div
    style={{
      alignItems: "center",
      background: "rgba(255,255,255,0.075)",
      display: "flex",
      gap: 10,
      padding: "10px 12px",
    }}
  >
    <div style={{ display: "flex", gap: 6 }}>
      <span style={{ background: "#f87171", borderRadius: 999, height: 10, width: 10 }} />
      <span style={{ background: "#facc15", borderRadius: 999, height: 10, width: 10 }} />
      <span style={{ background: "#4ade80", borderRadius: 999, height: 10, width: 10 }} />
    </div>
    <div style={{ color: pixelragPalette.muted, fontSize: 12, fontWeight: 800 }}>{label}</div>
    <div
      style={{
        background: `${scene.accent}22`,
        border: `1px solid ${scene.accent}55`,
        borderRadius: 999,
        height: 10,
        marginLeft: "auto",
        width: 86,
      }}
    />
  </div>
);

const ScreenshotSurface: FC<{
  readonly label?: string;
  readonly scene: PixelRAGChineseScene;
  readonly style?: CSSProperties;
}> = ({ label, scene, style }) => (
  <div
    style={{
      background: "rgba(8,14,22,0.9)",
      border: `1px solid ${scene.accent}`,
      borderRadius: 12,
      boxShadow: "0 34px 88px rgba(0,0,0,0.34)",
      display: "grid",
      overflow: "hidden",
      transformStyle: "preserve-3d",
      ...style,
    }}
  >
    <BrowserBar label={label} scene={scene} />
    <Img
      src={staticFile(scene.screenshotFile)}
      style={{ display: "block", height: "100%", minHeight: 0, width: "100%", ...fit }}
    />
  </div>
);

const MiniLabel: FC<{
  readonly children: string;
  readonly scene: PixelRAGChineseScene;
  readonly style?: CSSProperties;
}> = ({ children, scene, style }) => (
  <div
    style={{
      background: "rgba(5,10,18,0.82)",
      border: `1px solid ${scene.accent}66`,
      borderRadius: 8,
      color: "#fff",
      fontSize: 22,
      fontWeight: 860,
      padding: "12px 16px",
      position: "absolute",
      ...style,
    }}
  >
    {children}
  </div>
);

const TitleCardVisual: FC<{ readonly scene: PixelRAGChineseScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const logo = spring({ config: { damping: 14, mass: 0.7 }, fps: 30, frame });

  return (
    <CardStage3D scene={scene}>
      <ScreenshotSurface
        label="StarTrail-org / PixelRAG"
        scene={scene}
        style={{
          height: 384,
          transform: `rotateY(-13deg) rotateX(5deg) translateZ(42px) scale(${0.94 + logo * 0.06})`,
        }}
      />
      <MiniLabel scene={scene} style={{ bottom: 18, left: 28, transform: "translateZ(108px)" }}>
        PixelRAG
      </MiniLabel>
    </CardStage3D>
  );
};

const ScreenshotCardVisual: FC<{ readonly scene: PixelRAGChineseScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const float = Math.sin(frame / 20) * 6;

  return (
    <CardStage3D scene={scene}>
      <ScreenshotSurface
        scene={scene}
        style={{
          height: 392,
          transform: `rotateY(${scene.animationStyle === "flip-in" ? -18 : 12}deg) rotateX(7deg) translate3d(0, ${float}px, 64px)`,
        }}
      />
      <MiniLabel scene={scene} style={{ right: 18, top: 40, transform: "translateZ(124px)" }}>
        {scene.points[0]}
      </MiniLabel>
    </CardStage3D>
  );
};

const TextCrushVisual: FC<{ readonly scene: PixelRAGChineseScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const crush = fade(frame, 10, 44);
  const rows = ["header nav actions", "repo file list", "README content", "issues pull requests"];

  return (
    <CardStage3D scene={scene}>
      <ScreenshotSurface
        scene={scene}
        style={{
          height: 310,
          opacity: 1 - crush * 0.35,
          transform: `rotateY(-10deg) rotateX(7deg) translateZ(${60 - crush * 70}px) scaleY(${
            1 - crush * 0.62
          })`,
        }}
      />
      <div
        style={{
          bottom: 26,
          display: "grid",
          gap: 13,
          left: 34,
          position: "absolute",
          right: 34,
          transform: `translateZ(${120 + crush * 40}px)`,
        }}
      >
        {rows.map((row, index) => (
          <div
            key={row}
            style={{
              background: index === 0 ? scene.accent : "rgba(255,255,255,0.16)",
              borderRadius: 8,
              height: 18,
              opacity: fade(frame, 18 + index * 5, 38 + index * 5),
              transform: `scaleX(${0.58 + crush * 0.42})`,
              transformOrigin: "left center",
              width: `${88 - index * 11}%`,
            }}
          />
        ))}
      </div>
    </CardStage3D>
  );
};

const SlicedPageVisual: FC<{ readonly scene: PixelRAGChineseScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const slices = [0, 1, 2, 3, 4];

  return (
    <CardStage3D scene={scene}>
      {slices.map((slice) => {
        const progress = fade(frame, slice * 5, 28 + slice * 5);
        return (
          <div
            key={slice}
            style={{
              clipPath: `inset(${slice * 18}% 0 ${100 - (slice + 1) * 18}% 0)`,
              height: 390,
              left: 18 + slice * 8,
              opacity: progress,
              position: "absolute",
              right: 18 - slice * 8,
              top: 18,
              transform: `rotateY(${-24 + slice * 10}deg) rotateX(${8 - slice * 2}deg) translate3d(${
                (slice - 2) * 34
              }px, ${slice * 4}px, ${slice * 44}px)`,
              transformStyle: "preserve-3d",
            }}
          >
            <ScreenshotSurface scene={scene} style={{ height: 390 }} />
          </div>
        );
      })}
      <MiniLabel scene={scene} style={{ bottom: 12, right: 34, transform: "translateZ(260px)" }}>
        页面片段
      </MiniLabel>
    </CardStage3D>
  );
};

const VectorCubesVisual: FC<{ readonly scene: PixelRAGChineseScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const rotation = frame * 0.018;
  const labels = ["截图", "向量", "相似度"];

  return (
    <CardStage3D scene={scene}>
      <div
        style={{
          height: 390,
          position: "relative",
          transform: "translateZ(52px)",
          width: "100%",
        }}
      >
        <ThreeCanvas width={610} height={410}>
          <ambientLight intensity={0.62} />
          <directionalLight position={[4, 5, 7]} intensity={1.2} />
          <directionalLight position={[-5, -2, 3]} intensity={0.48} color={scene.secondaryAccent} />
          <group rotation={[0.12, rotation, 0]}>
            {[-1.9, 0, 1.9].map((x, index) => (
              <mesh
                key={x}
                position={[x, Math.sin(frame / 20 + index) * 0.18, index * 0.28]}
                rotation={[rotation + index * 0.35, rotation * 1.4 + index, 0.12]}
              >
                <boxGeometry args={[1.05, 1.05, 1.05]} />
                <meshStandardMaterial
                  color={index % 2 === 0 ? scene.accent : scene.secondaryAccent}
                  metalness={0.18}
                  roughness={0.34}
                />
              </mesh>
            ))}
          </group>
        </ThreeCanvas>
        <div
          style={{
            bottom: 8,
            display: "grid",
            gap: 14,
            gridTemplateColumns: "repeat(3, 1fr)",
            left: 22,
            position: "absolute",
            right: 22,
          }}
        >
          {labels.map((label, index) => (
            <div
              key={label}
              style={{
                background: "rgba(8,14,22,0.82)",
                border: `1px solid ${index % 2 === 0 ? scene.accent : scene.secondaryAccent}`,
                borderRadius: 8,
                color: "#fff",
                fontSize: 20,
                fontWeight: 820,
                padding: "10px 8px",
                textAlign: "center",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </CardStage3D>
  );
};

const IndexStackVisual: FC<{ readonly scene: PixelRAGChineseScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cards = ["page_001", "page_014", "page_027", "page_038", "page_052"];

  return (
    <CardStage3D scene={scene}>
      <div style={{ height: 420, position: "relative", transformStyle: "preserve-3d" }}>
        {cards.map((card, index) => {
          const progress = fade(frame, index * 5, 26 + index * 5);
          return (
            <div
              key={card}
              style={{
                background: index === cards.length - 1 ? `${scene.accent}26` : "rgba(10,20,30,0.9)",
                border: `1px solid ${index === cards.length - 1 ? scene.accent : "rgba(255,255,255,0.16)"}`,
                borderRadius: 12,
                boxShadow: "0 22px 52px rgba(0,0,0,0.3)",
                color: "#fff",
                fontSize: 24,
                fontWeight: 850,
                left: 84 + index * 22,
                opacity: progress,
                padding: "24px 28px",
                position: "absolute",
                top: 42 + index * 34,
                transform: `rotateX(58deg) rotateZ(${-8 + index * 4}deg) translateZ(${index * 34}px)`,
                transformStyle: "preserve-3d",
                width: 360,
              }}
            >
              <div
                style={{ color: index === cards.length - 1 ? scene.accent : pixelragPalette.muted }}
              >
                {card}
              </div>
              <div style={{ fontSize: 15, marginTop: 12, opacity: 0.75 }}>visual vector</div>
            </div>
          );
        })}
      </div>
    </CardStage3D>
  );
};

const ResultPullVisual: FC<{ readonly scene: PixelRAGChineseScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const beam = fade(frame, 8, 28);
  const result = fade(frame, 24, 52);

  return (
    <CardStage3D scene={scene}>
      <div style={{ height: 420, position: "relative", transformStyle: "preserve-3d" }}>
        <div
          style={{
            background: "rgba(8,14,22,0.92)",
            border: `1px solid ${scene.secondaryAccent}`,
            borderRadius: 999,
            color: "#fff",
            fontSize: 24,
            fontWeight: 820,
            left: 10,
            padding: "18px 28px",
            position: "absolute",
            top: 165,
            transform: "translateZ(120px)",
          }}
        >
          问题
        </div>
        <div
          style={{
            background: `linear-gradient(90deg, ${scene.secondaryAccent}, ${scene.accent})`,
            borderRadius: 999,
            height: 8,
            left: 126,
            opacity: beam,
            position: "absolute",
            top: 194,
            transform: `translateZ(88px) scaleX(${beam})`,
            transformOrigin: "left center",
            width: 250,
          }}
        />
        <ScreenshotSurface
          label="matched page fragment"
          scene={scene}
          style={{
            height: 310,
            left: 260,
            opacity: result,
            position: "absolute",
            right: 0,
            top: 46,
            transform: `rotateY(-16deg) rotateX(8deg) translate3d(${(1 - result) * 90}px, 0, ${
              90 + result * 80
            }px)`,
          }}
        />
      </div>
    </CardStage3D>
  );
};

const UseCaseCardsVisual: FC<{ readonly scene: PixelRAGChineseScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const labels = scene.points.length >= 3 ? scene.points : ["网页问答", "资料搜索", "智能体"];

  return (
    <CardStage3D scene={scene}>
      <div
        style={{
          height: 404,
          position: "relative",
          transformStyle: "preserve-3d",
        }}
      >
        {labels.map((label, index) => {
          const progress = fade(frame, index * 7, 30 + index * 7);
          return (
            <div
              key={label}
              style={{
                alignItems: "center",
                background: index % 2 === 0 ? `${scene.accent}22` : `${scene.secondaryAccent}22`,
                border: `1px solid ${index % 2 === 0 ? scene.accent : scene.secondaryAccent}`,
                borderRadius: 12,
                boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
                color: "#fff",
                display: "flex",
                fontSize: 31,
                fontWeight: 900,
                height: 146,
                justifyContent: "center",
                left: 86 + index * 92,
                opacity: progress,
                position: "absolute",
                top: 70 + index * 48,
                transform: `rotateY(${-24 + index * 18}deg) rotateZ(${-7 + index * 7}deg) translateZ(${
                  70 + index * 54
                }px) scale(${0.92 + progress * 0.08})`,
                transformStyle: "preserve-3d",
                width: 260,
              }}
            >
              {label}
            </div>
          );
        })}
      </div>
    </CardStage3D>
  );
};

const ClosingCardVisual: FC<{ readonly scene: PixelRAGChineseScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 10) * 0.015;

  return (
    <CardStage3D scene={scene}>
      <VideoPanel
        entrance={1}
        maxWidth="100%"
        padding="54px 58px"
        style={{
          borderRadius: 14,
          margin: "0 auto",
          minHeight: 330,
          transform: `rotateY(-8deg) rotateX(5deg) translate3d(-42px, 0, 92px) scale(${pulse * 0.92})`,
          transformStyle: "preserve-3d",
          width: 500,
        }}
        theme={usePrimitive(createTheme(scene))}
      >
        <Kicker theme={createTheme(scene)}>PixelRAG</Kicker>
        <div style={{ color: "#fff", fontSize: 62, fontWeight: 940, lineHeight: 1.04 }}>
          让 AI
          <br />
          看见网页
        </div>
      </VideoPanel>
    </CardStage3D>
  );
};

export const SceneVisual: FC<{ readonly scene: PixelRAGChineseScene }> = ({ scene }) => {
  switch (scene.visualKind) {
    case "title-card":
      return <TitleCardVisual scene={scene} />;
    case "screenshot-card":
      return <ScreenshotCardVisual scene={scene} />;
    case "text-crush":
      return <TextCrushVisual scene={scene} />;
    case "sliced-page":
      return <SlicedPageVisual scene={scene} />;
    case "vector-cubes":
      return <VectorCubesVisual scene={scene} />;
    case "index-stack":
      return <IndexStackVisual scene={scene} />;
    case "result-pull":
      return <ResultPullVisual scene={scene} />;
    case "use-case-cards":
      return <UseCaseCardsVisual scene={scene} />;
    case "closing-card":
      return <ClosingCardVisual scene={scene} />;
  }
};

export const SceneText: FC<{ readonly scene: PixelRAGChineseScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const theme = createTheme(scene);
  const entrance = fade(frame, 0, 16);

  return (
    <VideoPanel
      entrance={entrance}
      maxWidth={430}
      padding="26px 28px"
      style={{ borderRadius: 12 }}
      theme={usePrimitive(theme)}
    >
      <Kicker style={{ fontSize: 19, letterSpacing: 2, marginBottom: 14 }} theme={theme}>
        {scene.eyebrow}
      </Kicker>
      <div style={{ color: "#fff", fontSize: 38, fontWeight: 940, lineHeight: 1.04 }}>
        {scene.title}
      </div>
      <div
        style={{
          color: pixelragPalette.muted,
          fontSize: 20,
          fontWeight: 720,
          lineHeight: 1.32,
          marginTop: 15,
        }}
      >
        {scene.plainTitle}
      </div>
      {scene.points.length > 1 ? (
        <div style={{ marginTop: 24 }}>
          <CalloutGrid callouts={[...scene.points].slice(0, 3)} theme={theme} />
        </div>
      ) : null}
    </VideoPanel>
  );
};
