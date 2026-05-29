import { z } from "zod";

export const COMP_NAME = "HeroIntro";

export const CompositionProps = z.object({
  title: z.string(),
});

export type HeroCompositionProps = z.infer<typeof CompositionProps>;

export const defaultMyCompProps: HeroCompositionProps = {
  title: "监管者的视频模版",
};

export const DURATION_IN_FRAMES = 200;
export const VIDEO_WIDTH = 1280;
export const VIDEO_HEIGHT = 720;
export const VIDEO_FPS = 30;
