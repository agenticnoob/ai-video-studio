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
  "ai-video-studio-voxcpm-expression",
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
assertMissing(".agents/skills/ai-video-studio-voxcpm-expression-workflow");

const producerSkill = read(".agents/skills/ai-video-studio-agent-producer/SKILL.md");
assertIncludes(producerSkill, "Production Chain", "Agent Producer skill");
assertIncludes(producerSkill, "Skill Stack", "Agent Producer skill");
assertIncludes(producerSkill, "punctuation-split", "Agent Producer skill");
assertIncludesWords(producerSkill, "trimmed and concatenated", "Agent Producer skill");
assertIncludes(producerSkill, ".agents/skills/remotion-best-practices/", "Agent Producer skill");
assertIncludes(producerSkill, ".agents/skills/ai-video-studio-voxcpm-expression/", "Agent Producer skill");

const voxcpmSkill = read(".agents/skills/ai-video-studio-voxcpm-expression/SKILL.md");
assertIncludes(voxcpmSkill, "VoxCPM returns audio/wav", "VoxCPM skill");
assertIncludes(voxcpmSkill, "no per-line timestamps", "VoxCPM skill");
assertIncludes(voxcpmSkill, "punctuation", "VoxCPM skill");
assertIncludes(voxcpmSkill, "silence", "VoxCPM skill");
assertIncludes(voxcpmSkill, "GPT-5.6", "VoxCPM skill");

const remotionSkill = read(".agents/skills/remotion-best-practices/SKILL.md");
assertIncludes(remotionSkill, "AI Video Studio Agent Producer", "Remotion skill");
assertIncludes(remotionSkill, "rules/video-layout.md", "Remotion skill");
assertIncludes(remotionSkill, "rules/subtitles.md", "Remotion skill");
assertIncludes(remotionSkill, "rules/silence-detection.md", "Remotion skill");

for (const skillName of ["ai-video-studio-agent-producer", "ai-video-studio-voxcpm-expression"]) {
  const metadata = read(`.agents/skills/${skillName}/agents/openai.yaml`);
  assertIncludes(metadata, `Use $${skillName}`, `${skillName} openai.yaml`);
  assertIncludes(metadata, "display_name:", `${skillName} openai.yaml`);
  assertIncludes(metadata, "short_description:", `${skillName} openai.yaml`);
}

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
  assertIncludes(source, ".agents/skills/ai-video-studio-voxcpm-expression/", docPath);
  assertNotIncludes(source, ".agents/skills/ai-video-studio-agent-producer-workflow", docPath);
  assertNotIncludes(source, ".agents/skills/ai-video-studio-voxcpm-expression-workflow", docPath);
}

console.warn("Skill alignment smoke passed.");
