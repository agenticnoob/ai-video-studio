import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import console from "node:console";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const absolute = (relativePath) => path.join(root, relativePath);
const read = (relativePath) => readFileSync(absolute(relativePath), "utf8");
const trackedPaths = (pathspec) =>
  execFileSync("git", ["ls-files", "--", pathspec], { cwd: root, encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(Boolean)
    .filter((trackedPath) => existsSync(absolute(trackedPath)));

const removedPaths = [
  "src/app",
  "src/components",
  "src/helpers",
  "src/templates",
  "src/lambda",
  "src/remotion/ProjectVideo",
  "src/remotion/ScriptedVideo",
  "src/remotion/SpotlightVideo",
  "src/remotion/RecipeShowcase",
  "src/remotion/recipes/motion",
  "src/remotion/template-component-registry.tsx",
  "Dockerfile.prod",
  "docker-compose.prod.yml",
  "next-env.d.ts",
  "next.config.js",
];

for (const removedPath of removedPaths) {
  assert.equal(
    trackedPaths(removedPath).length,
    0,
    `Phase 3 path must have no tracked files: ${removedPath}`,
  );
}

const packageJson = JSON.parse(read("package.json"));
for (const dependency of [
  "@ai-sdk/deepseek",
  "@remotion/bundler",
  "@remotion/lambda",
  "@remotion/player",
  "ai",
  "clsx",
  "next",
  "tailwind-merge",
]) {
  assert.equal(packageJson.dependencies?.[dependency], undefined, `remove dependency ${dependency}`);
}
for (const dependency of ["@next/eslint-plugin-next", "eslint-config-next"]) {
  assert.equal(
    packageJson.devDependencies?.[dependency],
    undefined,
    `remove dev dependency ${dependency}`,
  );
}

for (const scriptName of Object.keys(packageJson.scripts ?? {})) {
  assert(
    !/(next|staged|storyboard|template|product-ui|provider-boundary|recipe-showcase|recipe-timing|deploy)/.test(
      scriptName,
    ),
    `remove Web/planner package script ${scriptName}`,
  );
}
assert.equal(
  packageJson.scripts?.["smoke:agent-producer-web-removal"],
  "node scripts/agent-producer-web-removal-smoke.mjs",
  "Phase 3 focused smoke command",
);

const compose = read("docker-compose.yml");
assert(/^ {2}producer:\s*$/m.test(compose), "docker-compose.yml must define producer service");
for (const service of ["web", "studio", "render", "web-prod"]) {
  assert(!new RegExp(`^  ${service}:\\s*$`, "m").test(compose), `remove Compose ${service} service`);
}
assert(!compose.includes("node_modules/next"), "Compose must not probe Next dependencies");

const rootSource = read("src/remotion/Root.tsx");
for (const removedRegistration of [
  "ProjectVideo",
  "RecipeShowcasePreview",
  "ScriptedTemplatePreview",
  "SpotlightTemplatePreview",
  "StatsDashboardTemplatePreview",
  "TechnicalExplainerTemplatePreview",
]) {
  assert(
    !rootSource.includes(removedRegistration),
    `Root must not register ${removedRegistration}`,
  );
}

const futureCaptionConsumers = [
  "scripts/lib/producer-audio/request.ts",
  "scripts/lib/producer-audio/captions.ts",
  "scripts/lib/producer-audio/types.ts",
  "src/remotion/standalone-video/timeline.ts",
  "src/remotion/standalone-video/types.ts",
  "src/remotion/standalone-video/runtime.tsx",
  "src/remotion/producer-samples/scaffold/SampleName/types.ts",
];
for (const sourcePath of futureCaptionConsumers) {
  const source = read(sourcePath);
  assert(
    source.includes("standalone-video/caption-types") ||
      source.includes('./caption-types') ||
      source.includes('"./caption-types"'),
    `${sourcePath} must use the Producer-owned caption contract`,
  );
  assert(!source.includes("lib/caption-schema"), `${sourcePath} must not use Web caption schema`);
}

for (const compatibilityPath of [
  "src/lib/caption-schema.ts",
  "src/lib/storyboard-plan-schema.ts",
  "src/lib/template-registry.ts",
  "src/remotion/recipes/blocks",
  "src/remotion/recipes/timing",
]) {
  assert(existsSync(absolute(compatibilityPath)), `${compatibilityPath} frozen compatibility`);
}
for (const sourcePath of ["src/lib/storyboard-plan-schema.ts", "src/lib/template-registry.ts"]) {
  const source = read(sourcePath);
  assert(!source.includes("src/templates"), `${sourcePath} must not reference src/templates`);
  assert(!source.includes("../templates"), `${sourcePath} must not import templates`);
  assert(!source.includes("PlannerRecipe"), `${sourcePath} must not expose planner manifests`);
}

for (const sourcePath of [
  ".agents/skills/ai-video-studio-agent-producer/SKILL.md",
  "src/remotion/producer-samples/scaffold/README.md",
  "src/remotion/producer-samples/scaffold/SampleName/types.ts",
]) {
  assert(
    !read(sourcePath).includes("src/remotion/recipes/blocks"),
    `${sourcePath} must not route future work to frozen recipe blocks`,
  );
}

console.log("Agent Producer Web removal smoke passed.");
