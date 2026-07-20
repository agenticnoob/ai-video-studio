import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import test, { type TestContext } from "node:test";

const CLI_PATH = path.resolve(process.cwd(), "dist/cli.js");
const SECRET = "pexels-stdio-contract-secret-value";

type SpawnedCli = {
  readonly child: ChildProcessWithoutNullStreams;
  readonly stdout: () => string;
  readonly stderr: () => string;
};

async function temporaryOutputRoot(t: TestContext): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "stock-assets-stdio-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

function spawnCli(input: {
  readonly outputDir?: string;
  readonly apiKey?: string;
}): SpawnedCli {
  const env = { ...process.env };
  delete env.STOCK_ASSETS_LIVE_PEXELS;
  delete env.PEXELS_API_KEY;
  delete env.STOCK_ASSETS_OUTPUT_DIR;
  if (input.apiKey !== undefined) env.PEXELS_API_KEY = input.apiKey;
  if (input.outputDir !== undefined) {
    env.STOCK_ASSETS_OUTPUT_DIR = input.outputDir;
  }
  const child = spawn(process.execPath, [CLI_PATH], {
    cwd: process.cwd(),
    env,
    stdio: ["pipe", "pipe", "pipe"],
  });
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk: string) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk: string) => {
    stderr += chunk;
  });
  return { child, stdout: () => stdout, stderr: () => stderr };
}

function writeHandshake(child: ChildProcessWithoutNullStreams): void {
  for (const message of [
    {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-11-25",
        capabilities: {},
        clientInfo: { name: "stdio-contract-test", version: "0.1.0" },
      },
    },
    { jsonrpc: "2.0", method: "notifications/initialized" },
    { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
  ]) {
    child.stdin.write(`${JSON.stringify(message)}\n`);
  }
}

async function waitForResponse(
  processFixture: SpawnedCli,
  responseId: number,
): Promise<Record<string, unknown>> {
  const { child } = processFixture;
  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline) {
    for (const line of processFixture.stdout().split("\n")) {
      if (line.length === 0) continue;
      const parsed = JSON.parse(line) as Record<string, unknown>;
      if (parsed.id === responseId) return parsed;
    }
    if (child.exitCode !== null || child.signalCode !== null) {
      assert.fail(
        `CLI exited before response ${responseId}: ${processFixture.stderr()}`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  assert.fail(`Timed out waiting for response ${responseId}`);
}

async function waitForClose(
  child: ChildProcessWithoutNullStreams,
): Promise<{ readonly code: number | null; readonly signal: NodeJS.Signals | null }> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return { code: child.exitCode, signal: child.signalCode };
  }
  const timeout = setTimeout(() => child.kill("SIGKILL"), 5_000);
  try {
    const [code, signal] = (await once(child, "close")) as [
      number | null,
      NodeJS.Signals | null,
    ];
    return { code, signal };
  } finally {
    clearTimeout(timeout);
  }
}

function assertProtocolOnly(stdout: string): void {
  const lines = stdout.split("\n").filter((line) => line.length > 0);
  assert.ok(lines.length > 0);
  for (const line of lines) {
    const parsed = JSON.parse(line) as { readonly jsonrpc?: string };
    assert.equal(parsed.jsonrpc, "2.0");
  }
}

test("built CLI completes initialize and tools/list with protocol-only stdout", async (t) => {
  const fixture = spawnCli({
    apiKey: SECRET,
    outputDir: await temporaryOutputRoot(t),
  });
  writeHandshake(fixture.child);
  const listed = await waitForResponse(fixture, 2);
  const result = listed.result as
    | { readonly tools?: readonly { readonly name: string }[] }
    | undefined;
  assert.deepEqual(
    result?.tools?.map((tool) => tool.name).sort(),
    ["acquire_image", "get_provider_status", "preview_images", "search_images"],
  );
  fixture.child.stdin.end();
  const closed = await waitForClose(fixture.child);
  assert.equal(closed.code, 0);
  assert.equal(closed.signal, null);
  assertProtocolOnly(fixture.stdout());
  assert.equal(fixture.stdout().includes(SECRET), false);
  assert.equal(fixture.stderr().includes(SECRET), false);
});

test("missing configuration is redacted, bounded, stderr-only, and nonzero", async () => {
  const fixture = spawnCli({ apiKey: SECRET });
  const closed = await waitForClose(fixture.child);
  assert.notEqual(closed.code, 0);
  assert.equal(fixture.stdout(), "");
  assert.equal(fixture.stderr().includes(SECRET), false);
  assert.ok(Buffer.byteLength(fixture.stderr(), "utf8") <= 1_024);
  assert.equal(
    fixture.stderr().split("\n").filter((line) => line.length > 0).length,
    1,
  );
});

test("stdin close shuts down without an unhandled rejection", async (t) => {
  const fixture = spawnCli({
    apiKey: SECRET,
    outputDir: await temporaryOutputRoot(t),
  });
  writeHandshake(fixture.child);
  await waitForResponse(fixture, 2);
  fixture.child.stdin.end();
  const closed = await waitForClose(fixture.child);
  assert.equal(closed.code, 0);
  assert.equal(closed.signal, null);
  assert.doesNotMatch(fixture.stderr(), /unhandled|rejection/i);
  assertProtocolOnly(fixture.stdout());
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  test(`${signal} uses guarded clean shutdown without stdout diagnostics`, async (t) => {
    const fixture = spawnCli({
      apiKey: SECRET,
      outputDir: await temporaryOutputRoot(t),
    });
    writeHandshake(fixture.child);
    await waitForResponse(fixture, 2);
    assert.equal(fixture.child.kill(signal), true);
    assert.equal(fixture.child.kill(signal), true);
    const closed = await waitForClose(fixture.child);
    assert.equal(closed.code, 0);
    assert.equal(closed.signal, null);
    assertProtocolOnly(fixture.stdout());
    assert.equal(fixture.stdout().includes(SECRET), false);
    assert.equal(fixture.stderr().includes(SECRET), false);
  });
}

test("application source and build contain no stdout logging or forced exit", async () => {
  const [source, built] = await Promise.all([
    readFile(path.join(process.cwd(), "src/cli.ts"), "utf8"),
    readFile(CLI_PATH, "utf8"),
  ]);
  for (const contents of [source, built]) {
    assert.doesNotMatch(contents, /console\.log\s*\(/);
    assert.doesNotMatch(contents, /process\.stdout\.write\s*\(/);
    assert.doesNotMatch(contents, /process\.exit\s*\(/);
  }
  assert.match(source, /const \{ pexelsApiKey, \.\.\.config \} = startupConfig/);
  assert.match(source, /new PexelsProviderAdapter\(\{/);
  assert.match(source, /apiKey: pexelsApiKey/);
  assert.match(source, /createStockAssetsServer\(\{ config, provider, store \}\)/);
  assert.match(source, /process\.exitCode/);
  assert.doesNotMatch(
    source,
    /createStockAssetsServer\(\{\s*config:\s*startupConfig/,
  );
});
