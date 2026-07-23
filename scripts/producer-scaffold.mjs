#!/usr/bin/env node
/* global console, process */

import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const valueFor = (flag) => {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const name = valueFor("--name");
const slug = valueFor("--slug");
const styleProfileId = valueFor("--style-profile");
const voiceProfileId = valueFor("--voice-profile");
const outputRoot = valueFor("--output-root") ?? "src/remotion";
const styleProfileIds = [
  "editorial-tech",
  "comic-anime",
  "cinematic-3d",
  "retro-terminal",
  "documentary-media",
  "hand-drawn-explainer",
];
const voiceProfileRegistry = JSON.parse(
  await readFile(path.resolve("scripts/lib/producer-audio/voice-profiles.json"), "utf8"),
);
const voiceProfiles = voiceProfileRegistry.profiles;
const voiceProfile = voiceProfiles.find((candidate) => candidate.id === voiceProfileId);

if (!name || !slug || !styleProfileId || !voiceProfileId) {
  throw new Error(
    "Usage: npm run producer:scaffold -- --name <PascalCase> --slug <kebab-case> --style-profile <profile-id> --voice-profile <voice-profile-id> [--output-root <path>]",
  );
}
if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) throw new Error("--name must be PascalCase.");
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("--slug must be kebab-case.");
if (!styleProfileIds.includes(styleProfileId)) {
  throw new Error(`--style-profile must be one of: ${styleProfileIds.join(", ")}.`);
}
if (!voiceProfile) {
  throw new Error(
    `--voice-profile must be one of: ${voiceProfiles.map((profile) => profile.id).join(", ")}.`,
  );
}

const templateRoot = path.resolve("src/remotion/producer-samples/scaffold/SampleName");
const destinationRoot = path.resolve(outputRoot, name);
try {
  await stat(destinationRoot);
  throw new Error(`Scaffold destination already exists: ${destinationRoot}`);
} catch (error) {
  if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
    // Expected for a new scaffold.
  } else {
    throw error;
  }
}

const lowerCamelName = `${name[0].toLowerCase()}${name.slice(1)}`;
const constantName = name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase();
const replaceTokens = (source) =>
  source
    .replaceAll("sampleName:", "__PRODUCER_MANIFEST_DISPLAY_FIELD__:")
    .replaceAll("SAMPLE_NAME", constantName)
    .replaceAll("SampleName", name)
    .replaceAll("sampleName", lowerCamelName)
    .replaceAll("sample-name", slug)
    .replaceAll('"editorial-tech" /* STYLE_PROFILE_ID */', JSON.stringify(styleProfileId))
    .replaceAll('"lyy" /* VOICE_PROFILE_ID */', JSON.stringify(voiceProfile.id))
    .replaceAll('"high-fidelity-clone" /* VOICE_MODE */', JSON.stringify(voiceProfile.defaultMode))
    .replaceAll('"../../../standalone-video', '"../standalone-video')
    .replaceAll('"../../../../../scripts', '"../../../scripts')
    .replaceAll('"../../manifest"', '"../producer-samples/manifest"')
    .replaceAll('"../../asset-manifest"', '"../producer-samples/asset-manifest"')
    .replaceAll('"../../creative-contract"', '"../producer-samples/creative-contract"')
    .replaceAll("__PRODUCER_MANIFEST_DISPLAY_FIELD__", "sampleName");

await mkdir(destinationRoot, { recursive: true });
for (const filename of await readdir(templateRoot)) {
  const sourcePath = path.join(templateRoot, filename);
  if (!(await stat(sourcePath)).isFile()) continue;
  const destinationName = filename.replaceAll("SampleName", name);
  const source = await readFile(sourcePath, "utf8");
  await writeFile(path.join(destinationRoot, destinationName), replaceTokens(source));
}

console.log(`Created Producer scaffold: ${path.relative(process.cwd(), destinationRoot)}`);
console.log(`Register composition: ${name}`);
console.log(`Register cover Stills: ${name}Cover16x9 and ${name}Cover9x16`);
console.log("Then add the maintained manifest to src/remotion/producer-samples/registry.ts.");
