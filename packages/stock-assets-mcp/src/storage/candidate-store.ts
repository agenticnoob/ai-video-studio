import { createHash } from "node:crypto";
import {
  lstat,
  mkdir,
  mkdtemp,
  open,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
} from "node:fs/promises";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";

import sharp from "sharp";

import { StockAssetsException } from "../domain/errors.js";
import {
  acquisitionReceiptV1Schema,
  imageIdSchema,
  searchContextSchema,
  type AcquisitionReceiptV1,
  type SearchContext,
} from "../domain/schemas.js";
import {
  providerImageRecordSchema,
  type ProviderImageRecord,
} from "../providers/types.js";
import type { ValidatedImage } from "./image-validation.js";

const ORIGINAL_FILE_PATTERN = /^original\.(jpg|png|webp)$/;
const MAX_INPUT_PIXELS = 100_000_000;

type MeasuredImage = Omit<ValidatedImage, "bytes">;

export type CandidateAcquireInput = {
  readonly provider: "pexels";
  readonly imageId: string;
  readonly canonicalRecord: ProviderImageRecord;
  readonly image: ValidatedImage;
  readonly searchContext?: SearchContext;
};

export type AcquiredCandidate = {
  readonly reused: boolean;
  readonly originalPath: string;
  readonly receiptPath: string;
  readonly receipt: AcquisitionReceiptV1;
};

export type CandidateStoreOptions = {
  readonly rootDir: string;
  readonly now?: () => Date;
};

export type CandidateStorePublicationEvent = {
  readonly phase:
    | "after-image-write"
    | "after-receipt-write"
    | "before-publish";
  readonly tempDir: string;
};

export type CandidateStoreTestHooks = {
  readonly publicationHook?: (
    event: CandidateStorePublicationEvent,
  ) => void | Promise<void>;
};

type TempIdentity = {
  readonly dev: number;
  readonly ino: number;
};

function boundaryViolation(message: string, cause?: unknown): StockAssetsException {
  return new StockAssetsException("OUTPUT_BOUNDARY_VIOLATION", message, {
    ...(cause === undefined ? {} : { cause }),
  });
}

function integrityMismatch(message: string, cause?: unknown): StockAssetsException {
  return new StockAssetsException("INTEGRITY_MISMATCH", message, {
    ...(cause === undefined ? {} : { cause }),
  });
}

function errorCode(error: unknown): string | undefined {
  return (error as NodeJS.ErrnoException).code;
}

function assertContained(root: string, target: string): void {
  const relative = path.relative(root, target);
  if (
    relative === "" ||
    path.isAbsolute(relative) ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`)
  ) {
    throw boundaryViolation("Candidate path escapes the configured output root");
  }
}

async function canonicalRoot(rootDir: string): Promise<string> {
  if (!path.isAbsolute(rootDir)) {
    throw boundaryViolation("Candidate output root must be absolute");
  }
  const requested = path.resolve(rootDir);
  let rootStats;
  try {
    rootStats = await lstat(requested);
  } catch (error) {
    throw boundaryViolation("Candidate output root is unavailable", error);
  }
  if (rootStats.isSymbolicLink() || !rootStats.isDirectory()) {
    throw boundaryViolation("Candidate output root must be a real directory");
  }
  const resolved = await realpath(requested).catch((error: unknown) => {
    throw boundaryViolation("Candidate output root cannot be resolved", error);
  });
  if (resolved !== requested) {
    throw boundaryViolation("Candidate output root is not canonical");
  }
  return resolved;
}

function validateFragments(provider: string, imageId: string): void {
  if (provider !== "pexels" || !imageIdSchema.safeParse(imageId).success) {
    throw boundaryViolation("Candidate provider or image ID is outside policy");
  }
}

async function ensureProviderRoot(
  root: string,
  provider: "pexels",
): Promise<string> {
  const providerRoot = path.join(root, provider);
  assertContained(root, providerRoot);
  try {
    await mkdir(providerRoot, { mode: 0o700 });
  } catch (error) {
    if (errorCode(error) !== "EEXIST") {
      throw boundaryViolation("Candidate provider directory cannot be created", error);
    }
  }
  const stats = await lstat(providerRoot).catch((error: unknown) => {
    throw boundaryViolation("Candidate provider directory is unavailable", error);
  });
  if (stats.isSymbolicLink() || !stats.isDirectory()) {
    throw boundaryViolation("Candidate provider path must be a real directory");
  }
  const resolved = await realpath(providerRoot).catch((error: unknown) => {
    throw boundaryViolation("Candidate provider directory cannot be resolved", error);
  });
  if (resolved !== providerRoot) {
    throw boundaryViolation("Candidate provider path escaped through a symlink");
  }
  return providerRoot;
}

function imageKindFromBytes(bytes: Buffer): {
  readonly extension: "jpg" | "png" | "webp";
  readonly format: "jpeg" | "png" | "webp";
  readonly mimeType: "image/jpeg" | "image/png" | "image/webp";
} {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { extension: "jpg", format: "jpeg", mimeType: "image/jpeg" };
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { extension: "png", format: "png", mimeType: "image/png" };
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { extension: "webp", format: "webp", mimeType: "image/webp" };
  }
  throw integrityMismatch("Candidate image has unsupported magic bytes");
}

async function measureImage(bytes: Buffer): Promise<MeasuredImage> {
  const kind = imageKindFromBytes(bytes);
  try {
    const options = {
      failOn: "error" as const,
      limitInputPixels: MAX_INPUT_PIXELS,
    };
    const metadata = await sharp(bytes, options).metadata();
    if (
      metadata.format !== kind.format ||
      metadata.width === undefined ||
      metadata.height === undefined ||
      !Number.isInteger(metadata.width) ||
      !Number.isInteger(metadata.height) ||
      metadata.width <= 0 ||
      metadata.height <= 0
    ) {
      throw integrityMismatch("Candidate image decode facts are invalid");
    }
    await sharp(bytes, options).raw().toBuffer();
    return {
      extension: kind.extension,
      mimeType: kind.mimeType,
      width: metadata.width,
      height: metadata.height,
      sizeInBytes: bytes.byteLength,
      sha256: createHash("sha256")
        .update(new DataView(Uint8Array.from(bytes).buffer))
        .digest("hex"),
    };
  } catch (error) {
    if (error instanceof StockAssetsException) {
      throw error;
    }
    throw integrityMismatch("Candidate image failed strict raster decoding", error);
  }
}

function measuredFactsMatch(
  measured: MeasuredImage,
  expected: Omit<ValidatedImage, "bytes">,
): boolean {
  return (
    measured.extension === expected.extension &&
    measured.mimeType === expected.mimeType &&
    measured.width === expected.width &&
    measured.height === expected.height &&
    measured.sizeInBytes === expected.sizeInBytes &&
    measured.sha256 === expected.sha256
  );
}

async function validateIncomingImage(image: ValidatedImage): Promise<MeasuredImage> {
  const measured = await measureImage(image.bytes);
  if (!measuredFactsMatch(measured, image)) {
    throw integrityMismatch("Validated candidate image facts have drifted");
  }
  return measured;
}

function canonicalReceiptFacts(
  record: ProviderImageRecord,
  imageId: string,
): Pick<
  AcquisitionReceiptV1,
  | "schemaVersion"
  | "acquisitionId"
  | "provider"
  | "providerAssetId"
  | "sourcePageUrl"
  | "creator"
  | "license"
  | "providerPolicy"
> {
  return {
    schemaVersion: 1,
    acquisitionId: `pexels:${imageId}`,
    provider: "pexels",
    providerAssetId: imageId,
    sourcePageUrl: record.sourcePageUrl,
    creator: record.photographer,
    license: {
      name: "Pexels License",
      url: "https://www.pexels.com/license/",
    },
    providerPolicy: {
      attributionRequired: true,
      attributionText: record.attribution.text,
    },
  };
}

function receiptMatchesCanonical(
  receipt: AcquisitionReceiptV1,
  record: ProviderImageRecord,
  imageId: string,
): boolean {
  const expected = canonicalReceiptFacts(record, imageId);
  return Object.entries(expected).every(([key, value]) =>
    isDeepStrictEqual(receipt[key as keyof typeof expected], value),
  );
}

async function validateRealDirectory(
  root: string,
  directory: string,
  label: string,
): Promise<void> {
  assertContained(root, directory);
  const stats = await lstat(directory).catch((error: unknown) => {
    throw boundaryViolation(`${label} is unavailable`, error);
  });
  if (stats.isSymbolicLink() || !stats.isDirectory()) {
    throw boundaryViolation(`${label} must be a real directory`);
  }
  const resolved = await realpath(directory).catch((error: unknown) => {
    throw boundaryViolation(`${label} cannot be resolved`, error);
  });
  if (resolved !== directory) {
    throw boundaryViolation(`${label} escaped through a symlink`);
  }
}

async function validateRegularFile(
  itemRoot: string,
  filePath: string,
  label: string,
): Promise<void> {
  assertContained(itemRoot, filePath);
  const stats = await lstat(filePath).catch((error: unknown) => {
    throw boundaryViolation(`${label} is unavailable`, error);
  });
  if (stats.isSymbolicLink() || !stats.isFile()) {
    throw boundaryViolation(`${label} must be a regular file`);
  }
  const resolved = await realpath(filePath).catch((error: unknown) => {
    throw boundaryViolation(`${label} cannot be resolved`, error);
  });
  if (resolved !== filePath) {
    throw boundaryViolation(`${label} escaped through a symlink`);
  }
}

async function validateItemDirectory(
  providerRoot: string,
  itemRoot: string,
  canonicalRecord: ProviderImageRecord,
  imageId: string,
): Promise<AcquiredCandidate> {
  await validateRealDirectory(providerRoot, itemRoot, "Candidate item directory");
  const entries = await readdir(itemRoot, { withFileTypes: true });
  if (entries.some((entry) => entry.isSymbolicLink())) {
    throw boundaryViolation("Candidate item contains a symbolic link");
  }
  if (entries.length !== 2 || entries.some((entry) => !entry.isFile())) {
    throw integrityMismatch("Candidate item must contain exactly two regular files");
  }
  const names = entries.map((entry) => entry.name);
  const originalNames = names.filter((name) => ORIGINAL_FILE_PATTERN.test(name));
  if (
    !names.includes("acquisition.json") ||
    originalNames.length !== 1 ||
    names.some(
      (name) => name !== "acquisition.json" && !ORIGINAL_FILE_PATTERN.test(name),
    )
  ) {
    throw integrityMismatch("Candidate item file names do not match the v1 layout");
  }
  const originalName = originalNames[0];
  if (originalName === undefined) {
    throw integrityMismatch("Candidate original file is missing");
  }
  const originalPath = path.join(itemRoot, originalName);
  const receiptPath = path.join(itemRoot, "acquisition.json");
  await validateRegularFile(itemRoot, originalPath, "Candidate original");
  await validateRegularFile(itemRoot, receiptPath, "Candidate receipt");

  let rawReceipt: unknown;
  try {
    rawReceipt = JSON.parse(await readFile(receiptPath, "utf8"));
  } catch (error) {
    throw integrityMismatch("Candidate receipt is not valid JSON", error);
  }
  const parsedReceipt = acquisitionReceiptV1Schema.safeParse(rawReceipt);
  if (!parsedReceipt.success) {
    throw integrityMismatch("Candidate receipt does not match schema v1", parsedReceipt.error);
  }
  const receipt = parsedReceipt.data;
  const measured = await measureImage(await readFile(originalPath));
  const expectedFile = {
    relativePath: originalName,
    mimeType: measured.mimeType,
    width: measured.width,
    height: measured.height,
    sizeInBytes: measured.sizeInBytes,
    sha256: measured.sha256,
  };
  if (
    !isDeepStrictEqual(receipt.file, expectedFile) ||
    !receiptMatchesCanonical(receipt, canonicalRecord, imageId)
  ) {
    throw integrityMismatch("Candidate receipt, bytes, or canonical facts have drifted");
  }
  return {
    reused: true,
    originalPath,
    receiptPath,
    receipt,
  };
}

function assertIncomingMatchesExisting(
  existing: AcquiredCandidate,
  image: ValidatedImage,
): void {
  if (
    existing.receipt.file.relativePath !== `original.${image.extension}` ||
    existing.receipt.file.mimeType !== image.mimeType ||
    existing.receipt.file.width !== image.width ||
    existing.receipt.file.height !== image.height ||
    existing.receipt.file.sizeInBytes !== image.sizeInBytes ||
    existing.receipt.file.sha256 !== image.sha256
  ) {
    throw integrityMismatch("Incoming candidate bytes differ from the existing item");
  }
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await lstat(target);
    return true;
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return false;
    }
    throw boundaryViolation("Candidate path cannot be inspected", error);
  }
}

async function writeExclusiveFile(filePath: string, data: Buffer | string): Promise<void> {
  const handle = await open(filePath, "wx", 0o600).catch((error: unknown) => {
    throw boundaryViolation("Candidate staged file cannot be created", error);
  });
  try {
    await handle.writeFile(
      typeof data === "string" ? data : Uint8Array.from(data),
    );
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function cleanupOwnedTemp(
  providerRoot: string,
  tempDir: string,
  identity: TempIdentity,
): Promise<void> {
  assertContained(providerRoot, tempDir);
  let stats;
  try {
    stats = await lstat(tempDir);
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return;
    }
    return;
  }
  if (
    stats.isSymbolicLink() ||
    !stats.isDirectory() ||
    stats.dev !== identity.dev ||
    stats.ino !== identity.ino
  ) {
    return;
  }
  const resolved = await realpath(tempDir).catch(() => undefined);
  if (resolved !== tempDir) {
    return;
  }
  await rm(tempDir, { recursive: true });
}

export class CandidateStore {
  private readonly now: () => Date;

  constructor(
    private readonly options: CandidateStoreOptions,
    private readonly testHooks: CandidateStoreTestHooks = {},
  ) {
    this.now = options.now ?? (() => new Date());
  }

  async validateExisting(
    provider: string,
    imageId: string,
    canonicalRecord: ProviderImageRecord,
  ): Promise<AcquiredCandidate> {
    validateFragments(provider, imageId);
    const parsedRecord = providerImageRecordSchema.safeParse(canonicalRecord);
    if (
      !parsedRecord.success ||
      parsedRecord.data.provider !== provider ||
      parsedRecord.data.imageId !== imageId
    ) {
      throw integrityMismatch("Canonical provider facts do not match the candidate key");
    }
    const root = await canonicalRoot(this.options.rootDir);
    const providerRoot = await ensureProviderRoot(root, "pexels");
    const itemRoot = path.join(providerRoot, imageId);
    assertContained(providerRoot, itemRoot);
    return validateItemDirectory(
      providerRoot,
      itemRoot,
      parsedRecord.data,
      imageId,
    );
  }

  async acquire(input: CandidateAcquireInput): Promise<AcquiredCandidate> {
    validateFragments(input.provider, input.imageId);
    const parsedRecord = providerImageRecordSchema.safeParse(input.canonicalRecord);
    if (
      !parsedRecord.success ||
      parsedRecord.data.provider !== input.provider ||
      parsedRecord.data.imageId !== input.imageId
    ) {
      throw integrityMismatch("Canonical provider facts do not match the candidate key");
    }
    await validateIncomingImage(input.image);
    const searchContextResult =
      input.searchContext === undefined
        ? undefined
        : searchContextSchema.safeParse(input.searchContext);
    if (searchContextResult !== undefined && !searchContextResult.success) {
      throw new StockAssetsException(
        "INVALID_INPUT",
        "Candidate search context is invalid",
      );
    }

    const root = await canonicalRoot(this.options.rootDir);
    const providerRoot = await ensureProviderRoot(root, input.provider);
    const itemRoot = path.join(providerRoot, input.imageId);
    assertContained(providerRoot, itemRoot);
    if (await pathExists(itemRoot)) {
      const existing = await validateItemDirectory(
        providerRoot,
        itemRoot,
        parsedRecord.data,
        input.imageId,
      );
      assertIncomingMatchesExisting(existing, input.image);
      return existing;
    }

    const tempDir = await mkdtemp(
      path.join(providerRoot, `.tmp-${input.imageId}-`),
    ).catch((error: unknown) => {
      throw boundaryViolation("Candidate temp directory cannot be created", error);
    });
    assertContained(providerRoot, tempDir);
    const tempStats = await lstat(tempDir);
    if (tempStats.isSymbolicLink() || !tempStats.isDirectory()) {
      throw boundaryViolation("Candidate temp path must be a real directory");
    }
    const tempIdentity: TempIdentity = {
      dev: tempStats.dev,
      ino: tempStats.ino,
    };

    try {
      const originalName = `original.${input.image.extension}`;
      const stagedOriginalPath = path.join(tempDir, originalName);
      const stagedReceiptPath = path.join(tempDir, "acquisition.json");
      await writeExclusiveFile(stagedOriginalPath, input.image.bytes);
      await this.testHooks.publicationHook?.({
        phase: "after-image-write",
        tempDir,
      });

      const acquiredAt = this.now();
      if (!(acquiredAt instanceof Date) || Number.isNaN(acquiredAt.getTime())) {
        throw integrityMismatch("Candidate acquisition clock returned an invalid date");
      }
      const receipt = acquisitionReceiptV1Schema.parse({
        ...canonicalReceiptFacts(parsedRecord.data, input.imageId),
        ...(searchContextResult === undefined
          ? {}
          : { searchContext: searchContextResult.data }),
        file: {
          relativePath: originalName,
          mimeType: input.image.mimeType,
          width: input.image.width,
          height: input.image.height,
          sizeInBytes: input.image.sizeInBytes,
          sha256: input.image.sha256,
        },
        acquiredAt: acquiredAt.toISOString(),
      });
      await writeExclusiveFile(
        stagedReceiptPath,
        `${JSON.stringify(receipt, null, 2)}\n`,
      );
      await this.testHooks.publicationHook?.({
        phase: "after-receipt-write",
        tempDir,
      });
      await this.testHooks.publicationHook?.({
        phase: "before-publish",
        tempDir,
      });

      const staged = await validateItemDirectory(
        providerRoot,
        tempDir,
        parsedRecord.data,
        input.imageId,
      );
      assertIncomingMatchesExisting(staged, input.image);

      try {
        await rename(tempDir, itemRoot);
        return {
          reused: false,
          originalPath: path.join(itemRoot, originalName),
          receiptPath: path.join(itemRoot, "acquisition.json"),
          receipt,
        };
      } catch (error) {
        if (!(await pathExists(itemRoot))) {
          throw boundaryViolation("Candidate item could not be published", error);
        }
        const winner = await validateItemDirectory(
          providerRoot,
          itemRoot,
          parsedRecord.data,
          input.imageId,
        );
        assertIncomingMatchesExisting(winner, input.image);
        return winner;
      }
    } finally {
      await cleanupOwnedTemp(providerRoot, tempDir, tempIdentity);
    }
  }
}
