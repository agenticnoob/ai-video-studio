# stock-assets-mcp

Private, local-only Node.js 20+ package for a stdio MCP stock-image server. The
package is independently installable and is not part of the root npm dependency
graph.

Task 1 establishes only the startup/configuration boundary. No MCP tools are
implemented yet.

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

## Local commands

```bash
npm install
npm run typecheck
npm test
npm run lint
npm run build
```
