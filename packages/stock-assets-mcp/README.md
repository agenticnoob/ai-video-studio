# stock-assets-mcp

Private, local-only Node.js 20+ package for a stdio MCP stock-image server. The
package is independently installable and is not part of the root npm dependency
graph.

Tasks 1–2 establish the startup boundary and strict public contracts. The MCP
tools are not registered or implemented yet.

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

The future tool names are `get_provider_status`, `search_images`,
`preview_images`, and `acquire_image`. At this stage their strict Zod contracts
exist, but the server still exposes zero tools.

`get_provider_status` accepts only `{}`. `search_images` accepts:

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

`preview_images` accepts one to four unique decimal `imageIds`.
`acquire_image` accepts only a canonical decimal `imageId` and optional
descriptive `searchContext` (`query`, normalized `orientation`, and a
1–500-character `selectionNote`). Unknown fields are rejected, including URL,
key, output-directory, and filename inputs.

Successful structured outputs use `{ok: true}` plus their strict status,
candidate/page, preview mapping, or versioned acquisition-receipt fields. A
public candidate contains provider/id, dimensions/aspect ratio, description,
average color, bounded thumbnail URL, source page, photographer, and required
attribution. Adapter-owned original and preview download URLs are not public
candidate fields. Every acquired receipt preserves canonical Pexels source,
creator, license, attribution, measured file integrity, optional descriptive
search context, and acquisition time.

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

## Local commands

```bash
npm install
npm run typecheck
npm test
npm run lint
npm run build
```
