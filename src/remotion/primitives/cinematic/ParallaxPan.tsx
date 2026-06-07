import type { FC } from "react";
import { Easing, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

type ParallaxPanProps = {
  direction?: "left-right" | "right-left" | "top-bottom" | "bottom-top";
  imageUrl?: string;
  scale?: number;
};

const getTranslate = (
  direction: NonNullable<ParallaxPanProps["direction"]>,
  progress: number
) => {
  if (direction === "left-right") {
    return { x: -20 * progress, y: 0 };
  }
  if (direction === "right-left") {
    return { x: -20 + 20 * progress, y: 0 };
  }
  if (direction === "top-bottom") {
    return { x: 0, y: -20 * progress };
  }
  return { x: 0, y: -20 + 20 * progress };
};

const ParallaxPan: FC<ParallaxPanProps> = ({
  direction = "left-right",
  imageUrl = "https://images.pexels.com/photos/1644724/pexels-photo-1644724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  scale = 1.2,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cycleFrame = frame % Math.max(durationInFrames, 1);
  const progress = interpolate(cycleFrame, [0, Math.max(durationInFrames - 1, 1)], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pingPong = progress <= 0.5 ? progress * 2 : (1 - progress) * 2;
  const translate = getTranslate(direction, pingPong);

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
        alt="Parallax Pan"
        src={imageUrl}
        style={{
          height: "100%",
          objectFit: "cover",
          transform: `translate(${translate.x}%, ${translate.y}%) scale(${scale})`,
          width: "100%",
        }}
      />
    </div>
  );
};

export default ParallaxPan;
