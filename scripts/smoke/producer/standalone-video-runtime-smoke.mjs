/* global console, process */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const compiledRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const standaloneModule = await import(
  path.join(compiledRoot, "src", "remotion", "standalone-video", "index.js")
);

const {
  STANDALONE_CANVAS_PROFILES,
  buildStandaloneSceneStartFrames,
  buildStandaloneSceneStartMap,
  getActiveStandaloneCaption,
  getStandaloneCanvasProfile,
  getStandaloneDurationInFrames,
} = standaloneModule;

const fail = (message) => {
  throw new Error(message);
};

const assertEqual = (actual, expected, message) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
};

const profileIds = STANDALONE_CANVAS_PROFILES.map((profile) => profile.id);
assertEqual(profileIds, ["landscape-16x9", "portrait-9x16"], "Unexpected canvas profiles");

const landscape = getStandaloneCanvasProfile("landscape-16x9");
if (landscape.width !== 1280 || landscape.height !== 720 || landscape.orientation !== "landscape") {
  fail("Landscape profile should be 1280x720.");
}

const portrait = getStandaloneCanvasProfile("portrait-9x16");
if (portrait.width !== 1080 || portrait.height !== 1920 || portrait.orientation !== "portrait") {
  fail("Portrait profile should be 1080x1920.");
}

const scenes = [
  { id: "one", durationInFrames: 100 },
  { id: "two", durationInFrames: 80 },
  { id: "three", durationInFrames: 60 },
];

assertEqual(
  buildStandaloneSceneStartFrames(scenes),
  [0, 100, 180],
  "Sequential starts should not overlap by default",
);
assertEqual(
  buildStandaloneSceneStartFrames(scenes, { overlapFrames: 8 }),
  [0, 92, 164],
  "Overlapped starts should subtract overlap from every next scene",
);
assertEqual(
  buildStandaloneSceneStartMap(scenes, { overlapFrames: 8 }),
  { one: 0, two: 92, three: 164 },
  "Start map should use scene ids",
);
if (getStandaloneDurationInFrames(scenes, { overlapFrames: 8 }) !== 224) {
  fail("Overlapped duration should equal last start plus last scene duration.");
}
if (getStandaloneDurationInFrames([]) !== 1) {
  fail("Empty standalone videos should still return a one-frame safe duration.");
}

const captions = {
  language: "zh",
  cues: [
    { id: "a", text: "第一句", startFrame: 0, durationInFrames: 10 },
    { id: "b", text: "第二句", startFrame: 10, durationInFrames: 5 },
  ],
};

if (getActiveStandaloneCaption(captions, 0)?.text !== "第一句") {
  fail("Caption lookup should include the cue start frame.");
}
if (getActiveStandaloneCaption(captions, 10)?.text !== "第二句") {
  fail("Caption lookup should switch at the next cue start.");
}
if (getActiveStandaloneCaption(captions, 15) !== undefined) {
  fail("Caption lookup should exclude the cue end frame.");
}

const indexSource = readFileSync(
  path.join(process.cwd(), "src", "remotion", "standalone-video", "index.ts"),
  "utf8",
);
if (!indexSource.includes("runtime")) {
  fail("Standalone video public exports should include runtime components.");
}

const runtimeSource = readFileSync(
  path.join(process.cwd(), "src", "remotion", "standalone-video", "runtime.tsx"),
  "utf8",
);
for (const expected of [
  "StandaloneTimeline",
  "StandaloneVoiceover",
  "StandaloneBottomCaption",
  "<Sequence",
  "<Audio",
  "pauseWhenBuffering",
  "staticFile",
]) {
  if (!runtimeSource.includes(expected)) {
    fail(`Standalone runtime source should include ${expected}.`);
  }
}

console.log("Standalone video runtime smoke passed.");
