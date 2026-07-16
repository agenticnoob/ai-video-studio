import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import console from "node:console";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const inventoryPath = "docs/architecture/agent-producer-only-removal-inventory.json";
const categories = ["producerOwned", "webF5Only", "shared", "historicalDependency", "unused"];
const actions = new Set(["retain", "extract-then-delete", "delete", "archive", "preserve-history"]);

const absolute = (relativePath) => path.join(root, relativePath);
const read = (relativePath) => readFileSync(absolute(relativePath), "utf8");
const trackedPaths = (pathspec) =>
  execFileSync("git", ["ls-files", "--", pathspec], { cwd: root, encoding: "utf8" })
    .trim()
    .split("\n")
    .filter((relativePath) => relativePath && existsSync(absolute(relativePath)));

assert(existsSync(absolute(inventoryPath)), `${inventoryPath} must exist`);
const inventory = JSON.parse(read(inventoryPath));

assert.equal(inventory.version, 1, "inventory version");
assert.deepEqual(inventory.completedPhases, [0, 1, 2, 3, 4, 5, 6, 7], "completed roadmap phases");
assert.deepEqual(
  inventory.completedPhaseSlices,
  [
    {
      phase: 6,
      slice: "version-gate",
      status: "complete",
      reason:
        "All currently installed Remotion packages are locked to exact 4.0.489 and verified before capability packages are admitted.",
    },
    {
      phase: 6,
      slice: "effects-text-layout-foundation",
      status: "complete",
      reason:
        "Exact-version effects and layout utilities now provide Producer-owned visual presets, guarded Chinese text fitting, and an isolated capability showcase.",
    },
    {
      phase: 6,
      slice: "transitions-showcase",
      status: "complete",
      reason:
        "Exact-version official transitions and light leaks now provide Producer-owned transition presets, duration accounting, cinematic treatment, and HTML/SVG/image/video canvas proofs.",
    },
    {
      phase: 7,
      slice: "dynamic-existing-media-sound-design",
      status: "complete",
      reason:
        "Producer-owned local dynamic media, motion treatments, sound design, audio quality gates, and one maintained proof passed real narration, preflight, deterministic still, cover, and MP4 verification.",
    },
    {
      phase: 8,
      slice: "style-profile-contract-showcase",
      status: "complete",
      reason:
        "Six typed Producer style profiles and deterministic code-only capability-showcase fixtures define visibly different composition, motion, texture, media, Three.js, caption, and sound languages; real dedicated-composition proof remains Phase 8B.",
    },
    {
      phase: 8,
      slice: "style-profile-sample-contract",
      status: "complete",
      reason:
        "Future Producer scaffolds now require one validated style-profile id while the completed Phase 7 maintained proof and every frozen composition remain unchanged.",
    },
  ],
  "completed roadmap phase slices",
);
const completedPhases = new Set(inventory.completedPhases);
assert.equal(
  inventory.authority.skill,
  ".agents/skills/ai-video-studio-agent-producer/",
  "sole skill authority",
);
assert.equal(
  inventory.authority.roadmap,
  "docs/AGENT_PRODUCER_ONLY_ROADMAP.md",
  "roadmap authority",
);
assert.deepEqual(
  Object.keys(inventory.categories).sort(),
  [...categories].sort(),
  "exact category set",
);

const seen = new Set();
for (const category of categories) {
  assert(Array.isArray(inventory.categories[category]), `${category} must be an array`);
  for (const entry of inventory.categories[category]) {
    assert.equal(typeof entry.id, "string", `${category} id`);
    assert(!seen.has(entry.id), `duplicate inventory id: ${entry.id}`);
    seen.add(entry.id);
    assert.equal(typeof entry.path, "string", `${entry.id} path`);
    assert(["path", "glob"].includes(entry.pathKind), `${entry.id} pathKind`);
    assert(actions.has(entry.action), `${entry.id} action`);
    assert(
      Number.isInteger(entry.phase) && entry.phase >= 0 && entry.phase <= 9,
      `${entry.id} phase`,
    );
    assert.equal(typeof entry.reason, "string", `${entry.id} reason`);
    assert(entry.reason.length >= 12, `${entry.id} reason must be specific`);
    if (entry.pathKind === "path") {
      if (entry.action === "delete" && completedPhases.has(entry.phase)) {
        assert.equal(
          trackedPaths(entry.path).length,
          0,
          `${entry.id} must have no tracked path: ${entry.path}`,
        );
      } else {
        assert(existsSync(absolute(entry.path)), `${entry.id} path must exist: ${entry.path}`);
      }
    }
  }
}

assert(
  inventory.allowedHistoricalExceptions.some(
    (entry) =>
      entry.pattern === "src/remotion/**/audio.generated.ts" &&
      entry.allowedValue === 'provider: "f5-tts"',
  ),
  "historical F5 metadata exception",
);

const activeDocs = [
  "README.md",
  "AGENTS.md",
  "docs/FINAL_PRODUCT_GOAL.md",
  "docs/ITERATION_STATUS.md",
  "docs/VISUAL_RECIPE_ROADMAP.md",
  "docs/EXTERNAL_REMOTION_REFERENCES.md",
  "docs/REMOTION_COMPONENT_LIBRARY.md",
  "docs/REMOTION_PRIMITIVES.md",
  "docs/PRODUCER_PROMOTION_GATE.md",
  "docs/PRODUCER_ASSET_CONTRACT.md",
  "docs/superpowers/README.md",
];
const requiredAuthority = [
  ".agents/skills/ai-video-studio-agent-producer/",
  "docs/AGENT_PRODUCER_ONLY_ROADMAP.md",
  "code and existing assets only",
];
const forbiddenActivePhrases = [
  "parked indefinitely",
  "F5-TTS is an explicit fallback",
  "TTS_PROVIDER=f5-tts",
  "image_generate",
  "generated source-card fallback",
];

for (const docPath of activeDocs) {
  const source = read(docPath);
  for (const phrase of requiredAuthority) {
    assert(source.includes(phrase), `${docPath} must include ${JSON.stringify(phrase)}`);
  }
  for (const phrase of forbiddenActivePhrases) {
    assert(!source.includes(phrase), `${docPath} must not include ${JSON.stringify(phrase)}`);
  }
}

assert(read("docs/FINAL_PRODUCT_GOAL.md").includes("only supported production flow"));
assert(read("docs/ITERATION_STATUS.md").includes("Phase 0"));
assert(read("docs/ITERATION_STATUS.md").includes("Phase 4"));
assert(read("docs/ITERATION_STATUS.md").includes("Phase 5"));
assert(read("docs/ITERATION_STATUS.md").includes("Phase 6"));
assert(read("docs/ITERATION_STATUS.md").includes("Phase 6 version gate is complete."));
assert(
  read("docs/ITERATION_STATUS.md").includes(
    "Phase 6A effects and text-layout foundation is complete.",
  ),
);
assert(read("docs/ITERATION_STATUS.md").includes("Phase 6 Remotion capability core is complete."));
assert(
  read("docs/ITERATION_STATUS.md").includes(
    "Phase 7 dynamic existing media and sound design is complete.",
  ),
);
assert(
  read("docs/ITERATION_STATUS.md").includes(
    "Phase 8A style-profile contract and showcase is complete.",
  ),
);
assert(
  read("docs/ITERATION_STATUS.md").includes("Phase 8B style-profile sample contract is complete."),
);
assert(
  read("docs/ITERATION_STATUS.md").includes("Phase 8B real-composition proof has not started."),
);
assert(read("docs/VISUAL_RECIPE_ROADMAP.md").includes("Superseded"));

const packageJson = JSON.parse(read("package.json"));
for (const command of [
  "producer:scaffold",
  "producer:assets",
  "producer:preflight",
  "producer:validate",
  "producer:stills",
  "producer:render",
  "smoke:producer-os",
  "smoke:producer-assets",
  "smoke:remotion-capabilities",
  "smoke:remotion-version-gate",
  "smoke:producer-media-sound",
  "smoke:producer-style-profiles",
  "smoke:producer-style-profile-sample-contract",
]) {
  assert(packageJson.scripts[command], `package.json must expose ${command}`);
}
for (const phase8aPath of [
  "scripts/producer-style-profiles-smoke.mjs",
  "src/remotion/styles/profiles.ts",
  "src/remotion/capability-showcase/StyleProfileShowcase.tsx",
]) {
  assert(existsSync(absolute(phase8aPath)), `Phase 8A path must exist: ${phase8aPath}`);
}
for (const phase8bContractPath of [
  "scripts/producer-style-profile-sample-contract-smoke.mjs",
  "src/remotion/styles/profile-ids.ts",
  "src/remotion/producer-samples/manifest.ts",
  "src/remotion/producer-samples/scaffold/SampleName/manifest.ts",
]) {
  assert(
    existsSync(absolute(phase8bContractPath)),
    `Phase 8B contract path must exist: ${phase8bContractPath}`,
  );
}
for (const phase7Path of [
  "scripts/producer-media-sound-smoke.mjs",
  "scripts/lib/producer-assets/audio-quality.ts",
  "src/remotion/media/ProducerLocalVideo.tsx",
  "src/remotion/media/ProducerAnimatedImage.tsx",
  "src/remotion/media/ProducerLottie.tsx",
  "src/remotion/motion/presets.tsx",
  "src/remotion/sound/ProducerSoundtrack.tsx",
  "src/remotion/AgentProducerMediaSoundProof/manifest.ts",
]) {
  assert(existsSync(absolute(phase7Path)), `Phase 7 path must exist: ${phase7Path}`);
}
for (const phase6aPath of [
  "scripts/remotion-capabilities-smoke.mjs",
  "src/remotion/effects/presets.ts",
  "src/remotion/styles/fit-text.ts",
  "src/remotion/capability-showcase/RemotionCapabilityShowcase.tsx",
]) {
  assert(existsSync(absolute(phase6aPath)), `Phase 6A path must exist: ${phase6aPath}`);
}
for (const phase5Path of [
  "src/remotion/producer-samples/asset-manifest.ts",
  "scripts/lib/producer-assets/index.ts",
  "scripts/producer-assets.mjs",
  "scripts/preflight-producer-assets.mjs",
  "docs/PRODUCER_ASSET_CONTRACT.md",
  "public/assets/library/README.md",
]) {
  assert(existsSync(absolute(phase5Path)), `Phase 5 path must exist: ${phase5Path}`);
}
for (const primitivePath of [
  "src/remotion/primitives/cinematic/KenBurns.tsx",
  "src/remotion/primitives/cinematic/ParallaxPan.tsx",
  "src/remotion/primitives/cinematic/ZoomPulse.tsx",
]) {
  assert(
    !/https?:\/\//i.test(read(primitivePath)),
    `${primitivePath} must not use a remote default.`,
  );
}
for (const phase4Path of [
  "scripts/producer-scaffold.mjs",
  "scripts/lib/producer-render.ts",
  "scripts/render-producer-sample.mjs",
  "src/remotion/producer-samples/scaffold/SampleName/manifest.ts",
  "src/remotion/producer-samples/scaffold/SampleName/cover.tsx",
]) {
  assert(existsSync(absolute(phase4Path)), `Phase 4 path must exist: ${phase4Path}`);
}

const activeProducerSampleOs = [
  read("src/remotion/producer-samples/manifest.ts"),
  read("src/remotion/producer-samples/registry.ts"),
].join("\n");
for (const forbidden of ['"recipe"', '"template"', "productized", "productizationExposure"]) {
  assert(
    !activeProducerSampleOs.includes(forbidden),
    `Producer Sample OS must remove ${forbidden}`,
  );
}

const producerSkill = read(".agents/skills/ai-video-studio-agent-producer/SKILL.md");
for (const phrase of [
  "Use `VideoProject`",
  "TTS_PROVIDER=f5-tts",
  "use F5-TTS",
  "image_generate",
  "generated source-card",
  "recipe/template promotion",
]) {
  assert(
    !producerSkill.includes(phrase),
    `Agent Producer skill must not include ${JSON.stringify(phrase)}`,
  );
}

const phase2DeletedPaths = [
  "services/f5-tts",
  "scripts/f5-tts",
  "docker-compose.f5.yml",
  "docker-compose.f5.gpu.yml",
  "scripts/f5-tts-next-smoke.sh",
  "scripts/f5-tts-real.sh",
  "scripts/f5-tts-smoke.sh",
  "scripts/f5-tts-staged-smoke.mjs",
  "scripts/lib/producer-audio/providers/f5.ts",
  "src/lib/tts/f5.ts",
  "docs/HANDOFF_F5_TTS_CAPTIONS.md",
  "docs/providers/f5-tts-service-plan.md",
  "docs/providers/f5-tts.md",
  "scripts/generate-ai-concepts-for-beginners.mjs",
  "scripts/generate-ai-daily-news-brief-2026-07-08.mjs",
  "scripts/generate-ai-daily-news-brief-2026-07-09.mjs",
  "scripts/generate-ai-news-strategic-brief-2026-07-09.mjs",
  "scripts/generate-openai-hardware-news-brief.mjs",
  "scripts/generate-pixelrag-chinese-standalone.mjs",
  "scripts/generate-uv-open-source-brief.mjs",
  "scripts/generate-world-cup-betting-analysis.mjs",
];
for (const deletedPath of phase2DeletedPaths) {
  assert.equal(
    trackedPaths(deletedPath).length,
    0,
    `Phase 2 path must have no tracked files: ${deletedPath}`,
  );
}

const phase2RuntimeFiles = [
  ".env.example",
  "docker-compose.yml",
  "package.json",
  "scripts/lib/producer-audio/types.ts",
  "scripts/lib/producer-audio/config.ts",
  "scripts/lib/producer-audio/providers/voxcpm.ts",
];
const forbiddenPhase2RuntimePatterns = [
  ["F5 environment key", /F5_TTS_/],
  ["F5 provider literal", /["']f5-tts["']/],
  ["F5 provider import", /(?:from|import\()["'][^"']*\/f5["']/],
  ["F5 Producer request planner", /createF5ProducerRequestPlan/],
  ["F5 synthesis", /synthesizeF5Speech/],
  ["F5 config reader", /readF5TtsConfig/],
];
for (const sourcePath of phase2RuntimeFiles) {
  const source = read(sourcePath);
  for (const [label, pattern] of forbiddenPhase2RuntimePatterns) {
    assert(!pattern.test(source), `${sourcePath} must not contain ${label}`);
  }
}

const futureProducerAudioPaths = [
  "scripts/lib/producer-audio/index.ts",
  "scripts/lib/producer-audio/types.ts",
  "scripts/lib/producer-audio/config.ts",
  "scripts/lib/producer-audio/captions.ts",
  "scripts/lib/producer-audio/wav.ts",
  "scripts/lib/producer-audio/progress.ts",
  "scripts/lib/producer-audio/providers/voxcpm.ts",
  "scripts/lib/producer-audio/request.ts",
  "scripts/lib/producer-audio/run.ts",
  "src/remotion/producer-samples/scaffold/SampleName/generate.mjs",
  "src/remotion/producer-samples/scaffold/SampleName/validation.ts",
];
const forbiddenFutureProducerAudioPatterns = [
  ["NEXT_ORIGIN", /NEXT_ORIGIN/],
  ["AI_VIDEO_STUDIO_ORIGIN", /AI_VIDEO_STUDIO_ORIGIN/],
  ["repository /api/tts", /\/api\/tts/],
  ["F5 request planning", /createF5ProducerRequestPlan/],
  ["F5 provider export", /providers\/f5/],
  ["provider selection", /TTS_PROVIDER/],
  ["origin request argument", /\borigin\s*:/],
  ["legacy fallback policy", /fallbackPolicy|fallbackReasons|explicit-silence-fallback/],
  ["configurable expected provider", /expectedProvider/],
];

for (const sourcePath of futureProducerAudioPaths) {
  const source = read(sourcePath);
  for (const [label, pattern] of forbiddenFutureProducerAudioPatterns) {
    assert(!pattern.test(source), `${sourcePath} must not contain ${label}`);
  }
}

const inventoryEntry = (id) => {
  for (const [category, entries] of Object.entries(inventory.categories)) {
    const entry = entries.find((candidate) => candidate.id === id);
    if (entry) return { category, entry };
  }
  return undefined;
};
const producerAudioInventory = inventoryEntry("producer-audio");
assert.equal(producerAudioInventory?.category, "producerOwned");
assert.equal(producerAudioInventory?.entry.action, "retain");
assert.equal(producerAudioInventory?.entry.phase, 1);
const ttsApiInventory = inventoryEntry("tts-api");
assert.equal(ttsApiInventory?.category, "webF5Only");
assert.equal(ttsApiInventory?.entry.action, "delete");
assert.equal(ttsApiInventory?.entry.phase, 3);

const legacyDocs = [
  "docs/AGENT_PLATFORM_DESIGN.md",
  "docs/FUTURE_DIRECTION_NOTES.md",
  "docs/HANDOFF_STATS_DASHBOARD_TEMPLATE.md",
  "docs/HANDOFF_STRUCTURE_REFACTOR.md",
  "docs/MEDIA_LAYERS.md",
  "docs/PRODUCT_ARCHITECTURE.md",
  "docs/PRODUCT_REQUIREMENTS.md",
  "docs/STRUCTURE_REFACTOR_PLAN.md",
  "docs/TEMPLATE_ARCHITECTURE.md",
  "docs/plans/STATS_DASHBOARD_TEMPLATE_ROADMAP.md",
  "docs/providers/deepseek.md",
  "docs/providers/minimax-tool-calling-review.md",
  "docs/providers/minimax-tool-calling.md",
  "docs/providers/minimax.md",
  "docs/superpowers/plans/2026-06-21-recipe-runtime-primitives-phase-2.md",
  "docs/superpowers/plans/2026-06-21-recipe-visual-blocks.md",
  "docs/superpowers/plans/2026-06-22-asset-aware-recipes-phase-5.md",
  "docs/superpowers/plans/2026-06-22-high-quality-recipe-templates-phase-3.md",
  "docs/superpowers/plans/2026-06-22-phase-4-live-smoke-closure.md",
  "docs/superpowers/plans/2026-06-22-planner-recipe-selection-phase-4.md",
  "docs/superpowers/plans/2026-06-22-recipe-coverage-expansion.md",
  "docs/superpowers/plans/2026-06-23-storyboard-draft-compiler.md",
  "docs/superpowers/plans/2026-06-29-main-site-recipe-abstractions-v1.md",
  "docs/superpowers/specs/2026-06-21-recipe-runtime-primitives-phase-2-design.md",
  "docs/superpowers/specs/2026-06-22-asset-aware-recipes-phase-5-design.md",
  "docs/superpowers/specs/2026-06-22-planner-recipe-selection-phase-4-design.md",
];
for (const sourcePath of legacyDocs) {
  const archivedPath = path.join("docs/archive/web-product", path.basename(sourcePath));
  assert(!existsSync(absolute(sourcePath)), `${sourcePath} must move out of active docs`);
  assert(existsSync(absolute(archivedPath)), `${archivedPath} must exist`);
}

console.log("Agent Producer architecture inventory smoke passed.");
