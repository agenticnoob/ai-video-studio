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

  const cleanAudioInputPath = path.join(rootDir, "inputs/clean-audio.wav");
  execFileSync("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=440:sample_rate=48000:duration=2",
    "-af",
    "volume=0.25",
    cleanAudioInputPath,
  ]);
  const cleanAudioManifest = await localizeProducerAssets({
    rootDir,
    plan: {
      version: 1,
      compositionId: "FixtureSoundAssets",
      slug: "fixture-sound-assets",
      outputManifestPath: "src/remotion/FixtureSoundAssets/assets.manifest.json",
      assets: [
        {
          id: "clean-bgm",
          kind: "audio",
          purpose: "Verify a licensed local background-music asset.",
          source: { provider: "repo-ffmpeg-fixture", license: "CC0-1.0" },
          acquisition: { type: "manual", sourcePath: cleanAudioInputPath },
          destination: { scope: "composition", fileName: "clean-bgm.wav" },
          sound: { role: "bgm", maxAllowedPeakDb: -1, maxSilenceSeconds: 0.5 },
        },
      ],
    },
  });
  assert.equal(cleanAudioManifest.assets[0].sound?.role, "bgm");
  await assert.doesNotReject(() =>
    preflightProducerAssets({ manifest: cleanAudioManifest, rootDir }),
  );

  const clippingAudioInputPath = path.join(rootDir, "inputs/clipping-audio.wav");
  execFileSync("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=660:sample_rate=48000:duration=1",
    "-af",
    "volume=12",
    clippingAudioInputPath,
  ]);
  const clippingManifest = await localizeProducerAssets({
    rootDir,
    plan: {
      version: 1,
      compositionId: "FixtureClippingAssets",
      slug: "fixture-clipping-assets",
      outputManifestPath: "src/remotion/FixtureClippingAssets/assets.manifest.json",
      assets: [
        {
          id: "clipping-sfx",
          kind: "audio",
          purpose: "Prove peak and clipping failure.",
          source: { provider: "repo-ffmpeg-fixture", license: "CC0-1.0" },
          acquisition: { type: "manual", sourcePath: clippingAudioInputPath },
          destination: { scope: "composition", fileName: "clipping-sfx.wav" },
          sound: { role: "sfx", maxAllowedPeakDb: -1, maxSilenceSeconds: 0.5 },
        },
      ],
    },
  });
  await assert.rejects(
    () => preflightProducerAssets({ manifest: clippingManifest, rootDir }),
    /peak.*clipp/i,
  );

  const longSilenceInputPath = path.join(rootDir, "inputs/long-silence.wav");
  execFileSync("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-f",
    "lavfi",
    "-t",
    "0.4",
    "-i",
    "sine=frequency=330:sample_rate=48000",
    "-f",
    "lavfi",
    "-t",
    "1.2",
    "-i",
    "anullsrc=r=48000:cl=mono",
    "-f",
    "lavfi",
    "-t",
    "0.4",
    "-i",
    "sine=frequency=330:sample_rate=48000",
    "-filter_complex",
    "[0:a][1:a][2:a]concat=n=3:v=0:a=1,volume=0.25",
    longSilenceInputPath,
  ]);
  const longSilenceManifest = await localizeProducerAssets({
    rootDir,
    plan: {
      version: 1,
      compositionId: "FixtureSilenceAssets",
      slug: "fixture-silence-assets",
      outputManifestPath: "src/remotion/FixtureSilenceAssets/assets.manifest.json",
      assets: [
        {
          id: "long-silence-ambience",
          kind: "audio",
          purpose: "Prove long-silence failure.",
          source: { provider: "repo-ffmpeg-fixture", license: "CC0-1.0" },
          acquisition: { type: "manual", sourcePath: longSilenceInputPath },
          destination: { scope: "composition", fileName: "long-silence.wav" },
          sound: { role: "ambience", maxAllowedPeakDb: -1, maxSilenceSeconds: 0.5 },
        },
      ],
    },
  });
  await assert.rejects(
    () => preflightProducerAssets({ manifest: longSilenceManifest, rootDir }),
    /silence/i,
  );

  const lottieInputPath = path.join(rootDir, "inputs/expression-free.json");
  await writeFile(
    lottieInputPath,
    JSON.stringify({ v: "5.13.0", fr: 30, ip: 0, op: 60, w: 320, h: 180, layers: [] }),
  );
  const lottieManifest = await localizeProducerAssets({
    rootDir,
    plan: {
      version: 1,
      compositionId: "FixtureLottieAssets",
      slug: "fixture-lottie-assets",
      outputManifestPath: "src/remotion/FixtureLottieAssets/assets.manifest.json",
      assets: [
        {
          id: "expression-free-lottie",
          kind: "lottie",
          purpose: "Prove deterministic expression metadata.",
          source: { provider: "repo-authored", license: "CC0-1.0" },
          acquisition: { type: "manual", sourcePath: lottieInputPath },
          destination: { scope: "composition", fileName: "expression-free.json" },
        },
      ],
    },
  });
  assert.equal(lottieManifest.assets[0].media?.hasExpressions, false);
} finally {
  await rm(rootDir, { recursive: true, force: true });
}

console.log("Producer asset supply smoke passed.");
