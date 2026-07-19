# Stock Assets MCP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an independently installable local `stock-assets-mcp` stdio server for safe Pexels image search, visual preview, and deterministic acquisition, then connect it to AI Video Studio's existing library-first Agent Producer workflow without coupling the package to Remotion or the reviewed asset-library runtime.

**Architecture:** `packages/stock-assets-mcp/` owns its npm manifest, lockfile, strict domain schemas, Pexels adapter, bounded HTTP/image validation, atomic candidate store, MCP tools, CLI, and package-local tests. The root repository remains a non-workspace Producer OS: its integration is documentation, skill routing, architecture guards, and one deterministic `producer:assets` fixture proving that a candidate receipt can become an ignored composition-local `ProducerAssetManifest` entry. The reviewed reusable library remains a separate later review path through `producer:library:add`; the MCP never writes to it or to `public/generated/`.

**Tech Stack:** Node.js `>=20` ESM; official MCP TypeScript SDK `@modelcontextprotocol/sdk@1.29.0`; Zod 4; TypeScript 5.9; Node's built-in `node:test`; built-in `fetch`, Web Streams, `AbortController`, `crypto`, and filesystem APIs; Sharp for bounded JPEG/PNG/WebP decode and dimensions; existing AI Video Studio Producer asset runtime and Docker `producer` service.

## Global Constraints

- Treat `docs/superpowers/specs/2026-07-20-stock-assets-mcp-design.md` as the approved product contract. Do not reopen product decisions or add adjacent features.
- Package name, CLI executable, and MCP server name are exactly `stock-assets-mcp` under `packages/stock-assets-mcp/`.
- Keep an independent nested `package.json` and `package-lock.json`; do not add npm workspaces to the root package.
- Use the official SDK's latest stable non-prerelease v1 release verified on 2026-07-20: exact `@modelcontextprotocol/sdk@1.29.0`. The official repository still marks v2 as beta/pre-release until the planned 2026-07-28 release, so do not use `@modelcontextprotocol/server`, `@modelcontextprotocol/client`, v2 imports, alpha packages, or draft-only APIs.
- Use the v1 imports `@modelcontextprotocol/sdk/server/mcp.js`, `@modelcontextprotocol/sdk/server/stdio.js`, `@modelcontextprotocol/sdk/client/index.js`, and `@modelcontextprotocol/sdk/inMemory.js`.
- Use `McpServer.registerTool`, Zod input/output schemas, tool annotations, `structuredContent` plus a serialized JSON text fallback, MCP image content, and `StdioServerTransport`.
- Expose tools only: `get_provider_status`, `search_images`, `preview_images`, and `acquire_image`. Do not expose resources, prompts, sampling, elicitation, tasks, HTTP transport, OAuth, or a UI.
- v1 supports Pexels still images only. Do not implement Unsplash, Pixabay, stock video, generation providers, or empty provider adapters.
- Public orientation is exactly `landscape | portrait | square`. Pexels maps `square -> square`; a data-only future contract records Unsplash `square -> squarish` without an Unsplash runtime branch.
- Read `PEXELS_API_KEY` and `STOCK_ASSETS_OUTPUT_DIR` only at startup. Optional defaults are `STOCK_ASSETS_MAX_BYTES=26214400` and `STOCK_ASSETS_TIMEOUT_MS=20000`.
- The AI Video Studio output root is the already ignored `/data/projects/labs/ai-video-studio/.producer-assets/stock-candidates/`. Do not add a redundant `.gitignore` rule.
- The MCP never accepts a URL, output directory, filename, API key, license override, or attribution override as tool input.
- Search the reviewed library first. Call the MCP only when no reviewed item fits. Remotion must use only the composition-local copy created by `producer:assets`, never a remote URL or `.producer-assets/stock-candidates/` path.
- Later approval uses `producer:library:add` with real Pexels facts. Never use the inbox-specific `producer:library:ingest` for MCP candidates.
- Do not automatically promote, delete, or clean candidates. Rejection from the reusable library does not invalidate an already localized current-video copy.
- Do not modify or regenerate frozen or completed compositions.
- Deterministic tests must not access the real network. The real Pexels smoke is separately opt-in and cannot depend on a fixed search rank or image ID.
- Keep secrets, candidate images, generated media, pack tarballs, coverage, temporary directories, and environment files untracked.

Official implementation references:

- [MCP TypeScript SDK v1 documentation](https://ts.sdk.modelcontextprotocol.io/)
- [Official TypeScript SDK v1.29.0 release](https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/v1.29.0)
- [MCP 2025-11-25 tools specification](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)
- [MCP 2025-11-25 stdio transport specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
- [Pexels API documentation and guidelines](https://www.pexels.com/api/documentation/)

---

## Verified Repository Baseline

- At plan research start on 2026-07-20, `HEAD` was `449b7fc docs: design stock assets mcp` on `refactor/agent-producer-service`, and `git status --short` was empty. Unrelated Remotion/audio working-tree changes appeared during plan drafting; they were preserved and excluded from this plan-only commit. The implementation agent must treat a fresh status check, not this historical snapshot, as authoritative.
- No `packages/` directory is currently tracked.
- The root package is not an npm workspace. Root TypeScript/build ownership remains Remotion-oriented and must not absorb package dependencies.
- `docker-compose.yml` has one `producer` service built from Node 22 Bookworm, mounts the repository at `/workspace`, and keeps the root `node_modules` in a named volume.
- Root smokes are grouped under `scripts/smoke/architecture/`, `scripts/smoke/producer/`, and `scripts/smoke/compositions/`; deterministic fixture source is under `scripts/fixtures/`, while generated fixture media belongs under `/tmp` or ignored roots.
- `localizeProducerAssets()` accepts a manual source path and writes composition media to `public/generated/<slug>/assets/`; `preflightProducerAssets()` rechecks integrity/media and existing library references.
- `.gitignore` already ignores `.producer-assets/`, `public/generated/`, and `out/`.

At implementation start, rerun and record these baselines before changing files:

```bash
git status --short
git log -5 --oneline --decorate
test ! -d packages/stock-assets-mcp
git check-ignore -v .producer-assets/stock-candidates/example.jpg
docker compose config --quiet
```

Expected: the design commit remains reachable; the package directory is absent; the candidate path is ignored by the existing `.producer-assets/` rule; Compose config is valid. Record and preserve unrelated working-tree changes, and stop if they overlap a planned file or if newer committed authority contradicts this plan.

## Planned File Map

Package-owned files:

- `packages/stock-assets-mcp/package.json` — private nested package metadata, exact SDK dependency, scripts, `bin`, `files`, and Node engine.
- `packages/stock-assets-mcp/package-lock.json` — independently resolved dependency graph.
- `packages/stock-assets-mcp/tsconfig.json` — strict ESM production build to `dist/`.
- `packages/stock-assets-mcp/tsconfig.test.json` — test compilation to ignored `.test-dist/`.
- `packages/stock-assets-mcp/eslint.config.mjs` — package-local TypeScript lint and `no-console` stdout-safety rule.
- `packages/stock-assets-mcp/README.md` — install, MCP client config, env, tools, provider policy, safety, and live smoke.
- `packages/stock-assets-mcp/src/cli.ts` — startup config, stdio transport, signal/disconnect shutdown, stderr-only diagnostics.
- `packages/stock-assets-mcp/src/server.ts` — dependency-injected server factory and four tool registrations.
- `packages/stock-assets-mcp/src/config.ts` — strict startup-only environment and output-root policy.
- `packages/stock-assets-mcp/src/domain/schemas.ts` — normalized types plus strict input/output/receipt schemas.
- `packages/stock-assets-mcp/src/domain/errors.ts` — stable errors, retryability, redaction, and MCP error results.
- `packages/stock-assets-mcp/src/providers/types.ts` — provider adapter and orientation mapping contracts.
- `packages/stock-assets-mcp/src/providers/http.ts` — bounded timeout/retry/manual-redirect request primitive.
- `packages/stock-assets-mcp/src/providers/pexels.ts` — Pexels API mapping, quota snapshot, and process-local search cache.
- `packages/stock-assets-mcp/src/storage/image-validation.ts` — allowlisted HTTPS download, streamed byte cap, MIME/magic/decode validation.
- `packages/stock-assets-mcp/src/storage/candidate-store.ts` — contained same-filesystem transaction, receipt, atomic publish, and idempotency.
- `packages/stock-assets-mcp/src/tools/provider-status.ts` — provider/output/quota status handler.
- `packages/stock-assets-mcp/src/tools/search-images.ts` — normalized search handler.
- `packages/stock-assets-mcp/src/tools/preview-images.ts` — canonical lookup and MCP image-content handler.
- `packages/stock-assets-mcp/src/tools/acquire-image.ts` — canonical lookup, original download, and candidate-store handler.
- `packages/stock-assets-mcp/tests/*.test.ts` — flat package-local deterministic test files so Node 20 shell globbing stays portable.
- `packages/stock-assets-mcp/tests/helpers.ts` — deterministic HTTP queues, clocks, image bytes, temp roots, and in-process MCP client setup.

Repository integration files:

- `scripts/fixtures/producer-stock-assets/fixture-candidate.mjs` — source-only deterministic Pexels receipt and tiny valid raster fixture generator.
- `scripts/smoke/producer/producer-stock-assets-smoke.mjs` — candidate receipt to `producer:assets` to `preflight` integration proof.
- `scripts/smoke/architecture/stock-assets-mcp-alignment-smoke.mjs` — package/doc/skill/boundary guard.
- `package.json` — root convenience smoke registrations only; no workspace or MCP runtime dependency.
- `scripts/AGENTS.md` — new smoke/fixture ownership and validation command.
- `README.md`, `AGENTS.md`, `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`, `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`, `docs/PRODUCER_ASSET_CONTRACT.md` — bounded post-Roadmap truth.
- `.agents/skills/ai-video-studio-agent-producer/SKILL.md` — library-first MCP fallback and current-video localization.
- `.agents/skills/ai-video-studio-asset-library/SKILL.md` — later explicit review via `producer:library:add`, never inbox ingest.
- `scripts/smoke/architecture/skill-alignment-smoke.mjs` — executable skill ownership assertions.

## Test Layers

| Layer | Location | Network | Purpose |
| --- | --- | --- | --- |
| Package-local unit tests | `packages/stock-assets-mcp/tests/{config,domain,image-validation,candidate-store}.test.ts` | Never | Pure schemas, errors, path/media/security, receipt, and transaction behavior |
| Mock provider contract tests | `packages/stock-assets-mcp/tests/pexels-provider.test.ts` | Mocked `fetch` only | Pexels API mapping, quota, cache, timeout, retry, and redaction |
| MCP in-process contract tests | `packages/stock-assets-mcp/tests/mcp-contract.test.ts` | Mocked provider/download only | Tool discovery, schemas, annotations, structured/text/image results, stable errors |
| MCP stdio process tests | `packages/stock-assets-mcp/tests/stdio-contract.test.ts` | Never | CLI startup/shutdown and stdout protocol purity |
| Repository integration smoke | `scripts/smoke/producer/producer-stock-assets-smoke.mjs` | Never | Receipt-to-supply translation, composition-local copy, manifest, and preflight |
| Repository alignment smoke | `scripts/smoke/architecture/stock-assets-mcp-alignment-smoke.mjs` | Never | Library-first docs/skills/package boundaries and ignored-path policy |
| Opt-in live Pexels smoke | `packages/stock-assets-mcp/tests/live-pexels.test.ts` | Real Pexels only | One bounded search, preview, and acquisition in a fresh temp root |
| Docker-first final checks | Root `producer` service | Package install may reach npm; tests do not reach Pexels | Root type/lint/build/composition and focused integration truth |

## Security Boundary Test Matrix

| Boundary | Deterministic test ownership | Required assertion |
| --- | --- | --- |
| API key redaction | `domain.test.ts`, `pexels-provider.test.ts`, `tools.test.ts`, `stdio-contract.test.ts` | Key and Authorization values never occur in structured/text errors, stderr, stdout, receipts, or status |
| Arbitrary URL rejection | `domain.test.ts`, `tools.test.ts` | Strict tool inputs reject URL fields; preview/acquire always re-fetch adapter-owned canonical URLs |
| Output path containment | `config.test.ts`, `candidate-store.test.ts` | Startup requires/canonicalizes an absolute root; every final/temp target remains below it |
| Traversal/symlink escape | `candidate-store.test.ts` | Absolute/`..` fragments and symlinked provider/item/file/receipt paths fail without touching outside sentinels |
| Redirect host revalidation | `image-validation.test.ts` | Every redirect is manually resolved and exact-host validated; suffix tricks and a sixth hop fail |
| Streamed byte limit | `image-validation.test.ts` | Oversized `Content-Length` fails before read and chunk overflow cancels before append/return |
| MIME and magic bytes mismatch | `image-validation.test.ts` | Header/magic disagreements, unsupported magic, corrupt decode, and zero dimensions fail closed |
| Partial transaction rollback | `candidate-store.test.ts` | Injected failure after image or receipt write leaves no final item/temp directory and preserves siblings |
| Repeat acquisition integrity mismatch | `candidate-store.test.ts`, `tools.test.ts` | Existing byte/receipt/canonical-fact drift returns `INTEGRITY_MISMATCH` and performs no overwrite |
| Stdout only contains MCP protocol | `stdio-contract.test.ts` | Every nonempty stdout line is JSON-RPC; startup failure, logs, signals, and disconnect add zero non-protocol bytes |

---

### Task 1: Independent Package, Stable SDK, Config, and Stdio Baseline

**Goal:** Establish the nested package and strict startup boundary without adding any MCP tools yet.

**Files:**

- Create: `packages/stock-assets-mcp/package.json`
- Create: `packages/stock-assets-mcp/package-lock.json`
- Create: `packages/stock-assets-mcp/tsconfig.json`
- Create: `packages/stock-assets-mcp/tsconfig.test.json`
- Create: `packages/stock-assets-mcp/eslint.config.mjs`
- Create: `packages/stock-assets-mcp/README.md`
- Create: `packages/stock-assets-mcp/src/config.ts`
- Create: `packages/stock-assets-mcp/src/server.ts`
- Create: `packages/stock-assets-mcp/src/cli.ts`
- Test: `packages/stock-assets-mcp/tests/config.test.ts`

**Interfaces:**

- Produces `StockAssetsConfig`, `loadStockAssetsConfig(env)`, `createStockAssetsServer(dependencies)`, and executable `dist/cli.js`.
- `StockAssetsConfig` contains only `pexelsApiKey`, canonical `outputDir`, `maxBytes`, `previewMaxBytes=5242880`, and `timeoutMs`.
- Later tasks inject provider/store instances through `createStockAssetsServer`; `server.ts` must not read `process.env`.

- [ ] **Step 1: Create the test harness and write the failing config tests**

Use exact nested package scripts:

```json
{
  "name": "stock-assets-mcp",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "bin": { "stock-assets-mcp": "dist/cli.js" },
  "files": ["dist", "README.md"],
  "engines": { "node": ">=20" },
  "scripts": {
    "build": "rm -rf dist && tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.test.json --noEmit",
    "test:compile": "rm -rf .test-dist && tsc -p tsconfig.test.json",
    "test": "npm run test:compile && node --test .test-dist/tests/*.test.js",
    "lint": "eslint src tests",
    "start": "node dist/cli.js"
  }
}
```

Install only inside the nested package and save exact resolved versions:

```bash
npm --prefix packages/stock-assets-mcp install --save-exact @modelcontextprotocol/sdk@1.29.0 zod@4.3.6 sharp@latest
npm --prefix packages/stock-assets-mcp install --save-dev --save-exact typescript@5.9.3 @types/node@20.12.14 eslint@9.19.0 typescript-eslint@8.46.0
```

Immediately verify `package.json` and `package-lock.json` contain no prerelease version (`-alpha`, `-beta`, `-rc`) for direct dependencies. Write tests equivalent to:

```ts
test("requires a redaction-safe API key and absolute output root", async () => {
  await assert.rejects(
    () => loadStockAssetsConfig({ STOCK_ASSETS_OUTPUT_DIR: "/tmp/candidates" }),
    /PEXELS_API_KEY is required/,
  );
  await assert.rejects(
    () => loadStockAssetsConfig({ PEXELS_API_KEY: "secret", STOCK_ASSETS_OUTPUT_DIR: "relative" }),
    /must be absolute/,
  );
});

test("applies bounded defaults", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "stock-assets-config-"));
  const config = await loadStockAssetsConfig({
    PEXELS_API_KEY: "fixture-key",
    STOCK_ASSETS_OUTPUT_DIR: path.join(root, "candidates"),
  });
  assert.equal(config.maxBytes, 26_214_400);
  assert.equal(config.previewMaxBytes, 5_242_880);
  assert.equal(config.timeoutMs, 20_000);
});
```

- [ ] **Step 2: Run RED**

```bash
npm --prefix packages/stock-assets-mcp test
```

Expected: compilation fails because `src/config.ts` and its exported `loadStockAssetsConfig` do not exist, not because of a network request.

- [ ] **Step 3: Implement the smallest strict startup surface**

Implement `loadStockAssetsConfig(env: NodeJS.ProcessEnv): Promise<StockAssetsConfig>` with these exact rules:

```ts
export type StockAssetsConfig = {
  readonly pexelsApiKey: string;
  readonly outputDir: string;
  readonly maxBytes: number;
  readonly previewMaxBytes: 5_242_880;
  readonly timeoutMs: number;
};
```

- Trim and require the key without echoing it.
- Require an absolute output path, create it, resolve it with `realpath`, require a directory, and verify the process can create/remove one same-filesystem probe directory below it.
- Parse positive base-10 integers only; reject zero, signs, whitespace-surrounded garbage, decimals, NaN, and values above `Number.MAX_SAFE_INTEGER`.
- Keep `server.ts` as a dependency-injected `McpServer({name: "stock-assets-mcp", version: "0.1.0"})` factory with no tools until Task 8.
- Keep `cli.ts` limited to config loading, the zero-tool server factory, `StdioServerTransport`, stderr-only fatal reporting, and nonzero startup exit. Do not use `console.log`. Task 8 replaces the empty registration set through the same factory API after the real provider/store dependencies exist.

- [ ] **Step 4: Run GREEN**

```bash
npm --prefix packages/stock-assets-mcp run typecheck
npm --prefix packages/stock-assets-mcp test
npm --prefix packages/stock-assets-mcp run lint
npm --prefix packages/stock-assets-mcp run build
```

Expected: all four commands exit `0`; `dist/cli.js` exists; root `package.json` and root lockfile are unchanged.

**Documentation sync:** Add a package README baseline stating local/private status, Node `>=20`, stdio-only scope, env names/defaults, ignored candidate output example, and that no tool accepts secrets or paths. Do not yet claim tools are implemented.

**Commit boundary:** Stage only `packages/stock-assets-mcp/`. Suggested commit: `feat: scaffold stock assets mcp package`.

---

### Task 2: Strict Domain Schemas, Error Contract, and Provider Boundary

**Goal:** Freeze provider-neutral public types and stable errors before network or tool code.

**Files:**

- Create: `packages/stock-assets-mcp/src/domain/schemas.ts`
- Create: `packages/stock-assets-mcp/src/domain/errors.ts`
- Create: `packages/stock-assets-mcp/src/providers/types.ts`
- Test: `packages/stock-assets-mcp/tests/domain.test.ts`
- Modify: `packages/stock-assets-mcp/README.md`

**Interfaces:**

- Produces strict Zod schemas/types for all four inputs, successful outputs, `StockImageCandidate`, `SearchPage`, quota, `AcquisitionReceiptV1`, and `StockAssetsError`.
- Produces `ImageProviderAdapter`, `ProviderImageRecord`, `mapProviderOrientation()`, `StockAssetsException`, `redactSensitiveText()`, and `toToolErrorResult()`.
- Later tasks must import these definitions instead of redeclaring tool/provider shapes.

- [ ] **Step 1: Write failing schema and redaction tests**

```ts
test("acquire accepts only a canonical id and descriptive search context", () => {
  assert.equal(acquireImageInputSchema.parse({ imageId: "2014422" }).imageId, "2014422");
  for (const forbidden of [
    { imageId: "2014422", url: "https://example.com/a.jpg" },
    { imageId: "2014422", outputDir: "/tmp" },
    { imageId: "2014422", fileName: "a.jpg" },
    { imageId: "../escape" },
  ]) assert.throws(() => acquireImageInputSchema.parse(forbidden));
});

test("records both provider orientation contracts without an Unsplash adapter", () => {
  assert.equal(mapProviderOrientation("pexels", "square"), "square");
  assert.equal(mapProviderOrientation("future-unsplash-contract", "square"), "squarish");
});

test("redacts keys and authorization headers from errors", () => {
  const secret = "pexels-secret-value";
  const safe = redactSensitiveText(`Authorization: ${secret}; failed`, [secret]);
  assert.equal(safe.includes(secret), false);
  assert.match(safe, /\[REDACTED\]/);
});
```

- [ ] **Step 2: Run RED**

```bash
npm --prefix packages/stock-assets-mcp test
```

Expected: missing schema/error/provider exports.

- [ ] **Step 3: Implement the normalized contract**

Use `.strict()` object schemas and explicit bounds:

- `query`: trimmed 1–200 characters.
- `imageId`: decimal string matching `^[1-9][0-9]{0,15}$`.
- `preview_images.imageIds`: 1–4 unique IDs.
- `page`: integer `1..1000`; `perPage`: integer `1..30`, default `12`; locale defaults to `zh-CN` and uses the exact official Pexels locale allowlist from the approved spec.
- `minWidth`/`minHeight`: optional positive integers capped at `100000`.
- `selectionNote`: optional trimmed 1–500 characters.
- Error codes are exactly `PROVIDER_NOT_CONFIGURED`, `INVALID_INPUT`, `IMAGE_NOT_FOUND`, `RATE_LIMITED`, `NETWORK_TIMEOUT`, `PROVIDER_ERROR`, `DOWNLOAD_REJECTED`, `OUTPUT_BOUNDARY_VIOLATION`, and `INTEGRITY_MISMATCH`.

Keep future Unsplash mapping data-only:

```ts
export const providerOrientationMap = {
  pexels: { landscape: "landscape", portrait: "portrait", square: "square" },
  "future-unsplash-contract": {
    landscape: "landscape",
    portrait: "portrait",
    square: "squarish",
  },
} as const;
```

Define the provider adapter with injected dependencies and no repository concepts:

```ts
export interface ImageProviderAdapter {
  readonly id: "pexels";
  isConfigured(): boolean;
  getQuota(): ProviderQuota | undefined;
  search(input: NormalizedSearchInput): Promise<SearchPage>;
  getById(imageId: string): Promise<ProviderImageRecord>;
}
```

`ProviderImageRecord` extends the public candidate with private adapter-owned `originalUrl` and `previewUrl`; tool outputs must strip those two download URLs except for the public bounded `thumbnailUrl` already approved by the spec.

Implement `toToolErrorResult()` so every tool-level failure has `isError: true`, structured error JSON, and the same JSON serialized in one text content block. Never include full upstream bodies, env dumps, keys, or Authorization values.

- [ ] **Step 4: Run GREEN**

```bash
npm --prefix packages/stock-assets-mcp run typecheck
npm --prefix packages/stock-assets-mcp test
npm --prefix packages/stock-assets-mcp run lint
```

Expected: schema, orientation, error classification, retryability, and key-redaction tests pass.

**Documentation sync:** Add the exact public input/output/error enums and the recorded future `square -> squarish` contract to the package README; explicitly state that no Unsplash runtime exists.

**Commit boundary:** Stage domain/provider types, tests, and package README only. Suggested commit: `feat: define stock assets mcp contracts`.

---

### Task 3: Pexels Search/Get-by-ID, Quota, Timeout, Retry, and Cache

**Goal:** Implement a deterministic, mockable Pexels API adapter without downloading image bytes.

**Files:**

- Create: `packages/stock-assets-mcp/src/providers/http.ts`
- Create: `packages/stock-assets-mcp/src/providers/pexels.ts`
- Create: `packages/stock-assets-mcp/tests/helpers.ts`
- Test: `packages/stock-assets-mcp/tests/pexels-provider.test.ts`
- Modify: `packages/stock-assets-mcp/README.md`

**Interfaces:**

- Produces `requestWithPolicy()`, `PexelsProviderAdapter`, `PEXELS_API_ORIGIN`, `PEXELS_IMAGE_HOSTS`, and injectable `fetchImpl`, `sleep`, and `now` dependencies.
- Search returns only normalized candidates and metadata. `getById` returns a canonical `ProviderImageRecord` for preview/acquire.

- [ ] **Step 1: Write mock provider contract tests first**

Cover success and every provider failure with a queued fake `fetch`:

```ts
test("normalizes search, applies local dimensions, captures quota, and caches", async () => {
  const http = createFetchQueue([pexelsSearchResponse({ photos: [smallPhoto, largePhoto] })]);
  const adapter = new PexelsProviderAdapter({ apiKey: "secret", fetchImpl: http.fetch, now: () => 0 });
  const input = { query: "量子 网络", locale: "zh-CN", orientation: "square", page: 1, perPage: 12, minWidth: 1000 } as const;
  const first = await adapter.search(input);
  const second = await adapter.search(input);
  assert.deepEqual(first.items.map((item) => item.imageId), [String(largePhoto.id)]);
  assert.equal(second.cache.hit, true);
  assert.equal(http.calls.length, 1);
  assert.equal(new URL(http.calls[0].url).searchParams.get("orientation"), "square");
  assert.equal(http.calls[0].headers.Authorization, "secret");
  assert.deepEqual(adapter.getQuota(), { limit: 20000, remaining: 19999, resetAt: 1590529646 });
});
```

Add separate cases for get-by-ID, all supported locale/orientation values, pagination, `404 -> IMAGE_NOT_FOUND`, `429 -> RATE_LIMITED`, other `4xx` no retry, timeout, two retries for transient `5xx`, malformed JSON, malformed 2xx payload, cache expiry, and key redaction from thrown/logged text.

- [ ] **Step 2: Run RED**

```bash
npm --prefix packages/stock-assets-mcp test
```

Expected: `PexelsProviderAdapter` and request policy are missing.

- [ ] **Step 3: Implement the minimal adapter**

- Use only `https://api.pexels.com/v1/search` and `https://api.pexels.com/v1/photos/:id`.
- Send `PEXELS_API_KEY` only as the API `Authorization` header.
- Validate successful JSON through strict provider-response Zod schemas before mapping.
- Map official `id`, `width`, `height`, `url`, `photographer`, `photographer_url`, `avg_color`, `alt`, `src.medium`, and `src.original` fields.
- Use `alt || "Pexels photo <id>"` for bounded nonempty description.
- Produce attribution `Photo by <photographer> on Pexels` with `required: true`.
- Read `X-Ratelimit-Limit`, `X-Ratelimit-Remaining`, and `X-Ratelimit-Reset` only from successful responses.
- Use at most three total attempts: immediate attempt, then deterministic 250 ms and 500 ms waits for timeout or `5xx` only. Never sleep/retry `429` or other `4xx`.
- Clamp parsed `Retry-After` to `0..3600` seconds.
- Use an injectable clock and a five-minute cache TTL keyed by stable JSON of normalized search input. Cache successful search results only; never cache errors.

- [ ] **Step 4: Run GREEN**

```bash
npm --prefix packages/stock-assets-mcp run typecheck
npm --prefix packages/stock-assets-mcp test
npm --prefix packages/stock-assets-mcp run lint
```

Expected: all mock HTTP cases pass with exactly the asserted attempt counts and no real DNS/network activity.

**Documentation sync:** Document official endpoints, header auth, quota fields, five-minute process-local cache, retry matrix, and Pexels locale/orientation limits in the package README.

**Commit boundary:** Stage provider HTTP/Pexels files, helpers, tests, and README. Suggested commit: `feat: add pexels image provider`.

---

### Task 4: Bounded HTTPS Download and Image Validation Security Boundary

**Goal:** Build the one shared download primitive used by preview and acquisition, with every network/media boundary enforced before bytes can be returned.

**Files:**

- Create: `packages/stock-assets-mcp/src/storage/image-validation.ts`
- Test: `packages/stock-assets-mcp/tests/image-validation.test.ts`
- Modify: `packages/stock-assets-mcp/src/providers/http.ts`
- Modify: `packages/stock-assets-mcp/README.md`

**Interfaces:**

- Produces `downloadValidatedImage(input): Promise<ValidatedImage>`.
- `ValidatedImage` contains `bytes`, `mimeType`, `extension`, `width`, `height`, `sizeInBytes`, and lowercase SHA-256.
- Preview supplies the 5 MiB cap; acquire supplies `config.maxBytes`.

- [ ] **Step 1: Write a security matrix as failing tests**

Required individual tests:

```ts
test("rejects non-HTTPS and unapproved hosts", async () => { /* http:, example.com, suffix tricks */ });
test("revalidates every redirect host", async () => { /* images.pexels.com -> evil.example */ });
test("does not forward Authorization to image hosts", async () => { /* inspect request headers */ });
test("rejects Content-Length above the byte cap before reading", async () => { /* zero body reads */ });
test("cancels when streamed bytes cross the cap", async () => { /* chunk N crosses limit */ });
test("rejects declared MIME that disagrees with magic bytes", async () => { /* image/png + JPEG */ });
test("rejects unsupported magic even with image/jpeg header", async () => { /* text bytes */ });
test("rejects corrupt or zero-dimension raster data", async () => { /* truncated PNG */ });
test("derives extension from decoded bytes, not URL suffix", async () => { /* .bin URL + PNG */ });
```

Use exact-host cases including `images.pexels.com.evil.example`, `evil-images.pexels.com`, userinfo, non-default ports, and a redirect chain longer than five hops.

- [ ] **Step 2: Run RED**

```bash
npm --prefix packages/stock-assets-mcp test
```

Expected: missing `downloadValidatedImage`.

- [ ] **Step 3: Implement the shared policy**

The function must execute in this exact order:

1. Parse URL, require `https:`, no username/password, default port, and exact hostname membership (`images.pexels.com` in v1).
2. Send requests with `redirect: "manual"`, no Authorization header, and one abort timer per attempt.
3. On `301/302/303/307/308`, resolve `Location`, re-run all URL checks, and stop after five redirects.
4. Reject non-2xx status. Retry timeout/`5xx` only under Task 3's bounded schedule.
5. Normalize `Content-Type` without parameters; allow only `image/jpeg`, `image/png`, and `image/webp`.
6. Reject a numeric `Content-Length` above the caller's cap.
7. Read the Web Stream chunk-by-chunk, increment before append, cancel immediately above the cap, and never return a partial buffer.
8. Detect JPEG (`ff d8 ff`), PNG signature, or RIFF/WEBP magic; require declared MIME to match detected bytes.
9. Decode with Sharp using `failOn: "error"` and `limitInputPixels: 100_000_000`; require positive integer dimensions and a supported format.
10. Compute SHA-256 and extension (`jpg`, `png`, `webp`) from validated bytes.

- [ ] **Step 4: Run GREEN**

```bash
npm --prefix packages/stock-assets-mcp run typecheck
npm --prefix packages/stock-assets-mcp test
npm --prefix packages/stock-assets-mcp run lint
```

Expected: every named security case passes; mock readers prove the byte cap stops streaming rather than validating only after `arrayBuffer()`.

**Documentation sync:** Add the exact HTTPS host, redirect, five-hop, preview/acquire byte, MIME/magic/decode, and 100 MP policies to the package README.

**Commit boundary:** Stage network/image validation code and tests. Suggested commit: `feat: validate stock image downloads`.

---

### Task 5: MCP Preview Image Content

**Goal:** Return visually inspectable one-to-four-image MCP results without writing preview bytes.

**Files:**

- Create: `packages/stock-assets-mcp/src/tools/preview-images.ts`
- Test: `packages/stock-assets-mcp/tests/preview-images.test.ts`
- Modify: `packages/stock-assets-mcp/README.md`

**Interfaces:**

- Produces `previewImages({imageIds}, context): Promise<CallToolResult>`.
- `context` provides the Pexels adapter and preview byte limit.
- Structured metadata maps every `imageId` to its `contentIndex`, candidate, MIME, dimensions, and byte size.

- [ ] **Step 1: Write failing preview tests**

```ts
test("returns ordered image content with explicit id mapping and performs no writes", async () => {
  const result = await previewImages({ imageIds: ["2", "1"] }, fixtureContext);
  assert.deepEqual(result.structuredContent.images.map((item) => item.imageId), ["2", "1"]);
  assert.deepEqual(result.structuredContent.images.map((item) => item.contentIndex), [1, 2]);
  assert.equal(result.content[0].type, "text");
  assert.deepEqual(result.content.slice(1).map((item) => item.type), ["image", "image"]);
  assert.equal(result.content[1].data, fixtureById["2"].bytes.toString("base64"));
  assert.equal(storeWrites.length, 0);
});
```

Add cases for 0/5/duplicate IDs, canonical `getById` lookup per ID, missing image, oversized preview, redirect rejection, MIME/magic rejection, preserved caller order, and one failed member returning a stable error rather than a misleading partial success.

- [ ] **Step 2: Run RED**

```bash
npm --prefix packages/stock-assets-mcp test
```

Expected: preview handler is missing.

- [ ] **Step 3: Implement minimal preview behavior**

- Resolve each ID through `getById`; never accept/copy a URL from the caller or prior search result.
- Fetch `ProviderImageRecord.previewUrl` through `downloadValidatedImage` with `previewMaxBytes`.
- Return content in this exact order: serialized structured JSON text at index `0`, then one MCP `{type:"image", data:<base64>, mimeType}` item per input ID.
- Return no filesystem path and perform no candidate-store operation.
- If any member fails, return one `isError: true` result with the failing image ID in a redacted actionable message; do not return other preview bytes as a successful result.

- [ ] **Step 4: Run GREEN**

```bash
npm --prefix packages/stock-assets-mcp run typecheck
npm --prefix packages/stock-assets-mcp test
npm --prefix packages/stock-assets-mcp run lint
```

Expected: preview content is correctly associated and no test creates a candidate directory.

**Documentation sync:** Document the 1–4 limit, canonical re-fetch, 5 MiB cap, result ordering, and non-durable nature of previews.

**Commit boundary:** Stage preview tool, tests, and README. Suggested commit: `feat: add stock image previews`.

---

### Task 6: Atomic Candidate Store, Receipt, SHA-256, and Idempotency

**Goal:** Publish exactly one validated original and one versioned receipt below the configured root, or publish nothing.

**Files:**

- Create: `packages/stock-assets-mcp/src/storage/candidate-store.ts`
- Test: `packages/stock-assets-mcp/tests/candidate-store.test.ts`
- Modify: `packages/stock-assets-mcp/src/domain/schemas.ts`
- Modify: `packages/stock-assets-mcp/README.md`

**Interfaces:**

- Produces `CandidateStore.acquire(input): Promise<AcquiredCandidate>` and `CandidateStore.validateExisting(provider, imageId, canonicalRecord)`.
- Accepts only already validated image bytes/media facts and canonical provider facts.
- Uses injectable `now()` and a test-only publication failure hook; production code has no CLI option for failure injection.

- [ ] **Step 1: Write failing filesystem transaction tests**

Required individual tests:

```ts
test("publishes exactly original plus receipt atomically", async () => { /* assert two names */ });
test("rolls back a failure after image write", async () => { /* no final item, no temp */ });
test("rolls back a failure after receipt write", async () => { /* no final item, no temp */ });
test("reuses a matching acquisition without changing acquiredAt", async () => { /* same paths/receipt */ });
test("refuses repeat acquisition when bytes or receipt drift", async () => { /* INTEGRITY_MISMATCH */ });
test("rejects traversal and absolute provider/image fragments", async () => { /* boundary error */ });
test("rejects provider, item, original, or receipt symlink escape", async () => { /* outside unchanged */ });
test("cleanup removes only this operation's validated temp directory", async () => { /* sibling survives */ });
```

- [ ] **Step 2: Run RED**

```bash
npm --prefix packages/stock-assets-mcp test
```

Expected: missing candidate store.

- [ ] **Step 3: Implement the candidate transaction**

Use deterministic final paths only:

```text
<root>/pexels/<image-id>/original.<validated-extension>
<root>/pexels/<image-id>/acquisition.json
```

Implementation order:

1. Canonicalize root and validate provider/id against registered values and decimal ID schema.
2. Resolve provider/final paths and prove `path.relative(root, target)` is nonempty, non-absolute, and does not begin with `..`.
3. `lstat` every existing path component; reject symlinks and non-directories. Never follow an existing item symlink.
4. If the final item exists, require exactly two regular files; parse/validate the receipt; recalculate byte count/SHA/decode facts; compare provider/id/path/source/creator/license/attribution/current canonical record. Return existing only on a full match, otherwise `INTEGRITY_MISMATCH` without writes.
5. Create a unique private temp directory under the provider directory so final rename is same-filesystem.
6. Write `original.<ext>` with exclusive creation, fsync/close, write deterministic `acquisition.json` plus final newline, then validate the staged directory again.
7. Atomically rename the temp item directory to `<image-id>`; if a concurrent winner appears, validate/reuse it or fail mismatch.
8. In `finally`, remove only the exact temp path created by this call after containment/lstat revalidation.

Receipt values follow the approved v1 schema exactly. Use `Pexels License`, `https://www.pexels.com/license/`, required photographer attribution, measured file facts, optional normalized search context, and an injected ISO `acquiredAt` clock.

- [ ] **Step 4: Run GREEN**

```bash
npm --prefix packages/stock-assets-mcp run typecheck
npm --prefix packages/stock-assets-mcp test
npm --prefix packages/stock-assets-mcp run lint
```

Expected: successful store contains exactly two files; rollback, symlink, traversal, and repeat-integrity tests all pass without modifying outside sentinels.

**Documentation sync:** Document the candidate layout, exactly-two-files rule, atomicity, idempotent reuse, integrity mismatch refusal, and no automatic deletion.

**Commit boundary:** Stage candidate store/schema/tests/README. Suggested commit: `feat: add atomic stock candidate store`.

---

### Task 7: Provider Status, Search, and Safe Acquire Tool Handlers

**Goal:** Complete four pure tool handlers before registering them with MCP.

**Files:**

- Create: `packages/stock-assets-mcp/src/tools/provider-status.ts`
- Create: `packages/stock-assets-mcp/src/tools/search-images.ts`
- Create: `packages/stock-assets-mcp/src/tools/acquire-image.ts`
- Test: `packages/stock-assets-mcp/tests/tools.test.ts`
- Modify: `packages/stock-assets-mcp/src/tools/preview-images.ts`
- Modify: `packages/stock-assets-mcp/README.md`

**Interfaces:**

- Produces `getProviderStatus`, `searchImages`, `previewImages`, and `acquireImage` handlers with common `{content, structuredContent}` success and `isError` failure behavior.
- `acquireImage` is the only handler allowed to call `CandidateStore.acquire`.

- [ ] **Step 1: Write failing handler tests**

Cover:

- status returns server/schema version, only `pexels`, `search/preview/acquire` capabilities, output readiness, and latest optional quota; serialized result contains no key or env values;
- search applies defaults, returns normalized page/cache/quota metadata, and propagates stable provider failures;
- acquire re-fetches canonical ID, downloads only `originalUrl`, writes under configured root, returns receipt/path/integrity, and keeps caller search context descriptive only;
- arbitrary URL/output directory/filename/key fields fail input parsing;
- original redirect host, streamed byte cap, MIME/magic mismatch, and decode failure become `DOWNLOAD_REJECTED`;
- candidate root/path/symlink failure becomes `OUTPUT_BOUNDARY_VIOLATION`;
- repeat drift becomes `INTEGRITY_MISMATCH` without overwrite;
- every error text and structured value excludes the configured API key.

- [ ] **Step 2: Run RED**

```bash
npm --prefix packages/stock-assets-mcp test
```

Expected: missing three handler modules.

- [ ] **Step 3: Implement the minimal orchestration**

```ts
export type StockAssetsToolContext = {
  readonly config: Omit<StockAssetsConfig, "pexelsApiKey">;
  readonly provider: ImageProviderAdapter;
  readonly store: CandidateStore;
};
```

- Keep the key inside the Pexels adapter closure; do not put it in `StockAssetsToolContext` exposed to handlers/status.
- Status is local/read-only and makes no provider call.
- Search delegates once after strict parsing; minimum dimensions stay local in the adapter.
- Acquire parses only `imageId` and optional `searchContext`, calls `getById`, validates/downloads the canonical original, then calls the store.
- Return repository-independent absolute candidate paths because the package output root is generic; never synthesize `public/generated` or library paths.
- Convert every expected exception through `toToolErrorResult`; let programming errors fail tests rather than broad-catch them into false provider failures.

- [ ] **Step 4: Run GREEN**

```bash
npm --prefix packages/stock-assets-mcp run typecheck
npm --prefix packages/stock-assets-mcp test
npm --prefix packages/stock-assets-mcp run lint
```

Expected: all four pure handlers pass without an MCP transport or real network.

**Documentation sync:** Replace provisional tool docs with exact inputs, outputs, side effects, error codes, and the statement that acquire is additive/idempotent but writes local files.

**Commit boundary:** Stage tool handlers/tests/README. Suggested commit: `feat: add stock assets tool handlers`.

---

### Task 8: MCP In-Process Contract and Tool Registration

**Goal:** Register the four tools with protocol-accurate schemas/annotations and verify them through the official in-memory client/transport.

**Files:**

- Modify: `packages/stock-assets-mcp/src/server.ts`
- Test: `packages/stock-assets-mcp/tests/mcp-contract.test.ts`
- Modify: `packages/stock-assets-mcp/tests/helpers.ts`
- Modify: `packages/stock-assets-mcp/README.md`

**Interfaces:**

- `createStockAssetsServer(context)` returns a configured but unconnected `McpServer`.
- Tests connect server/client with `InMemoryTransport.createLinkedPair()` and use the official `Client.listTools()`/`callTool()` methods.

- [ ] **Step 1: Write failing in-process contract tests**

```ts
test("discovers exactly four truthful tools", async () => {
  const { client, close } = await createInProcessFixture();
  const listed = await client.listTools();
  assert.deepEqual(listed.tools.map((tool) => tool.name).sort(), [
    "acquire_image", "get_provider_status", "preview_images", "search_images",
  ]);
  const acquire = listed.tools.find((tool) => tool.name === "acquire_image");
  assert.deepEqual(acquire.annotations, {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  });
  await close();
});
```

Also assert:

- status/search/preview use `readOnlyHint: true`; provider-backed search/preview use `openWorldHint: true`; local status uses `openWorldHint: false`;
- every tool has strict input and object-root output schemas;
- success returns conforming `structuredContent` and JSON text fallback;
- preview includes correctly mapped MCP image blocks;
- stable tool failures return `isError: true`, code, retryability, and no key;
- invalid protocol structure is distinct from a tool execution failure.

- [ ] **Step 2: Run RED**

```bash
npm --prefix packages/stock-assets-mcp test
```

Expected: `listTools()` returns zero tools or the first expected registration is absent.

- [ ] **Step 3: Implement exactly four tool registrations**

For each `registerTool`, provide title, precise description, strict Zod `inputSchema`, object `outputSchema`, and annotations. Do not register any dynamic tool, resource, prompt, or experimental capability. Return the handler result unchanged so SDK output-schema validation covers structured success results; error results use `isError: true` and skip success output validation as specified by the v1 SDK.

- [ ] **Step 4: Run GREEN**

```bash
npm --prefix packages/stock-assets-mcp run typecheck
npm --prefix packages/stock-assets-mcp test
npm --prefix packages/stock-assets-mcp run lint
```

Expected: all four tools are discoverable and callable through the official in-memory transport with accurate annotations/content.

**Documentation sync:** Add one MCP client config example invoking `node /absolute/path/packages/stock-assets-mcp/dist/cli.js` with only the two required env variables; state that preview image blocks require an MCP client capable of image content.

**Commit boundary:** Stage server registration, contract tests, helpers, README. Suggested commit: `feat: expose stock assets mcp tools`.

---

### Task 9: CLI Shutdown and Stdout Protocol Purity

**Goal:** Make the built CLI production-safe for stdio clients and prove stdout contains MCP messages only.

**Files:**

- Modify: `packages/stock-assets-mcp/src/cli.ts`
- Test: `packages/stock-assets-mcp/tests/stdio-contract.test.ts`
- Modify: `packages/stock-assets-mcp/eslint.config.mjs`
- Modify: `packages/stock-assets-mcp/README.md`

**Interfaces:**

- CLI starts from config, creates adapter/store/server, connects `StdioServerTransport`, and closes once on SIGINT, SIGTERM, or transport close.
- Diagnostics use `process.stderr.write` only.

- [ ] **Step 1: Write failing spawned-process tests**

Spawn `node dist/cli.js` with a temp output root and fixture key. Send valid newline-delimited `initialize`, `notifications/initialized`, and `tools/list` messages. Assert every nonempty stdout line parses as JSON with `jsonrpc: "2.0"`; no banner, config, log, path dump, or key precedes/follows it. Add cases for:

- missing config exits nonzero, prints only a redacted stderr message, and writes zero stdout bytes;
- closing stdin does not create an unhandled rejection;
- SIGINT and SIGTERM close once and do not print to stdout;
- searching source/dist for `console.log`, `process.stdout.write`, and raw key interpolation finds no application logging outside the SDK transport.

- [ ] **Step 2: Run RED**

```bash
npm --prefix packages/stock-assets-mcp run build
npm --prefix packages/stock-assets-mcp test
```

Expected: the initial CLI lacks complete shutdown/purity behavior or process tests.

- [ ] **Step 3: Implement safe lifecycle**

- Put `#!/usr/bin/env node` at the top of `cli.ts`.
- Install signal handlers before awaiting the long-lived connection.
- Guard shutdown with one promise so repeated signal/disconnect paths cannot double-close.
- Set `process.exitCode`; do not force `process.exit()` during normal disconnect.
- Send bounded single-line diagnostics to stderr through the central redactor.
- Add package-local ESLint `no-console: "error"` for `src/**/*.ts`; tests may use the Node test reporter but not application stdout logging.

- [ ] **Step 4: Run GREEN**

```bash
npm --prefix packages/stock-assets-mcp run build
npm --prefix packages/stock-assets-mcp run typecheck
npm --prefix packages/stock-assets-mcp test
npm --prefix packages/stock-assets-mcp run lint
```

Expected: spawned stdio exchange is valid; missing config produces no stdout; signal/disconnect cases terminate cleanly.

**Documentation sync:** Add troubleshooting that stdout is reserved for MCP protocol and all diagnostics go to stderr; document build-before-client configuration.

**Commit boundary:** Stage CLI/purity tests/lint/README. Suggested commit: `fix: keep stock assets stdio protocol clean`.

---

### Task 10: Opt-In Live Pexels Smoke

**Goal:** Verify the real provider path without weakening deterministic default tests or relying on stable Pexels content.

**Files:**

- Create: `packages/stock-assets-mcp/tests/live-pexels.test.ts`
- Modify: `packages/stock-assets-mcp/package.json`
- Modify: `packages/stock-assets-mcp/README.md`

**Interfaces:**

- Default `npm test` discovers but skips the live test unless `STOCK_ASSETS_LIVE_PEXELS=1`.
- `npm run smoke:live` requires a real `PEXELS_API_KEY`, creates its own temp output root, constructs the real Pexels adapter/candidate store/server, connects an SDK `Client` through `InMemoryTransport.createLinkedPair()`, and removes the root in `finally`.

- [ ] **Step 1: Write the failing opt-in wiring test and the skipped live case**

Put both cases in `live-pexels.test.ts`. The first is deterministic and always runs; it reads the nested `package.json` from `process.cwd()` and freezes the opt-in command before it is added:

```ts
test("keeps the live smoke explicit and outside the default test command", async () => {
  const pkg = JSON.parse(await readFile(path.join(process.cwd(), "package.json"), "utf8"));
  assert.equal(
    pkg.scripts["smoke:live"],
    "npm run test:compile && STOCK_ASSETS_LIVE_PEXELS=1 node --test .test-dist/tests/live-pexels.test.js",
  );
  assert.equal(pkg.scripts.test.includes("STOCK_ASSETS_LIVE_PEXELS=1"), false);
});
```

The second case is the only real-network case and remains skipped by default:

```ts
test("live Pexels search preview acquire", { skip: process.env.STOCK_ASSETS_LIVE_PEXELS !== "1" }, async () => {
  const outputDir = await mkdtemp(path.join(tmpdir(), "stock-assets-live-"));
  let client: Client | undefined;
  let server: ReturnType<typeof createStockAssetsServer> | undefined;
  try {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    server = createStockAssetsServer(await createLiveDependencies({
      pexelsApiKey: requiredLiveKey(),
      outputDir,
    }));
    client = new Client({ name: "stock-assets-live-smoke", version: "0.1.0" });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    const search = await client.callTool({ name: "search_images", arguments: { query: `nature texture ${new Date().getUTCFullYear()}`, perPage: 4 } });
    const ids = search.structuredContent.items.map((item) => item.imageId);
    assert.ok(ids.length > 0);
    await client.callTool({ name: "preview_images", arguments: { imageIds: ids.slice(0, 1) } });
    const acquired = await client.callTool({ name: "acquire_image", arguments: { imageId: ids[0], searchContext: { query: "nature texture" } } });
    assert.equal(acquired.isError, undefined);
  } finally {
    await Promise.allSettled([
      client ? client.close() : Promise.resolve(),
      server ? server.close() : Promise.resolve(),
    ]);
    await rm(outputDir, { recursive: true, force: true });
  }
});
```

Implement `requiredLiveKey()` and `createLiveDependencies()` in this test file using the production config/provider/downloader/store constructors; they may not add a second runtime factory. Do not assert the first ID, photographer, URL, exact count, or rank.

- [ ] **Step 2: Run RED without a key**

```bash
env -u PEXELS_API_KEY -u STOCK_ASSETS_LIVE_PEXELS npm --prefix packages/stock-assets-mcp test
```

Expected: the deterministic wiring test fails because `scripts["smoke:live"]` is still undefined; the real live case is reported skipped and there is no network call.

- [ ] **Step 3: Implement the opt-in command and run deterministic GREEN**

Add exactly this nested package script:

```json
"smoke:live": "npm run test:compile && STOCK_ASSETS_LIVE_PEXELS=1 node --test .test-dist/tests/live-pexels.test.js"
```

Complete the test-local production constructor wiring shown above, keeping the generated output path exclusively under `mkdtemp(os.tmpdir())` and cleanup in `finally`. Then run:

```bash
env -u PEXELS_API_KEY -u STOCK_ASSETS_LIVE_PEXELS npm --prefix packages/stock-assets-mcp test
```

Expected: deterministic tests pass, the wiring assertion passes, the live case is reported skipped, and no network call occurs.

- [ ] **Step 4: Run the real smoke only when explicitly authorized and configured**

```bash
PEXELS_API_KEY="$PEXELS_API_KEY" npm --prefix packages/stock-assets-mcp run smoke:live
```

Expected: one bounded live search, one single-image preview, and one acquisition pass in a newly created temp directory; output is decoded and receipt/integrity validates; temp data is removed. If no key is available, record `not run: PEXELS_API_KEY unavailable`; do not substitute a deterministic test claim.

**Documentation sync:** Mark the live smoke optional, key-bearing, quota-consuming, temp-root-only, and unsuitable for CI/default verification.

**Commit boundary:** Stage live test/package script/README. Suggested commit: `test: add opt-in pexels smoke`.

---

### Task 11: Composition-Local `producer:assets` Integration Fixture

**Goal:** Prove a generic candidate receipt can be translated into the existing supply contract and preflighted without entering the reusable library.

**Files:**

- Create: `scripts/fixtures/producer-stock-assets/fixture-candidate.mjs`
- Create: `scripts/smoke/producer/producer-stock-assets-smoke.mjs`
- Modify: `package.json`
- Modify: `scripts/AGENTS.md`

**Interfaces:**

- Fixture helper writes a tiny valid PNG plus matching approved-shape Pexels `acquisition.json` into a caller-owned temp candidate root.
- Smoke maps receipt facts into an existing `ProducerAssetSupplyPlan`; it does not add a new root runtime, command, manifest type, or MCP dependency.
- Produces root command `smoke:producer-stock-assets`.

- [ ] **Step 1: Add a static/runtime smoke that fails before the fixture exists**

The smoke must create a temp repository root and assert this exact translation:

```js
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
```

Assert after `localizeProducerAssets` and `preflightProducerAssets`:

- `localPath === "public/generated/fixture-stock-assets/assets/pexels-stock-2014422.png"`;
- source URL/ID/creator/license/attribution exactly match the receipt;
- localized SHA/bytes/media match the copied bytes;
- the source candidate original and receipt still exist unchanged;
- `public/assets/library/items/` is absent;
- the manifest contains no candidate path and no remote render path.

- [ ] **Step 2: Run RED**

Register the root smoke command, then run:

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run smoke:producer-stock-assets'
```

Expected: exit `1` on missing fixture/smoke integration surface, not a real network request.

- [ ] **Step 3: Implement the fixture and smoke minimally**

- Store raster bytes as a short base64 constant in `.mjs` source; write bytes and matching receipt only under `mkdtemp(os.tmpdir())` during the smoke.
- Compile/reuse the existing `scripts/lib/producer-assets/` modules exactly like `smoke:producer-assets`; do not copy localization/preflight logic.
- Do not import the nested MCP package into root runtime code. The receipt JSON contract is the integration boundary.
- Clean the entire temp root in `finally` after assertions.

- [ ] **Step 4: Run GREEN and the adjacent regression gate**

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run smoke:producer-stock-assets && npm run smoke:producer-assets && npm run smoke:producer-asset-library'
```

Expected: all three exit `0`; no source/media is written into the real repository.

**Documentation sync:** Add the fixture/smoke ownership and command to `scripts/AGENTS.md`, emphasizing mocked receipt/local image and no live Pexels access.

**Commit boundary:** Stage fixture source, producer smoke, root script, and scripts knowledge base. Suggested commit: `test: prove stock candidate producer integration`.

---

### Task 12: Library-First Agent Producer, Later Review, and Authority Alignment

**Goal:** Make the new capability discoverable through the correct skills while preserving the Producer/library ownership split and completed Roadmap.

**Files:**

- Create: `scripts/smoke/architecture/stock-assets-mcp-alignment-smoke.mjs`
- Modify: `package.json`
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `docs/FINAL_PRODUCT_GOAL.md`
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`
- Modify: `docs/PRODUCER_ASSET_CONTRACT.md`
- Modify: `.agents/skills/ai-video-studio-agent-producer/SKILL.md`
- Modify: `.agents/skills/ai-video-studio-asset-library/SKILL.md`
- Modify: `scripts/smoke/architecture/skill-alignment-smoke.mjs`

**Interfaces:**

- Produces root command `smoke:stock-assets-mcp-alignment`.
- Agent Producer owns library-first search, MCP fallback, visual choice, acquisition, receipt-to-supply translation, and current-video localization.
- Asset Library skill owns only later explicit review/admission through `producer:library:add`.

- [ ] **Step 1: Write the failing alignment guard**

Require these exact truths across active docs/skills:

- package/CLI/server name and `packages/stock-assets-mcp/` path;
- `.producer-assets/stock-candidates/` is ignored by the existing broad rule;
- `producer:library:search` precedes `search_images`;
- shortlist preview precedes acquisition when useful;
- Agent may acquire without per-image confirmation;
- receipt facts feed `producer:assets`, which writes `public/generated/<slug>/assets/`;
- Remotion cannot use remote URLs or candidate paths;
- later approval uses `producer:library:add`, never `producer:library:ingest`;
- rejection does not affect an existing composition-local copy;
- no auto-promotion, deletion, HTTP/OAuth/UI/Unsplash/Pixabay/video scope;
- completed/frozen compositions remain unchanged; no Phase 10 starts.

Extend `skill-alignment-smoke.mjs` so the Producer skill may mention MCP tool names but still must not contain asset-library management commands. Keep `producer:library:add` confined to the Asset Library skill and active review docs.

- [ ] **Step 2: Run RED**

```bash
npm run smoke:stock-assets-mcp-alignment
npm run smoke:skill-alignment
```

Expected: first missing post-Roadmap MCP truth in docs/skills.

- [ ] **Step 3: Update the smallest active documentation set**

- Root README/AGENTS: current capability and command discovery, not package implementation detail.
- Final goal/status/Roadmap: one bounded post-Roadmap capability, not Phase 10 and not another production entrypoint.
- Asset contract: distinguish reviewed library, ignored candidate store, and ignored composition-local copy; preserve exact Pexels provenance/attribution; no direct candidate render.
- Producer skill: explicit `library search -> MCP search -> preview -> acquire -> producer:assets -> preflight` order and autonomous per-image selection.
- Asset Library skill: after visual/semantic review, write a temporary library metadata JSON whose `source` maps the receipt exactly: `kind: "url-import"`, `provider`, `creator.name -> creator`, `license.name -> license`, `sourcePageUrl -> sourceUrl`, `providerAssetId -> sourceId`, `providerPolicy.attributionText -> attribution`, and `providerPolicy.attributionRequired -> attributionRequired`; add reviewed title/description/subjects/keywords/roles/recommended uses/avoided uses/style tags, then run `producer:library:add -- --file <candidate-original> --metadata <reviewed-metadata-json>`. Never use inbox ingest; rejection leaves the current video intact; candidate cleanup is separately authorized and outside v1.
- Package README remains the MCP client/config/tool/security authority.
- Do not add `PEXELS_API_KEY` to root `.env.example` or Compose: the package is a separately configured local MCP process.

- [ ] **Step 4: Run GREEN**

```bash
npm run smoke:stock-assets-mcp-alignment
npm run smoke:skill-alignment
npm run smoke:agent-producer-architecture
npm run smoke:producer-stock-assets
npm run smoke:producer-assets
npm run smoke:producer-asset-library
```

Expected: all focused alignment/integration/ownership gates exit `0`.

**Documentation sync:** This task is the authority-doc synchronization task; verify every statement against the approved spec and avoid copying package-internal implementation details into root docs.

**Commit boundary:** Stage only the listed docs/skills/smokes/root script. Suggested commit: `docs: integrate stock assets mcp workflow`.

---

### Task 13: Package Boundary, Full Verification, and Artifact/Secret Closure

**Goal:** Enforce pack contents and close with deterministic, Docker-first, secret-safe evidence.

**Files:**

- Create: `packages/stock-assets-mcp/tests/package-boundary.test.ts`
- Modify: `packages/stock-assets-mcp/package.json`
- Modify: `packages/stock-assets-mcp/README.md`

**Interfaces:**

- Package test enforces `private: true`, exact name/bin/engine/files, exact stable SDK, no workspace, no publication script, and no runtime dependency on the root package.
- Final verification produces evidence only; it must not commit pack tarballs or generated media.

- [ ] **Step 1: Write the failing package-boundary test**

```ts
test("keeps the nested package private, stable, and pack-bounded", async () => {
  const pkg = JSON.parse(await readFile(path.join(process.cwd(), "package.json"), "utf8"));
  assert.equal(pkg.name, "stock-assets-mcp");
  assert.equal(pkg.private, true);
  assert.deepEqual(pkg.bin, { "stock-assets-mcp": "dist/cli.js" });
  assert.deepEqual(pkg.files, ["dist", "README.md"]);
  assert.equal(pkg.dependencies["@modelcontextprotocol/sdk"], "1.29.0");
  assert.equal(pkg.scripts["verify:pack"], "npm pack --dry-run --json");
  assert.equal("workspaces" in pkg, false);
  assert.equal("publish" in pkg.scripts, false);
  assert.equal(/-(alpha|beta|rc)\b/.test(JSON.stringify(pkg.dependencies)), false);
});
```

Add a static scan asserting source/tests contain no literal API key value, candidate output, `public/generated` write, `public/assets/library` write, arbitrary downloader input fields, Streamable HTTP imports, OAuth, Unsplash adapter, or Pixabay adapter.

- [ ] **Step 2: Run RED then fix only real package-boundary gaps**

```bash
npm --prefix packages/stock-assets-mcp test
```

Expected: fail because Task 1 did not define the final `verify:pack` script. Add exactly `"verify:pack": "npm pack --dry-run --json"` to the nested package scripts. If another assertion fails, return to its owning earlier task and correct it there before continuing; Task 13 changes only the three files listed above.

- [ ] **Step 3: Run complete package-local verification**

```bash
npm --prefix packages/stock-assets-mcp ci
npm --prefix packages/stock-assets-mcp run typecheck
npm --prefix packages/stock-assets-mcp test
npm --prefix packages/stock-assets-mcp run lint
npm --prefix packages/stock-assets-mcp run build
npm --prefix packages/stock-assets-mcp run verify:pack
npm --prefix packages/stock-assets-mcp pack --dry-run --json
```

Expected: all commands exit `0`; dry-run file list contains only `package.json`, `README.md`, and intentional `dist/**` runtime/type files. It excludes `tests/`, `.test-dist/`, source maps unless explicitly listed, `.env*`, candidates, coverage, secrets, and tarballs.

- [ ] **Step 4: Run focused repository smokes**

```bash
npm run smoke:stock-assets-mcp-alignment
npm run smoke:producer-stock-assets
npm run smoke:producer-assets
npm run smoke:producer-asset-library
npm run smoke:producer-os
npm run smoke:agent-producer-architecture
npm run smoke:agent-producer-web-removal
npm run smoke:skill-alignment
```

Expected: all exit `0` without real Pexels access.

- [ ] **Step 5: Run Docker-first repository checks**

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm --prefix packages/stock-assets-mcp ci && npm --prefix packages/stock-assets-mcp run typecheck && npm --prefix packages/stock-assets-mcp test && npm --prefix packages/stock-assets-mcp run lint && npm --prefix packages/stock-assets-mcp run build'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run smoke:stock-assets-mcp-alignment && npm run smoke:producer-stock-assets && npm run smoke:producer-assets && npm run smoke:producer-asset-library && npm run smoke:producer-os && npm run smoke:agent-producer-architecture && npm run smoke:skill-alignment'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run lint'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run build'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx remotion compositions src/remotion/index.ts'
```

Expected: package and focused Docker checks pass. Root typecheck/build/composition listing pass. Root lint either exits `0` or exactly matches a freshly recorded pre-implementation baseline with no new/changed file in the failure set; never relabel a nonzero baseline as a clean pass.

- [ ] **Step 6: Run final diff, secret, generated-media, and scope scans**

```bash
git diff --check
git status --short
git diff --name-only --diff-filter=ACMRTUXB
git ls-files --others --exclude-standard
git status --short --ignored .producer-assets/stock-candidates public/generated out packages/stock-assets-mcp
git grep -n -I -E 'PEXELS_API_KEY[[:space:]]*=[[:space:]]*[A-Za-z0-9_-]{20,}|Authorization:[[:space:]]+[A-Za-z0-9_-]{20,}' -- ':!docs/superpowers/specs/**' ':!docs/superpowers/plans/**'
rg -n --hidden --no-ignore-vcs --glob '!.git/**' --glob '!**/node_modules/**' --glob '!packages/stock-assets-mcp/.test-dist/**' --glob '!docs/superpowers/specs/**' --glob '!docs/superpowers/plans/**' 'PEXELS_API_KEY[[:space:]]*=[[:space:]]*[A-Za-z0-9_-]{20,}|Authorization:[[:space:]]+[A-Za-z0-9_-]{20,}' .
git ls-files '.producer-assets/**' 'public/generated/**' 'out/**' '*.tgz' '.env*' 'packages/stock-assets-mcp/.test-dist/**' 'packages/stock-assets-mcp/coverage/**'
find packages/stock-assets-mcp -maxdepth 2 -type f \( -name '*.tgz' -o -name '.env*' -o -name '*.map' \) -print
```

Expected: `git diff --check` clean; only intended source/docs/lock changes appear; no unexpected untracked secret/generated media. The ignored-status command may list expected local install/test/candidate/generated roots, but every entry must be classified and none may be staged or tracked. Both secret scans, the tracked-artifact scan, and the local pack/env/source-map scan produce no match. (`git grep`/`rg` exit `1` specifically means “no match” and is the expected result.) Inspect every unexpected file rather than deleting it automatically.

- [ ] **Step 7: Self-review against the approved spec and commit**

Use this closure checklist:

- every approved goal/acceptance criterion maps to a passing test or smoke;
- no unresolved marker, vague error handling, unowned interface, or untestable success claim remains in implementation/docs;
- all security tests named in the spec exist independently: key redaction, arbitrary URL rejection, output containment, traversal/symlink escape, redirect revalidation, streamed cap, MIME/magic mismatch, transaction rollback, repeat mismatch, and stdout purity;
- no network test is part of deterministic/default gates;
- no workspace, HTTP/OAuth/UI, provider expansion, auto-promotion/deletion, direct candidate render, inbox misuse, or frozen composition change entered scope;
- live smoke result is reported separately as pass/not-run/fail.

**Documentation sync:** Update package README verification commands and supported/forbidden scope only if the final commands exposed drift. Do not add a changelog or publication instructions for an unpublished v1.

**Commit boundary:** Stage only verified source/tests/docs/lock changes; inspect `git diff --cached` and scan for secrets before commit. Suggested commit: `test: close stock assets mcp verification`.

---

## Final Handoff Required From the Implementer

Report:

- each task commit hash and final `git status --short`;
- exact resolved direct dependency versions and confirmation that MCP SDK is stable `1.29.0` with no prerelease dependency selected;
- package-local typecheck/test/lint/build and `npm pack --dry-run` result;
- mock provider, MCP in-process, stdio purity, candidate-store security, repository integration, and alignment smoke results as separate layers;
- live Pexels smoke as `passed`, `not run (no key/authorization)`, or `failed` with redacted reason;
- Docker root typecheck/lint/build/composition results, including an honest lint baseline comparison if nonzero;
- secret/generated-artifact scan result;
- confirmation that no candidate, generated media, API key, temp file, frozen composition, workspace config, npm publication, or push was created.

Do not push unless the user explicitly asks.
