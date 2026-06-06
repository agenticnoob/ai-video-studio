# Iteration Status

Last updated: 2026-06-02

## T2-narrow patch (this iteration)

Carved down from the broader T2 milestone: the in-scope change here is **only**
the tool-calling main path + Zod strict validation + `max_tokens=8192` (plus
the `finish_reason=length` guard). All decisions are inherited from the T1
research probe (`docs/providers/minimax-tool-calling.md`) and are not
re-debated here.

Scope (per `t_2f241ef2`):
- only files touched: `src/lib/minimax/{provider,parse-project,prompts,index,tool-schema}.ts`,
  `src/app/api/generate/route.ts` (only the provider-error classification regex),
  this doc.
- explicit no-touch: `src/lib/project-schema.ts`, `src/lib/video-schema.ts`,
  `src/app/page.tsx`, the render/export chain, any multi-provider abstraction,
  Hermes/wrapper config, the `responses` API path, and any code path that
  would echo `MINIMAX_API_KEY`.

Decisions (locked by T1):
- model: `MiniMax-M2.7-highspeed` (T1: 5/5 full-field coverage at ~21s P50 with the
  v2 deep-recursive schema; M3 is 2-4× slower with no quality gain on the
  probed brief set). Override via `MINIMAX_MODEL` env only.
- transport: self-`fetch` to `https://api.minimaxi.com/v1/text/chatcompletion_v2`.
  No OpenAI SDK dependency. No streaming.
- tool schema: **single** `emit_result` function tool with a deep-recursive
  JSON Schema (see `src/lib/minimax/tool-schema.ts`). `tool_choice` is forced
  to `{ type: "function", function: { name: "emit_result" } }`. Dual-tool
  routing and top-level-only schema are rejected by the T1 probe.
- `max_tokens`: **8192**. T1 §6 showed 3-segment briefs at 4096 hit
  `finish_reason=length` on 1/4 calls; 8192 is 0/4 truncations across the
  probed set.
- `response_format=json_object` is **not** sent on the tool-calling path.
  It is redundant when `tools` is present (both force JSON; sending both is
  noise) and is the kind of dual-forcing that triggers the M2.7
  double-encoding regression observed on 2026-06-02.
- `finish_reason=length` is part of the contract: the provider throws
  (`"MiniMax response truncated by max_tokens ..."`) and the route surfaces
  it as **502** via the `UPSTREAM_ERROR_PATTERN` regex. No silent mock
  fallback — `MINIMAX_API_KEY` missing also surfaces as **500** with the
  explicit `MINIMAX_API_KEY is not configured` message.

What the route does:
- `POST /api/generate` with `mode=project` → `minimaxGenerateProject()` →
  build prompt → `callMinimaxChat()` → first `tool_calls[0].function.arguments`
  string → `parseToolCallArguments()` → Zod `videoProjectSchema.safeParse`
  → `VideoProject` JSON.
- `mode=segment` mirrors the same chain through `minimaxReviseSegment()`.
  The model is instructed to return the **full** project with non-target
  segments byte-identical; the parser still gates it through Zod.
- Errors classify by the message: `MinimaxConfigError` → 500 (config
  problem); messages matching `UPSTREAM_ERROR_PATTERN` (network/non-JSON
  upstream/parse failures/no tool calls/wrong tool/empty args/length
  truncation) → 502; everything else (including Zod schema rejection) → 500.

Local error-path verification (no live API needed — `scripts-tmp-t2-smoke.mjs`):
1. `MINIMAX_API_KEY` unset → `MinimaxConfigError` → 500.
2. `parseAndValidateProject` non-JSON input → `MiniMax response was not
   valid JSON` → 502.
3. `parseAndValidateProject` valid JSON but wrong shape → Zod rejection →
   500 (schema is a contract problem, not upstream).
4. `parseToolCallArguments` non-JSON `arguments` string → 502.
5. `parseToolCallArguments` valid JSON but wrong shape → 500.

All 5 paths classified as expected (`PASS` × 5 in the smoke run).

Live smoke (1× mode=project, real `MINIMAX_API_KEY`, brief: "Create a
2-segment video about a kitchen knife forging workflow: heat, hammer,
polish."):
- elapsed 42.3 s end-to-end
- returned 2 segments, 6 scenes total (3 per segment)
- `meta = { title: "Forging a Kitchen Knife", fps: 30, width: 1280, height: 720 }`
- `segment[0].id = "segment-1"`, `templateId = "scripted"`
- `segment[0].implementation.scenes[0].type = "title"` (discriminator
  present, M2.7 deep-recursion regression not triggered)
- `brief` round-trips as a plain string (no double-encoding)
- `finish_reason` ≠ `length` (no truncation; `max_tokens=8192` budget held)

Validation trio:
- `npm run lint` → exit 0
- `npx tsc --noEmit` → exit 0
- `npm run build` → exit 0 (Next.js 16.2.3 Turbopack, 7/7 static pages)

## Latest iteration — MiniMax provider wiring (T2 milestone)

- `POST /api/generate` now calls `https://api.minimaxi.com/v1/text/chatcompletion_v2` for both `mode=project` and `mode=segment`.
- Implementation lives under `src/lib/minimax/` (provider client + prompt templates + strict parser + a tiny `index.ts` facade) and is documented in [`docs/providers/minimax.md`](providers/minimax.md).
- Key decisions:
  - config is read centrally in `readMinimaxConfig()`; `MINIMAX_API_KEY` missing → throws `MinimaxConfigError` → route returns **500** with the explicit message (no silent mock fallback).
  - other failures are classified by a regex over the thrown message and surface as 502 (network/upstream/parse) or 500 (schema validation).
  - strict parse: JSON fence strip → `JSON.parse` → `videoProjectSchema.safeParse`, errors carry the first 200 chars of raw text for diagnosis.
  - `MINIMAX_MODEL` / `MINIMAX_BASE_URL` default to `MiniMax-M2.7-highspeed` / `https://api.minimaxi.com/v1`; model name is never hard-coded in source.
  - `src/lib/project-generation.ts` is marked test-only and no longer imported by the route.
- New env keys documented in `.env.example`; full MiniMax section in `README.md`.
- Validation: `npm run lint`, `npx tsc --noEmit`, `npm run build` all pass. Missing-key 500 path verified with `tsx` invocation of `readMinimaxConfig()`.

## Tool calling — T3 live review resolved (2026-06-02 → stabilized)

- T2 wired the v2 deep-recursive `emit_result` tool + `tool_choice: {type:"function", function:{name:"emit_result"}}` + `max_tokens=8192` per T1 §5; `response_format: json_object` was dropped as redundant.
- T3 independent live verification (4 runs against the real `MINIMAX_API_KEY`; brief set different from T1/T2's) recorded in [`docs/providers/minimax-tool-calling-review.md`](providers/minimax-tool-calling-review.md).
- Follow-up fixes (parseToolCallArguments Path 4 + buildSegmentPrompt full non-target feed) landed and have been merged. The default `MINIMAX_MODEL = MiniMax-M2.7-highspeed` is the accepted production configuration.

## Current stage

`ai-video-studio` now has a closed local v1 authoring loop for the one-primary-template-per-segment workflow.

Current product direction:
- `VideoProject` remains the top-level generation / preview / render boundary.
- `VideoSegment` remains the user-facing editing and regeneration unit.
- Each segment should have one primary template.
- `templateId` determines the schema of `implementation`.
- `implementation` is template-specific; current `scripted` implementations use `VideoSpec`.
- `VideoSpec.scenes` is specific to the current `scripted` template, not a universal field for all future templates.
- Future existing video, image, or color inputs should be modeled as project-level or segment-level `baseLayer` data, not as extra templates inside the segment.

Current working flow:
1. user writes a brief
2. page calls `POST /api/generate`
3. API returns schema-validated `VideoProject`
4. page hydrates project-level editable state
5. assembled full-video preview renders the normalized project
6. user selects a segment and edits / regenerates only that segment
7. user clicks local export to render the current edited `VideoProject`
8. server writes both:
   - stable artifact: `out/renders/latest.mp4`
   - unique artifact for this render: `out/renders/render-<timestamp>-<id>.mp4`
9. UI returns render state plus both download entries:
   - stable: `GET /api/render/latest`
   - unique: `GET /api/render/[renderId]`

## What is already implemented

### Product workflow UI
- `src/app/page.tsx` uses project-level state instead of single `VideoSpec` state
- Chinese-first main page copy for the current studio path
- brief input + generate button
- loading state + error state
- primary full-video preview using `ProjectVideo`
- visible segment list for navigation
- selected-segment editing shell
- structured scene/theme editing preserved within the selected segment
- working segment regeneration action from the revision prompt
- local render/export controls for the current edited project
- render success state now exposes both the stable latest artifact and the unique artifact for that render

### Structured generation boundary
- `src/app/api/generate/route.ts`
- supports two request modes:
  - full project generation from brief
  - selected segment regeneration from current project + segment id + revision prompt
- returns schema-validated `VideoProject` JSON
- **current implementation is MiniMax (`https://api.minimaxi.com/v1/text/chatcompletion_v2`) backed** — see [`docs/providers/minimax.md`](providers/minimax.md)
- the local deterministic mock in `src/lib/project-generation.ts` is now **test-only** and is no longer imported by the route; missing `MINIMAX_API_KEY` surfaces as a 500 with an explicit message, never a silent fallback
- the `spec` compatibility field in the `/api/generate` response is `@deprecated` — `page.tsx` reads `data.project` only, zero in-repo consumers depend on `data.spec`

### Local render/export boundary
- `src/app/api/render/route.ts` accepts the normalized current `VideoProject` and performs local Remotion render
- `src/lib/render-project.ts` renders `ProjectVideo`, creates a unique render artifact, and refreshes `latest.mp4`
- `src/app/api/render/latest/route.ts` serves the stable latest artifact
- `src/app/api/render/[renderId]/route.ts` serves the unique artifact for one successful export
- `src/helpers/use-rendering.ts` resets stale render attempts safely so the UI does not stay stuck in `rendering`

### Video runtime wiring
- `src/remotion/ProjectVideo/ProjectVideo.tsx` sequences project segments into one assembled composition
- `src/remotion/Root.tsx` registers both `ProjectVideo` and legacy `ScriptedVideo`
- `src/remotion/ScriptedVideo/*` remains the segment implementation path for the current template
- preview duration / fps / width / height are derived from the project metadata and segment helpers
- Remotion text rendering now prefers a CJK-capable sans stack for Chinese-first content

### Docker/runtime support
- `Dockerfile` installs `fonts-noto-cjk` and `fonts-noto-cjk-extra` in addition to the existing browser/render dependencies
- `scripts/render.sh` still targets the default/sample composition render path
- current edited-project export path is the page action / `POST /api/render`, not `scripts/render.sh`

## What is intentionally NOT done yet

These are still out of scope or not implemented yet:
- full-project regeneration UX beyond the current initial generate flow
- render job progress UX for end users
- cancellation/progress history for finished renders
- ~~real LLM/provider-backed generation~~ **shipped** (MiniMax; see [`docs/providers/minimax.md`](providers/minimax.md))
- project persistence / saved drafts / history
- multi-template product architecture
- project-level / segment-level baseLayer media compositing
- browser automation acceptance

## Validation status

Latest repo-local verification after the second render/export fix pass:
- `npm install`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

Latest Docker dev verification after the LAN-access + studio recovery pass:
- `docker logs ai-video-studio-web-1` confirmed the prior HMR failure was `allowedDevOrigins` blocking `192.168.50.6`
- `next.config.js` now allows both `192.168.31.6` and `192.168.50.6`
- `docker logs ai-video-studio-studio-1` confirmed the prior blank-page path came from a stale image/container missing browser shared libs (`libnspr4.so`) even though the repo Dockerfile already declared them
- `docker compose build web studio` rebuilt `ai-video-studio:local` from the current Dockerfile
- `docker compose up -d --force-recreate web studio` recreated both services
- `curl http://127.0.0.1:3000/` returned `200`
- `curl http://127.0.0.1:3001/` returned `200`
- `curl http://192.168.50.6:3000/` returned `200`
- `curl http://192.168.50.6:3001/` returned `200`
- `http://192.168.50.6:3001/bundle.js.map` now exposes 928 bundled sources (previous bad runtime-only bundle state is gone)

## Important files for the current stage

- `src/app/page.tsx`
- `src/app/api/generate/route.ts`
- `src/app/api/render/route.ts`
- `src/app/api/render/latest/route.ts`
- `src/app/api/render/[renderId]/route.ts`
- `src/helpers/use-rendering.ts`
- `src/lib/render-project.ts`
- `src/lib/project-schema.ts`
- `src/lib/project-generation.ts`
- `src/remotion/ProjectVideo/ProjectVideo.tsx`
- `src/remotion/ScriptedVideo/SceneRenderer.tsx`
- `src/components/project/SegmentList.tsx`
- `src/components/project/SegmentEditor.tsx`
- `src/components/RenderControls.tsx`
- `docs/PRODUCT_REQUIREMENTS.md`
- `docs/FUTURE_DIRECTION_NOTES.md`
- `docs/plans/2026-05-29-v1-segment-first-orchestrator.md`

## Recommended next milestone

- ~~replace the local deterministic `POST /api/generate` mock with a real provider-backed generation path while preserving schema validation and the project-level edit loop~~ **shipped in this iteration** (MiniMax; see [`docs/providers/minimax.md`](providers/minimax.md)).

Suggested next focus, in order:
1. ~~keep `VideoProject` as the generation contract~~ ✓ kept
2. ~~add provider integration behind the existing request modes~~ ✓ added (MiniMax)
3. ~~preserve schema validation + deterministic fallback/error handling~~ ✓ preserved (strict parse, no silent mock fallback)
4. keep the next work bounded unless a task explicitly asks for persistence/history or media-layer compositing

## Notes for future Hermes/Codex work

- Keep `VideoProject` as the top-level page/generation/preview/render boundary for this phase.
- Keep `VideoSpec` as the per-segment implementation contract for the current scripted template.
- Keep one primary template per segment; grow segment expressiveness through template-specific implementation fields first.
- Treat `scenes` as a `scripted` implementation detail, not as a universal product-level concept.
- Model future video/image/color underlays as project-level or segment-level `baseLayer` data.
- Do not widen scope into multi-template-per-segment support unless a concrete workflow proves that scene/component composition is insufficient.
- Remove the temporary `/api/generate` `spec` compatibility field once no older consumer depends on it.
- Prefer repo-local artifacts for delegated workers when possible.
- On this workstation, browser automation is not the default validation path.
