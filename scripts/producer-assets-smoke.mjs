/* global console */

import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  assertProducerAssetManifest,
  localizeProducerAssets,
  preflightProducerAssets,
  serializeProducerAssetManifest,
} from "./lib/producer-assets/index.js";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

for (const command of ["producer:assets", "producer:preflight", "smoke:producer-assets"]) {
  assert(packageJson.scripts[command], `Missing Phase 5 command: ${command}`);
}

for (const file of [
  "src/remotion/producer-samples/asset-manifest.ts",
  "scripts/lib/producer-assets/index.ts",
  "scripts/producer-assets.mjs",
  "scripts/preflight-producer-assets.mjs",
  "src/remotion/producer-samples/scaffold/SampleName/assets.supply.json",
  "src/remotion/producer-samples/scaffold/SampleName/assets.manifest.json",
  "docs/PRODUCER_ASSET_CONTRACT.md",
]) {
  assert(existsSync(file), `Missing Phase 5 surface: ${file}`);
}

const primitiveSources = [
  "src/remotion/primitives/cinematic/KenBurns.tsx",
  "src/remotion/primitives/cinematic/ParallaxPan.tsx",
  "src/remotion/primitives/cinematic/ZoomPulse.tsx",
].map((file) => readFileSync(file, "utf8"));
assert(
  primitiveSources.every((source) => !/https?:\/\//i.test(source)),
  "Producer primitives must not contain remote default assets.",
);

const rootDir = await mkdtemp(path.join(os.tmpdir(), "producer-assets-smoke-"));
try {
  await mkdir(path.join(rootDir, "inputs"), { recursive: true });
  const manualSvgPath = path.join(rootDir, "inputs/manual.svg");
  const urlSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="800" height="450" fill="#123456"/></svg>';
  await writeFile(
    manualSvgPath,
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#abcdef"/></svg>',
  );

  const supplyPlan = {
    version: 1,
    compositionId: "FixtureAssets",
    slug: "fixture-assets",
    outputManifestPath: "src/remotion/FixtureAssets/assets.manifest.json",
    assets: [
      {
        id: "manual-diagram",
        kind: "svg",
        purpose: "Show the manual localization path.",
        source: { provider: "user-supplied", license: "CC0-1.0" },
        acquisition: { type: "manual", sourcePath: "inputs/manual.svg" },
        destination: { scope: "composition", fileName: "manual.svg" },
        requirements: { minWidth: 320, minHeight: 180 },
      },
      {
        id: "captured-source",
        kind: "svg",
        purpose: "Record a real source-backed capture fixture.",
        source: {
          provider: "browser-capture",
          sourceUrl: "https://example.com/source",
          creator: "Example Publisher",
          license: "fixture-review-use",
          attribution: "Example Publisher",
          attributionRequired: true,
        },
        acquisition: { type: "url", url: "https://example.com/source" },
        destination: { scope: "library", fileName: "captured-source.svg" },
      },
    ],
  };
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    arrayBuffer: async () => Uint8Array.from(Buffer.from(urlSvg)).buffer,
  });
  const manifest = await localizeProducerAssets({ plan: supplyPlan, rootDir, fetchImpl });
  assert.equal(manifest.assets.length, 2);
  assert.equal(manifest.assets[0].media?.width, 640);
  assert.equal(manifest.assets[1].media?.height, 450);
  assert.equal(manifest.assets[0].integrity.sha256.length, 64);
  assert.doesNotThrow(() => assertProducerAssetManifest(manifest));
  assert.equal(serializeProducerAssetManifest(manifest), `${JSON.stringify(manifest, null, 2)}\n`);
  await assert.doesNotReject(() => preflightProducerAssets({ manifest, rootDir }));

  const localizedManualPath = path.join(
    rootDir,
    "public/generated/fixture-assets/assets/manual.svg",
  );
  const originalManual = await readFile(localizedManualPath);
  await writeFile(localizedManualPath, `${originalManual.toString("utf8")}\n<!-- tampered -->`);
  await assert.rejects(
    () => preflightProducerAssets({ manifest, rootDir }),
    /manual-diagram.*(size|checksum)/i,
  );
  await writeFile(localizedManualPath, originalManual);
  await rm(localizedManualPath);
  await assert.rejects(
    () => preflightProducerAssets({ manifest, rootDir }),
    /manual-diagram.*missing/i,
  );
  await writeFile(localizedManualPath, originalManual);

  await assert.rejects(
    () =>
      localizeProducerAssets({
        rootDir,
        fetchImpl,
        plan: {
          ...supplyPlan,
          outputManifestPath: "src/remotion/FixtureAssets/duplicate.manifest.json",
          assets: [
            supplyPlan.assets[0],
            {
              ...supplyPlan.assets[0],
              id: "duplicate-diagram",
              destination: { scope: "composition", fileName: "duplicate.svg" },
            },
          ],
        },
      }),
    /duplicate producer asset checksum/i,
  );

  await assert.rejects(
    () =>
      localizeProducerAssets({
        rootDir,
        fetchImpl,
        plan: {
          ...supplyPlan,
          outputManifestPath: "src/remotion/FixtureAssets/bad-attribution.manifest.json",
          assets: [
            {
              ...supplyPlan.assets[1],
              id: "bad-attribution",
              source: {
                provider: "browser-capture",
                sourceUrl: "https://example.com/source",
                license: "fixture-review-use",
                attributionRequired: true,
              },
              destination: { scope: "library", fileName: "bad-attribution.svg" },
            },
          ],
        },
      }),
    /complete creator and attribution/i,
  );

  assert.throws(
    () =>
      assertProducerAssetManifest({
        ...manifest,
        assets: [{ ...manifest.assets[0], localPath: "https://example.com/remote.svg" }],
      }),
    /repository-relative local path/i,
  );
  assert.throws(
    () => assertProducerAssetManifest({ ...manifest, prompt: "generate an image" }),
    /generation field prompt/i,
  );

  const videoInputPath = path.join(rootDir, "inputs/source.avi");
  execFileSync("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-f",
    "lavfi",
    "-i",
    "testsrc2=size=320x180:rate=24",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=880:sample_rate=44100",
    "-t",
    "1",
    "-c:v",
    "mpeg4",
    "-c:a",
    "pcm_s16le",
    videoInputPath,
  ]);
  const videoManifest = await localizeProducerAssets({
    rootDir,
    plan: {
      version: 1,
      compositionId: "FixtureVideoAssets",
      slug: "fixture-video-assets",
      outputManifestPath: "src/remotion/FixtureVideoAssets/assets.manifest.json",
      assets: [
        {
          id: "formal-video",
          kind: "video",
          purpose: "Verify formal video normalization.",
          source: { provider: "user-supplied", license: "fixture-only" },
          acquisition: { type: "manual", sourcePath: videoInputPath },
          destination: { scope: "composition", fileName: "formal-video.mp4" },
          requirements: { minWidth: 320, minHeight: 180, minDurationInSeconds: 0.9 },
        },
      ],
    },
  });
  const video = videoManifest.assets[0];
  assert.equal(video.media?.codec, "h264");
  assert.equal(video.media?.pixelFormat, "yuv420p");
  assert.equal(video.media?.audioCodec, "aac");
  assert.equal(video.media?.constantFrameRate, true);
  await assert.doesNotReject(() => preflightProducerAssets({ manifest: videoManifest, rootDir }));

  await assert.rejects(
    () =>
      preflightProducerAssets({
        rootDir,
        manifest: {
          ...manifest,
          assets: [
            {
              ...manifest.assets[0],
              requirements: { minWidth: 9999 },
            },
          ],
        },
      }),
    /undersized/i,
  );
} finally {
  await rm(rootDir, { recursive: true, force: true });
}

console.log("Producer asset supply smoke passed.");
