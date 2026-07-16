import type { CSSProperties, FC } from "react";
import { AnimatedImage, staticFile, type AnimatedImageProps } from "remotion";

import { assertProducerLocalMediaPath, requirePositiveFiniteMediaNumber } from "./local-path";

export type ProducerAnimatedImageProps = {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly fit?: NonNullable<AnimatedImageProps["fit"]>;
  readonly playbackRate?: number;
  readonly loopBehavior?: NonNullable<AnimatedImageProps["loopBehavior"]>;
  readonly style?: CSSProperties;
};

export const ProducerAnimatedImage: FC<ProducerAnimatedImageProps> = ({
  src,
  width,
  height,
  fit = "cover",
  playbackRate = 1,
  loopBehavior = "loop",
  style,
}) => {
  assertProducerLocalMediaPath(src, "ProducerAnimatedImage src");
  requirePositiveFiniteMediaNumber(width, "ProducerAnimatedImage width");
  requirePositiveFiniteMediaNumber(height, "ProducerAnimatedImage height");
  requirePositiveFiniteMediaNumber(playbackRate, "ProducerAnimatedImage playbackRate");

  return (
    <AnimatedImage
      fit={fit}
      height={height}
      loopBehavior={loopBehavior}
      onError={(error) => {
        throw error;
      }}
      playbackRate={playbackRate}
      src={staticFile(src)}
      style={{ ...style, height, width }}
      width={width}
    />
  );
};
