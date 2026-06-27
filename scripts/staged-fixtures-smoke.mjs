/* global console, process */

import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["remotion", "compositions", "src/remotion/index.ts"], {
  encoding: "utf8",
});

if (result.stdout) {
  process.stdout.write(result.stdout);
}
if (result.stderr) {
  process.stderr.write(result.stderr);
}
if (result.error) {
  throw result.error;
}
if (result.status !== 0) {
  throw new Error(`remotion compositions exited with status ${result.status ?? "unknown"}`);
}

const requiredCompositionIds = [
  "ProjectVideo",
  "RecipeShowcasePreview",
  "ScriptedTemplatePreview",
  "SpotlightTemplatePreview",
  "StatsDashboardTemplatePreview",
  "TechnicalExplainerTemplatePreview",
];

for (const compositionId of requiredCompositionIds) {
  if (!result.stdout.includes(compositionId)) {
    throw new Error(`Missing Remotion composition: ${compositionId}`);
  }
}

console.log("staged fixtures smoke passed.");
