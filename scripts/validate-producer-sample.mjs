#!/usr/bin/env node
/* global console, process */

import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

const execFileAsync = promisify(execFile);
const moduleFlagIndex = process.argv.indexOf("--module");
const modulePath = moduleFlagIndex >= 0 ? process.argv[moduleFlagIndex + 1] : undefined;
if (!modulePath) throw new Error("Usage: npm run producer:validate -- --module <validation-module>");

const { producerValidationInput } = await import(pathToFileURL(path.resolve(modulePath)).href);
if (!producerValidationInput) throw new Error("Validation module must export producerValidationInput.");
const buildRoot = "/tmp/producer-validation-cli-build";
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
  "--outDir",
  buildRoot,
  "scripts/lib/producer-validation.ts",
  "scripts/lib/producer-audio/types.ts",
  "scripts/lib/producer-audio/captions.ts",
]);
const validationModulePath = path.join(buildRoot, "scripts/lib/producer-validation.js");
const { validateProducerSample } = await import(pathToFileURL(validationModulePath).href);

await validateProducerSample({
  ...producerValidationInput,
  isIgnoredPath: async (artifactPath) => {
    try {
      await execFileAsync("git", ["check-ignore", "-q", artifactPath]);
      return true;
    } catch {
      return false;
    }
  },
});

console.log(`Producer sample ${producerValidationInput.compositionId} passed mechanical validation.`);
