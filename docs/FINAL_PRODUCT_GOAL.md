# Final Product Goal

Status: authoritative product target and roadmap source.

This document defines the long-term generation target for `ai-video-studio`.
When roadmap, architecture, provider, template, TTS, or media-layer work needs
direction, use this document as the highest-level product goal. More specific
documents such as `PRODUCT_REQUIREMENTS.md`, `PRODUCT_ARCHITECTURE.md`,
`TEMPLATE_ARCHITECTURE.md`, `MEDIA_LAYERS.md`, and provider notes should align
with this target.

## 0. Product Statement

最终目标：

用户输入提示词后，系统把用户提示词、系统提示词、当前项目已注册的模版、
每个模版的能力和使用场景交给 LLM。LLM 先分析这个视频应该有几个分镜，
并为每个分镜返回：

- 当前分镜的大概内容
- 当前分镜选择的一个主模版
- 当前分镜的台词 / narration
- 当前分镜大概展示什么画面

然后系统按分镜循环生成：

1. 用当前分镜台词调用项目内 narration provider，优先使用项目内 F5-TTS
   provider 生成当前分镜语音和对齐字幕。
2. 读取或归一化当前语音的真实时长。
3. 基于 provider 返回的 alignment 生成字幕数据；如果 provider 暂时不返回
   alignment，再使用 narration、标点切分规则和语音时长生成 fallback 字幕。
4. 把真实时长、当前分镜选择的模版信息、当前分镜大致内容、台词、
   全局风格上下文交给 LLM。
5. LLM 只返回该模版需要的 schema-valid 参数。
6. 系统把 `templateId`、生成语音、真实时长、字幕数据、模版参数组合成当前分镜。
7. 全部分镜生成后，系统把它们组装成一个完整 `VideoProject`，用于预览、
   编辑、重新生成和本地导出。

The English sections below turn this product statement into engineering
contracts, roadmap order, and scope boundaries.

## 1. Final Goal

`ai-video-studio` should turn a user's loose creative prompt into a complete,
watchable, audible, editable, and locally exportable video.

The final generation model is not a single LLM call that directly emits a full
`VideoProject`. The final model is an orchestrated pipeline:

```txt
user prompt
  -> storyboard planning
  -> per-segment narration synthesis
  -> audio + aligned captions
  -> per-segment template compilation
  -> assembled VideoProject
  -> preview, edit, regenerate, export
```

The system should:

1. Understand the user's creative intent.
2. Choose how many segments / shots the video needs.
3. Select one primary registered template for each segment.
4. Write or refine narration for each segment.
5. Generate narration audio and aligned captions for each segment before final
   template parameters are compiled.
6. Prefer the in-project F5-TTS provider for local narration synthesis and
   caption alignment.
7. Use the real audio duration to generate schema-valid template parameters.
8. Assemble all compiled segments into one `VideoProject`.
9. Let the user preview, edit, regenerate, and export the full video.

This keeps the product segment-first, template-driven, voice-aware, and
scalable as the template library grows.

## 2. Authoritative Terminology

Use these terms consistently.

| Product idea | Current / target model | Meaning |
| --- | --- | --- |
| User prompt | `brief` / creative intent | The user's initial topic, story, requirement, or instruction. |
| Shot / storyboard segment / 分镜 | `VideoSegment` | The user-facing editable unit in the final video. |
| Template | `templateId` + template module | A registered implementation mechanism for one segment. |
| Template choice | `templateId` | The primary template selected for a segment. |
| Narration / 台词 | `VideoSegment.narration.text` target model | The spoken script for one segment. |
| Narration synthesis result | `VideoSegment.narration.audio` target model | Generated audio file plus duration, provider, voice, and related metadata owned by the segment. |
| Captions / subtitles | `VideoSegment.narration.captions` target model | Segment-local timed readable text returned or normalized from narration synthesis and kept outside template-specific implementation data. |
| Template parameters | `implementation` | The template-specific data needed by the selected renderer. |
| Compiled segment | `VideoSegment` | Template choice + narration/audio metadata + validated implementation. |
| Full video | `VideoProject` | The assembled project used by preview, editing, and export. |

Important modeling rules:

- A `VideoSegment` has one primary `templateId`.
- `templateId` determines the schema of `implementation`.
- `implementation` is template-specific, not a universal project field.
- Narration text and generated audio should stay outside template-specific
  `implementation` fields and should not be hidden inside one template's
  private scene model. The target home is `VideoSegment.narration`.
- Caption/subtitle data should be returned by the narration provider when
  possible, normalized from provider alignment, remain editable, and stay
  outside template-specific `implementation` fields. Caption timing should be
  segment-local under `VideoSegment.narration.captions`; shared preview/export
  code can flatten those cues to the global project timeline.
- The preferred narration provider is an in-project F5-TTS provider boundary,
  not a separate external product. It may run as a local service/process, but
  its adapter, request contract, artifact handling, and fallback behavior
  belong in this repository.
- The old scripted scene audio hook must not be treated as the narration/TTS
  model. New generation paths should use segment-level narration metadata.
  The current staged path stores generated narration audio in segment-level
  narration metadata; project-level narration media layers are compatibility
  carriers, not the target ownership model.
- `VideoSpec.scenes` is specific to the `scripted` template.
- Future templates should define their own implementation fields.
- Do not model one segment as multiple template instances unless a concrete
  future workflow proves that template-internal composition is insufficient.

## 3. Target Generation Pipeline

### 3.1 Stage A: Storyboard Planning

The first LLM call is a planner call. It should not receive every template's
complete schema, and it should not generate final render parameters.

Planner input:

- user prompt
- system planning prompt
- project-level constraints such as tone, aspect ratio, target length, language,
  audience, and style hints when available
- registered template manifest, not full renderer code
- template descriptions, use cases, capabilities, constraints, and recommended
  duration ranges

Planner output:

```ts
type StoryboardPlan = {
  title: string;
  brief: string;
  language?: string;
  globalStyle?: string;
  segments: StoryboardSegmentPlan[];
};

type StoryboardSegmentPlan = {
  id: string;
  order: number;
  title?: string;
  purpose: string;
  templateId: TemplateId;
  templateReason: string;
  narration: {
    text: string;
    tone?: string;
  };
  visualBrief: string;
  pacingHint?: string;
  expectedDurationSeconds?: number;
};
```

Planner responsibilities:

- decide how many segments the video needs
- decide each segment's communication purpose
- choose the best `templateId` from the template manifest
- write a narration draft for each segment
- describe the visual content each segment should roughly show
- preserve global continuity across all segments

Planner non-responsibilities:

- do not generate final `implementation`
- do not invent template ids
- do not write Remotion source code
- do not receive runtime renderer internals
- do not create arbitrary media URLs

Why this stage exists:

- It keeps template selection separate from low-level parameter filling.
- It avoids sending every template's full schema as the template library grows.
- It creates a stable intermediate artifact that can be edited, audited, and
  partially regenerated.

### 3.2 Stage B: Segment Narration Synthesis And Alignment

For each planned segment, the system generates voice audio before compiling the
template implementation. The preferred target is an in-project F5-TTS provider
that returns both audio and caption/alignment data from the same narration
request.

Narration synthesis input:

- segment narration text
- language
- desired voice / voice profile when selected
- tone or delivery hint
- segment id and project id for deterministic artifact naming
- optional reference audio / speaker profile for local F5-TTS voice control

Narration synthesis output:

```ts
type SegmentNarrationAsset = {
  text: string;
  audio?: {
    src: string;
    durationInFrames: number;
    durationInSeconds: number;
    voiceId?: string;
    provider?: "f5-tts" | "minimax" | string;
    format?: "mp3" | "wav" | "aac" | "m4a";
  };
  captions?: SegmentCaptions;
};
```

Narration provider responsibilities:

- produce a local or serveable audio asset
- report the real duration
- return aligned caption/subtitle cues when the provider can produce alignment
- keep enough metadata to support regeneration and debugging
- make preview and export use the same audio asset
- keep the provider adapter and artifact handling inside this project, even if
  the F5-TTS runtime itself is served by a local process or container

Narration provider non-responsibilities:

- do not decide the final visual implementation
- do not mutate unrelated segments
- do not become a full audio workstation
- do not require waveform editing, ducking, beat sync, or timeline UI for the
  first implementation

Why narration synthesis happens before template compilation:

- Real spoken duration controls segment duration.
- Visual pacing should fit the narration audio, not the other way around.
- Template parameter generation can use the real number of frames.
- Caption and subtitle timing should come from the same narration provider
  result when available, so audio and readable text share one timing source.

Duration guard:

- Each template should expose recommended duration constraints.
- If generated narration is too long or too short for the selected template,
  the system should choose a bounded repair path:
  - shorten or expand narration
  - split the segment
  - choose a better template
  - ask the user only if automatic repair would change intent too much

### 3.3 Stage C: Caption Cue Normalization

After narration synthesis returns audio and alignment, the system should
normalize caption cues before final project assembly. In the preferred F5-TTS
path, this stage consumes provider-returned alignment instead of acting as a
separate subtitle generation pass.

Caption input:

- segment narration text
- generated narration audio metadata
- provider-returned alignment / caption cues when available
- real `durationInFrames` and `durationInSeconds`
- language
- optional caption style preferences when present

Caption output:

```ts
type SegmentCaptionCue = {
  id: string;
  text: string;
  startFrame: number; // segment-local
  durationInFrames: number;
};

type SegmentCaptions = {
  language?: string;
  cues: SegmentCaptionCue[];
  style?: {
    preset?: string;
    position?: "bottom" | "center" | "top";
  };
};
```

Caption responsibilities:

- normalize readable subtitles from provider-returned alignment/caption data
- align cue timing with the generated narration audio using provider-returned
  alignment whenever available
- keep caption data editable and regeneratable per segment
- make preview and export render the same caption data
- keep caption content separate from template-specific `implementation`
- keep cue timing segment-local; preview/export can add each segment's global
  start frame at render time

Caption non-responsibilities:

- do not become a professional subtitle editor in the first implementation
- do not require word-perfect forced alignment before the basic caption loop is
  useful, but prefer F5-TTS alignment whenever available
- do not make each template own its own private subtitle data model
- do not treat captions as an independent LLM subtitle-generation stage when
  the narration provider already returned alignment

Why caption normalization is a separate step:

- Caption cues depend on narration-provider output and audio timing, not on a
  single template's internal schema.
- F5-TTS can make captions substantially better by returning timing data from
  the same local provider request that produced the audio.
- The user should be able to edit or regenerate subtitles without changing the
  selected template's visual parameters.
- Caption rendering can later be styled globally or per segment while the
  caption cues remain stable data.

### 3.4 Stage D: Segment Template Compilation

After narration synthesis and caption normalization, the system compiles each
segment into template-specific render data.

Compiler input:

- one `StoryboardSegmentPlan`
- its `SegmentNarrationAsset`
- its `SegmentCaptions`, when captions are enabled or generated
- real `durationInFrames`
- selected template's complete schema
- selected template's implementation rules
- selected template examples, if needed
- limited global project context

Compiler output:

```ts
type CompiledVideoSegment = {
  id: string;
  title: string;
  templateId: TemplateId;
  narration?: SegmentNarrationAsset;
  visualBrief?: string;
  implementation: TemplateImplementation;
  durationInFrames: number;
};
```

Compiler responsibilities:

- fill only the selected template's schema
- use the real narration audio duration as the timing anchor
- respect caption-safe layout constraints when the template renders text near
  the caption area
- keep visual content aligned with `visualBrief` and narration
- produce data that passes Zod validation
- preserve the selected template unless repair requires a template change

Compiler non-responsibilities:

- do not re-plan the whole video by default
- do not choose among all templates again unless duration or validation repair
  requires it
- do not write Remotion source code
- do not invent fields outside the selected template schema

Validation and repair:

- Every compiled segment must pass the selected template's Zod schema.
- Repair prompts should be bounded and template-specific.
- Repair should include validation errors, selected template schema, narration
  duration, and the previous invalid output.
- After a small number of failed repairs, the system should return a clear
  error instead of silently falling back to unrelated content.

### 3.5 Stage E: Project Assembly

The system assembles compiled segments into a `VideoProject`.

Assembly responsibilities:

- preserve the original brief
- preserve ordered compiled segments
- preserve generated caption/subtitle cues
- compute or normalize durations
- ensure preview and export consume the same project payload
- keep generated assets reachable by Remotion

The assembled `VideoProject` remains the top-level boundary for:

- page state
- preview input props
- selected-segment editing
- segment regeneration
- render/export request body
- downloaded render artifacts

## 4. Context Strategy For Many Templates

The final architecture should use two levels of template context.

### 4.1 Planner Template Manifest

The planner receives a compact manifest for all registered templates.

Manifest fields should include:

- `templateId`
- label
- short description
- best use cases
- avoid cases
- text density
- recommended duration range
- narration fit
- media or asset expectations
- examples of segment intents the template handles well

The planner should use this manifest to choose templates. It should not need
complete JSON schemas for every template.

### 4.2 Template Compiler Context

The compiler receives the full context for only the selected template.

Compiler context may include:

- complete JSON schema / Zod-derived schema
- implementation prompt
- renderer constraints
- duration rules
- field-level guidance
- examples
- repair instructions

Runtime adapters and React/Remotion renderer code stay internal. The LLM only
sees the template contract, not the implementation source code.

Why this matters:

- Template count can grow without exploding planner context.
- Each compiler call stays focused and easier to validate.
- Template-local ownership remains clean.
- New templates can be added by registering metadata, schema, compiler context,
  editor fields, and runtime adapter.

## 5. Editing And Regeneration Model

The final product should support regeneration at the smallest useful scope.

Recommended edit scopes:

- full project re-plan: user changes the whole brief or story direction
- segment re-plan: user changes what one segment should say or do
- narration regenerate: user changes the spoken script or voice
- narration synthesis regenerate: user keeps narration text but changes
  voice/delivery/provider
- captions regenerate: user keeps narration/audio but changes subtitle wording,
  timing, language, or display style
- implementation regenerate: user keeps narration/audio but changes visuals
- field edit: user directly edits template parameters

Regeneration rules:

- If narration text changes, rerun narration synthesis, caption normalization,
  and segment compilation.
- If narration text changes and captions are enabled, regenerate or realign
  captions for the affected segment.
- If only the voice or narration provider changes, rerun narration synthesis
  and segment compilation only when timing changes enough to affect visuals.
- If only caption text or caption style changes, preserve narration audio and
  template implementation unless layout constraints require visual repair.
- If only visual direction changes, reuse existing narration audio and rerun
  template compilation.
- If template changes, rerun template compilation and validate against the new
  template schema.
- Non-target segments should be preserved unless the user asks for broader
  re-planning.

This keeps editing fast while respecting the dependencies between narration,
audio duration, and visual timing.

## 6. Relationship To Current Implementation

The current implementation is a useful v1 shortcut:

```txt
brief
  -> MiniMax project generation
  -> schema-valid VideoProject
  -> preview/edit/export
```

This path can stay while it is sufficient. The final target evolves it into:

```txt
brief
  -> StoryboardPlan
  -> per-segment narration synthesis
  -> audio + aligned captions
  -> per-segment template compiler
  -> assembled VideoProject
  -> preview/edit/export
```

Do not treat the current one-call `POST /api/generate` path as the permanent
generation architecture. Treat it as the shipped v1 authoring loop that proves
preview, editing, template rendering, validation, and export.

Current compatibility notes:

- `VideoProject` remains the top-level contract.
- `VideoSegment` remains the editing unit.
- New narration-provider work must not use scripted scene fields as the audio
  carrier.
- The staged path now carries generated narration audio in segment-owned
  `VideoSegment.narration.audio` and flattens it to the project timeline for
  preview and export.
- `VideoProject.media.layers[]` still supports project-level audio layers,
  including old narration layers as a transitional compatibility path, but it
  is no longer the primary generated narration ownership model.
- Segment-owned `VideoSegment.narration.captions` now carries generated or
  fallback caption cues, with caption cues flattened to the project timeline
  for preview and export.
- Page-level F5 voice cloning is now exposed for staged generation: uploaded
  reference audio is stored under `out/voice-references/`, then paired with
  user supplied reference text at generation time and reused for full-project
  generation plus selected-segment regeneration when cloning is enabled.
- The current fallback caption path uses sentence punctuation as a hard split,
  comma punctuation as a soft split, merges short comma chunks forward for
  readability, and saves the normalized caption payload beside generated audio
  under `out/tts/...` as `<audio-name>.captions.json`.
- Generated narration audio is served as seekable streamed byte ranges with
  immutable artifact caching, and Remotion preview pauses timeline advancement
  while narration audio is buffering.
- Narration metadata should stay separated from template implementation data so
  the system can distinguish spoken text, generated audio, voice, timing, and
  provider.
- Caption/subtitle metadata should also stay separated from template
  implementation data so subtitle editing, timing, styling, preview, and export
  can evolve independently from any one template schema.
- The F5-TTS provider should be implemented as part of this project. It can
  call a local service/process/container, but the repo owns the provider
  contract, config, artifact writing, caption normalization, and fallback path.

## 7. Roadmap

Roadmap work should follow this target unless a later product decision updates
this document.

### Milestone 0: Shipped V1 Authoring Loop

Status: implemented.

Implemented capability:

- prompt input
- MiniMax-backed `POST /api/generate`
- schema-validated `VideoProject`
- registered `scripted` and `spotlight` templates
- full-video preview
- selected-segment editing
- selected-segment regeneration
- local Remotion export

Known limitation:

- the shipped one-shot `POST /api/generate` route still exists as a fallback
  shortcut
- the active staged page path now uses planner -> TTS -> compiler -> assembly,
  with bounded planner repair and deterministic mixed-template smoke fixtures;
  segment-owned narration audio/captions and the Next-side F5 adapter are in
  place; the optional F5 runtime service has passed GPU real-mode direct,
  Next-adapter, deterministic staged, and staged-export smoke coverage;
  provider-backed full staged-route live smoke coverage still needs hardening

### Milestone 1: Authoritative Goal And Contracts

Status: implemented.

Deliverables:

- this document
- updated PRD / README / agent notes that point to this target
- explicit statement that the final path is planner -> narration synthesis ->
  audio + aligned captions -> compiler -> assembly
- explicit statement that captions/subtitles are produced or normalized from
  the narration provider result
- explicit statement that current one-shot generation is a v1 shortcut

### Milestone 2: Storyboard Plan Contract

Status: implemented for the active staged route, including bounded planner
repair.

Goal:

- introduce a planner output contract before changing the full runtime path

Implemented:

- `StoryboardPlan` schema
- `StoryboardSegmentPlan` schema
- planner template manifest derived from registered templates
- planner prompt that receives compact template metadata
- internal MiniMax function that can produce and validate a plan
- one bounded planner repair attempt for invalid JSON or schema-invalid
  `StoryboardPlan` output
- selected-segment planner repair that still requires exactly one planned
  segment before target id/order reassignment

Non-goals:

- no TTS requirement yet
- no media layers
- no new template orchestration model

### Milestone 3: TTS Asset MVP

Status: implemented for the active staged route and selected-segment
regeneration path.

Goal:

- generate audio from planned segment narration and measure real duration

Implemented:

- `SegmentNarrationAsset` validation
- MiniMax-backed internal `POST /api/tts` for one planned segment
- local artifact writing under `out/tts/...`
- `/api/tts/assets/...` serving for Remotion-consumable audio URLs
- ffprobe duration measurement and frame normalization

Deliverables:

- TTS provider module
- local audio artifact path such as `out/tts/...`
- audio serving path that Remotion can consume
- duration probing or provider-returned duration normalization
- `SegmentNarrationAsset` metadata
- first UI or API action that generates narration audio for a planned segment
- optional local F5-TTS runtime service described in
  `docs/providers/f5-tts-service-plan.md`
- GPU real-mode smoke coverage for the F5 runtime, Next adapter,
  deterministic staged assembly, and staged export
- page-uploaded F5 voice clone references for staged generation

Remaining:

- harden provider-specific failure handling and retry behavior across full
  `POST /api/generate/staged` live requests
- add richer voice selection/profile management when the basic loop is stable

Initial scope:

- one voice or simple voice selection
- one provider
- `scripted` template first
- no waveform editor
- no background music
- no global media timeline

### Milestone 4: Audio-Duration-Driven Segment Compiler

Status: implemented for full-project staged generation and selected-segment
staged regeneration; live hardening remains active.

Goal:

- use real TTS duration to compile one segment's template parameters

Implemented:

- selected-template compiler prompt and tool schema
- selected-template schema-only context for compiler calls
- compile function that accepts plan + narration asset + duration
- strict Zod validation against the selected template schema
- one bounded compiler repair attempt
- segment-owned narration audio assembly through
  `VideoSegment.narration.audio`
- render-time flattening for segment-owned narration audio
- `POST /api/generate/staged` route for brief or existing plan input
- main page generation defaults to the staged route, with the one-shot v1 path
  kept as a fallback toggle
- `POST /api/generate/staged` segment mode replans one target segment,
  regenerates its TTS audio, recompiles its selected-template implementation,
  replaces that segment's owned narration data, and preserves non-target
  segments
- TTS asset route supports byte ranges for Remotion Player seek behavior
- local `/api/render` resolves route media such as `/api/tts/assets/...` to a
  Next app origin before Remotion export
- page generation state, staged API request/error boundaries, and staged
  project assembly helpers are split into focused modules so further staged
  hardening can happen without concentrating logic in the page or route entry

Remaining:

- provider-backed live multi-segment staged smoke through
  `POST /api/generate/staged`
- richer progress/error UX for multi-stage generation

Success criteria:

- a generated segment plays with TTS audio
- the preferred F5-TTS path returns or enables aligned caption cues for the
  segment narration
- segment duration matches or safely contains the audio duration
- template visual timing is generated from audio duration, not arbitrary
  guessed timing

### Milestone 5: Full Pipeline Integration

Goal:

- replace or wrap one-shot project generation with the target staged pipeline

Deliverables:

- full generate action runs planner -> narration synthesis loop -> audio +
  aligned captions -> compiler loop -> assembly
- generated audio and captions are attached to their owning `VideoSegment`
- page can display generation progress by stage
- segment regeneration chooses the smallest needed stage
- generated project remains editable and exportable through existing paths
- non-target segments are preserved during segment-level edits

### Milestone 6: Multi-Template Scaling

Goal:

- make the staged pipeline scale as templates increase

Deliverables:

- richer planner manifest per template
- template-specific compiler contexts
- examples and constraints per template
- duration guard per template
- template-specific repair prompts
- deterministic smoke fixtures for registered template mixes
- provider-backed live smoke coverage as template count grows

### Milestone 7: Captions, Narration, And Audio Polish

Goal:

- improve the audible and readable video experience after the basic TTS loop
  works

Deliverables:

- caption/subtitle data returned by F5-TTS when available, otherwise
  normalized from narration and generated audio duration as a fallback
- in-project F5-TTS provider integration for audio plus aligned captions
- segment-owned narration/caption contracts and render-time flattening
- preview/export rendering for captions
- optional local F5-TTS runtime service with health and synthesize endpoints
- GPU real-mode F5 smoke coverage through direct service, Next adapter,
  deterministic staged assembly, and staged export
- segment-level caption editing and regeneration
- per-segment voice selection
- optional project-level narration consistency
- volume normalization
- optional background music support
- simple audio mix rules

### Milestone 8: Media Layers And Existing Assets

Goal:

- add external image/video/audio/color material after generated narration is
  stable

Deliverables:

- project-level `media.layers[]`
- segment-level `media.layers[]` for media that belongs to one segment
- shared Remotion media renderer
- compact structured media editor

Important ordering:

- media layers are important, but they should not block the
  narration-provider-first generation pipeline
- generated narration audio should use template-external segment-owned data;
  the current minimal project audio media layer path is only the first
  cross-template runtime carrier

### Milestone 9: Persistence And Generation History

Goal:

- preserve intermediate artifacts so the user can iterate without losing
  context

Deliverables:

- saved `StoryboardPlan`
- saved TTS metadata
- saved compiler prompts/results
- validation/repair history
- project draft persistence
- render history

## 8. Non-Goals Until Explicitly Reopened

Do not use this roadmap to accidentally expand scope into:

- multi-template-per-segment orchestration
- full professional timeline editing
- AI-generated Remotion source code as the default path
- uploaded media management before narration-provider generation works
- generated images/videos before narration audio works
- waveform editing, ducking, beat sync, or DAW-style audio controls in the
  narration-provider MVP
- broad provider abstraction before one concrete provider path proves the
  staged pipeline

## 9. Decision Rules

When choosing between possible next steps, prefer work that moves the product
toward:

1. a better `StoryboardPlan`
2. generated narration audio through the in-project provider boundary
3. caption/subtitle data returned or normalized from provider alignment
4. real audio duration driving template parameters
5. one selected template's schema-valid implementation
6. reliable assembly into `VideoProject`
7. preview/export parity
8. segment-level regeneration with minimal blast radius

Prefer deferring work that mainly improves:

- generic media editing
- broad timeline editing
- persistence/history
- template marketplace behavior
- generated source-code workflows

Those may become important later, but they are not the main bridge from prompt
to complete generated video.
