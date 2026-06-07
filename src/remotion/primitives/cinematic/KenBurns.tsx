import type { FC } from "react";
import { Easing, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

type KenBurnsProps = {
  imageUrl?: string;
  scale?: number;
  translateX?: number;
  translateY?: number;
};

const KenBurns: FC<KenBurnsProps> = ({
  imageUrl = "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba",
  scale = 1.5,
  translateX = -50,
  translateY = -30,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, Math.max(durationInFrames - 1, 1)], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        alignItems: "center",
        backgroundColor: "black",
        display: "flex",
        flex: 1,
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Img
        alt=""
        src={imageUrl}
        style={{
          height: "100%",
          objectFit: "cover",
          transform: `scale(${1 + (scale - 1) * progress}) translate(${translateX * progress}px, ${translateY * progress}px)`,
          width: "100%",
        }}
      />
    </div>
  );
};

export default KenBurns;
