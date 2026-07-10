import { existsSync, readFileSync } from "node:fs";

/* global console */

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const rootSource = readFileSync("src/remotion/Root.tsx", "utf8");
const rendererSource = readFileSync(
  "src/remotion/AiConceptsForBeginners/AiConceptsForBeginners.tsx",
  "utf8",
);
const generatorSource = readFileSync("scripts/generate-ai-concepts-for-beginners.mjs", "utf8");
const scriptModule = await import("../src/remotion/AiConceptsForBeginners/script.js");
const dataModule = await import("../src/remotion/AiConceptsForBeginners/data.js");
const audioModule = await import("../src/remotion/AiConceptsForBeginners/audio.generated.js");
const typesModule = await import("../src/remotion/AiConceptsForBeginners/types.js");

const expectedConcepts = [
  "LLM",
  "Prompt",
  "Context",
  "RAG",
  "Function Calling",
  "MCP",
  "Agent",
  "Workflow",
  "Skill",
  "Subagent",
  "LangChain",
];

assert(
  scriptModule.aiConceptsForBeginnersNarrationBeats
    .filter((beat) => expectedConcepts.includes(beat.concept))
    .map((beat) => beat.concept)
    .join("|") === expectedConcepts.join("|"),
  "AI concepts must stay in dependency-aware order.",
);
assert(
  typesModule.AI_CONCEPTS_FOR_BEGINNERS_COMPOSITION_ID === "AiConceptsForBeginners",
  "Composition id changed unexpectedly.",
);
assert(
  typesModule.AI_CONCEPTS_FOR_BEGINNERS_PROFILE_ID === "landscape-16x9" &&
    typesModule.AI_CONCEPTS_FOR_BEGINNERS_CONTENT_FAMILY === "tutorial",
  "The explainer must remain a landscape tutorial producer sample.",
);
assert(
  rootSource.includes("AI_CONCEPTS_FOR_BEGINNERS_COMPOSITION_ID") &&
    rootSource.includes("AiConceptsForBeginnersVideo"),
  "The composition must be registered in Root.tsx.",
);
assert(
  rendererSource.includes("StandaloneTimeline") &&
    rendererSource.includes("StandaloneVoiceover") &&
    rendererSource.includes("StandaloneBottomCaption"),
  "The renderer must reuse the standalone runtime.",
);
assert(
  rendererSource.includes("GradientShiftBackground") &&
    rendererSource.includes("GridPulse") &&
    rendererSource.includes("VideoPanel") &&
    rendererSource.includes("Kicker") &&
    rendererSource.includes("CalloutGrid"),
  "The renderer must reuse repo primitives.",
);
assert(
  rendererSource.includes("useCurrentFrame()") && rendererSource.includes("interpolate("),
  "The renderer must stay frame-driven.",
);
assert(
  !rendererSource.includes("animation:") && !rendererSource.includes("transition:"),
  "Render-critical CSS animation and transition styles are forbidden.",
);
assert(
  generatorSource.includes('provider: process.env.TTS_PROVIDER || "voxcpm"') &&
    generatorSource.includes("voiceClone"),
  "The generator must use the VoxCPM voice-clone path by default.",
);

const scenes = dataModule.aiConceptsForBeginnersData.scenes;
const tracks = audioModule.aiConceptsForBeginnersAudio;
assert(scenes.length === 13, "Expected thirteen educational scenes.");
assert(tracks.length === scenes.length, "Every scene must have one generated audio track.");
assert(
  scenes.reduce((sum, scene) => sum + scene.durationInFrames, 0) ===
    typesModule.AI_CONCEPTS_FOR_BEGINNERS_DURATION_IN_FRAMES,
  "Duration constant must match the timed scene data.",
);
assert(
  typesModule.AI_CONCEPTS_FOR_BEGINNERS_DURATION_IN_FRAMES >=
    typesModule.AI_CONCEPTS_FOR_BEGINNERS_MIN_DURATION_IN_FRAMES &&
    typesModule.AI_CONCEPTS_FOR_BEGINNERS_DURATION_IN_FRAMES <=
      typesModule.AI_CONCEPTS_FOR_BEGINNERS_MAX_DURATION_IN_FRAMES,
  "Finished narration must stay between seven and nine minutes.",
);

for (const track of tracks) {
  assert(
    track.provider && track.provider !== "local-silent-fallback",
    `${track.sceneId} needs real TTS.`,
  );
  assert(track.durationInFrames > 0, `${track.sceneId} needs positive duration.`);
  assert(track.captions.cues.length > 0, `${track.sceneId} needs measured captions.`);
  assert(existsSync(`public/${track.audioFile}`), `Missing local audio asset: ${track.audioFile}`);
}

console.log("AI concepts for beginners smoke passed.");
