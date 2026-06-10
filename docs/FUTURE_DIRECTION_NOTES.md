# Future Direction Notes

Status: partially resumed.

当前补充：
- 第一轮最小工作流已经落地，当前状态以 `docs/ITERATION_STATUS.md` 为准。
- 最终生成目标和 roadmap 上游依据以 `docs/FINAL_PRODUCT_GOAL.md` 为准：
  用户提示词 -> 分镜计划 -> 每个分镜 TTS -> 按真实音频时长编译所选模版
  参数 -> 组装完整 `VideoProject`。
- 本文件保留“更后续方向”的判断，不再代表当前实现是否已开始。
- 产品模型已收敛为：一个 segment 对应一个 primary template；`templateId` 决定 `implementation` 的 schema；当前注册模板包括 `scripted` 和 `spotlight`；`scripted` 的 `implementation` 是 `VideoSpec`，其中 `scenes` 是 scripted 专有的内部序列字段；`spotlight` 的 `implementation` 是 `SpotlightSpec`，其中 `callouts` 是 spotlight 专有内容字段；已有视频、图片、音频或纯色素材通过 project-level / segment-level `media.layers[]` 表达；旧的 `baseLayer` 概念作为媒体层 role，而不是单独字段。

此前判断（保留为背景）：
- 不要一开始就把 `ai-video-studio` 扩成完整 AI 视频产品。
- 先用小步迭代确认真实需求和工作流。
- 更大的后续方向先记录在项目内，不立即一次性实施。

## Current judgement

For the target workflow:
- user gives AI instructions
- AI generates prompts / structured parameters
- user previews and fine-tunes in the page
- final video is exported by Remotion

Primary repo choice:
- use `ai-video-studio` as the main project shell

Reason:
- `ai-video-studio` is a better product-shell starting point because it is based on a Next.js app.
- It is easier to evolve into a real web product with prompt input, API routes, parameter forms, preview, render actions, history, and other app features.

Secondary reference repo:
- use `vibe-motion-app` as a structure/reference project

Reason:
- `vibe-motion-app` is better viewed as a template workbench / scaffold.
- Its stronger parts are parameter-driven scene design, plugin/scaffold layering, preview workbench structure, and render helper scripts.
- It is not yet the right main shell for the intended end-user product.

## Recommended future direction

When implementation resumes, the preferred strategy is:
- keep `ai-video-studio` as the main repo
- borrow selected architecture ideas from `vibe-motion-app`
- keep one primary template per segment unless a concrete future workflow proves that segment-internal template timelines are necessary
- evolve generation from the current one-shot `VideoProject` shortcut into the
  staged final pipeline: storyboard planner -> per-segment TTS ->
  selected-template compiler -> assembled `VideoProject`
- treat TTS voiceover as part of the main generated-video pipeline because
  real narration duration should drive segment timing
- express richer segment visuals through template-specific implementation fields,
  internal components, and media-layer props first

In short:
- `ai-video-studio` provides the product shell
- `vibe-motion-app` provides reusable internal structure ideas

## Candidate ideas to borrow later from vibe-motion-app

Not to implement yet; only keep as reference.

1. Parameter-driven video design
- prefer structured props / JSON schema over ad-hoc generated code
- keep preview and render driven by the same validated parameter model

2. Layer separation
- separate product UI, video runtime, and feature/template logic
- avoid mixing page concerns and scene animation concerns too early

3. Preview workbench ideas
- left-side parameter controls + right-side live preview
- keep this idea, but implement it inside the Next.js product shell

4. Feature/template modularity
- future video templates can be isolated as feature modules or plugins
- this makes it easier to support multiple styles/templates across segments later
- do not turn one segment into multiple template instances by default

5. Render preset / config pattern
- support saved presets or structured project configs for repeatable renders

6. Media layer compositing
- future projects may add project-level `media.layers[]` for existing video,
  image, audio, or color layers shared by the full generated video
- future segments may add segment-level `media.layers[]` for media that
  applies only to that segment
- treat the old `baseLayer` idea as a media-layer role for background visual
  media, not as a separate schema field
- start with simple structured layer editing before introducing full timeline
  editing

## Suggested future milestones

The older starter milestones below have mostly been shipped. Current roadmap
iteration should follow `docs/FINAL_PRODUCT_GOAL.md` instead.

Current likely sequence:

1. Lock the authoritative final generation goal
- final goal document
- PRD / architecture / README / agent notes point to the same target
- status: implemented

2. Add storyboard planning contract
- validated `StoryboardPlan`
- compact planner template manifest
- template selection based on registered descriptions, capabilities, and use
  cases
- status: core schema, manifest, MiniMax planner prompt/tool/parser, and
  internal facade are implemented; main route integration and planner repair
  remain later work

3. Add TTS voiceover MVP
- generate narration audio from planned segment text
- write local audio artifacts
- measure or normalize duration
- feed audio duration back into segment compilation
- status: internal asset/API boundary implemented for one planned segment;
  MiniMax TTS smoke test passed, and main-route/compiler integration remains
  later work

4. Add duration-aware segment compiler
- provide only the selected template schema and rules
- generate schema-valid `implementation`
- repair bounded validation failures
- status: next major pipeline slice

5. Assemble staged output into the current product loop
- preview and export the assembled `VideoProject`
- regenerate only the smallest affected scope

6. Later media-layer and persistence work
- add existing image/video/audio/color layers after generated narration is
  stable
- add saved plans, TTS metadata, compiler results, and render history later

Older shipped starter sequence kept for background:

1. Replace starter page with a product-style layout
- prompt input
- parameter panel
- preview area
- render/export action

2. Add structured video schema
- scene config
- theme config
- timing config
- asset/text config
- validation rules

3. Add `/api/generate`
- prompt -> structured JSON
- validate before preview

4. Connect preview state to Remotion composition props
- one source of truth for preview and export

5. Add final render/export flow
- reuse validated parameter payload
- export artifact to a stable output path

## Current instruction

Until a task explicitly widens scope:
- treat `docs/FINAL_PRODUCT_GOAL.md` as the authoritative final target
- do not auto-expand this repo into the full long-term vision in one step
- treat `docs/ITERATION_STATUS.md` as the source of truth for current implemented progress
- use this file for longer-term direction and deferred ideas
- prefer one primary template per segment
- prefer TTS -> audio duration -> template compile as the next generation
  direction
- prefer media layers for existing image, video, audio, and color needs
