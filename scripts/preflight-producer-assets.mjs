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

const compositionId = valueFor("--composition");
const directManifestPath = valueFor("--manifest");
if ((!compositionId && !directManifestPath) || (compositionId && directManifestPath)) {
  throw new Error(
    "Usage: npm run producer:preflight -- --composition <id> OR --manifest <asset-manifest-json>",
  );
}

const execFileAsync = promisify(execFile);
const buildRoot = "/tmp/producer-assets-preflight-cli-build";
await execFileAsync("rm", ["-rf", buildRoot]);
const sources = [
  "src/remotion/producer-samples/asset-manifest.ts",
  "scripts/lib/producer-assets/index.ts",
  "scripts/lib/producer-assets/types.ts",
  "scripts/lib/producer-assets/serialize.ts",
  "scripts/lib/producer-assets/metadata.ts",
  "scripts/lib/producer-assets/localize.ts",
  "scripts/lib/producer-assets/preflight.ts",
];
if (compositionId) {
  sources.push(
    "src/remotion/producer-samples/manifest.ts",
    "src/remotion/producer-samples/registry.ts",
  );
}
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
  ...sources,
]);

const runtime = await import(
  pathToFileURL(path.join(buildRoot, "scripts/lib/producer-assets/index.js")).href
);
let assetManifestPath = directManifestPath;
if (compositionId) {
  const registry = await import(
    pathToFileURL(path.join(buildRoot, "src/remotion/producer-samples/registry.js")).href
  );
  const sampleManifest = registry.getProducerSampleManifestByCompositionId(compositionId);
  if (!sampleManifest) throw new Error(`Unknown producer sample composition: ${compositionId}`);
  if (sampleManifest.sampleStatus !== "maintained") {
    throw new Error(
      `${compositionId} is a frozen reference and has no maintained asset preflight.`,
    );
  }
  assetManifestPath = sampleManifest.assets.manifestPath;
}

const manifest = await runtime.readProducerAssetManifest(path.resolve(assetManifestPath));
await runtime.preflightProducerAssets({ manifest });
console.log(
  `Producer asset preflight passed: ${manifest.compositionId} (${manifest.assets.length}).`,
);
