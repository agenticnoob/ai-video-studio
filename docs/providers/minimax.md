# MiniMax Provider Implementation

Status: implemented and current as of the T2/T3 stabilization pass.

This document describes the current `POST /api/generate` provider path. It is
no longer a proposal. The provider keeps `VideoProject` as the generation,
preview, and render contract; MiniMax only converts a brief or segment revision
request into schema-valid `VideoProject` JSON.

Roadmap note:
- The authoritative final generation target is `docs/FINAL_PRODUCT_GOAL.md`.
- This MiniMax path is the shipped v1 shortcut.
- Future generation work should evolve toward storyboard planning,
  per-segment TTS, duration-aware selected-template compilation, and final
  `VideoProject` assembly.

## Scope

In scope:
- full-project generation from `mode: "project"`
- selected-segment regeneration from `mode: "segment"`
- single `emit_result` tool-calling path
- strict Zod validation through `videoProjectSchema`
- bounded MiniMax shape recovery for known tool-call argument regressions
- explicit 500/502 error surfacing; no silent mock fallback

Out of scope for this provider pass:
- multi-provider registry or fallback chains
- streaming responses
- persistence, draft history, or render history UX
- template creation beyond the currently registered template modules
- project-level or segment-level `media.layers[]` compositing

## Implementation Files

- `src/app/api/generate/route.ts` validates request bodies and maps provider errors to HTTP status codes.
- `src/lib/minimax/provider.ts` reads config and calls `text/chatcompletion_v2`.
- `src/lib/minimax/prompts.ts` builds project and segment prompts plus the forced tool definition.
- `src/lib/minimax/tool-schema.ts` contains the deep-recursive `emit_result` JSON schema.
- `src/lib/minimax/parse-project.ts` parses tool-call arguments and validates the final `VideoProject`.
- `src/lib/minimax/index.ts` exposes `minimaxGenerateProject()` and `minimaxReviseSegment()`.
- `src/lib/project-generation.ts` is test-only mock generation and is not imported by the route.

## Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `MINIMAX_API_KEY` | yes | none | Bearer token for MiniMax. Missing or blank throws `MinimaxConfigError`. |
| `MINIMAX_MODEL` | no | `MiniMax-M2.7-highspeed` | Model sent on every request. Override via env only. |
| `MINIMAX_BASE_URL` | no | `https://api.minimaxi.com/v1` | Base URL; request path is `/text/chatcompletion_v2`. |

If `MINIMAX_BASE_URL` is set without an `http://` or `https://` scheme, the
provider logs a warning and falls back to the default base URL.

## Request Shape

`callMinimaxChat()` sends:

```json
{
  "model": "<MINIMAX_MODEL>",
  "temperature": 0.4,
  "top_p": 0.9,
  "max_tokens": 8192,
  "messages": ["<system/user messages>"],
  "tools": ["<single emit_result function tool>"],
  "tool_choice": { "type": "function", "function": { "name": "emit_result" } }
}
```

`response_format: { "type": "json_object" }` is intentionally not sent on the
tool-calling path. The forced `emit_result` tool already constrains output to
JSON, and the T1/T2 probes found that adding both mechanisms created noisy
double-forcing behavior.

`max_tokens` is `8192`, not `4096`, because 4096 produced length truncation on
some 3-segment briefs.

## Generation Flow

Project mode:
1. `POST /api/generate` validates `{ mode: "project", brief }`.
2. `minimaxGenerateProject()` builds a project prompt.
3. MiniMax is forced to call `emit_result`.
4. The first `tool_calls[0].function.arguments` string is parsed.
5. `videoProjectSchema.safeParse()` gates the returned project.
6. The route returns `{ project }`.

Segment mode:
1. `POST /api/generate` validates `{ mode: "segment", project, segmentId, revisionPrompt }`.
2. `minimaxReviseSegment()` sends the full current project, including every segment's `implementation.meta`, `implementation.theme`, and `implementation.scenes`.
3. The prompt instructs MiniMax to return the full project and preserve non-target segments byte-for-byte.
4. The same tool-call parser and Zod validation gate the returned project.

## Parser Recovery

The parser is strict first and only uses bounded recovery for observed MiniMax
tool-call shapes:

- Path 1: unwrap `{ "project": { meta, brief, segments } }`.
- Path 2: unwrap a single-key object whose value is a JSON-encoded project string.
- Path 3: unwrap double-encoded string leaves, such as a double-encoded `brief`.
- Path 4: unwrap stringified structural fields whose keys are known array/object fields: `meta`, `segments`, `theme`, `scenes`, `implementation`.

The parser does not invent defaults, widen schemas, run `eval`, or silently
fall back to mock data. Zod remains the final contract gate.

## Error Mapping

| Failure | HTTP |
|---|---|
| Missing or blank `MINIMAX_API_KEY` | 500 |
| Invalid request body or unknown mode | 400 |
| MiniMax network error or non-2xx response | 502 |
| MiniMax non-JSON response | 502 |
| Tool call missing, wrong function, empty arguments, or `finish_reason=length` | 502 |
| Tool-call arguments are not valid JSON | 502 |
| Parsed JSON fails `videoProjectSchema` | 500 |

There is no silent fallback to `src/lib/project-generation.ts`.

## Runtime And Validation

The current project runtime is Docker-first. Start the app through the
repository wrapper:

```bash
cd /data/projects/labs/ai-video-studio
./scripts/dev.sh
```

Then open:
- `http://localhost:3000`

For Docker verification, use the wrappers documented in `README.md`. Repo-local
`npm run lint`, `npx tsc --noEmit`, and `npm run build` are still useful for
static validation when Docker is not part of a task, but they are not the
default runtime path for this project.

Useful Docker smoke paths:
- Unset `MINIMAX_API_KEY`, call `POST /api/generate`, expect 500 with the explicit config message.
- With a valid key, generate a 1-3 segment project and confirm the returned `project` renders in the page.
- Revise a single segment and confirm non-target segments keep their `implementation.theme` and `implementation.scenes`.

## Current Product Contract

- `VideoProject` remains the top-level generation, preview, and render boundary.
- `VideoSegment` remains the editing and regeneration unit.
- Each segment has one primary template.
- `templateId` determines the schema of `implementation`.
- Current registered templates are `scripted` (`VideoSpec`) and `spotlight`
  (`SpotlightSpec`).
- `VideoSpec.scenes` is a `scripted` template detail, not a universal segment field.
- `SpotlightSpec.callouts` is a `spotlight` template detail.
