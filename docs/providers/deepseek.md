# DeepSeek Provider Implementation

Status: active staged generation LLM provider path.

The staged generation path uses DeepSeek through the Vercel AI SDK provider
for storyboard planning, selected-segment replanning, and selected-template
implementation compilation. F5-TTS and VoxCPM are the active local
narration/TTS providers. F5-TTS owns voice-clone requests; VoxCPM can be
selected for ordinary `/tts` synthesis. MiniMax is no longer used by the
active LLM or TTS pipeline.

## Scope

In scope:

- `src/lib/deepseek/provider.ts` reads DeepSeek config and calls AI SDK
  `generateText()` with JSON mode / `response_format`.
- `src/lib/deepseek/prompts.ts` builds storyboard planner, segment revision,
  and template compiler prompts.
- `src/lib/deepseek/parse-storyboard-plan.ts` and
  `src/lib/deepseek/parse-template-implementation.ts` validate provider output
  with the existing Zod contracts.
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

Narration uses the local TTS variables documented in
[`docs/providers/f5-tts.md`](f5-tts.md) and
[`docs/providers/voxcpm.md`](voxcpm.md). Leave `TTS_PROVIDER` empty or set it
to `f5-tts` for F5-TTS; set it to `voxcpm` for ordinary VoxCPM `/tts`
synthesis. `voiceClone.enabled` still forces F5-TTS.

## Generation Flow

1. `generateStagedProjectFromBrief()` calls `deepseekGenerateStoryboardPlan()`.
2. The planner returns a schema-validated `StoryboardPlan`.
3. For each segment, `generateSegmentNarrationAsset()` calls the selected local
   TTS provider and writes segment-owned audio/caption artifacts.
4. `deepseekCompileTemplateImplementation()` receives the selected template
   schema, visual brief, narration text, and measured audio duration.
5. The compiler returns only the selected template `implementation` object.
6. The staged assembly path returns a validated `VideoProject`.

Selected-segment regeneration uses the same boundary: DeepSeek replans only the
target segment, the selected local TTS provider regenerates its narration,
DeepSeek recompiles its visual implementation, and non-target segments are
preserved by the staged replacement helper.

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
| Missing or invalid VoxCPM config | 500 |
| VoxCPM runtime/network/audio failure | 502 |

The route does not fall back to mock generation or MiniMax.
