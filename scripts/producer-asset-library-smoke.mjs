/* global console, process */

import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const runtimePath = "scripts/lib/producer-asset-library/index.ts";
assert(existsSync(runtimePath), "Missing standalone Producer asset-library runtime");

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
for (const command of [
  "producer:library:add",
  "producer:library:ingest",
  "producer:library:validate",
  "producer:library:list",
  "producer:library:search",
  "producer:library:update",
  "producer:library:deprecate",
  "producer:library:build",
]) {
  assert(packageJson.scripts[command], `Missing asset-library command: ${command}`);
}

for (const file of ["public/assets/library/catalog.json", "public/assets/library/index.html"]) {
  assert(existsSync(file), `Missing asset-library derived view: ${file}`);
}

const skill = readFileSync(".agents/skills/ai-video-studio-agent-producer/SKILL.md", "utf8");
const normalizedSkill = skill.replace(/\s+/gu, " ");
assert(
  skill.includes("producer:library:search"),
  "Agent Producer skill must search the reusable asset library before acquisition.",
);
for (const token of [
  "recursively inventory the requested inbox batch",
  "every description document",
  "visually inspect assets with missing semantic facts",
  "must not ask for source, author, license, rights, or attribution",
  "one atomic `producer:library:ingest` operation per accepted asset",
]) {
  assert(
    normalizedSkill.includes(token),
    `Agent Producer skill is missing inbox workflow: ${token}`,
  );
}

const buildDir = process.env.PRODUCER_ASSET_LIBRARY_BUILD_DIR;
if (!buildDir) {
  console.warn("Producer asset-library static smoke passed.");
  process.exit(0);
}

const runtime = await import(
  pathToFileURL(path.join(buildDir, "scripts/lib/producer-asset-library/index.js")).href
);
const producerAssetsRuntime = await import(
  pathToFileURL(path.join(buildDir, "scripts/lib/producer-assets/index.js")).href
);

const png = (width, height) => {
  const bytes = Buffer.alloc(45);
  Buffer.from("89504e470d0a1a0a", "hex").copy(bytes, 0);
  bytes.writeUInt32BE(13, 8);
  bytes.write("IHDR", 12, "ascii");
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);
  bytes[24] = 8;
  bytes[25] = 6;
  bytes.write("IEND", 37, "ascii");
  return bytes;
};

const jpeg = (width, height) =>
  Buffer.from([
    0xff,
    0xd8,
    0xff,
    0xc0,
    0x00,
    0x11,
    0x08,
    (height >> 8) & 0xff,
    height & 0xff,
    (width >> 8) & 0xff,
    width & 0xff,
    0x03,
    0x01,
    0x11,
    0x00,
    0x02,
    0x11,
    0x00,
    0x03,
    0x11,
    0x00,
    0xff,
    0xd9,
  ]);

const webp = (width, height) => {
  const bytes = Buffer.alloc(30);
  bytes.write("RIFF", 0, "ascii");
  bytes.writeUInt32LE(22, 4);
  bytes.write("WEBPVP8X", 8, "ascii");
  bytes.writeUInt32LE(10, 16);
  const write24 = (offset, value) => {
    bytes[offset] = value & 0xff;
    bytes[offset + 1] = (value >> 8) & 0xff;
    bytes[offset + 2] = (value >> 16) & 0xff;
  };
  write24(24, width - 1);
  write24(27, height - 1);
  return bytes;
};

const metadata = (id, kind, sourceKind = "user-provided") => ({
  version: 1,
  id,
  title: `${id} title`,
  description: `Reusable ${id} network diagram asset.`,
  kind,
  semantics: {
    subjects: ["network", id],
    keywords: ["internet", "diagram"],
    roles: ["icon", "diagram-node"],
    recommendedUses: ["network architecture diagrams"],
    avoidUses: ["photorealistic establishing shots"],
    styleProfileIds: ["editorial-tech"],
    styleTags: ["outlined", "technical"],
  },
  visual: {
    dominantColors: ["#7dd3fc"],
    transparentBackground: true,
  },
  source:
    sourceKind === "agent-authored"
      ? {
          kind: "agent-authored",
          provider: "repository",
          creator: "Agent Producer",
          license: "repository-owned",
          attributionRequired: false,
        }
      : {
          kind: "user-provided",
          provider: "user",
          creator: "Fixture User",
          license: "fixture-rights",
          rightsBasis: "User confirmed the file may be reused in this repository.",
          attributionRequired: false,
        },
  lifecycle: { status: "active" },
});

const rootDir = await mkdtemp(path.join(os.tmpdir(), "producer-asset-library-smoke-"));
try {
  await mkdir(path.join(rootDir, "public/assets/library/items"), { recursive: true });
  await mkdir(path.join(rootDir, ".producer-assets/library-inbox"), { recursive: true });
  await runtime.buildAssetLibraryViews({ rootDir });
  const emptyCatalog = JSON.parse(
    await readFile(path.join(rootDir, "public/assets/library/catalog.json"), "utf8"),
  );
  assert.deepEqual(emptyCatalog.items, []);
  const emptyHtml = await readFile(path.join(rootDir, "public/assets/library/index.html"), "utf8");
  for (const token of [
    "No reusable assets yet",
    "asset-search",
    "filter-kind",
    "filter-tag",
    "filter-style",
    "filter-role",
    "filter-aspect",
    "filter-status",
    "asset-details",
  ]) {
    assert(emptyHtml.includes(token), `Static report missing ${token}.`);
  }
  for (const forbidden of ["fetch(", "XMLHttpRequest", 'type="file"', "contenteditable"]) {
    assert(
      !emptyHtml.includes(forbidden),
      `Static report contains mutation/network token ${forbidden}.`,
    );
  }

  const inputDir = path.join(rootDir, "inputs");
  await mkdir(inputDir, { recursive: true });
  const svgPath = path.join(inputDir, "cloud.svg");
  const pngPath = path.join(rootDir, ".producer-assets/library-inbox/cloud.png");
  const jpegPath = path.join(inputDir, "photo.jpg");
  const webpPath = path.join(inputDir, "panel.webp");
  await writeFile(
    svgPath,
    '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="320"><path fill="#7dd3fc" d="M0 0h512v320H0z"/></svg>',
  );
  await writeFile(pngPath, png(80, 60));
  await writeFile(jpegPath, jpeg(96, 54));
  await writeFile(webpPath, webp(100, 100));

  await runtime.addAssetLibraryItem({
    rootDir,
    filePath: svgPath,
    metadata: metadata("network-cloud", "svg", "agent-authored"),
  });
  const sourceFreeInboxMetadata = metadata("network-png", "png");
  delete sourceFreeInboxMetadata.source;
  const ingestedInboxItem = await runtime.ingestAssetLibraryItem({
    rootDir,
    filePath: pngPath,
    metadata: sourceFreeInboxMetadata,
  });
  assert.deepEqual(ingestedInboxItem.source, {
    kind: "user-provided",
    provider: "user",
    creator: "user",
    license: "user-authorized",
    rightsBasis: "User confirmed authorization for project use",
    attributionRequired: false,
  });
  assert(existsSync(pngPath), "Inbox ingestion must preserve the original file.");
  await runtime.addAssetLibraryItem({
    rootDir,
    filePath: jpegPath,
    metadata: metadata("network-jpeg", "jpeg"),
  });
  await runtime.addAssetLibraryItem({
    rootDir,
    filePath: webpPath,
    metadata: metadata("network-webp", "webp"),
  });

  const items = await runtime.validateAssetLibrary({ rootDir });
  assert.deepEqual(
    items.map((item) => item.kind),
    ["svg", "jpeg", "png", "webp"],
  );
  const catalogSource = await readFile(
    path.join(rootDir, "public/assets/library/catalog.json"),
    "utf8",
  );
  const catalog = JSON.parse(catalogSource);
  assert.equal(catalog.items.length, 4);
  assert.deepEqual(
    catalog.items.map((item) => item.id),
    ["network-cloud", "network-jpeg", "network-png", "network-webp"],
  );
  assert(catalog.items.every((item) => item.mediaUrl.startsWith("items/")));
  const html = await readFile(path.join(rootDir, "public/assets/library/index.html"), "utf8");
  for (const id of catalog.items.map((item) => item.id)) assert(html.includes(id));
  assert(!html.includes("<script>alert"), "Imported metadata must not become executable markup.");

  assert.equal(runtime.searchAssetLibrary(catalog, { text: "internet" }).length, 4);
  assert.equal(runtime.searchAssetLibrary(catalog, { kind: "svg" })[0].id, "network-cloud");
  assert.equal(runtime.searchAssetLibrary(catalog, { styleProfileId: "editorial-tech" }).length, 4);
  assert.equal(runtime.searchAssetLibrary(catalog, { role: "diagram-node" }).length, 4);
  assert.equal(runtime.searchAssetLibrary(catalog, { tag: "technical" }).length, 4);

  await runtime.updateAssetLibraryItem({
    rootDir,
    id: "network-cloud",
    patch: { title: "Updated network cloud" },
  });
  await runtime.deprecateAssetLibraryItem({
    rootDir,
    id: "network-jpeg",
    reason: "Superseded by a better reviewed asset.",
  });
  const updatedCatalog = JSON.parse(
    await readFile(path.join(rootDir, "public/assets/library/catalog.json"), "utf8"),
  );
  assert.equal(runtime.searchAssetLibrary(updatedCatalog, { text: "network" }).length, 3);
  assert.equal(
    runtime.searchAssetLibrary(updatedCatalog, { text: "network", status: "deprecated" }).length,
    1,
  );
  assert(existsSync(path.join(rootDir, "public/assets/library/items/network-jpeg")));

  await runtime.buildAssetLibraryViews({ rootDir, check: true });
  const deterministicCatalog = await readFile(
    path.join(rootDir, "public/assets/library/catalog.json"),
    "utf8",
  );
  await runtime.buildAssetLibraryViews({ rootDir });
  assert.equal(
    await readFile(path.join(rootDir, "public/assets/library/catalog.json"), "utf8"),
    deterministicCatalog,
  );
  await writeFile(path.join(rootDir, "public/assets/library/catalog.json"), "{}\n");
  await assert.rejects(
    () => runtime.buildAssetLibraryViews({ rootDir, check: true }),
    /catalog\.json is stale/i,
  );
  await runtime.buildAssetLibraryViews({ rootDir });

  const badSvgPath = path.join(inputDir, "unsafe.svg");
  await writeFile(
    badSvgPath,
    '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" onload="alert(1)"><script>alert(1)</script></svg>',
  );
  await assert.rejects(
    () =>
      runtime.addAssetLibraryItem({
        rootDir,
        filePath: badSvgPath,
        metadata: metadata("unsafe-svg", "svg", "agent-authored"),
      }),
    /unsafe-svg.*(script|event handler)/i,
  );
  assert(!existsSync(path.join(rootDir, "public/assets/library/items/unsafe-svg")));

  const corruptPath = path.join(inputDir, "corrupt.png");
  await writeFile(corruptPath, "not a png");
  await assert.rejects(
    () =>
      runtime.addAssetLibraryItem({
        rootDir,
        filePath: corruptPath,
        metadata: metadata("corrupt-png", "png"),
      }),
    /corrupt-png.*PNG/i,
  );
  await assert.rejects(
    () =>
      runtime.addAssetLibraryItem({
        rootDir,
        filePath: jpegPath,
        metadata: {
          ...metadata("missing-semantics", "jpeg"),
          semantics: { ...metadata("missing-semantics", "jpeg").semantics, subjects: [] },
        },
      }),
    /subjects/i,
  );
  await assert.rejects(
    () =>
      runtime.addAssetLibraryItem({
        rootDir,
        filePath: webpPath,
        metadata: { ...metadata("missing-license", "webp"), source: { kind: "user-provided" } },
      }),
    /source.*(provider|license|rightsBasis)/i,
  );
  await assert.rejects(
    () =>
      runtime.addAssetLibraryItem({
        rootDir,
        filePath: webpPath,
        metadata: metadata("network-cloud", "webp"),
      }),
    /already exists/i,
  );
  await assert.rejects(
    () =>
      runtime.addAssetLibraryItem({
        rootDir,
        filePath: webpPath,
        metadata: metadata("duplicate-webp", "webp"),
      }),
    /duplicate.*checksum/i,
  );

  const beforeRollbackCatalog = await readFile(
    path.join(rootDir, "public/assets/library/catalog.json"),
  );
  const rollbackPngPath = path.join(inputDir, "rollback.png");
  await writeFile(rollbackPngPath, png(81, 61));
  await assert.rejects(
    () =>
      runtime.addAssetLibraryItem({
        rootDir,
        filePath: rollbackPngPath,
        metadata: metadata("rollback-png", "png"),
        failAfterPublishStep: "item",
      }),
    /injected failure/i,
  );
  assert(!existsSync(path.join(rootDir, "public/assets/library/items/rollback-png")));
  assert.deepEqual(
    await readFile(path.join(rootDir, "public/assets/library/catalog.json")),
    beforeRollbackCatalog,
  );

  const activeSvg = (await runtime.validateAssetLibrary({ rootDir })).find(
    (item) => item.id === "network-cloud",
  );
  const producerAsset = {
    id: activeSvg.id,
    kind: "svg",
    localPath: `public/assets/library/items/${activeSvg.id}/${activeSvg.file}`,
    purpose: "Use the reviewed cloud in a future network scene.",
    source: {
      provider: activeSvg.source.provider,
      creator: activeSvg.source.creator,
      license: activeSvg.source.license,
      attributionRequired: activeSvg.source.attributionRequired,
    },
    integrity: activeSvg.integrity,
    media: { width: activeSvg.visual.width, height: activeSvg.visual.height, codec: "svg" },
  };
  await assert.doesNotReject(() =>
    runtime.validateProducerAssetLibraryReference({ asset: producerAsset, rootDir }),
  );
  await assert.doesNotReject(() =>
    producerAssetsRuntime.preflightProducerAssets({
      rootDir,
      manifest: {
        version: 1,
        compositionId: "FutureLibraryConsumer",
        slug: "future-library-consumer",
        assets: [producerAsset],
      },
    }),
  );
  await assert.rejects(
    () =>
      runtime.validateProducerAssetLibraryReference({
        asset: {
          ...producerAsset,
          integrity: { ...producerAsset.integrity, sha256: "0".repeat(64) },
        },
        rootDir,
      }),
    /checksum drift/i,
  );
  await assert.rejects(
    () =>
      runtime.validateProducerAssetLibraryReference({
        asset: { ...producerAsset, localPath: "public/assets/library/items/missing/asset.svg" },
        rootDir,
      }),
    /missing/i,
  );
  const deprecated = (await runtime.validateAssetLibrary({ rootDir })).find(
    (item) => item.id === "network-jpeg",
  );
  await assert.rejects(
    () =>
      runtime.validateProducerAssetLibraryReference({
        asset: {
          ...producerAsset,
          id: deprecated.id,
          kind: "image",
          localPath: `public/assets/library/items/${deprecated.id}/${deprecated.file}`,
          integrity: deprecated.integrity,
          media: { width: deprecated.visual.width, height: deprecated.visual.height },
          source: {
            provider: deprecated.source.provider,
            creator: deprecated.source.creator,
            license: deprecated.source.license,
            attributionRequired: deprecated.source.attributionRequired,
          },
        },
        rootDir,
      }),
    /deprecated/i,
  );

  console.warn("Producer asset-library runtime smoke passed.");
} finally {
  await rm(rootDir, { recursive: true, force: true });
}
