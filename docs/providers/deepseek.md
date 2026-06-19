# DeepSeek Provider Implementation

Status: active staged generation LLM provider path.

The staged generation path uses DeepSeek through the Vercel AI SDK provider
for storyboard planning, selected-segment replanning, and selected-template
implementation compilation. F5-TTS is the only active narration/TTS provider.
MiniMax is no longer used by the active LLM or TTS pipeline.

## Scope

In scope:

- `src/lib/deepseek/provider.ts` reads DeepSeek config and calls AI SDK
  `generateText()` with JSON mode / `response_format`.
- `src/lib/deepseek/prompts.ts` builds storyboard planner, segment revision,
  and template compiler prompts.
- `src/lib/deepseek/parse-storyboard-plan.ts` and
  `src/lib/deepseek/parse-template-implementation.ts` validate provider output
  with the existing Zod contracts after only bounded provider-boundary
  normalization.
- `POST /api/generate/staged` remains the active generation endpoint.

Out of scope:

- MiniMax fallback.
- generated TSX or unrestricted code execution.
- streaming generation.
- provider marketplace or multi-provider routing.

## Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DEEPSEEK_API_KEY` | yes | none | API key used by `@ai-sdk/deepseek`. Missing or blank throws `DeepSeekConfigError`. |
| `DEEPSEEK_MODEL` | no | `deepseek-chat` | Model used for planner and compiler calls. |
| `DEEPSEEK_BASE_URL` | no | provider default | Optional base URL override for a gateway or compatible deployment. |

Narration uses the F5-TTS variables documented in
[`docs/providers/f5-tts.md`](f5-tts.md). `TTS_PROVIDER` is now F5-only:
leave it empty or set it to `f5-tts`.

## JSON Mode Boundary

DeepSeek uses AI SDK JSON mode / `response_format`, not a provider function
tool schema. That keeps the provider integration simpler, but the repo must
own the exact validation boundary.

The parser is strict-first:

- final acceptance always requires the `StoryboardPlan` or selected template
  Zod schema to pass.
- missing `segments[].purpose` can be recovered from existing segment title,
  narration text, visual brief, or the plan brief.
- missing `proceduralGenerator.title` can default from the segment title or
  purpose.
- numeric `proceduralGenerator.data.beats[].time` aliases are normalized to
  `beats[].atFrame`.

This is not a generic repair system. Unknown template ids, unsupported
strategies, bad refs, arbitrary generator ids, invalid ranges, unexpected
schema shapes, generated TSX, and provider-authored code remain validation
failures.

## Generation Flow

1. `generateStagedProjectFromBrief()` calls `deepseekGenerateStoryboardPlan()`.
2. The planner returns a schema-validated `StoryboardPlan`.
3. For each segment, `generateSegmentNarrationAsset()` calls F5-TTS and writes
   segment-owned audio/caption artifacts.
4. `deepseekCompileTemplateImplementation()` receives the selected template
   schema, visual brief, narration text, and measured audio duration.
5. The compiler returns only the selected template `implementation` object.
6. The staged assembly path returns a validated `VideoProject`.

Selected-segment regeneration uses the same boundary: DeepSeek replans only the
target segment, F5-TTS regenerates its narration, DeepSeek recompiles its
visual implementation, and non-target segments are preserved by the staged
replacement helper.

The planner prompt routes deterministic workflow, node graph, agent loop,
system-flow, journey, timeline, terminal, build/test, and deploy trace briefs
toward `scene-graph` + bounded `procedural_generator` payloads. Current
provider-facing generators are `node-graph-flow`, `line-path-flow`, and
`terminal-session`; all compile deterministically into actual
`primitive_scene_graph` output before project assembly.

## Error Mapping

| Failure | HTTP |
|---|---|
| Missing or blank `DEEPSEEK_API_KEY` | 500 |
| Invalid `DEEPSEEK_BASE_URL` | 500 |
| DeepSeek/AI SDK request failure | 502 |
| Missing JSON output | 502 |
| JSON parses but fails planner/template validation | 502 |
| Missing or invalid F5-TTS config | 500 |
| F5-TTS runtime/network/audio failure | 502 |

The route does not fall back to mock generation or MiniMax.

## Validation

- `npm run smoke:storyboard-parser` covers the bounded JSON-mode recovery
  cases.
- `npm run smoke:provider-boundary` covers provider-boundary parsing without
  live network calls.
- `npm run smoke:staged-live` calls the live staged route with DeepSeek plus
  F5-only narration. It verifies the normal workflow brief naturally selects a
  `scene-graph` `node-graph-flow` procedural generator, then exercises direct
  SceneGraph, forced node graph, line path, terminal session, narration,
  diagnostics, and byte-range audio serving.
