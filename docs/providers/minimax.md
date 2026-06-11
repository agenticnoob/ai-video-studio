# MiniMax Provider Implementation

Status: implemented v1 provider path plus active staged generation,
selected-segment staged regeneration, and TTS asset delivery.

This document describes the current `POST /api/generate` provider path. It is
no longer a proposal. The provider keeps `VideoProject` as the generation,
preview, and render contract; MiniMax only converts a brief or segment revision
request into schema-valid `VideoProject` JSON.

Roadmap note:
- The authoritative final generation target is `docs/FINAL_PRODUCT_GOAL.md`.
- `POST /api/generate` is the shipped v1 shortcut.
- The storyboard planner, TTS asset route, selected-template compiler, and
  staged assembly path are wired behind `POST /api/generate/staged`.
- The next narration-provider target is the in-project F5-TTS provider
  described in `docs/providers/f5-tts.md`; MiniMax TTS remains the current
  working provider/fallback until that path lands.
- The main page generation action now defaults to `POST /api/generate/staged`
  and keeps `POST /api/generate` available as a one-shot fallback.
- In staged mode, selected-segment regeneration replans only the target
  segment, regenerates its narration audio, recompiles its template
  implementation from the real audio duration, and preserves non-target
  segments.

## Scope

In scope:
- full-project generation from `mode: "project"`
- selected-segment regeneration from `mode: "segment"`
- internal storyboard-plan generation via `minimaxGenerateStoryboardPlan()`
- internal planned-segment TTS asset generation via `POST /api/tts`
- staged generation via `POST /api/generate/staged`
- staged selected-segment regeneration via `POST /api/generate/staged`
- duration-aware selected-template implementation compilation
- segment-owned generated narration audio through
  `VideoSegment.narration.audio`
- render-time flattening for segment-owned narration audio
- byte-range serving for generated TTS assets
- single `emit_result` tool-calling path
- strict Zod validation through `videoProjectSchema`
- strict Zod validation through `storyboardPlanSchema` for planner output
- bounded MiniMax shape recovery for known tool-call argument regressions
- explicit 500/502 error surfacing; no silent mock fallback

Out of scope for this provider pass:
- multi-provider registry or fallback chains
- F5-TTS provider integration and aligned caption generation
- streaming responses
- persistence, draft history, or render history UX
- template creation beyond the currently registered template modules
- broad project-level or segment-level media-layer compositing beyond the
  current narration audio compatibility path
- planner repair beyond selected-template compiler repair

## Implementation Files

- `src/app/api/generate/route.ts` validates request bodies and maps provider errors to HTTP status codes.
- `src/lib/minimax/provider.ts` reads config and calls `text/chatcompletion_v2`.
- `src/lib/minimax/prompts.ts` builds project, legacy segment,
  storyboard-planner, staged segment-revision, and compiler prompts.
- `src/lib/minimax/prompts.ts` also builds selected-template compiler prompts.
- `src/lib/minimax/tool-schema.ts` contains the `emit_result` JSON schemas for `VideoProject`, `StoryboardPlan`, and selected template implementations.
- `src/lib/minimax/parse-project.ts` parses tool-call arguments and validates the final `VideoProject`.
- `src/lib/minimax/parse-storyboard-plan.ts` parses tool-call arguments and validates the planner `StoryboardPlan`.
- `src/lib/minimax/parse-template-implementation.ts` parses selected-template compiler tool-call arguments.
- `src/lib/minimax/index.ts` exposes `minimaxGenerateProject()`, `minimaxReviseSegment()`, `minimaxGenerateStoryboardPlan()`, `minimaxGenerateRevisedSegmentPlan()`, and `minimaxCompileTemplateImplementation()`.
- `src/lib/storyboard-plan-schema.ts` defines the planner contract.
- `src/lib/narration-asset-schema.ts` defines the generated narration asset metadata contract.
- `src/lib/narration-asset-schema.ts` also defines segment-owned narration
  audio and caption contracts.
- `src/lib/staged-project-generation.ts` assembles staged planner/TTS/compiler output into `VideoProject`.
- `src/lib/staged-project-assembly.ts` preserves non-target segment narration
  data when one segment is regenerated.
- `src/remotion/ProjectVideo/ProjectNarrationLayers.tsx` flattens
  segment-owned narration audio during preview/export.
- `src/app/api/generate/staged/route.ts` runs the staged pipeline.
- `src/lib/tts/config.ts` reads MiniMax TTS config.
- `src/lib/tts/minimax.ts` calls the MiniMax synchronous speech endpoint.
- `src/lib/tts/audio-duration.ts` probes generated audio duration with `ffprobe`.
- `src/lib/tts/artifacts.ts` owns local TTS artifact paths and download URLs.
- `src/app/api/tts/route.ts` generates one planned segment narration asset.
- `src/app/api/tts/assets/[...assetPath]/route.ts` serves generated audio files from `out/tts/...`.
- `src/lib/project-generation.ts` is test-only mock generation and is not imported by the route.

## Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `MINIMAX_API_KEY` | yes | none | Bearer token for MiniMax. Missing or blank throws `MinimaxConfigError`. |
| `MINIMAX_MODEL` | no | `MiniMax-M2.7-highspeed` | Model sent on every request. Override via env only. |
| `MINIMAX_BASE_URL` | no | `https://api.minimaxi.com/v1` | Base URL; request path is `/text/chatcompletion_v2`. |
| `MINIMAX_GROUP_ID` | account-dependent | none | Optional `GroupId` query param for MiniMax TTS deployments that require it. |
| `MINIMAX_TTS_ENDPOINT` | no | `${MINIMAX_BASE_URL}/t2a_v2` | Full speech endpoint override. |
| `MINIMAX_TTS_MODEL` | no | `speech-2.8-turbo` | Speech model sent by `POST /api/tts`. |
| `MINIMAX_TTS_VOICE_ID` | no | `male-qn-qingse` | Default voice used by `POST /api/tts`. |
| `MINIMAX_TTS_EMOTION` | no | none | Optional `voice_setting.emotion` for models that support emotion. |
| `MINIMAX_TTS_SAMPLE_RATE` | no | `32000` | Requested speech sample rate. |
| `MINIMAX_TTS_BITRATE` | no | `128000` | Requested speech bitrate. |
| `MINIMAX_TTS_CHANNEL` | no | `1` | Requested channel count, `1` or `2`. |
| `AI_VIDEO_STUDIO_RENDER_ASSET_ORIGIN` | no | `http://127.0.0.1:3000` | Origin used by `/api/render` to resolve route media such as generated TTS audio during Remotion export. |

If `MINIMAX_BASE_URL` is set without an `http://` or `https://` scheme, the
provider logs a warning and falls back to the default base URL.

TTS implementation follows the official MiniMax synchronous speech HTTP
contract documented at
`https://platform.minimaxi.com/docs/api-reference/speech-t2a-http`:

- endpoint: `POST https://api.minimaxi.com/v1/t2a_v2`
- `Content-Type: application/json`
- bearer authorization through `MINIMAX_API_KEY`
- non-streaming request with `stream: false`
- `audio_setting` includes `sample_rate`, `bitrate`, `format`, and `channel`
- `subtitle_enable: false`
- `output_format: "hex"`
- successful non-streaming JSON returns `data.audio` as hex-encoded audio and
  `base_resp.status_code: 0`

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
5. Existing project media layers are reattached and current narration layer
   `startFrame` values are recalculated to prevent legacy one-shot segment
   regeneration from dropping or desynchronizing staged narration audio.

Storyboard-planner mode:
1. `minimaxGenerateStoryboardPlan()` builds a planning prompt from the brief.
2. The prompt includes the compact planner template manifest derived from registered template definitions.
3. MiniMax is forced to call `emit_result` with a `StoryboardPlan`.
4. `parseStoryboardPlanToolCallArguments()` validates the result through `storyboardPlanSchema`.
5. This path is consumed by `POST /api/generate/staged` for full-project
   staged generation and selected-segment staged regeneration.

TTS mode:
1. `POST /api/tts` validates `{ plan, segmentId, voiceId? }`.
2. The route finds the selected `StoryboardSegmentPlan`.
3. `synthesizeMinimaxSpeech()` sends the segment narration text to the
   MiniMax synchronous speech endpoint.
4. The provider decodes `data.audio` from hex into a local audio file under
   `out/tts/...`.
5. `ffprobe` measures the generated file duration.
6. The route returns a validated `SegmentNarrationAsset` with `audioSrc`,
   `durationInSeconds`, `durationInFrames`, provider, voice, and format.
7. `/api/tts/assets/...` serves generated files with `Content-Length`,
   `Accept-Ranges`, and `Content-Range` support so Remotion Player can seek
   audio during preview pause/resume.

Selected-template compiler mode:
1. `minimaxCompileTemplateImplementation()` receives one
   `StoryboardSegmentPlan`, its `SegmentNarrationAsset`, and the computed
   target duration.
2. The compiler prompt includes only the selected template's implementation
   schema and rules.
3. MiniMax is forced to call `emit_result` with only the template
   implementation object.
4. `parseTemplateImplementationToolCallArguments()` validates the result
   through the selected template's Zod schema.
5. The compiler rejects implementations whose visual duration is shorter than
   the real narration duration and retries once with bounded repair context.

Staged endpoint:
1. `POST /api/generate/staged` with `mode: "brief"` runs planner -> TTS ->
   compiler -> assembly.
2. `POST /api/generate/staged` with `mode: "plan"` skips planner and runs TTS
   -> compiler -> assembly from a validated `StoryboardPlan`.
3. `POST /api/generate/staged` with `mode: "segment"` replans exactly the
   target segment, regenerates its TTS asset, recompiles its selected-template
   implementation, replaces that segment and its `VideoSegment.narration`
   audio data, and preserves non-target segments.
4. Generated narration audio is attached to
   `VideoSegment.narration.audio`; project-level narration media layers remain
   supported only as a transitional compatibility path.
5. The route returns `{ plan, project, diagnostics }`.
6. The main page uses this route by default for top-level generation and
   selected-segment regeneration while keeping the one-shot route as a
   fallback toggle.

F5-TTS roadmap note:
- The future target is planner -> narration synthesis -> audio + aligned
  captions -> compiler -> assembly.
- F5-TTS should be added under the project-owned TTS/narration provider
  boundary, not inside MiniMax-specific code.
- Before or alongside F5-TTS, add caption normalization and store captions as
  segment-local `VideoSegment.narration.captions` data.
- MiniMax-specific `subtitle_enable: false` describes the current MiniMax TTS
  request only; it is not the final caption strategy.

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
| TTS request has an invalid body or missing segment id | 400 |
| Missing or blank `MINIMAX_API_KEY` for TTS | 500 |
| MiniMax TTS network error, non-2xx response, or unusable audio response | 502 |

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
- `StoryboardPlan` is the future planner-stage boundary, not the preview/render
  payload; `VideoProject` remains the active page/export boundary.
