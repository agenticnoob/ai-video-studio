/* global console */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");

const proofs = [
  {
    compositionId: "TcpHandshakeEditorial",
    slug: "tcp-handshake-editorial",
    profileId: "editorial-tech",
    transitionId: "editorial-fade",
    sfxRole: "soft-whoosh",
  },
  {
    compositionId: "TcpHandshakeTerminal",
    slug: "tcp-handshake-terminal",
    profileId: "retro-terminal",
    transitionId: "signal-wipe",
    sfxRole: "signal-sweep",
  },
];

for (const proof of proofs) {
  for (const file of [
    `${proof.compositionId}.tsx`,
    "assets.manifest.json",
    "assets.supply.json",
    "audio.generated.ts",
    "cover.tsx",
    "data.ts",
    "generate.mjs",
    "index.ts",
    "manifest.ts",
    "publishing.md",
    "render-metadata.json",
    "script.ts",
    "soundtrack.tsx",
    "types.ts",
    "validation.ts",
  ]) {
    const relativePath = `src/remotion/${proof.compositionId}/${file}`;
    assert(
      existsSync(path.join(root, relativePath)),
      `Missing Phase 8B real proof: ${relativePath}`,
    );
  }

  const manifest = read(`src/remotion/${proof.compositionId}/manifest.ts`);
  const renderer = read(`src/remotion/${proof.compositionId}/${proof.compositionId}.tsx`);
  const soundtrack = read(`src/remotion/${proof.compositionId}/soundtrack.tsx`);
  const script = read(`src/remotion/${proof.compositionId}/script.ts`);
  const assets = JSON.parse(read(`src/remotion/${proof.compositionId}/assets.manifest.json`));

  for (const token of [
    'sampleStatus: "maintained"',
    `styleProfileId: "${proof.profileId}"`,
    'ttsStatus: "generated-local"',
    "soundDesign",
    "ProfiledMaintainedProducerSampleManifest",
  ]) {
    assert(manifest.includes(token), `${proof.compositionId} manifest missing ${token}.`);
  }
  for (const token of [
    `getProducerStyleProfile("${proof.profileId}")`,
    `id: "${proof.transitionId}"`,
    "TransitionSeries",
    "useCurrentFrame",
    "interpolate",
    "StandaloneBottomCaption",
  ]) {
    assert(renderer.includes(token), `${proof.compositionId} renderer missing ${token}.`);
  }
  assert(
    soundtrack.includes(proof.sfxRole),
    `${proof.compositionId} soundtrack missing ${proof.sfxRole}.`,
  );
  for (const token of ["syn", "syn-ack", "ack", "zh-cn"]) {
    assert(script.toLowerCase().includes(token), `${proof.compositionId} script missing ${token}.`);
  }
  assert.equal(assets.compositionId, proof.compositionId);
  assert.equal(assets.slug, proof.slug);
  assert.equal(assets.assets.filter((asset) => asset.kind === "audio").length, 7);
  assert.equal(assets.assets.filter((asset) => asset.kind === "svg").length, 1);

  const combinedRenderSource = `${renderer}\n${read(`src/remotion/${proof.compositionId}/cover.tsx`)}`;
  for (const forbidden of [
    "http://",
    "https://",
    "Date.now",
    "Math.random",
    "setTimeout",
    "setInterval",
    "VideoProject",
    "StoryboardPlan",
    "ComfyUI",
    "image_generate",
    "video_generate",
    "provider fallback",
  ]) {
    assert(
      !combinedRenderSource.includes(forbidden),
      `${proof.compositionId} contains forbidden token: ${forbidden}`,
    );
  }
  assert(
    !/(?:animation|transition)(?:Name|Duration|TimingFunction)?\s*:/u.test(combinedRenderSource),
    `${proof.compositionId} must not use CSS animation or transition properties.`,
  );
}

const editorialScript = read("src/remotion/TcpHandshakeEditorial/script.ts");
const terminalScript = read("src/remotion/TcpHandshakeTerminal/script.ts");
const narrationTexts = (source) =>
  [...source.matchAll(/(?:ttsText|displayText):\s*"([^"]+)"/gu)].map((match) => match[1]);
assert.deepEqual(
  narrationTexts(editorialScript),
  narrationTexts(terminalScript),
  "Both Phase 8B proofs must use identical narration/display content.",
);

const registry = read("src/remotion/producer-samples/registry.ts");
const rootSource = read("src/remotion/Root.tsx");
for (const proof of proofs) {
  assert(
    registry.includes(`${proof.compositionId}/manifest`),
    `${proof.compositionId} missing registry import.`,
  );
  for (const id of [
    proof.compositionId,
    `${proof.compositionId}Cover16x9`,
    `${proof.compositionId}Cover9x16`,
  ]) {
    assert(rootSource.includes(id), `${id} missing Root registration.`);
  }
}

const inventory = JSON.parse(read("docs/architecture/agent-producer-only-removal-inventory.json"));
assert(inventory.completedPhases.includes(8), "Phase 8 must complete after both real proofs pass.");
assert(
  inventory.completedPhaseSlices.some(
    (entry) => entry.phase === 8 && entry.slice === "style-profile-real-compositions",
  ),
  "Inventory must record the completed Phase 8B real-composition slice.",
);

for (const docPath of [
  "AGENTS.md",
  "README.md",
  "docs/FINAL_PRODUCT_GOAL.md",
  "docs/ITERATION_STATUS.md",
  "docs/AGENT_PRODUCER_ONLY_ROADMAP.md",
  "docs/REMOTION_COMPONENT_LIBRARY.md",
  "docs/PRODUCER_PROMOTION_GATE.md",
  ".agents/skills/ai-video-studio-agent-producer/SKILL.md",
  ".agents/skills/remotion-best-practices/SKILL.md",
]) {
  const source = read(docPath);
  assert(source.includes("Phase 8 is complete."), `${docPath} must mark Phase 8 complete.`);
  assert(source.includes("Phase 9A"), `${docPath} must describe the Phase 9A boundary.`);
  assert(source.includes("Phase 9B"), `${docPath} must keep Phase 9B unstarted.`);
}

console.warn("Producer style-profile real compositions smoke passed.");
