import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import console from "node:console";
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");
const compact = (source) => source.replace(/\s+/gu, " ");

const assertIncludes = (source, token, label) => {
  assert(source.includes(token), `${label} must include ${JSON.stringify(token)}.`);
};

const assertIncludesWords = (source, words, label) => {
  assertIncludes(compact(source), compact(words), label);
};

const assertInOrder = (source, tokens, label) => {
  let cursor = -1;
  for (const token of tokens) {
    const next = source.indexOf(token, cursor + 1);
    assert(next > cursor, `${label} must place ${JSON.stringify(token)} after the previous step.`);
    cursor = next;
  }
};

const rootPackage = JSON.parse(read("package.json"));
const mcpPackage = JSON.parse(read("packages/stock-assets-mcp/package.json"));
assert.equal(mcpPackage.name, "stock-assets-mcp");
assert.deepEqual(mcpPackage.bin, { "stock-assets-mcp": "dist/cli.js" });
assert.equal("workspaces" in rootPackage, false, "Root package must remain a non-workspace.");
assert.equal(
  rootPackage.scripts["smoke:stock-assets-mcp-alignment"],
  "node scripts/smoke/architecture/stock-assets-mcp-alignment-smoke.mjs",
);

const ignored = execFileSync(
  "git",
  ["check-ignore", "-v", ".producer-assets/stock-candidates/pexels/1/original.jpg"],
  { cwd: root, encoding: "utf8" },
);
assertIncludes(ignored, ".producer-assets/", "Existing broad ignore rule");

const activeAuthorityPaths = [
  "README.md",
  "AGENTS.md",
  "docs/FINAL_PRODUCT_GOAL.md",
  "docs/ITERATION_STATUS.md",
  "docs/AGENT_PRODUCER_ONLY_ROADMAP.md",
  "docs/PRODUCER_ASSET_CONTRACT.md",
];
for (const docPath of activeAuthorityPaths) {
  const source = read(docPath);
  assertIncludes(source, "stock-assets-mcp", docPath);
  assertIncludes(source, "post-Roadmap", docPath);
  assertIncludes(source, "Phase 10", docPath);
}

const producerAssetsReferencePath =
  ".agents/skills/ai-video-studio-agent-producer/references/assets-evidence.md";
const producerAssetsReference = read(producerAssetsReferencePath);
for (const token of [
  "Visual-Source Decision Gate",
  "asset-led",
  "code-led",
  "hybrid",
  "real person, place, object, product, source, or truthful evidence",
  "process, relationship, state change, hierarchy, comparison, or measured value",
  "reality or evidence anchor",
  "existing primitive -> existing block -> composition-local component",
  "category, object, setting, or mood",
  "specific claim it does not truthfully depict",
  "generic filler",
  "fabricated screenshot",
  "explanatory copy, charts, or process diagrams",
  "stock-assets-mcp",
  "search_images",
  "preview_images",
  "acquire_image",
  "acquisition.json",
  "without per-image confirmation",
  ".producer-assets/stock-candidates/",
  "public/generated/<slug>/assets/",
  "producer:assets",
  "producer:preflight",
]) {
  assertIncludesWords(producerAssetsReference, token, producerAssetsReferencePath);
}
assertInOrder(
  producerAssetsReference,
  [
    "producer:library:search",
    "search_images",
    "preview_images",
    "acquire_image",
    "producer:assets",
    "producer:preflight",
  ],
  producerAssetsReferencePath,
);
assertIncludesWords(
  producerAssetsReference.toLowerCase(),
  "code-led beats do not call stock-assets-mcp",
  producerAssetsReferencePath,
);
assertIncludesWords(
  producerAssetsReference,
  "Remotion never renders a remote URL or a path below `.producer-assets/stock-candidates/`",
  producerAssetsReferencePath,
);

const assetSkillPath = ".agents/skills/ai-video-studio-asset-library/SKILL.md";
const assetSkill = read(assetSkillPath);
for (const token of [
  "Later MCP Candidate Review",
  "stock-assets-mcp",
  "acquisition.json",
  'kind: "url-import"',
  "creator.name",
  "license.name",
  "sourcePageUrl",
  "providerAssetId",
  "providerPolicy.attributionText",
  "providerPolicy.attributionRequired",
  "producer:library:add",
  "reviewed title",
  "recommended uses",
  "avoided uses",
  "style tags",
]) {
  assertIncludesWords(assetSkill, token, assetSkillPath);
}
assertIncludesWords(
  assetSkill,
  "never use `producer:library:ingest` for an MCP candidate",
  assetSkillPath,
);
assertIncludesWords(
  assetSkill,
  "rejection leaves the composition-local copy valid",
  assetSkillPath,
);
assertIncludesWords(assetSkill, "cleanup requires separate authorization", assetSkillPath);

const assetContract = read("docs/PRODUCER_ASSET_CONTRACT.md");
for (const token of [
  ".producer-assets/stock-candidates/",
  "public/generated/<slug>/assets/",
  "public/assets/library/items/<asset-id>/",
  "acquisition.json",
  "producer:library:add",
  "producer:library:ingest",
]) {
  assertIncludes(assetContract, token, "Producer asset contract");
}
assertIncludesWords(
  assetContract,
  "rejection does not invalidate or delete an existing composition-local copy",
  "Producer asset contract",
);

const packageReadme = read("packages/stock-assets-mcp/README.md");
for (const token of [
  "stdio only",
  "Pexels",
  "get_provider_status",
  "search_images",
  "preview_images",
  "acquire_image",
  ".producer-assets/stock-candidates/",
]) {
  assertIncludes(packageReadme, token, "stock-assets-mcp README");
}

for (const sourcePath of [".env.example", "docker-compose.yml"]) {
  assert.equal(
    read(sourcePath).includes("PEXELS_API_KEY"),
    false,
    `${sourcePath} must not configure the separately launched MCP process.`,
  );
}

const combinedAuthority = activeAuthorityPaths.map(read).join("\n");
for (const token of [
  "no automatic promotion",
  "no automatic deletion",
  "no HTTP, OAuth, UI, Unsplash, Pixabay, or stock video",
  "completed and frozen compositions remain unchanged",
]) {
  assertIncludesWords(combinedAuthority, token, "Active stock-assets-mcp authority");
}

console.warn("Stock assets MCP alignment smoke passed.");
