/* global console, process */

import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const compiledRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const audioModule = await import(
  path.join(compiledRoot, "src", "remotion", "WorldCupBettingAnalysis", "audio.generated.js")
);
const dataModule = await import(
  path.join(compiledRoot, "src", "remotion", "WorldCupBettingAnalysis", "data.js")
);
const typesModule = await import(
  path.join(compiledRoot, "src", "remotion", "WorldCupBettingAnalysis", "types.js")
);

const { worldCupBettingAudio } = audioModule;
const { worldCupBettingData } = dataModule;
const {
  WORLD_CUP_BETTING_ANALYSIS_COMPOSITION_ID,
  WORLD_CUP_BETTING_ANALYSIS_DURATION_IN_FRAMES,
  WORLD_CUP_BETTING_ANALYSIS_FPS,
  WORLD_CUP_BETTING_ANALYSIS_HEIGHT,
  WORLD_CUP_BETTING_ANALYSIS_VOICEOVER_PLAYBACK_RATE,
  WORLD_CUP_BETTING_ANALYSIS_WIDTH,
} = typesModule;

const fail = (message) => {
  throw new Error(message);
};

const rootSource = readFileSync(path.join(process.cwd(), "src", "remotion", "Root.tsx"), "utf8");
const componentSource = readFileSync(
  path.join(
    process.cwd(),
    "src",
    "remotion",
    "WorldCupBettingAnalysis",
    "WorldCupBettingAnalysis.tsx",
  ),
  "utf8",
);

if (WORLD_CUP_BETTING_ANALYSIS_COMPOSITION_ID !== "WorldCupBettingAnalysis") {
  fail("Unexpected World Cup betting analysis composition id.");
}
if (WORLD_CUP_BETTING_ANALYSIS_FPS !== 30) {
  fail("World Cup betting analysis FPS should be 30.");
}
if (WORLD_CUP_BETTING_ANALYSIS_WIDTH !== 1080 || WORLD_CUP_BETTING_ANALYSIS_HEIGHT !== 1920) {
  fail("World Cup betting analysis should be a 1080x1920 vertical composition.");
}
if (worldCupBettingData.profileId !== "portrait-9x16") {
  fail("World Cup betting analysis should use the shared portrait standalone canvas profile.");
}
if (worldCupBettingData.contentFamily !== "data-analysis") {
  fail("World Cup betting analysis should be categorized as a standalone data-analysis sample.");
}
const durationInSeconds =
  WORLD_CUP_BETTING_ANALYSIS_DURATION_IN_FRAMES / WORLD_CUP_BETTING_ANALYSIS_FPS;
if (durationInSeconds < 60 || durationInSeconds > 70) {
  fail(`World Cup betting analysis duration is out of range: ${durationInSeconds}s`);
}
if (
  !Number.isFinite(WORLD_CUP_BETTING_ANALYSIS_VOICEOVER_PLAYBACK_RATE) ||
  WORLD_CUP_BETTING_ANALYSIS_VOICEOVER_PLAYBACK_RATE < 1 ||
  WORLD_CUP_BETTING_ANALYSIS_VOICEOVER_PLAYBACK_RATE > 1.15
) {
  fail("World Cup betting analysis voiceover playback rate should stay subtle.");
}
if (worldCupBettingData.scenes.length !== 8) {
  fail("World Cup betting analysis should keep the requested 8-scene structure.");
}
if (worldCupBettingAudio.length !== worldCupBettingData.scenes.length) {
  fail("World Cup betting analysis should include one generated voiceover track per scene.");
}

const sceneDurations = worldCupBettingData.scenes.map((scene) => scene.durationInFrames);
const expectedDurations = [219, 196, 196, 320, 320, 273, 320, 245];
if (JSON.stringify(sceneDurations) !== JSON.stringify(expectedDurations)) {
  fail(`Unexpected scene durations: ${sceneDurations.join(", ")}`);
}

for (const scene of worldCupBettingData.scenes) {
  if (!scene.narration || scene.narration.length < 20) {
    fail(`Scene ${scene.id} should include generated voiceover narration text.`);
  }
  const track = worldCupBettingAudio.find((candidate) => candidate.sceneId === scene.id);
  if (!track) {
    fail(`Missing generated voiceover track for ${scene.id}.`);
  }
  if (track.narration !== scene.narration) {
    fail(`Voiceover narration mismatch for ${scene.id}.`);
  }
  if (!track.audioFile.startsWith("generated/world-cup-betting-analysis/")) {
    fail(`Unexpected audio location for ${scene.id}: ${track.audioFile}`);
  }
  const audioPath = path.join(process.cwd(), "public", track.audioFile);
  if (!existsSync(audioPath) || statSync(audioPath).size <= 0) {
    fail(`Missing generated static voiceover file for ${scene.id}: ${audioPath}`);
  }
  if (!Number.isFinite(track.durationInFrames) || track.durationInFrames <= 0) {
    fail(`Invalid generated voiceover duration for ${scene.id}: ${track.durationInFrames}`);
  }
  const effectiveAudioFrames = Math.ceil(
    track.durationInFrames / WORLD_CUP_BETTING_ANALYSIS_VOICEOVER_PLAYBACK_RATE,
  );
  if (effectiveAudioFrames > scene.durationInFrames) {
    fail(`Voiceover for ${scene.id} is longer than its scene.`);
  }
  if (!track.captions?.cues?.length) {
    fail(`Generated voiceover for ${scene.id} should include caption cues.`);
  }
}

const matches = worldCupBettingData.matches;
if (matches.length !== 3) {
  fail("World Cup betting analysis should include exactly three matches.");
}

const brazil = matches.find((match) => match.id === "brazil-japan");
const germany = matches.find((match) => match.id === "germany-paraguay");
const netherlands = matches.find((match) => match.id === "netherlands-morocco");

if (!brazil || !germany || !netherlands) {
  fail("Missing one or more required match records.");
}
if (
  brazil.marketOdds.win !== 1.49 ||
  brazil.marketOdds.draw !== 3.72 ||
  brazil.marketOdds.loss !== 5.28
) {
  fail("Brazil vs Japan竞彩赔率 are not accurate.");
}
if (brazil.noVigProbabilities.win !== 56.1 || brazil.expectedValues.loss !== -3.4) {
  fail("Brazil vs Japan probability or EV values are not accurate.");
}
if (germany.marketOdds.win !== 1.2 || germany.expectedValues.win !== -13.7) {
  fail("Germany vs Paraguay key odds or EV values are not accurate.");
}
if (netherlands.marketOdds.draw !== 2.95 || netherlands.noVigProbabilities.draw !== 30.4) {
  fail("Netherlands vs Morocco draw data is not accurate.");
}
if (!worldCupBettingData.summary.noBet.text.includes("EV = 0")) {
  fail("Closing no-bet EV=0 conclusion is missing.");
}
if (!worldCupBettingData.summary.disclaimer.includes("不构成投注建议")) {
  fail("Required disclaimer is missing.");
}

if (!rootSource.includes("WorldCupBettingAnalysisVideo")) {
  fail("Remotion Root should register WorldCupBettingAnalysisVideo.");
}
if (!componentSource.includes("<Sequence")) {
  fail("WorldCupBettingAnalysis should use Remotion Sequence for scene timing.");
}
if (!componentSource.includes("StandaloneTimeline")) {
  fail("WorldCupBettingAnalysis should use the shared standalone timeline runtime.");
}
if (!componentSource.includes("StandaloneVoiceover")) {
  fail("WorldCupBettingAnalysis should use the shared standalone voiceover runtime.");
}
if (!componentSource.includes("spring(")) {
  fail("WorldCupBettingAnalysis should use Remotion spring for entrances.");
}
if (!componentSource.includes("interpolate(")) {
  fail("WorldCupBettingAnalysis should use interpolate for frame-driven motion.");
}
if (componentSource.includes("animation:") || componentSource.includes("transition:")) {
  fail("WorldCupBettingAnalysis should not use CSS animation or transition styles.");
}
if (!componentSource.includes("PitchLines")) {
  fail("WorldCupBettingAnalysis should draw football pitch lines with SVG.");
}
if (!componentSource.includes("OddsTable")) {
  fail("WorldCupBettingAnalysis should redraw the odds table when no screenshot is present.");
}
if (!componentSource.includes("免责声明")) {
  fail("WorldCupBettingAnalysis should render an explicit final disclaimer.");
}

console.log("World Cup betting analysis smoke passed.");
