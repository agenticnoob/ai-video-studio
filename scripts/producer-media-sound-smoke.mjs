/* global console */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");
const packageJson = JSON.parse(read("package.json"));
const inventory = JSON.parse(read("docs/architecture/agent-producer-only-removal-inventory.json"));
const allDirectDependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

for (const name of [
  "@remotion/gif",
  "@remotion/media",
  "@remotion/lottie",
  "@remotion/motion-blur",
]) {
  assert.equal(allDirectDependencies[name], "4.0.489", `${name} must be exact 4.0.489`);
}
assert.equal(allDirectDependencies["lottie-web"], "5.13.0", "lottie-web must be exact 5.13.0");
assert(!("@remotion/rive" in allDirectDependencies), "Rive must remain unadmitted without proof");

const requiredPaths = [
  "scripts/lib/producer-assets/audio-quality.ts",
  "scripts/fixtures/producer-media-sound/create-fixtures.sh",
  "scripts/fixtures/producer-media-sound/lottie.json",
  "src/remotion/media/ProducerLocalVideo.tsx",
  "src/remotion/media/ProducerAnimatedImage.tsx",
  "src/remotion/media/ProducerLottie.tsx",
  "src/remotion/media/index.ts",
  "src/remotion/motion/presets.tsx",
  "src/remotion/motion/index.ts",
  "src/remotion/sound/types.ts",
  "src/remotion/sound/library.ts",
  "src/remotion/sound/envelopes.ts",
  "src/remotion/sound/ProducerSoundtrack.tsx",
  "src/remotion/sound/transition-sfx.ts",
  "src/remotion/sound/index.ts",
  "src/remotion/AgentProducerMediaSoundProof/AgentProducerMediaSoundProof.tsx",
  "src/remotion/AgentProducerMediaSoundProof/assets.manifest.json",
  "src/remotion/AgentProducerMediaSoundProof/assets.supply.json",
  "src/remotion/AgentProducerMediaSoundProof/audio.generated.ts",
  "src/remotion/AgentProducerMediaSoundProof/cover.tsx",
  "src/remotion/AgentProducerMediaSoundProof/data.ts",
  "src/remotion/AgentProducerMediaSoundProof/generate.mjs",
  "src/remotion/AgentProducerMediaSoundProof/index.ts",
  "src/remotion/AgentProducerMediaSoundProof/manifest.ts",
  "src/remotion/AgentProducerMediaSoundProof/publishing.md",
  "src/remotion/AgentProducerMediaSoundProof/render-metadata.json",
  "src/remotion/AgentProducerMediaSoundProof/script.ts",
  "src/remotion/AgentProducerMediaSoundProof/soundtrack.tsx",
  "src/remotion/AgentProducerMediaSoundProof/types.ts",
  "src/remotion/AgentProducerMediaSoundProof/validation.ts",
];

for (const relativePath of requiredPaths) {
  assert(existsSync(path.join(root, relativePath)), `Missing Phase 7 surface: ${relativePath}`);
}

const localVideoSource = read("src/remotion/media/ProducerLocalVideo.tsx");
const mediaSource = [
  localVideoSource,
  read("src/remotion/media/ProducerAnimatedImage.tsx"),
  read("src/remotion/media/ProducerLottie.tsx"),
].join("\n");
for (const token of [
  "@remotion/gif",
  "<Gif",
  "@remotion/media",
  "AnimatedImage",
  "@remotion/lottie",
  "delayRender",
  "staticFile",
  "trimBefore",
  "trimAfter",
  "playbackRate",
  "objectFit",
]) {
  assert(mediaSource.includes(token), `Dynamic media source must include ${token}`);
}
assert(
  !localVideoSource.includes("disallowFallbackToOffthreadVideo"),
  "Producer local video must allow the official native-video fallback for LAN HTTP Studio",
);
assert(
  !localVideoSource.includes('onError={() => "fail"}'),
  "Producer local video must not force a decode failure before the native-video fallback",
);

const motionSource = read("src/remotion/motion/presets.tsx");
for (const token of [
  "camera-natural",
  "typography-trail",
  "icon-trail",
  "particle-trail",
  "CameraMotionBlur",
  "Trail",
]) {
  assert(motionSource.includes(token), `Motion preset source must include ${token}`);
}

const soundSource = [
  read("src/remotion/sound/library.ts"),
  read("src/remotion/sound/envelopes.ts"),
  read("src/remotion/sound/ProducerSoundtrack.tsx"),
  read("src/remotion/sound/transition-sfx.ts"),
].join("\n");
for (const token of [
  "narration",
  "bgm",
  "ambience",
  "sfx",
  "soft-whoosh",
  "directional-whoosh",
  "signal-sweep",
  "impact-bloom",
  "loopVolumeCurveBehavior",
]) {
  assert(soundSource.includes(token), `Sound design source must include ${token}`);
}

const assetContract = read("src/remotion/producer-samples/asset-manifest.ts");
for (const token of [
  "ProducerSoundAssetPolicy",
  "maxAllowedPeakDb",
  "maxSilenceSeconds",
  "hasExpressions",
]) {
  assert(assetContract.includes(token), `Asset contract must include ${token}`);
}

const proofManifest = read("src/remotion/AgentProducerMediaSoundProof/manifest.ts");
const proofRenderer = [
  read("src/remotion/AgentProducerMediaSoundProof/AgentProducerMediaSoundProof.tsx"),
  read("src/remotion/AgentProducerMediaSoundProof/soundtrack.tsx"),
].join("\n");
for (const token of ['sampleStatus: "maintained"', "soundDesign", "generated-local"]) {
  assert(proofManifest.includes(token), `Proof manifest must include ${token}`);
}
assert(
  proofManifest.includes("agentProducerMediaSoundProofSceneStarts"),
  "Proof review frames must follow measured narration scene starts",
);
assert(
  proofRenderer.includes('color: "#f8fafc"'),
  "Proof captions must set an explicit readable foreground color",
);
for (const token of [
  "ProducerLocalVideo",
  "ProducerAnimatedImage",
  "ProducerLottie",
  "ProducerSoundtrack",
  "ProducerMotionTreatment",
]) {
  assert(proofRenderer.includes(token), `Proof renderer must include ${token}`);
}

assert(
  read("src/remotion/producer-samples/registry.ts").includes(
    "agentProducerMediaSoundProofManifest",
  ),
  "Maintained proof manifest must enter the Producer registry",
);
const rootSource = read("src/remotion/Root.tsx");
for (const token of [
  "AGENT_PRODUCER_MEDIA_SOUND_PROOF_COMPOSITION_ID",
  "AgentProducerMediaSoundProofCover16x9",
  "AgentProducerMediaSoundProofCover9x16",
]) {
  assert(rootSource.includes(token), `Root must include ${token}`);
}

assert(inventory.completedPhases.includes(7), "Removal inventory must mark Phase 7 complete");
const iterationStatus = read("docs/ITERATION_STATUS.md");
assert(iterationStatus.includes("Phase 7 dynamic existing media and sound design is complete."));
assert(iterationStatus.includes("Phase 8A style-profile contract and showcase is complete."));
assert(iterationStatus.includes("Phase 8 is complete."));
assert(iterationStatus.includes("Phase 9 has not started."));

const producerSkill = read(".agents/skills/ai-video-studio-agent-producer/SKILL.md");
for (const token of [
  "ProducerLocalVideo",
  "ProducerAnimatedImage",
  "ProducerLottie",
  "ProducerSoundtrack",
  "smoke:producer-media-sound",
]) {
  assert(producerSkill.includes(token), `Agent Producer skill must include ${token}`);
}

const phase7RenderSource = [mediaSource, motionSource, soundSource, proofRenderer].join("\n");
for (const [label, pattern] of [
  ["remote URL", /https?:\/\//i],
  ["CSS animation", /animation(?:Name)?\s*:/],
  ["CSS transition", /transition\s*:/],
  ["image generation", /image[_ -]?generat/i],
  ["video generation", /video[_ -]?generat/i],
  ["unsupported provider", /f5-tts|TTS_PROVIDER|provider-neutral/i],
  ["Web/planner/template runtime", /VideoProject|StoryboardPlan|selected-template|\/api\/generate/],
]) {
  assert(!pattern.test(phase7RenderSource), `Phase 7 render source must not contain ${label}`);
}

const compiledRoot = process.env.PRODUCER_MEDIA_SOUND_BUILD_DIR;
if (compiledRoot) {
  const require = createRequire(import.meta.url);
  const { getProducerDuckedVolume } = require(
    path.join(compiledRoot, "src/remotion/sound/envelopes.js"),
  );
  const { getProducerTransitionSfxRole } = require(
    path.join(compiledRoot, "src/remotion/sound/transition-sfx.js"),
  );

  const envelopeInput = {
    baseVolume: 0.24,
    duckedVolume: 0.08,
    attackFrames: 6,
    releaseFrames: 8,
    narrationWindows: [{ startFrame: 30, endFrame: 90 }],
  };
  assert.equal(getProducerDuckedVolume({ ...envelopeInput, frame: 0 }), 0.24);
  assert.equal(getProducerDuckedVolume({ ...envelopeInput, frame: 30 }), 0.08);
  assert.equal(getProducerDuckedVolume({ ...envelopeInput, frame: 60 }), 0.08);
  assert.equal(getProducerDuckedVolume({ ...envelopeInput, frame: 98 }), 0.24);
  assert.throws(
    () =>
      getProducerDuckedVolume({
        ...envelopeInput,
        frame: 0,
        narrationWindows: [{ startFrame: 90, endFrame: 30 }],
      }),
    /window/u,
  );

  assert.equal(getProducerTransitionSfxRole("editorial-fade"), "soft-whoosh");
  assert.equal(getProducerTransitionSfxRole("directional-slide"), "directional-whoosh");
  assert.equal(getProducerTransitionSfxRole("signal-wipe"), "signal-sweep");
  assert.equal(getProducerTransitionSfxRole("cinematic-film-burn"), "impact-bloom");
}

console.log("Producer media and sound smoke passed.");
