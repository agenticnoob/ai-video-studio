import { getProducerTransitionSeriesDuration } from "../transitions";

export const EFFECTS_PAGE_DURATION_IN_FRAMES = 90;
export const TEXT_LAYOUT_PAGE_DURATION_IN_FRAMES = 90;

export const TRANSITION_TIMING_PAGE_DURATION_IN_FRAMES = getProducerTransitionSeriesDuration({
  sceneDurations: [60, 60, 60],
  transitions: [
    { id: "editorial-fade", durationInFrames: 15 },
    { id: "signal-wipe", durationInFrames: 20 },
  ],
  fps: 30,
});

export const CINEMATIC_PAGE_DURATION_IN_FRAMES =
  60 +
  getProducerTransitionSeriesDuration({
    sceneDurations: [60, 60],
    transitions: [{ id: "cinematic-film-burn", durationInFrames: 15 }],
    fps: 30,
  });

export const CANVAS_SOURCE_PAGE_DURATION_IN_FRAMES = 120;
export const STYLE_PROFILE_PAGE_DURATION_IN_FRAMES = 90;
export const STYLE_PROFILE_SHOWCASE_DURATION_IN_FRAMES = 6 * STYLE_PROFILE_PAGE_DURATION_IN_FRAMES;

export const REMOTION_CAPABILITY_SHOWCASE_DURATION_IN_FRAMES =
  EFFECTS_PAGE_DURATION_IN_FRAMES +
  TEXT_LAYOUT_PAGE_DURATION_IN_FRAMES +
  TRANSITION_TIMING_PAGE_DURATION_IN_FRAMES +
  CINEMATIC_PAGE_DURATION_IN_FRAMES +
  CANVAS_SOURCE_PAGE_DURATION_IN_FRAMES +
  STYLE_PROFILE_SHOWCASE_DURATION_IN_FRAMES;
