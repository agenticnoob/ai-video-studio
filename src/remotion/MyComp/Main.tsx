import {
  AbsoluteFill,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { CompositionProps } from "../../../types/constants";
import { NextLogo } from "./NextLogo";
import { Rings } from "./Rings";
import { TextFade } from "./TextFade";

const FALLBACK_FONT_STACK =
  'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
export const Main = ({ title }: z.infer<typeof CompositionProps>) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const transitionStart = 2 * fps;
  const transitionDuration = 1 * fps;

  const logoOut = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
    durationInFrames: transitionDuration,
    delay: transitionStart,
  });

  return (
    <AbsoluteFill className="bg-white">
      <Sequence
        durationInFrames={transitionStart + transitionDuration}
        style={{
          scale: 2,
        }}
      >
        <Rings outProgress={logoOut}></Rings>
        <AbsoluteFill className="justify-center items-center">
          <NextLogo outProgress={logoOut}></NextLogo>
        </AbsoluteFill>
      </Sequence>
      <Sequence
        from={transitionStart + transitionDuration / 2}
        style={{
          scale: 3,
          rotate: "20deg",
        }}
        premountFor={50}
      >
        <TextFade>
          <h1
            className="text-[70px] font-bold"
            style={{
              fontFamily: FALLBACK_FONT_STACK,
            }}
          >
            {title}
          </h1>
        </TextFade>
      </Sequence>
    </AbsoluteFill>
  );
};
