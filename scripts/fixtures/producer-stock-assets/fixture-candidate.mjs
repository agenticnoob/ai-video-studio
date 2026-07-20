import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const fixturePng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

export const createFixtureStockCandidate = async ({ candidateRoot }) => {
  const candidateDir = path.join(candidateRoot, "pexels", "2014422");
  const candidateOriginalPath = path.join(candidateDir, "original.png");
  const receiptPath = path.join(candidateDir, "acquisition.json");
  const receipt = {
    schemaVersion: 1,
    acquisitionId: "pexels:2014422",
    provider: "pexels",
    providerAssetId: "2014422",
    sourcePageUrl: "https://www.pexels.com/photo/fixture-stock-image-2014422/",
    creator: {
      name: "Fixture Photographer",
      profileUrl: "https://www.pexels.com/@fixture-photographer",
    },
    license: {
      name: "Pexels License",
      url: "https://www.pexels.com/license/",
    },
    providerPolicy: {
      attributionRequired: true,
      attributionText: "Photo by Fixture Photographer on Pexels",
    },
    searchContext: {
      query: "fixture stock image",
      orientation: "square",
      selectionNote: "Deterministic Producer integration fixture.",
    },
    file: {
      relativePath: "original.png",
      mimeType: "image/png",
      width: 1,
      height: 1,
      sizeInBytes: fixturePng.byteLength,
      sha256: createHash("sha256").update(fixturePng).digest("hex"),
    },
    acquiredAt: "2026-07-20T00:00:00.000Z",
  };

  await mkdir(candidateDir, { recursive: true });
  await writeFile(candidateOriginalPath, fixturePng);
  await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);

  return { candidateOriginalPath, receiptPath };
};
