#!/usr/bin/env node
/* global console, process */

import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

const valueFor = (flag) => {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const planPath = valueFor("--manifest");
if (!planPath) {
  throw new Error("Usage: npm run producer:assets -- --manifest <supply-plan-json>");
}

const execFileAsync = promisify(execFile);
const buildRoot = "/tmp/producer-assets-cli-build";
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
  "src/remotion/producer-samples/asset-manifest.ts",
  "scripts/lib/producer-assets/index.ts",
  "scripts/lib/producer-assets/types.ts",
  "scripts/lib/producer-assets/serialize.ts",
  "scripts/lib/producer-assets/metadata.ts",
  "scripts/lib/producer-assets/localize.ts",
  "scripts/lib/producer-assets/preflight.ts",
]);

const runtime = await import(
  pathToFileURL(path.join(buildRoot, "scripts/lib/producer-assets/index.js")).href
);
const plan = await runtime.readProducerAssetSupplyPlan(path.resolve(planPath));
const manifest = await runtime.localizeProducerAssets({ plan });
for (const asset of manifest.assets) console.log(`${asset.id}: ${asset.localPath}`);
console.log(`Producer asset manifest: ${plan.outputManifestPath}`);
