/* global console */

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createFixtureStockCandidate } from "../../fixtures/producer-stock-assets/fixture-candidate.mjs";
import {
  localizeProducerAssets,
  preflightProducerAssets,
} from "../../lib/producer-assets/index.js";

const rootDir = await mkdtemp(path.join(os.tmpdir(), "producer-stock-assets-smoke-"));

try {
  const candidateRoot = path.join(rootDir, "stock-candidates");
  const { candidateOriginalPath, receiptPath } = await createFixtureStockCandidate({
    candidateRoot,
  });
  const candidateBytesBefore = await readFile(candidateOriginalPath);
  const receiptBytesBefore = await readFile(receiptPath);
  const receipt = JSON.parse(receiptBytesBefore.toString("utf8"));

  const request = {
    id: "pexels-stock-2014422",
    kind: "image",
    purpose: "Fixture scene evidence image.",
    source: {
      provider: receipt.provider,
      sourceUrl: receipt.sourcePageUrl,
      sourceId: receipt.providerAssetId,
      creator: receipt.creator.name,
      license: receipt.license.name,
      attribution: receipt.providerPolicy.attributionText,
      attributionRequired: receipt.providerPolicy.attributionRequired,
    },
    acquisition: { type: "manual", sourcePath: candidateOriginalPath },
    destination: { scope: "composition", fileName: "pexels-stock-2014422.png" },
  };

  const outputManifestPath = "src/remotion/FixtureStockAssets/assets.manifest.json";
  const manifest = await localizeProducerAssets({
    rootDir,
    plan: {
      version: 1,
      compositionId: "FixtureStockAssets",
      slug: "fixture-stock-assets",
      outputManifestPath,
      assets: [request],
    },
  });
  await preflightProducerAssets({ manifest, rootDir });

  assert.equal(manifest.assets.length, 1);
  const [asset] = manifest.assets;
  assert.equal(
    asset.localPath,
    "public/generated/fixture-stock-assets/assets/pexels-stock-2014422.png",
  );
  assert.deepEqual(asset.source, request.source);
  assert.equal(asset.integrity.sha256, receipt.file.sha256);
  assert.equal(asset.integrity.sizeInBytes, receipt.file.sizeInBytes);
  assert.equal(asset.media?.width, receipt.file.width);
  assert.equal(asset.media?.height, receipt.file.height);

  const localizedBytes = await readFile(path.join(rootDir, asset.localPath));
  assert.deepEqual(localizedBytes, candidateBytesBefore);
  assert.deepEqual(await readFile(candidateOriginalPath), candidateBytesBefore);
  assert.deepEqual(await readFile(receiptPath), receiptBytesBefore);
  assert.equal(
    existsSync(path.join(rootDir, "public/assets/library/items")),
    false,
    "The fixture must not enter the reusable asset library.",
  );

  const persistedManifest = JSON.parse(
    await readFile(path.join(rootDir, outputManifestPath), "utf8"),
  );
  assert.equal(JSON.stringify(persistedManifest).includes(candidateRoot), false);
  assert.equal(persistedManifest.assets[0].localPath.startsWith("http"), false);
  assert.equal(persistedManifest.assets[0].localPath.includes("stock-candidates"), false);
} finally {
  await rm(rootDir, { recursive: true, force: true });
}

console.log("Producer stock-assets integration smoke passed.");
