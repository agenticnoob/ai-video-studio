/* global console */

const { DEFAULT_RECIPE_CAPTION_SAFE_AREA, getRecipeBeatTiming } = await import(
  "../src/remotion/recipes/timing/recipe-timing.js"
);

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const assertMonotonic = (timing, durationInFrames) => {
  assert(timing.revealStartFrame === 0, "reveal should start at frame 0");
  assert(timing.revealStartFrame <= timing.revealEndFrame, "reveal range should be monotonic");
  assert(timing.revealEndFrame <= timing.holdStartFrame, "hold should not start before reveal ends");
  assert(timing.holdStartFrame <= timing.holdEndFrame, "hold range should be monotonic");
  assert(timing.holdEndFrame <= timing.exitStartFrame, "exit should not start before hold ends");
  assert(timing.exitStartFrame <= timing.exitEndFrame, "exit range should be monotonic");
  assert(timing.exitEndFrame === durationInFrames, "exit should end at the normalized duration");
};

const normalTiming = getRecipeBeatTiming({ durationInFrames: 330 });
assertMonotonic(normalTiming, 330);
assert(normalTiming.revealEndFrame > 0, "normal timing should include a reveal");
assert(normalTiming.holdEndFrame > normalTiming.holdStartFrame, "normal timing should include a hold");
assert(normalTiming.exitEndFrame > normalTiming.exitStartFrame, "normal timing should include an exit");

const shortTiming = getRecipeBeatTiming({ durationInFrames: 9 });
assertMonotonic(shortTiming, 9);
assert(shortTiming.exitStartFrame >= shortTiming.holdEndFrame, "short timing should keep exit after hold");

const invalidTiming = getRecipeBeatTiming({ durationInFrames: Number.NaN });
assertMonotonic(invalidTiming, 1);

assert(DEFAULT_RECIPE_CAPTION_SAFE_AREA.bottom >= 80, "caption-safe bottom inset should protect subtitles");
assert(DEFAULT_RECIPE_CAPTION_SAFE_AREA.left > 0, "caption-safe left inset should be positive");
assert(DEFAULT_RECIPE_CAPTION_SAFE_AREA.right > 0, "caption-safe right inset should be positive");

console.log("Recipe timing smoke passed.");
