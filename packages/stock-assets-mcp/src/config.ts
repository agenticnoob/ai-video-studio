import { mkdir, mkdtemp, realpath, rm, stat } from "node:fs/promises";
import path from "node:path";

const DEFAULT_MAX_BYTES = 26_214_400;
const PREVIEW_MAX_BYTES = 5_242_880 as const;
const DEFAULT_TIMEOUT_MS = 20_000;

export type StockAssetsConfig = {
  readonly pexelsApiKey: string;
  readonly outputDir: string;
  readonly maxBytes: number;
  readonly previewMaxBytes: 5_242_880;
  readonly timeoutMs: number;
};

function parsePositiveInteger(
  name: string,
  rawValue: string | undefined,
  defaultValue: number,
): number {
  if (rawValue === undefined) {
    return defaultValue;
  }

  if (!/^[1-9][0-9]*$/.test(rawValue)) {
    throw new Error(`${name} must be a positive base-10 integer`);
  }

  const value = Number(rawValue);
  if (!Number.isSafeInteger(value)) {
    throw new Error(`${name} must be a positive base-10 integer`);
  }

  return value;
}

async function prepareOutputDirectory(requestedPath: string): Promise<string> {
  if (!path.isAbsolute(requestedPath)) {
    throw new Error("STOCK_ASSETS_OUTPUT_DIR must be absolute");
  }

  try {
    await mkdir(requestedPath, { recursive: true });
  } catch (error) {
    try {
      const existing = await stat(requestedPath);
      if (!existing.isDirectory()) {
        throw new Error("STOCK_ASSETS_OUTPUT_DIR output path must be a directory");
      }
    } catch (statError) {
      if (
        statError instanceof Error &&
        statError.message ===
          "STOCK_ASSETS_OUTPUT_DIR output path must be a directory"
      ) {
        throw statError;
      }
    }

    throw new Error("STOCK_ASSETS_OUTPUT_DIR could not be created", {
      cause: error,
    });
  }

  const canonicalPath = await realpath(requestedPath);
  const outputStat = await stat(canonicalPath);
  if (!outputStat.isDirectory()) {
    throw new Error("STOCK_ASSETS_OUTPUT_DIR output path must be a directory");
  }

  let probePath: string | undefined;
  try {
    probePath = await mkdtemp(path.join(canonicalPath, ".stock-assets-mcp-probe-"));
    await rm(probePath, { recursive: true });
    probePath = undefined;
  } catch (error) {
    if (probePath !== undefined) {
      await rm(probePath, { recursive: true, force: true }).catch(() => undefined);
    }
    throw new Error(
      "STOCK_ASSETS_OUTPUT_DIR must permit same-filesystem create and remove operations",
      { cause: error },
    );
  }

  return canonicalPath;
}

export async function loadStockAssetsConfig(
  env: NodeJS.ProcessEnv,
): Promise<StockAssetsConfig> {
  const pexelsApiKey = env.PEXELS_API_KEY?.trim();
  if (!pexelsApiKey) {
    throw new Error("PEXELS_API_KEY is required");
  }

  const requestedOutputDir = env.STOCK_ASSETS_OUTPUT_DIR?.trim();
  if (!requestedOutputDir) {
    throw new Error("STOCK_ASSETS_OUTPUT_DIR is required");
  }

  const outputDir = await prepareOutputDirectory(requestedOutputDir);

  return {
    pexelsApiKey,
    outputDir,
    maxBytes: parsePositiveInteger(
      "STOCK_ASSETS_MAX_BYTES",
      env.STOCK_ASSETS_MAX_BYTES,
      DEFAULT_MAX_BYTES,
    ),
    previewMaxBytes: PREVIEW_MAX_BYTES,
    timeoutMs: parsePositiveInteger(
      "STOCK_ASSETS_TIMEOUT_MS",
      env.STOCK_ASSETS_TIMEOUT_MS,
      DEFAULT_TIMEOUT_MS,
    ),
  };
}
