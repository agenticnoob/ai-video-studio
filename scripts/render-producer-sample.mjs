#!/usr/bin/env node
/* global console, process */

import { spawn } from "node:child_process";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

const valueFor = (flag) => {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const compositionId = valueFor("--composition");
const dryRun = process.argv.includes("--dry-run");
if (!compositionId) {
  throw new Error("Usage: npm run producer:render -- --composition <id> [--dry-run]");
}

const execFileAsync = promisify(execFile);
const buildRoot = "/tmp/producer-render-cli-build";
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
  "scripts/lib/producer-render.ts",
  "src/remotion/producer-samples/manifest.ts",
  "src/remotion/producer-samples/registry.ts",
]);

const registryModulePath = path.join(buildRoot, "src/remotion/producer-samples/registry.js");
const rendererModulePath = path.join(buildRoot, "scripts/lib/producer-render.js");
if (!existsSync(registryModulePath) || !existsSync(rendererModulePath)) {
  throw new Error(
    "TypeScript render build produced no output; run this command in the Docker producer service.",
  );
}

const registry = await import(pathToFileURL(registryModulePath).href);
const renderer = await import(pathToFileURL(rendererModulePath).href);
const manifest = registry.getProducerSampleManifestByCompositionId(compositionId);
if (!manifest) throw new Error(`Unknown producer sample composition: ${compositionId}`);

const jobs = renderer.buildProducerRenderJobs({ manifest });
for (const job of jobs) {
  console.log(`${dryRun ? "DRY RUN" : "RUN"}: ${job.command} ${job.args.join(" ")}`);
  if (dryRun) continue;
  await new Promise((resolve, reject) => {
    const child = spawn(job.command, job.args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${job.kind} failed with exit code ${code}.`)),
    );
  });
  for (const outputPath of job.outputPaths) console.log(outputPath);
}
