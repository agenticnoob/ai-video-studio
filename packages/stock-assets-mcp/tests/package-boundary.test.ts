import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

type PackageJson = {
  readonly name?: string;
  readonly private?: boolean;
  readonly bin?: Record<string, string>;
  readonly files?: readonly string[];
  readonly engines?: Record<string, string>;
  readonly scripts?: Record<string, string>;
  readonly dependencies?: Record<string, string>;
  readonly workspaces?: unknown;
};

const packageRoot = process.cwd();
const repositoryRoot = path.resolve(packageRoot, "../..");

async function readJson(filePath: string): Promise<PackageJson> {
  return JSON.parse(await readFile(filePath, "utf8")) as PackageJson;
}

async function sourceFiles(root: string): Promise<readonly string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(root, entry.name);
      return entry.isDirectory() ? sourceFiles(entryPath) : [entryPath];
    }),
  );
  return nested.flat();
}

async function joinedSources(
  root: string,
  excludedBasenames: readonly string[] = [],
): Promise<string> {
  const files = (await sourceFiles(root)).filter(
    (filePath) =>
      filePath.endsWith(".ts") && !excludedBasenames.includes(path.basename(filePath)),
  );
  return (await Promise.all(files.map((filePath) => readFile(filePath, "utf8")))).join("\n");
}

test("keeps the nested package private, stable, and pack-bounded", async () => {
  const pkg = await readJson(path.join(packageRoot, "package.json"));
  assert.equal(pkg.name, "stock-assets-mcp");
  assert.equal(pkg.private, true);
  assert.deepEqual(pkg.bin, { "stock-assets-mcp": "dist/cli.js" });
  assert.deepEqual(pkg.files, ["dist", "README.md"]);
  assert.deepEqual(pkg.engines, { node: ">=20" });
  assert.equal(pkg.dependencies?.["@modelcontextprotocol/sdk"], "1.29.0");
  assert.equal(
    pkg.scripts?.test,
    "npm run build && npm run test:compile && node --test .test-dist/tests/*.test.js",
  );
  assert.equal(pkg.scripts?.["verify:pack"], "npm pack --dry-run --json");
  assert.equal("workspaces" in pkg, false);
  assert.equal("publish" in (pkg.scripts ?? {}), false);
  assert.equal(/-(alpha|beta|rc)\b/u.test(JSON.stringify(pkg.dependencies)), false);

  const rootPackage = await readJson(path.join(repositoryRoot, "package.json"));
  assert.equal("workspaces" in rootPackage, false);
  assert.equal(rootPackage.dependencies?.["@modelcontextprotocol/sdk"], undefined);
});

test("keeps project paths, secrets, transports, and provider expansion outside the package", async () => {
  const runtime = await joinedSources(path.join(packageRoot, "src"));
  const publicTools = await joinedSources(path.join(packageRoot, "src/tools"));
  const tests = await joinedSources(path.join(packageRoot, "tests"), [
    "package-boundary.test.ts",
  ]);
  const combined = `${runtime}\n${tests}`;

  assert.doesNotMatch(
    combined,
    /PEXELS_API_KEY\s*[:=]\s*["'][A-Za-z0-9_-]{20,}["']/u,
  );
  assert.doesNotMatch(runtime, /\.producer-assets\/stock-candidates/u);
  assert.doesNotMatch(runtime, /public\/generated/u);
  assert.doesNotMatch(runtime, /public\/assets\/library/u);
  assert.doesNotMatch(publicTools, /input\.(?:url|outputDir|fileName|apiKey)\b/u);
  assert.doesNotMatch(
    combined,
    /@modelcontextprotocol\/sdk\/server\/(?:streamableHttp|sse)\.js/u,
  );
  assert.doesNotMatch(combined, /(?:OAuth|UnsplashProviderAdapter|PixabayProviderAdapter)/u);
  assert.doesNotMatch(runtime, /from\s+["'](?:\.\.\/){3,}/u);
});
