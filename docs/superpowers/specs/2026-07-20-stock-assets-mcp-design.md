# Stock Assets MCP Design

Status: approved design; implementation has not started.

Date: 2026-07-20.

## 1. Current Repository Facts

- `.agents/skills/ai-video-studio-agent-producer/` is the only supported
  video-production entrypoint.
- `.agents/skills/ai-video-studio-asset-library/` separately owns admission
  and maintenance of the reviewed reusable image library.
- Future videos search the reviewed library before acquiring an equivalent
  external image.
- Reviewed reusable images live under
  `public/assets/library/items/<asset-id>/`.
- Composition-local working assets live under the ignored
  `public/generated/<slug>/assets/` tree and are the only non-library image
  paths accepted by the current `ProducerAssetManifest` contract.
- `.producer-assets/library-inbox/` is an ignored inbox for user-supplied
  assets. Its default `user-authorized` source record is intentionally not a
  valid provenance substitute for a Pexels API acquisition.
- The repository already ignores `.producer-assets/` as a whole. A stock
  candidate area below that root therefore needs documentation, not a second
  overlapping ignore rule.
- Existing finished and frozen compositions remain read-only references.
- The Agent Producer-only Roadmap is complete. This capability is bounded
  post-Roadmap work and does not create another numbered phase.

## 2. Product Decision

Add an independent local package at:

```text
packages/stock-assets-mcp/
```

The package is a generic local stdio MCP server for discovering, previewing,
and acquiring licensed stock images. It must not understand Remotion,
`ProducerAssetManifest`, or the repository's reusable-library schema.

The current repository supplies the project-specific orchestration around the
generic server:

```text
Agent Producer searches the reviewed library
  -> no suitable reviewed item exists
  -> Agent calls stock-assets-mcp
  -> Agent visually reviews MCP candidates and chooses one
  -> MCP acquires the original into an ignored candidate area
  -> Agent localizes a copy into the current composition through producer:assets
  -> current video uses the composition-local copy immediately
  -> later explicit Agent or human review decides whether to add it to the
     reviewed reusable library
```

The Agent may select and acquire a candidate without asking the user to approve
each image. It asks only when no candidate is suitable, required provenance is
incomplete, acquisition fails, or a broader creative decision is genuinely
ambiguous.

Rejecting a candidate for reusable-library admission does not invalidate or
delete an already valid composition-local copy. Rejection means only that the
image is not promoted for automatic discovery by future videos.

The package name, CLI executable name, and MCP server name are all
`stock-assets-mcp`. The broader word `assets` reserves a stable package name;
it does not expand v1 beyond still stock images.

## 3. Goals

- Provide a safe local MCP interface for stock-image search, visual preview,
  and deterministic acquisition.
- Let the user configure a provider API key through environment variables.
- Preserve provider, creator, source-page, license, attribution, integrity, and
  acquisition facts next to every downloaded candidate.
- Keep the public MCP contract provider-neutral enough to add another provider
  without changing Agent workflows.
- Integrate with the current library-first Agent Producer workflow without
  coupling the MCP package to this repository.
- Keep the package independently buildable, testable, and installable so it can
  be extracted or published later without redesigning its public contract.
- Fail closed on missing configuration, unsafe paths, untrusted redirects,
  invalid image bytes, incomplete writes, and integrity drift.

## 4. Non-Goals

- No npm publication in v1.
- No Streamable HTTP transport, OAuth, hosted service, user accounts, or shared
  provider key.
- No Unsplash or Pixabay implementation in v1.
- No stock video, audio, SVG, font, Lottie, Rive, glTF, or other media search in
  v1.
- No image generation or video generation.
- No browser UI or management console.
- No direct writes to `public/generated/`, `public/assets/library/`, a
  composition manifest, or another project-specific directory.
- No automatic promotion into the reviewed reusable library.
- No MCP tool that deletes candidates.
- No arbitrary-URL downloader, arbitrary output path, or caller-supplied
  filename.
- No changes to completed or frozen compositions.
- No empty provider implementations whose only purpose is to suggest future
  coverage.

## 5. Package Boundary And Layout

The package remains independently installable inside the repository:

```text
packages/stock-assets-mcp/
├── package.json
├── package-lock.json
├── tsconfig.json
├── README.md
├── src/
│   ├── cli.ts
│   ├── server.ts
│   ├── config.ts
│   ├── domain/
│   │   ├── schemas.ts
│   │   └── errors.ts
│   ├── providers/
│   │   ├── types.ts
│   │   └── pexels.ts
│   ├── storage/
│   │   ├── candidate-store.ts
│   │   └── image-validation.ts
│   └── tools/
│       ├── provider-status.ts
│       ├── search-images.ts
│       ├── preview-images.ts
│       └── acquire-image.ts
└── tests/
```

The root repository does not need to become an npm workspace. The nested
package owns its dependency lock and can be installed, built, and tested with
`npm --prefix packages/stock-assets-mcp ...`. Root scripts may provide
convenience wrappers without merging the package's runtime dependencies into
the video-production dependency graph.

Use Node.js 20 or newer and the current stable, non-alpha MCP TypeScript SDK at
implementation time. Pin the resolved dependency through the package lock.
Use the high-level `McpServer.registerTool` API, Zod schemas, structured tool
results, tool annotations, and a `StdioServerTransport`.

The server exposes tools only in v1. It does not expose MCP resources, prompts,
sampling, elicitation, or experimental tasks.

## 6. Provider Adapter Contract

The normalized provider boundary is conceptually:

```ts
type NormalizedOrientation = "landscape" | "portrait" | "square";

type ImageProviderAdapter = {
  readonly id: string;
  isConfigured(): boolean;
  search(input: NormalizedSearchInput): Promise<SearchPage>;
  getById(imageId: string): Promise<StockImageCandidate>;
  openDownload(candidate: StockImageCandidate): Promise<DownloadResponse>;
};
```

`PexelsProviderAdapter` is the only v1 implementation. It authenticates by
sending `PEXELS_API_KEY` in the Pexels `Authorization` header, uses the official
photo-search and get-photo endpoints, and maps official response fields into
the normalized domain model.

The public MCP orientation enum remains:

```text
landscape | portrait | square
```

Provider adapters own provider-specific vocabulary. The future mapping contract
is recorded now to prevent a breaking public-schema change:

| MCP value | Pexels request value | future Unsplash request value |
| --- | --- | --- |
| `landscape` | `landscape` | `landscape` |
| `portrait` | `portrait` | `portrait` |
| `square` | `square` | `squarish` |

When an Unsplash adapter is eventually implemented, this mapping requires a
focused unit test. No Unsplash source file or runtime branch is added in v1.

## 7. Configuration

The stdio server reads secrets and filesystem policy only at startup.

Required environment variables:

```env
PEXELS_API_KEY=...
STOCK_ASSETS_OUTPUT_DIR=/absolute/path/to/stock-candidates
```

For this repository, the intended output root is:

```text
/data/projects/labs/ai-video-studio/.producer-assets/stock-candidates
```

Optional bounded configuration:

```env
STOCK_ASSETS_MAX_BYTES=26214400
STOCK_ASSETS_TIMEOUT_MS=20000
```

Defaults are 25 MiB per acquired image and a 20-second network timeout. Invalid
integers, relative output paths, a missing API key, an unreadable output parent,
or an output path that cannot be created safely cause startup to fail closed.

The API key is never accepted as a tool input and is never included in tool
results, receipts, errors, or logs. Documentation and configuration examples
contain variable names and placeholders only.

## 8. MCP Tool Surface

### 8.1 `get_provider_status`

A read-only diagnostic tool with no input. It returns:

- server and schema version;
- configured provider IDs;
- provider capabilities;
- whether the output root is ready;
- the last observed rate-limit limit, remaining count, and reset time when
  available.

It never returns a key, a key prefix, or environment values.

### 8.2 `search_images`

Input:

```ts
type SearchImagesInput = {
  query: string;
  orientation?: "landscape" | "portrait" | "square";
  locale?: string;
  page?: number;
  perPage?: number;
  minWidth?: number;
  minHeight?: number;
};
```

Rules:

- `query` is trimmed, non-empty, and bounded in length.
- `locale` defaults to `zh-CN` and must be one of the Pexels-supported locale
  values in v1.
- `page` defaults to 1.
- `perPage` defaults to 12 and is capped at 30 even though the upstream API
  permits more, keeping tool results and visual review bounded.
- Minimum dimensions are applied to normalized results locally because the
  Pexels photo-search endpoint does not own those filters.
- A short-lived in-memory cache keyed by normalized search input avoids
  immediately repeating identical API requests during one stdio process.

Each result contains:

```ts
type StockImageCandidate = {
  provider: "pexels";
  imageId: string;
  width: number;
  height: number;
  aspectRatio: number;
  description: string;
  averageColor?: string;
  thumbnailUrl: string;
  sourcePageUrl: string;
  photographer: {
    name: string;
    profileUrl: string;
  };
  attribution: {
    required: true;
    text: string;
  };
};
```

The result also contains page metadata and the latest provider quota headers.
Search does not download a durable file.

### 8.3 `preview_images`

Input is one to four Pexels image IDs. The tool resolves canonical records by
ID, downloads bounded Pexels preview variants, and returns one MCP image content
item per resolved ID plus structured metadata that preserves the ID-to-image
mapping.

Preview exists so an Agent can visually inspect candidates instead of choosing
from alt text or URLs alone. Preview bytes are not written to the candidate
store. Preview downloads use the same HTTPS, hostname, timeout, redirect,
content-type, and byte-limit policy as acquisition, with a smaller preview byte
limit.

### 8.4 `acquire_image`

Input:

```ts
type AcquireImageInput = {
  imageId: string;
  searchContext?: {
    query?: string;
    orientation?: "landscape" | "portrait" | "square";
    selectionNote?: string;
  };
};
```

The tool does not accept a URL, output directory, filename, license override,
or attribution override. It re-fetches the canonical Pexels record by ID,
selects the official original image URL, validates it, and writes one candidate
transaction below the configured output root.

The operation is non-destructive and idempotent. If an existing candidate's
receipt and bytes validate, the tool returns the existing acquisition. If they
do not validate, it returns `INTEGRITY_MISMATCH` and never overwrites the
directory silently.

## 9. Tool Result Contract

Every tool defines strict input and output schemas. Successful results return
both:

- `structuredContent` conforming to the output schema; and
- a JSON text content block for clients that do not consume structured output.

Tool annotations describe actual behavior:

- status, search, and preview are read-only;
- acquire is non-destructive and idempotent but writes local files;
- provider-backed calls declare that they interact with an open external
  system.

Tool-level failures return `isError: true` and a stable structured error shape:

```ts
type StockAssetsError = {
  ok: false;
  error: {
    code:
      | "PROVIDER_NOT_CONFIGURED"
      | "INVALID_INPUT"
      | "IMAGE_NOT_FOUND"
      | "RATE_LIMITED"
      | "NETWORK_TIMEOUT"
      | "PROVIDER_ERROR"
      | "DOWNLOAD_REJECTED"
      | "OUTPUT_BOUNDARY_VIOLATION"
      | "INTEGRITY_MISMATCH";
    message: string;
    retryable: boolean;
    retryAfterSeconds?: number;
  };
};
```

Messages are actionable but redact authorization headers, API keys, and
unbounded provider response bodies.

## 10. Candidate Store

For this repository, the configured store appears as:

```text
.producer-assets/stock-candidates/
└── pexels/
    └── <image-id>/
        ├── original.<validated-extension>
        └── acquisition.json
```

The MCP package treats the configured output root generically. Another project
may point `STOCK_ASSETS_OUTPUT_DIR` somewhere else without changing the package.

Directory and filename rules:

- the provider directory comes from a registered adapter ID;
- the item directory comes from a strictly validated provider image ID;
- the primary filename is `original.<extension-derived-from-validated-bytes>`;
- caller text never participates in a filesystem path;
- each item contains exactly the original and its receipt in v1;
- partial transaction directories are private temporary paths on the same
  filesystem and are removed after a failed transaction when safe to do so.

The candidate store is not:

- part of the MCP npm package;
- a path that Remotion may reference directly;
- the reviewed reusable library;
- searched before the formal library by Agent Producer.

It is an ignored acquisition and audit area that allows a source image to be
used by the current video and reviewed for promotion later.

## 11. Acquisition Receipt

`acquisition.json` is versioned durable provenance for one acquired candidate.
Its logical v1 shape is:

```json
{
  "schemaVersion": 1,
  "acquisitionId": "pexels:2014422",
  "provider": "pexels",
  "providerAssetId": "2014422",
  "sourcePageUrl": "https://www.pexels.com/photo/...",
  "creator": {
    "name": "Photographer name",
    "profileUrl": "https://www.pexels.com/@..."
  },
  "license": {
    "name": "Pexels License",
    "url": "https://www.pexels.com/license/"
  },
  "providerPolicy": {
    "attributionRequired": true,
    "attributionText": "Photo by Photographer name on Pexels"
  },
  "searchContext": {
    "query": "example query",
    "orientation": "landscape",
    "selectionNote": "scene-level reason"
  },
  "file": {
    "relativePath": "original.jpg",
    "mimeType": "image/jpeg",
    "width": 3024,
    "height": 3024,
    "sizeInBytes": 1234567,
    "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
  },
  "acquiredAt": "2026-07-20T00:00:00.000Z"
}
```

`searchContext` is optional descriptive provenance and never changes license or
source facts. `acquiredAt` is appropriate here because the receipt represents a
real external acquisition event; it is not a deterministic generated catalog.

The Pexels API guidelines require a prominent Pexels link for API use and ask
applications to credit photographers when possible. The v1 normalized receipt
therefore preserves attribution as required for downstream project handling,
rather than weakening provider policy into the more permissive standalone
Pexels license wording.

## 12. Safe Acquisition Transaction

Acquisition proceeds in this order:

1. validate startup configuration and tool input;
2. resolve the canonical Pexels record by image ID;
3. reject a non-HTTPS or non-approved provider image URL;
4. open a bounded streaming request with an abort timeout;
5. validate every redirect target before following it;
6. enforce the declared and streamed byte limit;
7. validate HTTP status, content type, magic bytes, supported raster kind, and
   decodable positive dimensions;
8. compute SHA-256 and byte size from the completed file;
9. create the normalized receipt from canonical provider facts and measured
   file facts;
10. validate the complete candidate in same-filesystem temporary storage;
11. atomically rename it into the deterministic final item directory.

Approved upstream hosts are explicit per adapter. Pexels v1 permits only its
documented API endpoint and official Pexels image delivery hosts. Validation is
performed again after every redirect; suffix string matching alone is not
sufficient.

The store resolves its configured root and all write targets, rejects `..`,
absolute user path fragments, and symlink escapes, and never follows an
existing item directory through a symlink.

Supported acquired bytes in v1 are JPEG, PNG, and WebP. The extension is
derived from validated media bytes rather than a URL suffix or untrusted
`Content-Type` alone.

## 13. Network And Rate-Limit Behavior

- Successful Pexels responses update an in-memory quota snapshot from the
  official response headers.
- `429` becomes `RATE_LIMITED` and includes a bounded retry-after hint when the
  provider supplies one. A single MCP call does not sleep through a long quota
  reset window.
- Network timeouts and transient `5xx` responses receive at most two bounded
  exponential-backoff retries.
- Other `4xx` responses do not retry.
- Malformed successful payloads become a redacted `PROVIDER_ERROR`.
- Search-cache entries are process-local and short-lived. They are an API quota
  optimization, not durable content or an alternative asset library.
- No failure returns an empty successful result when the provider call itself
  failed.

## 14. Stdio And Logging Safety

The stdio transport writes only valid MCP protocol messages to stdout.
Informational, warning, and diagnostic logs go to stderr or MCP logging
notifications when supported. Logs use structured redaction and exclude:

- API keys and authorization headers;
- complete environment dumps;
- binary image data;
- unbounded upstream bodies;
- private filesystem contents unrelated to the configured output root.

The CLI handles `SIGINT` and `SIGTERM`, closes the MCP server cleanly, and does
not convert a normal client disconnect into an unhandled rejection.

## 15. AI Video Studio Integration

### 15.1 Video-production flow

For each future video:

1. Agent Producer searches the reviewed reusable library with
   `producer:library:search`.
2. The Agent inspects full candidate metadata and previews when useful.
3. If no reviewed item fits the scene, the Agent calls `search_images`.
4. The Agent calls `preview_images` for a bounded shortlist and owns the visual
   choice.
5. The Agent calls `acquire_image` for the selected Pexels ID without asking
   for per-image user confirmation.
6. The Agent transforms the returned file and receipt into an existing
   `producer:assets` supply entry with exact provider, source URL, creator,
   license, attribution, and purpose facts.
7. Existing localization copies the image to
   `public/generated/<slug>/assets/`, measures integrity/media metadata, and
   writes the composition's strict asset manifest.
8. Existing preflight runs before representative stills and render.

Remotion never renders directly from the MCP candidate directory or a remote
Pexels URL.

### 15.2 Later reusable-library review

Review is an explicit later Agent or user request. The reviewer inspects the
original candidate, receipt, visual content, semantic fit, recommended uses,
avoided uses, and style tags.

If approved, the asset-library Agent uses `producer:library:add` with the real
Pexels source facts. It must not use `producer:library:ingest`, whose omitted
source behavior intentionally assigns the user-supplied `user-authorized`
record.

If not approved, the candidate remains outside the reviewed library and the
composition-local copy remains valid. Neither outcome automatically deletes
the candidate. Cleanup is a separate explicitly authorized task outside v1.

## 16. Documentation And Skill Alignment

Implementation must update the smallest active documentation set that makes
the new capability discoverable and truthful:

- root `README.md` and `AGENTS.md` current repository truth;
- `docs/FINAL_PRODUCT_GOAL.md` and `docs/ITERATION_STATUS.md` as bounded
  post-Roadmap status, without creating Phase 10;
- `docs/PRODUCER_ASSET_CONTRACT.md` for the candidate-versus-composition-local
  versus-reviewed-library boundary;
- `.agents/skills/ai-video-studio-agent-producer/SKILL.md` for library-first MCP
  fallback and current-video localization;
- `.agents/skills/ai-video-studio-asset-library/SKILL.md` for later review and
  `producer:library:add` admission;
- `packages/stock-assets-mcp/README.md` for local installation, MCP client
  configuration, environment variables, tool contracts, and provider policy.

The repository already ignores `.producer-assets/`; implementation should
verify that fact and only clarify the existing comment when useful. It must not
add a redundant ignore rule.

## 17. Testing Strategy

### 17.1 Unit tests

Cover:

- strict environment parsing and redaction;
- normalized input/output schemas;
- Pexels mapping, including `square -> square`;
- the recorded future Unsplash `square -> squarish` mapping contract without
  adding an Unsplash runtime adapter;
- path containment, traversal, symlink escape, deterministic item paths, and
  filename derivation;
- hostname and redirect validation;
- streaming byte limits, MIME/magic validation, dimensions, and SHA-256;
- receipt normalization and validation;
- idempotent reuse and integrity-mismatch refusal;
- stable error classification and retryability.

### 17.2 Provider contract tests

Mock HTTP at the fetch boundary and cover:

- successful search and get-by-ID normalization;
- pagination and local minimum-dimension filtering;
- supported locale/orientation forwarding;
- quota-header capture;
- 404, 429, other 4xx, transient 5xx, timeout, malformed JSON, and malformed
  successful payloads;
- rejected download domains and redirect escapes.

Tests must assert that authorization data never appears in outputs or logs.

### 17.3 MCP contract tests

Exercise the server through an in-process MCP client/transport and verify:

- all four tools are discoverable;
- schemas and annotations match behavior;
- success returns structured content and a text fallback;
- preview returns correctly associated image content;
- errors return `isError: true` with a stable code;
- stdio mode emits no non-protocol stdout bytes.

### 17.4 Candidate-store tests

Use temporary directories on the same filesystem to prove:

- a successful transaction publishes exactly two final files;
- interrupted or invalid downloads do not publish partial items;
- a matching repeat acquisition reuses the existing item;
- a mismatching repeat fails without overwrite;
- cleanup targets only the operation's validated temporary directory.

### 17.5 Optional live Pexels smoke

A live smoke is opt-in and runs only when explicitly supplied a real
`PEXELS_API_KEY`. It performs one bounded search, preview, and acquisition into
a newly created temporary output directory. Default CI and normal repository
checks do not make live provider calls.

The smoke verifies behavior and decodability, not a stable search ranking or a
specific Pexels image ID.

### 17.6 Repository integration smoke

Use a local image and deterministic fixture receipt, not the real network, to
prove:

- Agent-facing candidate output can be translated into the existing supply
  contract;
- `producer:assets` creates a composition-local image with exact source facts;
- `ProducerAssetManifest` accepts the resulting path and metadata;
- `producer:preflight` accepts the unchanged localized bytes;
- no fixture is admitted automatically to the reviewed reusable library.

### 17.7 Packaging and repository verification

Run package-local typecheck, test, build, and `npm pack --dry-run`. Verify the
packed file list excludes tests, local candidates, environment files, source
maps when not intentionally shipped, and secrets.

Run the smallest focused repository smokes first, then the Docker-first checks
required by active repository instructions when implementation or integration
changes affect their surfaces. Finish with `git diff --check` and explicit
secret/generated-artifact scans.

## 18. Acceptance Criteria

The v1 capability is complete only when all of the following are true:

- `stock-assets-mcp` starts over stdio with valid configuration and fails
  closed with invalid configuration.
- A real opt-in Pexels smoke can search, visually preview, and acquire one image
  without exposing the API key.
- Acquisition writes a valid original plus `acquisition.json` only below the
  configured output root.
- The MCP accepts neither arbitrary download URLs nor arbitrary write paths.
- The Agent Producer documentation searches the reviewed library first and
  calls the MCP only when no suitable reviewed item exists.
- A selected candidate can become a strict composition-local Producer asset
  and pass preflight without entering the reviewed library.
- Later approval uses `producer:library:add` with Pexels provenance; rejection
  leaves the current video's valid local copy unchanged.
- Unsplash is not implemented, but the normalized `square` to Unsplash
  `squarish` mapping is recorded and test-protected for the future adapter.
- No finished or frozen composition is modified.
- No secret, candidate media, generated composition media, or temporary file is
  committed.
- The package can be built and packed independently, but no npm publication or
  remote deployment occurs.

## 19. Reference Project Assessment

`jeanpfs/stock-images-mcp` is useful as a compact example of a TypeScript stdio
server, provider registry, and environment-key configuration. This design does
not copy its public download boundary because accepting an arbitrary URL,
filename, and folder would permit unrelated network access and uncontrolled
filesystem writes. It also requires stronger durable provenance, provider
policy handling, structured outputs, visual preview, quota reporting, atomic
storage, and integration verification for this repository's production flow.

Relevant primary references:

- MCP TypeScript server guide:
  <https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md>
- MCP transport specification:
  <https://modelcontextprotocol.io/specification/2025-11-25/basic/transports>
- MCP authorization guidance:
  <https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization>
- Pexels API documentation and guidelines:
  <https://www.pexels.com/api/documentation/>
- Unsplash API documentation for the recorded future orientation mapping:
  <https://unsplash.com/documentation>
- Reference repository:
  <https://github.com/jeanpfs/stock-images-mcp>
