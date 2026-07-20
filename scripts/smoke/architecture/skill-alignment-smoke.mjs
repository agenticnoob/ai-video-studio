import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";

const repoRoot = process.cwd();

const fail = (message) => {
  throw new Error(message);
};

const read = (relativePath) => readFileSync(path.join(repoRoot, relativePath), "utf8");

const assertIncludes = (source, needle, label) => {
  if (!source.includes(needle)) {
    fail(`${label} must include ${JSON.stringify(needle)}.`);
  }
};

const assertIncludesWords = (source, needle, label) => {
  const normalizedSource = source.replace(/\s+/g, " ");
  const normalizedNeedle = needle.replace(/\s+/g, " ");
  assertIncludes(normalizedSource, normalizedNeedle, label);
};

const assertNotIncludes = (source, needle, label) => {
  if (source.includes(needle)) {
    fail(`${label} must not include ${JSON.stringify(needle)}.`);
  }
};

const assertExists = (relativePath) => {
  if (!existsSync(path.join(repoRoot, relativePath))) {
    fail(`${relativePath} must exist.`);
  }
};

const assertMissing = (relativePath) => {
  if (existsSync(path.join(repoRoot, relativePath))) {
    fail(`${relativePath} must not exist.`);
  }
};

const frontmatterName = (source) => {
  const match = source.match(/^---\nname:\s*([^\n]+)\n/m);
  return match?.[1]?.trim() ?? "";
};

const skillNames = [
  "ai-video-studio-agent-producer",
  "ai-video-studio-asset-library",
  "remotion-best-practices",
];

for (const skillName of skillNames) {
  const skillPath = `.agents/skills/${skillName}/SKILL.md`;
  assertExists(skillPath);
  const source = read(skillPath);
  if (frontmatterName(source) !== skillName) {
    fail(`${skillPath} frontmatter name must match the skill folder.`);
  }
  assertNotIncludes(source, `${skillName}-workflow`, skillPath);
}

assertMissing(".agents/skills/ai-video-studio-agent-producer-workflow");
assertMissing(".agents/skills/ai-video-studio-voxcpm-expression"); // inlined into agent-producer

const producerSkill = read(".agents/skills/ai-video-studio-agent-producer/SKILL.md");
const producerNarrationReferencePath =
  ".agents/skills/ai-video-studio-agent-producer/references/narration.md";
const producerNarrationReference = read(producerNarrationReferencePath);
assertIncludes(producerSkill, "Production Chain", "Agent Producer skill");
assertIncludes(producerSkill, "Skill Stack", "Agent Producer skill");
assertIncludes(producerSkill, ".agents/skills/remotion-best-practices/", "Agent Producer skill");
assertIncludes(
  producerNarrationReference,
  "../voxcpm-expression/VOXCPM_EXPRESSION.md",
  "Agent Producer narration reference",
);
assertIncludes(
  producerNarrationReference,
  "punctuation-split",
  "Agent Producer narration reference",
);
assertIncludesWords(
  producerNarrationReference,
  "trimmed and concatenated",
  "Agent Producer narration reference",
);
for (const required of [
  "npm run producer:scaffold",
  "npm run producer:assets",
  "npm run producer:preflight",
  "npm run producer:validate",
  "npm run producer:stills",
  "npm run producer:render",
  "npm run producer:quality",
  "npm run producer:library:search",
  "Visual-Source Decision Gate",
  "asset-led",
  "code-led",
  "hybrid",
  "stock-assets-mcp",
  "search_images",
  "preview_images",
  "acquire_image",
  "acquisition.json",
  ".producer-assets/stock-candidates/",
  "read-only inspection",
  "not automatic creative choices",
  "strict maintained manifest",
  "ProducerAssetManifest",
  "docs/PRODUCER_ASSET_CONTRACT.md",
  "public/assets/library/",
  "public/generated/<slug>/assets/",
  "frozen-reference",
  "existing finished samples are read-only references",
  "only supported video-production entrypoint",
  "docs/AGENT_PRODUCER_ONLY_ROADMAP.md",
  "code and existing assets only",
  "Remotion `<Still>`",
  "honest code-rendered information graphic",
  "VoxCPM is the only supported narration provider",
  "docker compose run --rm producer",
  "getProducerEffectPreset",
  "fitProducerText",
  "AgentProducerCapabilityShowcase",
  "npm run smoke:remotion-capabilities",
  "ProducerLocalVideo",
  "ProducerAnimatedImage",
  "ProducerLottie",
  "ProducerSoundtrack",
  "npm run smoke:producer-media-sound",
  "getProducerStyleProfile",
  "editorial-tech",
  "comic-anime",
  "cinematic-3d",
  "retro-terminal",
  "documentary-media",
  "hand-drawn-explainer",
  "npm run smoke:producer-style-profiles",
  "npm run smoke:producer-style-profile-sample-contract",
  "npm run smoke:producer-quality-gates",
  "--style-profile",
])
  assertIncludes(producerSkill, required, "Agent Producer skill");
for (const required of [
  "scripts/lib/producer-audio/",
  "voice-design",
  "controllable-clone",
  "high-fidelity-clone",
  "voices/clone/",
  "public/generated/<slug>/audio/",
  "scene id",
  "request fingerprint",
  "fails closed",
  "displayText",
]) {
  assertIncludesWords(producerNarrationReference, required, "Agent Producer narration reference");
}
assertIncludesWords(
  producerNarrationReference,
  "first real request reloads it automatically",
  "Agent Producer narration reference",
);
assertIncludesWords(
  producerNarrationReference,
  "`/ready` is diagnostic, not a gate",
  "Agent Producer narration reference",
);
for (const forbidden of [
  "Use `VideoProject`",
  "TTS_PROVIDER=f5-tts",
  "use F5-TTS",
  "image_generate",
  "generated source-card",
  "recipe/template promotion",
  "use an existing direct VoxCPM sample script",
  "/api/tts",
  "NEXT_ORIGIN",
  "uploaded reference id",
  "TTS_PROVIDER",
  "docker compose run --rm web",
  "node_modules/next",
])
  assertNotIncludes(producerSkill, forbidden, "Agent Producer skill");

for (const managementToken of [
  "producer:library:add",
  "producer:library:ingest",
  "producer:library:update",
  "producer:library:deprecate",
  "recursively inventory the requested inbox batch",
]) {
  assertNotIncludes(producerSkill.replace(/\s+/g, " "), managementToken, "Agent Producer skill");
}

const assetLibrarySkill = read(".agents/skills/ai-video-studio-asset-library/SKILL.md");
for (const required of [
  "producer:library:add",
  "producer:library:ingest",
  "producer:library:validate",
  "producer:library:list",
  "producer:library:search",
  "producer:library:update",
  "producer:library:deprecate",
  "producer:library:build -- --check",
  "recursively inventory the requested inbox batch",
  "visually inspect assets with missing semantic facts",
  "must not ask for source, author, license, rights, or attribution",
  "one atomic `producer:library:ingest` operation per accepted asset",
  "Admission does not require prior composition use",
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
  "never use `producer:library:ingest` for an MCP candidate",
  "rejection leaves the composition-local copy valid",
  "cleanup requires separate authorization",
]) {
  assertIncludesWords(assetLibrarySkill, required, "Asset Library skill");
}

const primitiveReference = read(
  ".agents/skills/ai-video-studio-agent-producer/remotion-primitives/REMOTION_PRIMITIVES.md",
);
for (const forbidden of [
  "src/templates/",
  "LLM-visible parameters",
  "template implementation schema",
])
  assertNotIncludes(primitiveReference, forbidden, "Producer primitive reference");
assertIncludes(
  primitiveReference,
  "Agent Producer Development Rule",
  "Producer primitive reference",
);
assertIncludes(primitiveReference, "producer:library:search", "Producer primitive reference");
assertIncludesWords(
  primitiveReference,
  "shortlist informs Agent creative judgment",
  "Producer primitive reference",
);

const voxcpmSkill = read(
  ".agents/skills/ai-video-studio-agent-producer/voxcpm-expression/VOXCPM_EXPRESSION.md",
);
assertIncludes(voxcpmSkill, "VoxCPM returns audio/wav", "VoxCPM skill");
assertIncludes(voxcpmSkill, "no per-line timestamps", "VoxCPM skill");
assertIncludes(voxcpmSkill, "punctuation", "VoxCPM skill");
assertIncludes(voxcpmSkill, "silence", "VoxCPM skill");
assertIncludes(voxcpmSkill, "GPT-5.6", "VoxCPM skill");
for (const required of [
  "voice-design",
  "controllable-clone",
  "high-fidelity-clone",
  "5–30 seconds",
  "retry_badcase",
  "Producer Direct Runtime Contract",
  "scripts/lib/producer-audio/",
  "voices/clone/",
  "public/generated/<slug>/audio/",
  "scene id",
  "fail closed",
  "controllable clone does not require a transcript upstream",
  "Hi-Fi clone requires an exact transcript",
  "control instructions are ignored by Hi-Fi clone",
])
  assertIncludes(voxcpmSkill, required, "VoxCPM skill");
assertIncludesWords(
  voxcpmSkill,
  "punctuation splitting, silence trimming, WAV concatenation, and duration-derived captions are Producer runtime behavior",
  "VoxCPM skill",
);
for (const forbidden of [
  "Repo Adapter Contract",
  "/api/tts",
  "uploaded reference id",
  "TTS_PROVIDER",
])
  assertNotIncludes(voxcpmSkill, forbidden, "VoxCPM skill");

const voxcpmDoc = read("docs/providers/voxcpm.md");
for (const required of [
  "voice-design",
  "controllable-clone",
  "high-fidelity-clone",
  "VOXCPM_TTS_RETRY_BADCASE=true",
  "Producer Direct Runtime Contract",
  "scripts/lib/producer-audio/",
  "voices/clone/",
  "public/generated/<slug>/audio/",
  "unloads the model after 10 minutes",
  "do not require HTTP `200` before narration",
]) {
  assertIncludes(voxcpmDoc, required, "VoxCPM provider doc");
}
for (const forbidden of ["Repo Adapter Contract", "/api/tts", "NEXT_ORIGIN", "TTS_PROVIDER"])
  assertNotIncludes(voxcpmDoc, forbidden, "VoxCPM provider doc");

const scienceExplainerProfileTokens = [
  "science-explainer-young-male",
  "future Chinese science-explainer",
  "controllable-clone",
  "voices/clone/science-explainer-young-male.wav",
  "voices/clone/science-explainer-young-male.txt",
  "high-fidelity-clone",
  "production brief",
  "fail closed",
  "no fallback",
];
for (const required of scienceExplainerProfileTokens) {
  assertIncludes(voxcpmSkill, required, "VoxCPM skill science explainer default");
  assertIncludes(voxcpmDoc, required, "VoxCPM provider doc science explainer default");
}
for (const [source, label] of [
  [voxcpmSkill, "VoxCPM skill science explainer default"],
  [voxcpmDoc, "VoxCPM provider doc science explainer default"],
]) {
  assertIncludesWords(
    source,
    "non-science content retains the existing default clone configuration",
    label,
  );
  assertIncludesWords(
    source,
    "high-fidelity-clone uses the same WAV and exact same-name transcript without a control instruction",
    label,
  );
  assertIncludesWords(
    source,
    "must not silently fall back to `lyy`, F5, or another provider",
    label,
  );
}
const scienceExplainerAcceptance = "User audition status: accepted on 2026-07-19.";
const activeScienceExplainerDocs = [
  [producerNarrationReference, "Agent Producer narration reference science explainer default"],
  [read("AGENTS.md"), "AGENTS science explainer default"],
  [read("README.md"), "README science explainer default"],
  [read("docs/FINAL_PRODUCT_GOAL.md"), "Final product goal science explainer default"],
  [read("docs/ITERATION_STATUS.md"), "Iteration status science explainer default"],
  [read("docs/AGENT_PRODUCER_ONLY_ROADMAP.md"), "Roadmap science explainer default"],
  [voxcpmDoc, "VoxCPM provider doc science explainer default"],
  [voxcpmSkill, "VoxCPM skill science explainer default"],
];
for (const [source, label] of activeScienceExplainerDocs) {
  for (const required of [
    "science-explainer-young-male",
    "future Chinese science-explainer",
    "controllable-clone",
    "voices/clone/science-explainer-young-male.wav",
    "voices/clone/science-explainer-young-male.txt",
    "high-fidelity-clone",
    "production brief",
    "non-science content",
    "fail closed",
    "`lyy`",
    "F5",
    "another provider",
    scienceExplainerAcceptance,
  ]) {
    assertIncludes(source, required, label);
  }
}
assertIncludes(
  read("docs/superpowers/specs/2026-07-19-science-explainer-voice-profile-design.md"),
  "Status: implemented and user-audition accepted on 2026-07-19",
  "Science explainer voice design status",
);

const remotionSkill = read(".agents/skills/remotion-best-practices/SKILL.md");
assertIncludes(remotionSkill, "AI Video Studio Agent Producer", "Remotion skill");
assertIncludes(remotionSkill, "rules/video-layout.md", "Remotion skill");
assertIncludes(remotionSkill, "rules/subtitles.md", "Remotion skill");
assertIncludes(remotionSkill, "rules/silence-detection.md", "Remotion skill");
assertIncludes(remotionSkill, "getProducerEffectPreset", "Remotion skill");
assertIncludes(remotionSkill, "getProducerMediaEffectPreset", "Remotion skill");
assertIncludes(remotionSkill, "fitProducerText", "Remotion skill");
assertIncludes(remotionSkill, "getProducerTransitionPreset", "Remotion skill");
assertIncludes(remotionSkill, "getProducerTransitionSeriesDuration", "Remotion skill");
assertIncludes(remotionSkill, "AgentProducerCapabilityShowcase", "Remotion skill");
assertIncludes(remotionSkill, "getProducerStyleProfile", "Remotion skill");
assertIncludes(remotionSkill, "npm run smoke:producer-style-profiles", "Remotion skill");
assertIncludes(
  remotionSkill,
  "npm run smoke:producer-style-profile-sample-contract",
  "Remotion skill",
);
assertIncludes(remotionSkill, "styleProfileId", "Remotion skill");
assertIncludes(remotionSkill, "producer:quality", "Remotion skill");
assertIncludes(remotionSkill, "does not score aesthetics", "Remotion skill");

for (const skillName of ["ai-video-studio-agent-producer", "ai-video-studio-asset-library"]) {
  const skillDir = `.agents/skills/${skillName}`;
  const metadata = read(`${skillDir}/agents/openai.yaml`);
  assertIncludes(metadata, `Use $${skillName}`, `${skillName} openai.yaml`);
  assertIncludes(metadata, "display_name:", `${skillName} openai.yaml`);
  assertIncludes(metadata, "short_description:", `${skillName} openai.yaml`);
}
// VoxCPM expression skill is inlined under agent producer
const voxcpmMetadata = read(
  ".agents/skills/ai-video-studio-agent-producer/voxcpm-expression/openai.yaml",
);
assertIncludes(voxcpmMetadata, "display_name:", "VoxCPM inlined openai.yaml");

const docsToCheck = [
  "README.md",
  "AGENTS.md",
  "docs/FINAL_PRODUCT_GOAL.md",
  "docs/VISUAL_RECIPE_ROADMAP.md",
  "docs/providers/voxcpm.md",
];

for (const docPath of docsToCheck) {
  const source = read(docPath);
  assertIncludes(source, ".agents/skills/ai-video-studio-agent-producer/", docPath);
  assertNotIncludes(source, ".agents/skills/ai-video-studio-agent-producer-workflow", docPath);
}
for (const docPath of [
  "README.md",
  "AGENTS.md",
  "docs/FINAL_PRODUCT_GOAL.md",
  "docs/ITERATION_STATUS.md",
  "docs/PRODUCER_ASSET_CONTRACT.md",
]) {
  assertIncludes(read(docPath), ".agents/skills/ai-video-studio-asset-library/", docPath);
}

console.warn("Skill alignment smoke passed.");
