# Future Direction Notes

Status: partially resumed.

当前补充：
- 第一轮最小工作流已经落地，当前状态以 `docs/ITERATION_STATUS.md` 为准。
- 本文件保留“更后续方向”的判断，不再代表当前实现是否已开始。
- 产品模型已收敛为：一个 segment 对应一个 primary template；`templateId` 决定 `implementation` 的 schema；当前 `scripted` 模板的 `implementation` 是 `VideoSpec`，其中 `scenes` 是 scripted 专有的内部序列字段；已有视频、图片或纯色素材通过 project-level / segment-level `baseLayer` 表达。

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
- express richer segment visuals through template-specific implementation fields, internal components, and media/base-layer props first

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

6. Base layer compositing
- future projects may add a project-level `baseLayer` for an existing video, image, or color under the full generated video
- future segments may add a segment-level `baseLayer` for media that applies only to that segment
- start with simple background/underlay compositing before introducing timeline or layer editing

## Suggested future milestones

When work restarts, likely sequence:

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
- do not auto-expand this repo into the full long-term vision in one step
- treat `docs/ITERATION_STATUS.md` as the source of truth for current implemented progress
- use this file for longer-term direction and deferred ideas
- prefer one primary template per segment
- prefer base layers for existing media overlay/background needs
