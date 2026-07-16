#!/usr/bin/env node
/* global console, process */

import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const valueFor = (flag) => {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
};
const compositionId = valueFor("--composition");
if (!compositionId)
  throw new Error("Usage: npm run producer:stills -- --composition <id> [--scale 0.5] [--dry-run]");
const scale = Number(valueFor("--scale") ?? "0.5");
if (!(scale > 0)) throw new Error("--scale must be a positive number.");
const dryRun = process.argv.includes("--dry-run");
const registryModule = valueFor("--registry-module");

const buildRoot = "/tmp/producer-review-frames-cli-build";
const { execFile } = await import("node:child_process");
const { promisify } = await import("node:util");
const execFileAsync = promisify(execFile);
await execFileAsync("rm", ["-rf", buildRoot]);
await execFileAsync("npx", [
  "tsc",
  "--target",
  "es2022",
  "--module",
  "commonjs",
  "--moduleResolution",
  "node",
  "--skipLibCheck",
  "--esModuleInterop",
  "--noEmit",
  "false",
  "--rootDir",
  ".",
  "--outDir",
  buildRoot,
  "scripts/lib/producer-review-frames.ts",
  "scripts/lib/producer-assets/index.ts",
  "scripts/lib/producer-assets/types.ts",
  "scripts/lib/producer-assets/serialize.ts",
  "scripts/lib/producer-assets/metadata.ts",
  "scripts/lib/producer-assets/audio-quality.ts",
  "scripts/lib/producer-assets/localize.ts",
  "scripts/lib/producer-assets/preflight.ts",
  "src/remotion/producer-samples/asset-manifest.ts",
  "src/remotion/producer-samples/manifest.ts",
]);
const { buildProducerReviewFrameJobs } = await import(
  pathToFileURL(path.join(buildRoot, "scripts/lib/producer-review-frames.js")).href
);
const { preflightProducerAssets, readProducerAssetManifest } = await import(
  pathToFileURL(path.join(buildRoot, "scripts/lib/producer-assets/index.js")).href
);

let manifest;
if (registryModule) {
  const absoluteRegistryModule = path.resolve(registryModule);
  let importPath = absoluteRegistryModule;
  if (absoluteRegistryModule.endsWith(".ts")) {
    await execFileAsync("npx", [
      "tsc",
      "--target",
      "es2022",
      "--module",
      "commonjs",
      "--moduleResolution",
      "node",
      "--skipLibCheck",
      "--esModuleInterop",
      "--noEmit",
      "false",
      "--rootDir",
      ".",
      "--outDir",
      buildRoot,
      registryModule,
      "src/remotion/producer-samples/manifest.ts",
    ]);
    importPath = path.join(buildRoot, registryModule.replace(/\.ts$/, ".js"));
  }
  const imported = await import(pathToFileURL(importPath).href);
  manifest = imported.fixtureProducerManifest ?? imported.manifest;
} else {
  await execFileAsync("npx", [
    "tsc",
    "--target",
    "es2022",
    "--module",
    "commonjs",
    "--moduleResolution",
    "node",
    "--skipLibCheck",
    "--esModuleInterop",
    "--noEmit",
    "false",
    "--rootDir",
    ".",
    "--outDir",
    buildRoot,
    "src/remotion/producer-samples/registry.ts",
    "src/remotion/producer-samples/manifest.ts",
  ]);
  const registry = await import(
    pathToFileURL(path.join(buildRoot, "src/remotion/producer-samples/registry.js")).href
  );
  manifest = registry.getProducerSampleManifestByCompositionId(compositionId);
}
if (!manifest || manifest.compositionId !== compositionId)
  throw new Error(`Unknown producer sample composition: ${compositionId}`);

if (manifest.sampleStatus === "maintained") {
  const assetManifest = await readProducerAssetManifest(path.resolve(manifest.assets.manifestPath));
  await preflightProducerAssets({ manifest: assetManifest });
}

const jobs = buildProducerReviewFrameJobs({ manifest, scale });
for (const job of jobs) {
  console.log(`${dryRun ? "DRY RUN" : "RENDER"}: npx ${job.args.join(" ")}`);
  if (dryRun) continue;
  await mkdir(path.dirname(job.outputPath), { recursive: true });
  await new Promise((resolve, reject) => {
    const child = spawn("npx", job.args, { stdio: "inherit" });
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`Remotion still failed with exit code ${code}.`)),
    );
  });
  console.log(job.outputPath);
}
const summaryPath = path.posix.join("out", manifest.slug, "review-frames", "review-summary.json");
if (!dryRun) {
  await mkdir(path.dirname(summaryPath), { recursive: true });
  await writeFile(summaryPath, `${JSON.stringify({ compositionId, scale, jobs }, null, 2)}\n`);
}
