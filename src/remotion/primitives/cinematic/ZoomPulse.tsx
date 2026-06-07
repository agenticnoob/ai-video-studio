import type { FC } from "react";
import { Easing, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

type ZoomPulseProps = {
  imageUrl?: string;
  maxScale?: number;
  minScale?: number;
};

const ZoomPulse: FC<ZoomPulseProps> = ({
  imageUrl = "https://images.pexels.com/photos/1726310/pexels-photo-1726310.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  maxScale = 1.1,
  minScale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cycle = (frame % Math.max(fps * 4, 1)) / Math.max(fps * 4, 1);
  const pulse = cycle < 0.5 ? cycle * 2 : (1 - cycle) * 2;
  const eased = interpolate(pulse, [0, 1], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
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
        alt="Zoom Pulse"
        src={imageUrl}
        style={{
          height: "100%",
          objectFit: "cover",
          transform: `scale(${minScale + (maxScale - minScale) * eased})`,
          width: "100%",
        }}
      />
    </div>
  );
};

export default ZoomPulse;
