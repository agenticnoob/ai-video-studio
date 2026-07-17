import { copyFile, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { getAssetLibraryViewBytes } from "./catalog";
import {
  assetLibraryKinds,
  type AssetLibraryItem,
  type AssetLibraryKind,
  type AssetLibraryMutationInput,
} from "./types";
import {
  assertAssetLibraryItem,
  assetLibraryFileName,
  inspectAssetLibraryFile,
  serializeAssetLibraryItem,
  validateAssetLibrary,
  validateAssetLibraryItemDirectory,
} from "./validate";

const asRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
};

const readOptional = async (filePath: string): Promise<Buffer | undefined> =>
  readFile(filePath).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return undefined;
    throw error;
  });

const restoreFile = async (filePath: string, previous: Buffer | undefined): Promise<void> => {
  if (previous === undefined) {
    await rm(filePath, { force: true });
    return;
  }
  const temporaryPath = `${filePath}.producer-library-restore-${process.pid}`;
  await writeFile(temporaryPath, new Uint8Array(previous));
  await rename(temporaryPath, filePath);
};

const stageItem = async ({
  transactionRoot,
  filePath,
  metadata,
}: {
  readonly transactionRoot: string;
  readonly filePath: string;
  readonly metadata: unknown;
}): Promise<{ readonly item: AssetLibraryItem; readonly itemDir: string }> => {
  const raw = asRecord(metadata, "asset library metadata");
  const id = typeof raw.id === "string" ? raw.id : "unknown";
  const kind = raw.kind as AssetLibraryKind;
  if (!assetLibraryKinds.includes(kind)) {
    throw new Error(`${id}.kind must be svg, png, jpeg, or webp.`);
  }
  const itemDir = path.join(transactionRoot, "item", id);
  await mkdir(itemDir, { recursive: true });
  const file = assetLibraryFileName(kind);
  const stagedFilePath = path.join(itemDir, file);
  await copyFile(filePath, stagedFilePath);
  let inspected;
  try {
    inspected = await inspectAssetLibraryFile(stagedFilePath, kind, id);
  } catch (error) {
    throw new Error(`${id}: ${(error as Error).message}`);
  }
  const rawVisual = asRecord(raw.visual, `${id}.visual`);
  const item = {
    ...raw,
    version: 1,
    id,
    kind,
    file,
    visual: {
      ...rawVisual,
      width: inspected.width,
      height: inspected.height,
      aspectRatio: inspected.width / inspected.height,
    },
    integrity: {
      sha256: inspected.sha256,
      sizeInBytes: inspected.sizeInBytes,
      mimeType: inspected.mimeType,
    },
  } as unknown as AssetLibraryItem;
  assertAssetLibraryItem(item);
  await writeFile(path.join(itemDir, "asset.json"), serializeAssetLibraryItem(item));
  await validateAssetLibraryItemDirectory(itemDir, id);
  return { item, itemDir };
};

const publishItem = async ({
  rootDir,
  stagedItemDir,
  item,
  replace,
  failAfterPublishStep,
}: {
  readonly rootDir: string;
  readonly stagedItemDir: string;
  readonly item: AssetLibraryItem;
  readonly replace: boolean;
  readonly failAfterPublishStep?: "item" | "catalog";
}): Promise<AssetLibraryItem> => {
  const libraryRoot = path.join(rootDir, "public/assets/library");
  const itemsRoot = path.join(libraryRoot, "items");
  const finalItemDir = path.join(itemsRoot, item.id);
  const transactionBackup = path.join(path.dirname(path.dirname(stagedItemDir)), "backup-item");
  const catalogPath = path.join(libraryRoot, "catalog.json");
  const htmlPath = path.join(libraryRoot, "index.html");
  const oldCatalog = await readOptional(catalogPath);
  const oldHtml = await readOptional(htmlPath);
  const catalogTemporary = `${catalogPath}.producer-library-tmp-${process.pid}`;
  const htmlTemporary = `${htmlPath}.producer-library-tmp-${process.pid}`;
  const existingItems = await validateAssetLibrary({ rootDir });
  const existing = existingItems.find((candidate) => candidate.id === item.id);
  if (existing && !replace) throw new Error(`${item.id} already exists.`);
  if (!existing && replace) throw new Error(`${item.id} is missing.`);
  const duplicate = existingItems.find(
    (candidate) => candidate.id !== item.id && candidate.integrity.sha256 === item.integrity.sha256,
  );
  if (duplicate) throw new Error(`${item.id} has duplicate checksum with ${duplicate.id}.`);
  const prospectiveItems = [...existingItems.filter((candidate) => candidate.id !== item.id), item];
  const views = await getAssetLibraryViewBytes({ rootDir, items: prospectiveItems });
  let oldMoved = false;
  let newPublished = false;
  try {
    await mkdir(itemsRoot, { recursive: true });
    if (existing) {
      await rename(finalItemDir, transactionBackup);
      oldMoved = true;
    }
    await rename(stagedItemDir, finalItemDir);
    newPublished = true;
    if (failAfterPublishStep === "item") throw new Error("Injected failure after item publish.");
    await writeFile(catalogTemporary, views.catalog);
    await rename(catalogTemporary, catalogPath);
    if (failAfterPublishStep === "catalog")
      throw new Error("Injected failure after catalog publish.");
    await writeFile(htmlTemporary, views.html);
    await rename(htmlTemporary, htmlPath);
    if (oldMoved) await rm(transactionBackup, { recursive: true, force: true });
    return item;
  } catch (error) {
    if (newPublished) await rm(finalItemDir, { recursive: true, force: true });
    if (oldMoved) await rename(transactionBackup, finalItemDir);
    await restoreFile(catalogPath, oldCatalog);
    await restoreFile(htmlPath, oldHtml);
    throw error;
  } finally {
    await rm(catalogTemporary, { force: true });
    await rm(htmlTemporary, { force: true });
  }
};

const add = async (
  input: AssetLibraryMutationInput,
  ingest: boolean,
): Promise<AssetLibraryItem> => {
  const rootDir = path.resolve(input.rootDir ?? process.cwd());
  const sourcePath = path.resolve(input.filePath);
  if (ingest) {
    const inboxRoot = path.join(rootDir, ".producer-assets/library-inbox");
    const relative = path.relative(inboxRoot, sourcePath);
    if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error("producer:library:ingest source must be inside the ignored library inbox.");
    }
  }
  const transactionsRoot = path.join(rootDir, ".producer-assets/transactions");
  await mkdir(transactionsRoot, { recursive: true });
  const transactionRoot = await mkdtemp(path.join(transactionsRoot, "library-"));
  try {
    const staged = await stageItem({
      transactionRoot,
      filePath: sourcePath,
      metadata: input.metadata,
    });
    return await publishItem({
      rootDir,
      stagedItemDir: staged.itemDir,
      item: staged.item,
      replace: false,
      failAfterPublishStep: input.failAfterPublishStep,
    });
  } finally {
    await rm(transactionRoot, { recursive: true, force: true });
  }
};

export const addAssetLibraryItem = async (
  input: AssetLibraryMutationInput,
): Promise<AssetLibraryItem> => add(input, false);

export const ingestAssetLibraryItem = async (
  input: AssetLibraryMutationInput,
): Promise<AssetLibraryItem> => add(input, true);

export const updateAssetLibraryItem = async ({
  rootDir = process.cwd(),
  id,
  patch,
  failAfterPublishStep,
}: {
  readonly rootDir?: string;
  readonly id: string;
  readonly patch: unknown;
  readonly failAfterPublishStep?: "item" | "catalog";
}): Promise<AssetLibraryItem> => {
  const absoluteRoot = path.resolve(rootDir);
  const currentDir = path.join(absoluteRoot, "public/assets/library/items", id);
  const current = await validateAssetLibraryItemDirectory(currentDir, id);
  const update = asRecord(patch, `${id} update`);
  for (const immutable of ["version", "id", "kind", "file", "visual", "integrity"] as const) {
    if (immutable in update) throw new Error(`${id}.${immutable} cannot be updated directly.`);
  }
  const transactionsRoot = path.join(absoluteRoot, ".producer-assets/transactions");
  await mkdir(transactionsRoot, { recursive: true });
  const transactionRoot = await mkdtemp(path.join(transactionsRoot, "library-"));
  try {
    const itemDir = path.join(transactionRoot, "item", id);
    await mkdir(itemDir, { recursive: true });
    await copyFile(path.join(currentDir, current.file), path.join(itemDir, current.file));
    const next = { ...current, ...update } as AssetLibraryItem;
    assertAssetLibraryItem(next);
    await writeFile(path.join(itemDir, "asset.json"), serializeAssetLibraryItem(next));
    await validateAssetLibraryItemDirectory(itemDir, id);
    return await publishItem({
      rootDir: absoluteRoot,
      stagedItemDir: itemDir,
      item: next,
      replace: true,
      failAfterPublishStep,
    });
  } finally {
    await rm(transactionRoot, { recursive: true, force: true });
  }
};

export const deprecateAssetLibraryItem = async ({
  rootDir,
  id,
  reason,
  failAfterPublishStep,
}: {
  readonly rootDir?: string;
  readonly id: string;
  readonly reason: string;
  readonly failAfterPublishStep?: "item" | "catalog";
}): Promise<AssetLibraryItem> => {
  if (!reason.trim()) throw new Error(`${id} deprecation reason must be non-empty.`);
  return updateAssetLibraryItem({
    rootDir,
    id,
    patch: { lifecycle: { status: "deprecated", reason } },
    failAfterPublishStep,
  });
};
