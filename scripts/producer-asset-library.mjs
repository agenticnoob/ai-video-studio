#!/usr/bin/env node
/* global console, process */

import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

const operation = process.argv[2];
const valueFor = (flag) => {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
};
const has = (flag) => process.argv.includes(flag);

if (!operation) throw new Error("Missing Producer asset-library operation.");

const execFileAsync = promisify(execFile);
const buildRoot = "/tmp/producer-asset-library-cli-build";
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
  "scripts/lib/producer-asset-library/index.ts",
  "scripts/lib/producer-asset-library/types.ts",
  "scripts/lib/producer-asset-library/validate.ts",
  "scripts/lib/producer-asset-library/catalog.ts",
  "scripts/lib/producer-asset-library/search.ts",
  "scripts/lib/producer-asset-library/transactions.ts",
  "src/remotion/styles/profile-ids.ts",
  "src/remotion/producer-samples/asset-manifest.ts",
]);
const runtime = await import(
  pathToFileURL(path.join(buildRoot, "scripts/lib/producer-asset-library/index.js")).href
);

const jsonFile = async (flag) => {
  const filePath = valueFor(flag);
  if (!filePath) throw new Error(`${operation} requires ${flag} <json>.`);
  return JSON.parse(await readFile(path.resolve(filePath), "utf8"));
};
const emit = (value) =>
  console.log(has("--json") ? JSON.stringify(value, null, 2) : (value.id ?? value));

if (operation === "add" || operation === "ingest") {
  const filePath = valueFor("--file");
  if (!filePath) throw new Error(`${operation} requires --file <path>.`);
  const input = { filePath, metadata: await jsonFile("--metadata") };
  emit(
    operation === "add"
      ? await runtime.addAssetLibraryItem(input)
      : await runtime.ingestAssetLibraryItem(input),
  );
} else if (operation === "validate") {
  const items = await runtime.validateAssetLibrary();
  emit(has("--json") ? items : `Asset library valid: ${items.length} item(s).`);
} else if (operation === "list") {
  const catalog = await runtime.buildAssetLibraryViews({ check: true });
  const items = valueFor("--status")
    ? runtime.searchAssetLibrary(catalog, { status: valueFor("--status") })
    : catalog.items;
  if (has("--json")) console.log(JSON.stringify(items, null, 2));
  else items.forEach((item) => console.log(`${item.id}\t${item.kind}\t${item.lifecycle.status}`));
} else if (operation === "search") {
  const catalog = await runtime.buildAssetLibraryViews({ check: true });
  const results = runtime.searchAssetLibrary(catalog, {
    text: valueFor("--text"),
    kind: valueFor("--kind"),
    tag: valueFor("--tag"),
    styleProfileId: valueFor("--style-profile"),
    role: valueFor("--role"),
    aspectRatioGroup: valueFor("--aspect"),
    status: valueFor("--status"),
  });
  if (has("--json")) console.log(JSON.stringify(results, null, 2));
  else results.forEach((item) => console.log(`${item.id}\t${item.title}`));
} else if (operation === "update") {
  const id = valueFor("--id");
  if (!id) throw new Error("update requires --id <asset-id>.");
  emit(await runtime.updateAssetLibraryItem({ id, patch: await jsonFile("--metadata") }));
} else if (operation === "deprecate") {
  const id = valueFor("--id");
  const reason = valueFor("--reason");
  if (!id || !reason) throw new Error("deprecate requires --id <asset-id> --reason <text>.");
  emit(await runtime.deprecateAssetLibraryItem({ id, reason }));
} else if (operation === "build") {
  const catalog = await runtime.buildAssetLibraryViews({ check: has("--check") });
  emit(has("--json") ? catalog : `Asset library views ready: ${catalog.items.length} item(s).`);
} else {
  throw new Error(`Unknown Producer asset-library operation: ${operation}.`);
}
