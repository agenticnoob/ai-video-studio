#!/usr/bin/env node
/* global console, process */

import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

const execFileAsync = promisify(execFile);
const moduleFlagIndex = process.argv.indexOf("--module");
const modulePath = moduleFlagIndex >= 0 ? process.argv[moduleFlagIndex + 1] : undefined;
if (!modulePath)
  throw new Error("Usage: npm run producer:validate -- --module <validation-module>");

const buildRoot = "/tmp/producer-validation-cli-build";
await execFileAsync("rm", ["-rf", buildRoot]);
const absoluteModulePath = path.resolve(modulePath);
const relativeModulePath = path.relative(process.cwd(), absoluteModulePath);
if (relativeModulePath.startsWith("..")) {
  throw new Error("Validation module must live inside the repository.");
}
const compileSources = [
  "scripts/lib/producer-validation.ts",
  "scripts/lib/producer-audio/types.ts",
  "scripts/lib/producer-audio/captions.ts",
  "src/remotion/producer-samples/manifest.ts",
  "src/remotion/producer-samples/asset-manifest.ts",
  "src/remotion/producer-samples/creative-contract.ts",
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
  "--resolveJsonModule",
  "--noEmit",
  "false",
  "--rootDir",
  ".",
  "--outDir",
  buildRoot,
  ...compileSources,
]);
const validationModulePath = path.join(buildRoot, "scripts/lib/producer-validation.js");
if (!existsSync(validationModulePath)) {
  throw new Error(
    "TypeScript validation build produced no output; run this command in the Docker producer service.",
  );
}
const { validateProducerSample } = await import(pathToFileURL(validationModulePath).href);
const importedValidationModulePath = modulePath.endsWith(".ts")
  ? path.join(buildRoot, relativeModulePath.replace(/\.ts$/, ".js"))
  : absoluteModulePath;
const { producerValidationInput } = await import(pathToFileURL(importedValidationModulePath).href);
if (!producerValidationInput)
  throw new Error("Validation module must export producerValidationInput.");

const creativeValidationInput = {};
const creativeContract = producerValidationInput.manifest?.creativeContract;
if (creativeContract) {
  const visualIntentRelativePath = path.normalize(creativeContract.visualIntentModule);
  if (
    visualIntentRelativePath.startsWith("..") ||
    path.isAbsolute(visualIntentRelativePath) ||
    !visualIntentRelativePath.endsWith(".ts")
  ) {
    throw new Error("Creative visual-intent module must be a repository-local TypeScript file.");
  }
  const compiledVisualIntentPath = path.join(
    buildRoot,
    visualIntentRelativePath.replace(/\.ts$/u, ".js"),
  );
  if (!existsSync(compiledVisualIntentPath)) {
    throw new Error(
      `Creative visual-intent module was not compiled from its manifest path: ${creativeContract.visualIntentModule}.`,
    );
  }
  const { producerVisualIntents } = await import(pathToFileURL(compiledVisualIntentPath).href);
  if (!producerVisualIntents) {
    throw new Error("Creative visual-intent module must export producerVisualIntents.");
  }
  creativeValidationInput.visualIntentSource = {
    path: creativeContract.visualIntentModule,
    intents: producerVisualIntents,
  };
  creativeValidationInput.readRendererSource = async (sourcePath) => {
    const absoluteSourcePath = path.resolve(sourcePath);
    const relativeSourcePath = path.relative(process.cwd(), absoluteSourcePath);
    if (relativeSourcePath.startsWith("..") || path.isAbsolute(relativeSourcePath)) {
      throw new Error(`Renderer source path escapes the repository: ${sourcePath}.`);
    }
    try {
      return await readFile(absoluteSourcePath, "utf8");
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        return undefined;
      }
      throw error;
    }
  };
}

await validateProducerSample({
  ...producerValidationInput,
  ...creativeValidationInput,
  isIgnoredPath: async (artifactPath) => {
    try {
      await execFileAsync("git", ["check-ignore", "-q", artifactPath]);
      return true;
    } catch {
      return false;
    }
  },
});

console.log(
  `Producer sample ${producerValidationInput.compositionId} passed mechanical validation.`,
);
