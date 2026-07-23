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

const assertInOrder = (source, needles, label) => {
  let cursor = -1;
  for (const needle of needles) {
    const next = source.indexOf(needle, cursor + 1);
    if (next <= cursor) {
      fail(`${label} must place ${JSON.stringify(needle)} after the previous item.`);
    }
    cursor = next;
  }
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

const wordCount = (source) => source.trim().split(/\s+/u).length;

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
const producerAssetsReferencePath =
  ".agents/skills/ai-video-studio-agent-producer/references/assets-evidence.md";
const producerAssetsReference = read(producerAssetsReferencePath);
const producerRemotionReferencePath =
  ".agents/skills/ai-video-studio-agent-producer/references/remotion-composition.md";
const producerRemotionReference = read(producerRemotionReferencePath);
const producerWorkflowReferencePath =
  ".agents/skills/ai-video-studio-agent-producer/references/full-video-workflow.md";
const producerWorkflowReference = read(producerWorkflowReferencePath);
const producerFinalizationReferencePath =
  ".agents/skills/ai-video-studio-agent-producer/references/render-review-quality.md";
const producerFinalizationReference = read(producerFinalizationReferencePath);
const producerReferencePaths = [
  "references/full-video-workflow.md",
  "references/narration.md",
  "references/assets-evidence.md",
  "references/remotion-composition.md",
  "references/render-review-quality.md",
];
if (wordCount(producerSkill) > 500) {
  fail(`Agent Producer SKILL.md exceeds the 500-word context budget: ${wordCount(producerSkill)}`);
}
for (const relativePath of producerReferencePaths) {
  assertIncludes(producerSkill, relativePath, "Agent Producer task router");
}
assertNotIncludes(producerSkill, "@.agents/skills/", "Agent Producer task router");
assertIncludes(producerSkill, "Production Chain", "Agent Producer skill");
assertIncludes(producerSkill, "Task Routing", "Agent Producer skill");
assertIncludes(producerSkill, "only supported video-production entrypoint", "Agent Producer skill");
assertInOrder(
  producerSkill,
  [
    "npm run producer:scaffold",
    "npm run producer:assets",
    "npm run producer:preflight",
    "npm run producer:validate",
    "npm run producer:stills",
    "npm run producer:render",
    "npm run producer:quality",
  ],
  "Agent Producer production chain",
);
for (const required of [
  "code and existing assets only",
  "VoxCPM only for new narration",
  "dedicated Remotion composition",
  "completed and frozen compositions read-only",
  "Agent judgment owns",
  "Generated media and private voice files stay ignored",
  "Finish with composition/artifact paths",
  "known issues",
  "next bounded step",
]) {
  assertIncludesWords(producerSkill, required, "Agent Producer skill");
}
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
  "audience and publishing surface",
  "duration and aspect ratio",
  "language and content family",
  "factual freshness",
  "narration requirement",
  "expected assets and evidence",
  "output slug",
  "local artifact root",
  "narration.md",
  "assets-evidence.md",
  "remotion-composition.md",
  "render-review-quality.md",
]) {
  assertIncludesWords(producerWorkflowReference, required, "Agent Producer workflow reference");
}
assertIncludesWords(
  producerWorkflowReference.toLowerCase(),
  "narration duration owns",
  "Agent Producer workflow reference",
);
for (const required of [
  "producer:validate",
  "producer:stills",
  "producer:render",
  "producer:quality",
  "ffprobe",
  "4:3",
  "1600x1200",
  "3:4",
  "1200x1600",
  "final MP4",
  "does not approve aesthetics",
  "publishing",
  "Promote only reuse",
  "Handoff records",
]) {
  assertIncludesWords(
    producerFinalizationReference,
    required,
    "Agent Producer finalization reference",
  );
}
for (const required of [
  "Content-First Visual Intent",
  "subject, action or change, shot language, intended meaning, and distinct silhouette",
  "paused frame",
  "visual-intent.ts",
  "Do not open or copy dedicated composition renderers",
]) {
  assertIncludesWords(
    producerWorkflowReference,
    required,
    "Agent Producer content-first workflow reference",
  );
}
for (const required of [
  "Style Is Not A Storyboard",
  "clarity wins",
  "adjacent scenes",
  "smoke:producer-creative-contract",
]) {
  assertIncludesWords(
    producerRemotionReference,
    required,
    "Agent Producer composition clarity reference",
  );
}
for (const required of [
  "all-scene review",
  "early, middle, and late",
  "full-size and thumbnail",
  "representative render benchmark",
  "metadata and covers only",
  "explicit visual end hold",
  "Do not widen the quality tolerance",
]) {
  assertIncludesWords(
    producerFinalizationReference,
    required,
    "Agent Producer creative review reference",
  );
}

for (const [cliPath, expectedCount] of [
  ["scripts/preflight-producer-assets.mjs", 1],
  ["scripts/render-producer-review-frames.mjs", 3],
  ["scripts/render-producer-sample.mjs", 1],
  ["scripts/validate-producer-quality.mjs", 1],
]) {
  const actualCount = read(cliPath).split("--resolveJsonModule").length - 1;
  if (actualCount !== expectedCount) {
    fail(
      `${cliPath} must configure JSON imports for every TypeScript compiler call; expected ${expectedCount}, found ${actualCount}.`,
    );
  }
}
for (const required of [
  ".agents/skills/remotion-best-practices/SKILL.md",
  "rules/video-layout.md",
  "rules/subtitles.md",
  "rules/silence-detection.md",
  "getProducerEffectPreset",
  "getProducerMediaEffectPreset",
  "fitProducerText",
  "getProducerTransitionPreset",
  "getProducerTransitionSeriesDuration",
  "cinematic-film-burn",
  "Config.setAllowHtmlInCanvasEnabled(true)",
  "AgentProducerCapabilityShowcase",
  "ProducerLocalVideo",
  "ProducerAnimatedImage",
  "ProducerLottie",
  "ProducerMotionTreatment",
  "ProducerSoundtrack",
  "getProducerStyleProfile",
  "editorial-tech",
  "comic-anime",
  "cinematic-3d",
  "retro-terminal",
  "documentary-media",
  "hand-drawn-explainer",
  "producer:scaffold",
  "--style-profile",
  "smoke:remotion-capabilities",
  "smoke:producer-media-sound",
  "smoke:producer-style-profiles",
  "smoke:producer-style-profile-sample-contract",
]) {
  assertIncludes(producerRemotionReference, required, "Agent Producer Remotion reference");
}
for (const required of [
  "Visual-Source Decision Gate",
  "asset-led",
  "code-led",
  "hybrid",
  "producer:library:search",
  "stock-assets-mcp",
  "search_images",
  "preview_images",
  "acquire_image",
  "acquisition.json",
  ".producer-assets/stock-candidates/",
  "public/generated/<slug>/assets/",
  "producer:assets",
  "producer:preflight",
  "ProducerAssetManifest",
  "docs/PRODUCER_ASSET_CONTRACT.md",
  "public/assets/library/",
  "honest code-rendered information graphic",
]) {
  assertIncludesWords(producerAssetsReference, required, "Agent Producer assets reference");
}
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
  assertNotIncludes(
    producerAssetsReference.replace(/\s+/g, " "),
    managementToken,
    "Agent Producer assets reference",
  );
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
const voiceRegistryTokens = [
  "voice profile registry",
  "scripts/lib/producer-audio/voice-profiles.json",
  "--voice-profile <voice-profile-id>",
  "science-explainer-young-male",
  "explicit production brief",
  "fail closed",
  "no fallback",
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
  for (const required of voiceRegistryTokens) {
    assertIncludes(source, required, `${label} voice profile registry`);
  }
}
const scaffoldCommand =
  "npm run producer:scaffold -- --name <CompositionName> --slug <slug> --style-profile <profile-id> --voice-profile <voice-profile-id>";
for (const [source, label] of [
  [producerSkill, "Agent Producer skill"],
  [read("README.md"), "README"],
  [read("AGENTS.md"), "AGENTS"],
  [read("docs/FINAL_PRODUCT_GOAL.md"), "Final product goal"],
  [read("docs/ITERATION_STATUS.md"), "Iteration status"],
  [read("docs/AGENT_PRODUCER_ONLY_ROADMAP.md"), "Roadmap"],
]) {
  assertIncludes(source, scaffoldCommand, `${label} scaffold command`);
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
assertIncludesWords(remotionSkill, "content-first visual review", "Remotion skill");
assertIncludes(remotionSkill, "visual-intent.ts", "Remotion skill");
assertIncludes(remotionSkill, "smoke:producer-creative-contract", "Remotion skill");
assertIncludes(producerSkill, "visual-intent.ts", "Agent Producer skill");

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

for (const docPath of [
  "README.md",
  "AGENTS.md",
  "docs/FINAL_PRODUCT_GOAL.md",
  "docs/ITERATION_STATUS.md",
  "docs/AGENT_PRODUCER_ONLY_ROADMAP.md",
  "docs/DESIGN_SYSTEM.md",
  "src/remotion/AGENTS.md",
]) {
  assertIncludesWords(read(docPath), "content-first visual review", docPath);
}
for (const docPath of [
  "README.md",
  "AGENTS.md",
  "docs/FINAL_PRODUCT_GOAL.md",
  "docs/ITERATION_STATUS.md",
  "docs/AGENT_PRODUCER_ONLY_ROADMAP.md",
  "docs/DESIGN_SYSTEM.md",
  "docs/REMOTION_COMPONENT_LIBRARY.md",
  "docs/REMOTION_PRIMITIVES.md",
  "docs/EXTERNAL_REMOTION_REFERENCES.md",
  "docs/PRODUCER_PROMOTION_GATE.md",
  "src/remotion/AGENTS.md",
]) {
  assertIncludes(read(docPath), "visual-intent.ts", docPath);
}
for (const docPath of [
  "README.md",
  "AGENTS.md",
  "docs/FINAL_PRODUCT_GOAL.md",
  "docs/ITERATION_STATUS.md",
  "docs/AGENT_PRODUCER_ONLY_ROADMAP.md",
  "src/remotion/AGENTS.md",
]) {
  assertIncludesWords(read(docPath), "explicit visual end hold", docPath);
}

const remotionAgents = read("src/remotion/AGENTS.md");
assertIncludesWords(
  remotionAgents,
  "Phase 9B final acceptance video and Roadmap closure are complete",
  "Remotion knowledge base Roadmap status",
);
assertNotIncludes(
  remotionAgents,
  "Phase 9B final acceptance video and Roadmap closure have not started",
  "Remotion knowledge base Roadmap status",
);

console.warn("Skill alignment smoke passed.");
