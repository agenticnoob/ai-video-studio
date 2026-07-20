import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test, { type TestContext } from "node:test";

import sharp from "sharp";

import { StockAssetsException } from "../src/domain/errors.js";
import type { ProviderImageRecord } from "../src/providers/types.js";
import {
  CandidateStore,
  type CandidateStorePublicationEvent,
} from "../src/storage/candidate-store.js";
import type { ValidatedImage } from "../src/storage/image-validation.js";

const ACQUIRED_AT = new Date("2026-07-20T00:00:00.000Z");

async function temporaryRoot(t: TestContext): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "stock-candidate-store-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

async function validatedPng(red = 10): Promise<ValidatedImage> {
  const bytes = await sharp({
    create: {
      width: 3,
      height: 2,
      channels: 4,
      background: { r: red, g: 20, b: 30, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
  return {
    bytes,
    mimeType: "image/png",
    extension: "png",
    width: 3,
    height: 2,
    sizeInBytes: bytes.byteLength,
    sha256: createHash("sha256")
      .update(new DataView(Uint8Array.from(bytes).buffer))
      .digest("hex"),
  };
}

function canonicalRecord(
  imageId = "2014422",
  overrides: Partial<ProviderImageRecord> = {},
): ProviderImageRecord {
  return {
    provider: "pexels",
    imageId,
    width: 3_024,
    height: 2_016,
    aspectRatio: 1.5,
    description: `Fixture image ${imageId}`,
    averageColor: "#978E82",
    thumbnailUrl: `https://images.pexels.com/photos/${imageId}/thumbnail.jpg`,
    sourcePageUrl: `https://www.pexels.com/photo/fixture-${imageId}/`,
    photographer: {
      name: `Photographer ${imageId}`,
      profileUrl: `https://www.pexels.com/@fixture-${imageId}`,
    },
    attribution: {
      required: true,
      text: `Photo by Photographer ${imageId} on Pexels`,
    },
    previewUrl: `https://images.pexels.com/photos/${imageId}/preview.bin`,
    originalUrl: `https://images.pexels.com/photos/${imageId}/original.bin`,
    ...overrides,
  };
}

function acquireInput(
  image: ValidatedImage,
  record = canonicalRecord(),
) {
  return {
    provider: record.provider,
    imageId: record.imageId,
    canonicalRecord: record,
    image,
    searchContext: {
      query: "  granite landscape  ",
      orientation: "landscape" as const,
      selectionNote: "  Reality anchor for the opening scene.  ",
    },
  };
}

async function expectStockError(
  promise: Promise<unknown>,
  code: string,
): Promise<StockAssetsException> {
  let captured: StockAssetsException | undefined;
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof StockAssetsException);
    assert.equal(error.code, code);
    captured = error;
    return true;
  });
  if (captured === undefined) {
    assert.fail("Expected a StockAssetsException");
  }
  return captured;
}

async function providerEntries(root: string): Promise<string[]> {
  const providerRoot = path.join(root, "pexels");
  try {
    return (await readdir(providerRoot)).sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

test("publishes exactly one validated original and one strict receipt", async (t) => {
  const root = await temporaryRoot(t);
  const image = await validatedPng();
  const store = new CandidateStore({
    rootDir: root,
    now: () => ACQUIRED_AT,
  });

  const result = await store.acquire(acquireInput(image));

  assert.equal(result.reused, false);
  assert.equal(
    result.originalPath,
    path.join(root, "pexels", "2014422", "original.png"),
  );
  assert.equal(
    result.receiptPath,
    path.join(root, "pexels", "2014422", "acquisition.json"),
  );
  const entries = await readdir(path.dirname(result.originalPath), {
    withFileTypes: true,
  });
  assert.deepEqual(
    entries.map((entry) => entry.name).sort(),
    ["acquisition.json", "original.png"],
  );
  assert.ok(entries.every((entry) => entry.isFile()));
  assert.deepEqual(await readFile(result.originalPath), image.bytes);
  assert.deepEqual(result.receipt, {
    schemaVersion: 1,
    acquisitionId: "pexels:2014422",
    provider: "pexels",
    providerAssetId: "2014422",
    sourcePageUrl: canonicalRecord().sourcePageUrl,
    creator: canonicalRecord().photographer,
    license: {
      name: "Pexels License",
      url: "https://www.pexels.com/license/",
    },
    providerPolicy: {
      attributionRequired: true,
      attributionText: canonicalRecord().attribution.text,
    },
    searchContext: {
      query: "granite landscape",
      orientation: "landscape",
      selectionNote: "Reality anchor for the opening scene.",
    },
    file: {
      relativePath: "original.png",
      mimeType: "image/png",
      width: 3,
      height: 2,
      sizeInBytes: image.sizeInBytes,
      sha256: image.sha256,
    },
    acquiredAt: ACQUIRED_AT.toISOString(),
  });
  assert.deepEqual(
    JSON.parse(await readFile(result.receiptPath, "utf8")),
    result.receipt,
  );
  assert.equal((await readFile(result.receiptPath, "utf8")).endsWith("\n"), true);
  assert.deepEqual(await providerEntries(root), ["2014422"]);
});

for (const phase of ["after-image-write", "after-receipt-write"] as const) {
  test(`rolls back completely on ${phase} failure`, async (t) => {
    const root = await temporaryRoot(t);
    const image = await validatedPng();
    const store = new CandidateStore(
      { rootDir: root, now: () => ACQUIRED_AT },
      {
        publicationHook(event: CandidateStorePublicationEvent): void {
          if (event.phase === phase) {
            throw new Error(`injected ${phase} failure`);
          }
        },
      },
    );

    await assert.rejects(store.acquire(acquireInput(image)), /injected/);
    assert.deepEqual(await providerEntries(root), []);
  });
}

test("revalidates the complete staged directory immediately before publish", async (t) => {
  const root = await temporaryRoot(t);
  const image = await validatedPng();
  const store = new CandidateStore(
    { rootDir: root, now: () => ACQUIRED_AT },
    {
      async publicationHook(event: CandidateStorePublicationEvent): Promise<void> {
        if (event.phase === "before-publish") {
          await writeFile(path.join(event.tempDir, "original.png"), "tampered");
        }
      },
    },
  );

  await expectStockError(store.acquire(acquireInput(image)), "INTEGRITY_MISMATCH");
  assert.deepEqual(await providerEntries(root), []);
});

test("reuses a full matching acquisition without changing acquiredAt", async (t) => {
  const root = await temporaryRoot(t);
  const image = await validatedPng();
  const firstStore = new CandidateStore({
    rootDir: root,
    now: () => ACQUIRED_AT,
  });
  const first = await firstStore.acquire(acquireInput(image));
  const secondStore = new CandidateStore({
    rootDir: root,
    now: () => new Date("2030-01-01T00:00:00.000Z"),
  });

  const second = await secondStore.acquire({
    ...acquireInput(image),
    searchContext: { selectionNote: "A later descriptive note." },
  });

  assert.equal(second.reused, true);
  assert.equal(second.originalPath, first.originalPath);
  assert.equal(second.receiptPath, first.receiptPath);
  assert.equal(second.receipt.acquiredAt, ACQUIRED_AT.toISOString());
  assert.deepEqual(second.receipt, first.receipt);
});

test("refuses incoming byte drift without overwriting the winner", async (t) => {
  const root = await temporaryRoot(t);
  const firstImage = await validatedPng(10);
  const driftedImage = await validatedPng(200);
  const store = new CandidateStore({ rootDir: root, now: () => ACQUIRED_AT });
  const first = await store.acquire(acquireInput(firstImage));

  await expectStockError(
    store.acquire(acquireInput(driftedImage)),
    "INTEGRITY_MISMATCH",
  );
  assert.deepEqual(await readFile(first.originalPath), firstImage.bytes);
});

test("refuses stored receipt or canonical fact drift without overwrite", async (t) => {
  const root = await temporaryRoot(t);
  const image = await validatedPng();
  const store = new CandidateStore({ rootDir: root, now: () => ACQUIRED_AT });
  const acquired = await store.acquire(acquireInput(image));
  const receipt = JSON.parse(await readFile(acquired.receiptPath, "utf8")) as {
    sourcePageUrl: string;
  };
  receipt.sourcePageUrl = "https://www.pexels.com/photo/drifted-source/";
  await writeFile(acquired.receiptPath, `${JSON.stringify(receipt)}\n`);

  await expectStockError(store.acquire(acquireInput(image)), "INTEGRITY_MISMATCH");

  const root2 = await temporaryRoot(t);
  const store2 = new CandidateStore({ rootDir: root2, now: () => ACQUIRED_AT });
  await store2.acquire(acquireInput(image));
  const driftedRecord = canonicalRecord("2014422", {
    photographer: {
      name: "Different Photographer",
      profileUrl: "https://www.pexels.com/@different",
    },
  });
  await expectStockError(
    store2.acquire(acquireInput(image, driftedRecord)),
    "INTEGRITY_MISMATCH",
  );
});

test("rejects traversal, absolute fragments, and a relative root", async (t) => {
  const root = await temporaryRoot(t);
  const image = await validatedPng();
  const store = new CandidateStore({ rootDir: root, now: () => ACQUIRED_AT });
  for (const fragments of [
    { provider: "../outside", imageId: "2014422" },
    { provider: "/absolute", imageId: "2014422" },
    { provider: "pexels", imageId: "../outside" },
    { provider: "pexels", imageId: "/absolute" },
  ]) {
    await expectStockError(
      store.acquire({
        ...acquireInput(image),
        ...fragments,
      } as never),
      "OUTPUT_BOUNDARY_VIOLATION",
    );
  }

  const relativeStore = new CandidateStore({
    rootDir: "relative-candidates",
    now: () => ACQUIRED_AT,
  });
  await expectStockError(
    relativeStore.acquire(acquireInput(image)),
    "OUTPUT_BOUNDARY_VIOLATION",
  );
});

test("rejects provider and item symlink escapes without touching outside data", async (t) => {
  const root = await temporaryRoot(t);
  const outside = await temporaryRoot(t);
  const sentinel = path.join(outside, "sentinel.txt");
  await writeFile(sentinel, "outside");
  await symlink(outside, path.join(root, "pexels"), "dir");
  const image = await validatedPng();
  const store = new CandidateStore({ rootDir: root, now: () => ACQUIRED_AT });

  await expectStockError(store.acquire(acquireInput(image)), "OUTPUT_BOUNDARY_VIOLATION");
  assert.equal(await readFile(sentinel, "utf8"), "outside");

  await rm(path.join(root, "pexels"));
  await mkdir(path.join(root, "pexels"));
  await symlink(outside, path.join(root, "pexels", "2014422"), "dir");
  await expectStockError(store.acquire(acquireInput(image)), "OUTPUT_BOUNDARY_VIOLATION");
  assert.equal(await readFile(sentinel, "utf8"), "outside");
});

for (const symlinkName of ["original.png", "acquisition.json"] as const) {
  test(`rejects an existing ${symlinkName} symlink escape`, async (t) => {
    const root = await temporaryRoot(t);
    const outside = await temporaryRoot(t);
    const sentinel = path.join(outside, "sentinel.txt");
    await writeFile(sentinel, "outside");
    const itemRoot = path.join(root, "pexels", "2014422");
    await mkdir(itemRoot, { recursive: true });
    const otherName =
      symlinkName === "original.png" ? "acquisition.json" : "original.png";
    await writeFile(path.join(itemRoot, otherName), "fixture");
    await symlink(sentinel, path.join(itemRoot, symlinkName));
    const store = new CandidateStore({ rootDir: root, now: () => ACQUIRED_AT });

    await expectStockError(
      store.acquire(acquireInput(await validatedPng())),
      "OUTPUT_BOUNDARY_VIOLATION",
    );
    assert.equal(await readFile(sentinel, "utf8"), "outside");
  });
}

test("requires an existing item to contain exactly two regular files", async (t) => {
  const root = await temporaryRoot(t);
  const image = await validatedPng();
  const store = new CandidateStore({ rootDir: root, now: () => ACQUIRED_AT });
  const acquired = await store.acquire(acquireInput(image));
  await writeFile(path.join(path.dirname(acquired.originalPath), "extra.txt"), "extra");

  await expectStockError(store.acquire(acquireInput(image)), "INTEGRITY_MISMATCH");
  assert.deepEqual(await readFile(acquired.originalPath), image.bytes);
});

test("cleanup removes only this operation's revalidated temp directory", async (t) => {
  const root = await temporaryRoot(t);
  const providerRoot = path.join(root, "pexels");
  await mkdir(providerRoot);
  const sibling = path.join(providerRoot, ".tmp-sibling-owned-elsewhere");
  await mkdir(sibling);
  await writeFile(path.join(sibling, "sentinel.txt"), "keep");
  const store = new CandidateStore(
    { rootDir: root, now: () => ACQUIRED_AT },
    {
      publicationHook(event: CandidateStorePublicationEvent): void {
        if (event.phase === "after-image-write") {
          throw new Error("rollback current operation");
        }
      },
    },
  );

  await assert.rejects(store.acquire(acquireInput(await validatedPng())), /rollback/);
  assert.equal(await readFile(path.join(sibling, "sentinel.txt"), "utf8"), "keep");
  assert.deepEqual(await providerEntries(root), [".tmp-sibling-owned-elsewhere"]);
});

test("does not clean a temp path replaced by a symlink", async (t) => {
  const root = await temporaryRoot(t);
  const outside = await temporaryRoot(t);
  const sentinel = path.join(outside, "sentinel.txt");
  await writeFile(sentinel, "outside");
  let swappedTempDir = "";
  const store = new CandidateStore(
    { rootDir: root, now: () => ACQUIRED_AT },
    {
      async publicationHook(event: CandidateStorePublicationEvent): Promise<void> {
        if (event.phase === "before-publish") {
          swappedTempDir = event.tempDir;
          await rm(event.tempDir, { recursive: true });
          await symlink(outside, event.tempDir, "dir");
        }
      },
    },
  );

  await expectStockError(
    store.acquire(acquireInput(await validatedPng())),
    "OUTPUT_BOUNDARY_VIOLATION",
  );
  assert.equal(await readFile(sentinel, "utf8"), "outside");
  assert.equal((await lstat(swappedTempDir)).isSymbolicLink(), true);
});

test("a concurrent matching winner is validated and reused without overwrite", async (t) => {
  const root = await temporaryRoot(t);
  const image = await validatedPng();
  let arrivals = 0;
  let release: (() => void) | undefined;
  const barrier = new Promise<void>((resolve) => {
    release = resolve;
  });
  const hook = async (event: CandidateStorePublicationEvent): Promise<void> => {
    if (event.phase !== "before-publish") return;
    arrivals += 1;
    if (arrivals === 2) release?.();
    await barrier;
  };
  const firstStore = new CandidateStore(
    { rootDir: root, now: () => ACQUIRED_AT },
    { publicationHook: hook },
  );
  const secondStore = new CandidateStore(
    { rootDir: root, now: () => new Date("2030-01-01T00:00:00.000Z") },
    { publicationHook: hook },
  );

  const results = await Promise.all([
    firstStore.acquire(acquireInput(image)),
    secondStore.acquire(acquireInput(image)),
  ]);

  assert.deepEqual(
    results
      .map((result: { readonly reused: boolean }) => result.reused)
      .sort(),
    [false, true],
  );
  assert.deepEqual(await providerEntries(root), ["2014422"]);
  assert.deepEqual(
    (await readdir(path.join(root, "pexels", "2014422"))).sort(),
    ["acquisition.json", "original.png"],
  );
});

test("a concurrent mismatching loser reports INTEGRITY_MISMATCH", async (t) => {
  const root = await temporaryRoot(t);
  const firstImage = await validatedPng(10);
  const secondImage = await validatedPng(200);
  let arrivals = 0;
  let release: (() => void) | undefined;
  const barrier = new Promise<void>((resolve) => {
    release = resolve;
  });
  const hook = async (event: CandidateStorePublicationEvent): Promise<void> => {
    if (event.phase !== "before-publish") return;
    arrivals += 1;
    if (arrivals === 2) release?.();
    await barrier;
  };
  const stores = [
    new CandidateStore(
      { rootDir: root, now: () => ACQUIRED_AT },
      { publicationHook: hook },
    ),
    new CandidateStore(
      { rootDir: root, now: () => ACQUIRED_AT },
      { publicationHook: hook },
    ),
  ];

  const settled = await Promise.allSettled([
    stores[0]?.acquire(acquireInput(firstImage)),
    stores[1]?.acquire(acquireInput(secondImage)),
  ]);

  assert.equal(settled.filter((result) => result.status === "fulfilled").length, 1);
  const rejected = settled.find((result) => result.status === "rejected");
  assert.equal(rejected?.status, "rejected");
  if (rejected?.status !== "rejected") assert.fail("Expected one rejected race");
  assert.ok(rejected.reason instanceof StockAssetsException);
  assert.equal(rejected.reason.code, "INTEGRITY_MISMATCH");
  assert.deepEqual(await providerEntries(root), ["2014422"]);
});
