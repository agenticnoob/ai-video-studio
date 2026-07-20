# stock-assets-mcp

Private, local-only Node.js 20+ package for a stdio MCP stock-image server. The
package is independently installable and is not part of the root npm dependency
graph.

Tasks 1–7 establish the startup boundary, strict public contracts, Pexels image
provider, shared validated-image download primitive, atomic candidate store,
and all four pure tool handlers. The MCP tools are not registered with the
server yet.

## Configuration

The server reads configuration once at startup:

```env
PEXELS_API_KEY=<your-provider-key>
STOCK_ASSETS_OUTPUT_DIR=/absolute/path/to/stock-candidates
STOCK_ASSETS_MAX_BYTES=26214400
STOCK_ASSETS_TIMEOUT_MS=20000
```

`STOCK_ASSETS_MAX_BYTES` defaults to 25 MiB and
`STOCK_ASSETS_TIMEOUT_MS` defaults to 20 seconds. Preview downloads use a fixed
5 MiB limit. For AI Video Studio, the intended ignored output root is
`/data/projects/labs/ai-video-studio/.producer-assets/stock-candidates/`.

The transport is stdio only. Secrets and filesystem paths are startup
configuration; no current or future tool accepts an API key, output directory,
or caller-selected path.

## Frozen public contracts

The future registered tool names are `get_provider_status`, `search_images`,
`preview_images`, and `acquire_image`. Their strict Zod contracts and pure
handlers exist, but the server still exposes zero tools until the separate MCP
registration task.

`get_provider_status` accepts only `{}`. It returns server/schema version, the
single configured `pexels` provider, truthful search/preview/acquire
capabilities, output-root readiness, and the latest optional quota snapshot.
It performs no provider search, lookup, or network request and never exposes a
key or environment value.

`search_images` accepts:

```ts
{
  query: string; // trimmed, 1–200 characters
  orientation?: "landscape" | "portrait" | "square";
  locale?: "en-US" | "pt-BR" | "es-ES" | "ca-ES" | "de-DE" |
    "it-IT" | "fr-FR" | "sv-SE" | "id-ID" | "pl-PL" | "ja-JP" |
    "zh-TW" | "zh-CN" | "ko-KR" | "th-TH" | "nl-NL" | "hu-HU" |
    "vi-VN" | "cs-CZ" | "da-DK" | "fi-FI" | "uk-UA" | "el-GR" |
    "ro-RO" | "nb-NO" | "sk-SK" | "tr-TR" | "ru-RU"; // default zh-CN
  page?: number; // 1–1000, default 1
  perPage?: number; // 1–30, default 12
  minWidth?: number; // 1–100000
  minHeight?: number; // 1–100000
}
```

The search handler strictly parses and normalizes this input before delegating
exactly once to the Pexels adapter. It returns the normalized candidates,
pagination, cache status, and optional quota without writing files.

`preview_images` accepts one to four unique decimal `imageIds`. It re-fetches
every canonical provider record, downloads only the adapter-owned preview URL,
and preserves caller order. Result content starts with serialized structured
JSON at index 0, followed by one MCP image block per ID; structured metadata
maps each ID to its exact content index, candidate, MIME, dimensions, and byte
size. Preview downloads use the fixed 5 MiB limit and are non-durable: the
handler returns no filesystem path, does not write preview bytes, and does not
call a candidate store. If any member fails, the entire call returns one stable
error without partial-success image content.

`acquire_image` accepts only a canonical decimal `imageId` and optional
descriptive `searchContext` (`query`, normalized `orientation`, and a
1–500-character `selectionNote`). Unknown fields are rejected, including URL,
key, output-directory, filename, license override, and attribution override
inputs. The handler re-fetches the canonical provider record, downloads only
its adapter-owned `originalUrl` through the configured acquisition byte limit,
and then calls `CandidateStore.acquire`. It is the only pure handler that calls
the store or writes files. Returned original/receipt paths are generic absolute
candidate paths below the configured root; they are never synthesized as
`public/generated`, reusable-library, or Remotion paths.

Successful structured outputs use `{ok: true}` plus their strict status,
candidate/page, preview mapping, or versioned acquisition-receipt fields. A
public candidate contains provider/id, dimensions/aspect ratio, description,
average color, bounded thumbnail URL, source page, photographer, and required
attribution. Adapter-owned original and preview download URLs are not public
candidate fields. Every acquired receipt preserves canonical Pexels source,
creator, license, attribution, measured file integrity, optional descriptive
search context, and acquisition time.

Every successful pure handler returns conforming `structuredContent` plus the
same serialized JSON at text content index 0. Preview then appends its mapped
MCP image blocks. Expected validation, provider, download, output-boundary, and
integrity exceptions retain their stable codes through `isError: true` tool
results. Unexpected programming errors are not broad-caught and mislabeled as
provider failures.

## Candidate store

Acquisition storage is deterministic below the configured root:

```text
<root>/pexels/<image-id>/original.<validated-extension>
<root>/pexels/<image-id>/acquisition.json
```

A published item contains exactly those two regular files. The store accepts
only validated JPEG, PNG, or WebP bytes plus canonical adapter facts, then
re-decodes and re-hashes the staged original before publishing. The receipt
strictly records schema/acquisition/provider IDs, Pexels source page and
creator, fixed Pexels license facts, required attribution, validated media and
integrity facts, optional descriptive search context, and an injected-clock
acquisition time.

Image and receipt writes occur in one private temp directory below the same
provider root as the final item. Both files are exclusively created and
synced, the full staged directory is revalidated, and publication uses an
atomic directory rename. A failed transaction removes only the temp directory
created and revalidated by that operation; it does not clean sibling temp
paths or candidates automatically.

Matching repeat acquisition validates and reuses the existing two-file item
without changing `acquiredAt`. Byte, receipt, or canonical-fact drift returns
`INTEGRITY_MISMATCH` and never overwrites. Traversal, containment, non-regular
paths, and provider/item/file symlink boundaries fail closed as
`OUTPUT_BOUNDARY_VIOLATION`. A concurrent winner is validated and either reused
or rejected as a mismatch.

Tool failures use `{ok: false, error: {code, message, retryable,
retryAfterSeconds?}}` with exactly these codes:

- `PROVIDER_NOT_CONFIGURED`
- `INVALID_INPUT`
- `IMAGE_NOT_FOUND`
- `RATE_LIMITED`
- `NETWORK_TIMEOUT`
- `PROVIDER_ERROR`
- `DOWNLOAD_REJECTED`
- `OUTPUT_BOUNDARY_VIOLATION`
- `INTEGRITY_MISMATCH`

Errors are returned as both structured content and the same serialized JSON
text fallback. API keys and Authorization values are redacted.

Provider orientation is normalized at the public boundary. Pexels maps
`square -> square`. A data-only future contract records
`square -> squarish` for Unsplash so that a later adapter will not change the
public enum. No Unsplash runtime, adapter, branch, or tool exists in v1.

## Pexels provider behavior

The provider calls only the official photo endpoints:

- `https://api.pexels.com/v1/search`
- `https://api.pexels.com/v1/photos/:id`

`PEXELS_API_KEY` is sent only in the API `Authorization` header. Search
forwards the exact supported Pexels locale list shown above and the normalized
`landscape`, `portrait`, or `square` orientation. Public results retain the
source page, photographer, attribution, thumbnail, dimensions, and page
metadata; adapter-only preview/original URLs remain private.

Successful API responses update the process-local quota snapshot from
`X-Ratelimit-Limit`, `X-Ratelimit-Remaining`, and `X-Ratelimit-Reset`.
Successful searches are cached in memory for five minutes using the complete
normalized input; get-by-ID results and errors are never cached.

Timeouts and transient `5xx` responses receive at most two retries after
deterministic 250 ms and 500 ms waits (three total attempts). `404`, `429`, and
other `4xx` responses never retry. A numeric `Retry-After` hint is bounded to
one hour. Malformed JSON or successful payloads fail closed without returning
the upstream body, key, or Authorization value.

## Validated image downloads

Preview uses, and acquisition will use, one bounded download primitive. It accepts
only HTTPS URLs on the exact `images.pexels.com` host, rejects userinfo and
non-default ports, follows redirects manually, revalidates every target, and
permits at most five redirect hops. Image-host requests never receive the
Pexels API `Authorization` header.

The caller supplies either the fixed 5 MiB preview limit or the configured
acquisition limit (25 MiB by default). A declared oversized `Content-Length`
is rejected before reading. Undeclared or smaller bodies are read chunk by
chunk and cancelled immediately when the running total crosses the limit.

Allowed responses are JPEG, PNG, and WebP only. Declared MIME, file magic, and
a strict full Sharp decode must agree. Decode uses `failOn: "error"`, a
100,000,000-pixel input limit, and positive integer dimensions. The returned
`jpg`, `png`, or `webp` extension, byte count, and lowercase SHA-256 are derived
from validated bytes, never from the URL suffix. No bytes are persisted by
this primitive itself.

## Local commands

```bash
npm install
npm run typecheck
npm test
npm run lint
npm run build
```
