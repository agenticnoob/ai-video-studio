#!/usr/bin/env node
/* global console, process */

import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

const execFileAsync = promisify(execFile);
const moduleFlagIndex = process.argv.indexOf("--module");
const modulePath = moduleFlagIndex >= 0 ? process.argv[moduleFlagIndex + 1] : undefined;
if (!modulePath) throw new Error("Usage: npm run producer:quality -- --module <quality-module>");

const absoluteModulePath = path.resolve(modulePath);
const relativeModulePath = path.relative(process.cwd(), absoluteModulePath);
if (relativeModulePath.startsWith("..") || path.isAbsolute(relativeModulePath)) {
  throw new Error("Quality module must live inside the repository.");
}
const buildRoot = "/tmp/producer-quality-cli-build";
await rm(buildRoot, { recursive: true, force: true });
const compileSources = [
  "scripts/lib/producer-quality-gates.ts",
  "scripts/lib/producer-quality-analysis.ts",
];
if (modulePath.endsWith(".ts")) compileSources.push(relativeModulePath);
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
  ...compileSources,
]);

const gatesPath = path.join(buildRoot, "scripts/lib/producer-quality-gates.js");
const analysisPath = path.join(buildRoot, "scripts/lib/producer-quality-analysis.js");
if (!existsSync(gatesPath) || !existsSync(analysisPath)) {
  throw new Error(
    "TypeScript quality build produced no output; run inside the Docker producer service.",
  );
}
const importedModulePath = modulePath.endsWith(".ts")
  ? path.join(buildRoot, relativeModulePath.replace(/\.ts$/, ".js"))
  : absoluteModulePath;
const qualityModule = await import(pathToFileURL(importedModulePath).href);
if (!qualityModule.producerQualityPlan) {
  throw new Error("Quality module must export producerQualityPlan.");
}
const { collectProducerQualityEvidence } = await import(pathToFileURL(analysisPath).href);
const { validateProducerQualityGateInput } = await import(pathToFileURL(gatesPath).href);
const evidence = await collectProducerQualityEvidence(qualityModule.producerQualityPlan);
validateProducerQualityGateInput(evidence);
console.log(`Producer quality gates passed: ${qualityModule.producerQualityPlan.compositionId}.`);
