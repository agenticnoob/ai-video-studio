/* global console, process */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");

for (const relativePath of [
  "scripts/lib/producer-quality-gates.ts",
  "scripts/lib/producer-quality-analysis.ts",
  "scripts/validate-producer-quality.mjs",
  "src/remotion/producer-samples/scaffold/SampleName/quality.ts",
]) {
  assert(
    existsSync(path.join(root, relativePath)),
    `Missing Phase 9A quality surface: ${relativePath}`,
  );
}

const packageJson = JSON.parse(read("package.json"));
assert(packageJson.scripts["producer:quality"], "Missing producer:quality package command.");
assert(
  packageJson.scripts["smoke:producer-quality-gates"],
  "Missing smoke:producer-quality-gates package command.",
);
const inventory = JSON.parse(read("docs/architecture/agent-producer-only-removal-inventory.json"));
assert(
  inventory.completedPhaseSlices.some(
    (entry) => entry.phase === 9 && entry.slice === "quality-gates" && entry.status === "complete",
  ),
  "Removal inventory must record the completed Phase 9A quality-gates slice.",
);
for (const [relativePath, required] of [
  ["docs/ITERATION_STATUS.md", "Phase 9A deterministic quality gates are complete."],
  ["docs/AGENT_PRODUCER_ONLY_ROADMAP.md", "Phase 9B - Final Acceptance And Closure"],
  [
    ".agents/skills/ai-video-studio-agent-producer/references/render-review-quality.md",
    "producer:quality",
  ],
  [
    ".agents/skills/ai-video-studio-agent-producer/references/render-review-quality.md",
    "does not approve aesthetics",
  ],
  [".agents/skills/remotion-best-practices/SKILL.md", "does not score aesthetics"],
]) {
  assert(read(relativePath).includes(required), `${relativePath} must include ${required}.`);
}
const qualityRuntimeSource = [
  read("scripts/lib/producer-quality-gates.ts"),
  read("scripts/lib/producer-quality-analysis.ts"),
  read("scripts/validate-producer-quality.mjs"),
].join("\n");
for (const forbidden of [
  /image[- ]generation/i,
  /video[- ]generation/i,
  /ComfyUI/i,
  /\/api\/(?:generate|render|progress)/,
  /F5_TTS_/,
  /aesthetic score/i,
  /automatic creative approval/i,
]) {
  assert(!forbidden.test(qualityRuntimeSource), `Quality runtime contains forbidden ${forbidden}.`);
}

const buildDir = process.env.PRODUCER_QUALITY_GATES_BUILD_DIR;
if (buildDir) {
  const { validateProducerQualityGateInput } = await import(
    pathToFileURL(path.join(buildDir, "scripts/lib/producer-quality-gates.js")).href
  );
  const { collectProducerQualityEvidence } = await import(
    pathToFileURL(path.join(buildDir, "scripts/lib/producer-quality-analysis.js")).href
  );
  const { producerQualityPlan } = await import(
    pathToFileURL(path.join(buildDir, "scripts/fixtures/producer-quality/fixture-plan.js")).href
  );
  const fixtureRoot = "/tmp/producer-quality-gates-fixture";
  rmSync(fixtureRoot, { recursive: true, force: true });
  mkdirSync(fixtureRoot, { recursive: true });
  execFileSync("ffmpeg", [
    "-v",
    "error",
    "-f",
    "lavfi",
    "-i",
    "testsrc2=size=320x180:rate=30",
    "-frames:v",
    "1",
    path.join(fixtureRoot, "review-good.png"),
  ]);
  execFileSync("ffmpeg", [
    "-v",
    "error",
    "-f",
    "lavfi",
    "-i",
    "color=black:size=320x180:rate=30",
    "-frames:v",
    "1",
    path.join(fixtureRoot, "review-blank.png"),
  ]);
  execFileSync("ffmpeg", [
    "-v",
    "error",
    "-f",
    "lavfi",
    "-i",
    "testsrc2=size=320x180:rate=30:duration=1",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=440:sample_rate=48000:duration=1",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-shortest",
    path.join(fixtureRoot, "fixture.mp4"),
  ]);
  writeFileSync(
    path.join(fixtureRoot, "fixture.json"),
    `${JSON.stringify({
      title: "Fixture",
      duration: 1,
      durationInFrames: 30,
      fps: 30,
      chapters: [
        { name: "First", startTime: "00:00:00" },
        { name: "Second", startTime: "00:00:0.5" },
      ],
    })}\n`,
  );

  const goodEvidence = await collectProducerQualityEvidence(producerQualityPlan);
  assert.equal(goodEvidence.observedArtifact.chapters[1]?.startFrame, 15);
  assert.doesNotThrow(() => validateProducerQualityGateInput(goodEvidence));
  const blankEvidence = await collectProducerQualityEvidence({
    ...producerQualityPlan,
    reviewFrames: [{ frame: 15, label: "blank", path: path.join(fixtureRoot, "review-blank.png") }],
  });
  assert.throws(() => validateProducerQualityGateInput(blankEvidence), /near-blank|low-contrast/i);
  assert.throws(
    () =>
      validateProducerQualityGateInput({
        ...goodEvidence,
        textLayouts: [{ ...goodEvidence.textLayouts[0], fits: false }],
      }),
    /text overflow/i,
  );
  assert.throws(
    () =>
      validateProducerQualityGateInput({
        ...goodEvidence,
        textLayouts: [
          {
            ...goodEvidence.textLayouts[0],
            foregroundColor: "#777777",
            backgroundColor: "#777777",
          },
        ],
      }),
    /text contrast/i,
  );
  assert.throws(
    () =>
      validateProducerQualityGateInput({
        ...goodEvidence,
        visibleElements: [{ id: "unsafe", bounds: { x: 0, y: 0, width: 100, height: 100 } }],
      }),
    /safe margins/i,
  );
  assert.throws(
    () =>
      validateProducerQualityGateInput({
        ...goodEvidence,
        evidence: [{ id: "missing", status: "unresolved" }],
      }),
    /unresolved evidence/i,
  );
  assert.throws(
    () => validateProducerQualityGateInput({ ...goodEvidence, renderedReviewFrames: [] }),
    /missing planned review frame/i,
  );
  const missingFrameEvidence = await collectProducerQualityEvidence({
    ...producerQualityPlan,
    reviewFrames: [{ frame: 15, label: "missing", path: path.join(fixtureRoot, "missing.png") }],
  });
  assert.throws(() => validateProducerQualityGateInput(missingFrameEvidence), /unreadable/i);
  assert.throws(
    () =>
      validateProducerQualityGateInput({
        ...goodEvidence,
        observedArtifact: { ...goodEvidence.observedArtifact, videoCodec: "vp9" },
      }),
    /H\.264/i,
  );
  assert.throws(
    () =>
      validateProducerQualityGateInput({
        ...goodEvidence,
        trackedArtifactPaths: ["out/tracked.mp4"],
      }),
    /tracked by Git/i,
  );
  assert.throws(
    () =>
      validateProducerQualityGateInput({
        ...goodEvidence,
        observedArtifact: {
          ...goodEvidence.observedArtifact,
          chapters: [
            { name: "First", startFrame: 0 },
            { name: "Second", startFrame: 10 },
          ],
        },
      }),
    /chapter.*timing/i,
  );
  const trackedEvidence = await collectProducerQualityEvidence({
    ...producerQualityPlan,
    artifactPaths: ["package.json"],
  });
  assert.deepEqual(trackedEvidence.trackedArtifactPaths, ["package.json"]);
  assert.throws(() => validateProducerQualityGateInput(trackedEvidence), /tracked by Git/i);
  execFileSync(
    "node",
    [
      "scripts/validate-producer-quality.mjs",
      "--module",
      "scripts/fixtures/producer-quality/fixture-plan.ts",
    ],
    { stdio: "inherit" },
  );
}

console.log("Producer quality gates smoke passed.");
