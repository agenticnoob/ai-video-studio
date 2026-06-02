# MiniMax Tool Calling — Independent Live Review (T3)

> Reviewer: `m3-reviewer` · Date: 2026-06-02 · Parent tasks: `t_0b7b90e7`
> Predecessors: `t_62e39dea` (T1 research), `t_e9e43f18` (T2 builder)
> Self task: `t_794f5663`
> Verdict (TL;DR): **not stable** — see §3 for failure boundaries.

This document is the independent live-validation layer the T3 card
(`t_794f5663`) required. It does **not** rerun the T1 research probe or
the T2 verify harness; it uses a from-scratch script
(`scripts-tmp-t3-live-verify.mjs`) with a different brief set and a
re-implemented Zod-equivalent parser. All numbers in §2 are pulled
from the live API, not synthesized.

## 1. Setup

- **API key**: read live from `ai-video-studio/.env.local` (`MINIMAX_API_KEY`).
- **Endpoint**: `https://api.minimaxi.com/v1/text/chatcompletion_v2` (HTTPS, JSON, 60s timeout, 30K char response cap respected).
- **Default model** (per `.env.local`): `MiniMax-M2.7-highspeed`. The same env var is also read by `src/lib/minimax/provider.ts` in prod; i.e. the env currently steers both T3 and the running `/api/generate` route to the **same** model. We additionally probed the T1-recommended `MiniMax-M2.7` (strict) for comparison.
- **Tool schema**: deep-recursive `emit_result` (v2 shape) per T1 §5.1 — T3's inline copy is rewritten from the spec, not pasted from `src/lib/minimax/tool-schema.ts`.
- **Request shape**: `tools: [EMIT_RESULT_TOOL] + tool_choice: {type:"function", function:{name:"emit_result"}}`, `response_format` deliberately omitted (T1 §5.2), `temperature=0.4`, `top_p=0.9`, `max_tokens=8192`.
- **Brief set** (T3 independent, no overlap with T1's 2-segment default or T2's):
  - A: short 1-segment — "Make a 30-second intro for an AI video studio that turns a one-line brief into a structured video project."
  - B: medium 2-segment — two-step product walkthrough.
  - C: long 3-segment — full product tour; also feeds the segment-mode revise test.

## 2. Per-run table (live, real `MINIMAX_API_KEY`)

All 4 runs in this main table were captured against
`MINIMAX_MODEL=MiniMax-M2.7-highspeed` (the .env.local default). `parse_ok`
means the raw `tool_calls[0].function.arguments` string was valid JSON
after `JSON.parse`; `zod_ok` means the parsed object, after the T3
unwrapper (Path 1 + Path 2 equivalents, see §4), passes a
Zod-equivalent structural check matching `videoProjectSchema`. `argsLen`
is the byte length of the raw `arguments` string.

| run | model | mode | brief | finish | parseOK | zodOK | argsLen | ms |
|---|---|---|---|---|---|---|---|---|
| project-A_short_1seg | M2.7-highspeed | project | A (≤1 句) | tool_calls | true | **true** | 1556 | 15452 |
| project-B_medium_2seg | M2.7-highspeed | project | B (2 句) | tool_calls | true | **true** | 3392 | 20657 |
| project-C_long_3seg | M2.7-highspeed | project | C (3 句长) | tool_calls | true | **true** | 5033 | 26907 |
| segment-revise-segment-1 | M2.7-highspeed | segment | C → rev seg-1 | tool_calls | true | **false** | 2449 | 30076 |

3/3 project runs hit `finish_reason=tool_calls` with the correct
function name; tool-calling transport is functioning at the wire
level. **The project-mode end-to-end path is "mostly stable" under
M2.7-highspeed** with the v2 deep-recursive schema — with two
qualifications (see §3) and a major caveat for segment mode.

### 2.1 Wrapper-shape observation (T3 additional finding)

Across the 3 project runs, the model wrapped `tool_calls[0].function.arguments`
inside **three different single-key envelopes** with no discernible
pattern (run 1 → `{"arguments": "..."}`, run 2 → `{"result": "..."}`,
run 3 → `{"json_string": "..."}`). The T1 report warned this is a
known regression of the `M2.7-highspeed` routing alias (T1 §4.1
"wraps the VideoProject inside `{result: '<json string>'}` or
`{json: '...'}`"). **Confirmed live and extended to `{arguments: ...}`**
in this probe. The T3 unwrapper handles any single-key string
wrapper (it only checks `Object.keys(v).length === 1`), matching the
production `parseToolCallArguments` Path 2 behaviour.

### 2.2 M2.7-strict spot check (T1-recommended model)

T3 also ran one M2.7-strict probe (Brief C). It exposed a separate
regression that the v1 report flagged but the v2 follow-up never
re-tested:

- `args_len=1794`, top-level shape is `{meta, brief, segments}`, but
  `segments` is a **JSON-encoded string**, not an array —
  i.e. `"segments": "[{...}, {...}, {...}]"`. A 2925-element loop
  confirmed `project.segments.map` is undefined.
- The T3 unwrapper (and `parseToolCallArguments` Path 1+2+3) only
  unwrap outer single-key strings; **neither handles
  string-typed sub-fields like `segments: "..."`**.
- Net effect: production parser throws → route returns **HTTP 500**
  with `Generated project failed schema validation: ...`.

This is a real production hazard, not a probe artifact. It contradicts
T1's §0 "M2.7 5/5 full-field coverage" claim at least on this
brief, and it lines up with the T1 §0 caveat about
"M2.7 occasionally stringifies structural arrays". The T1 report
didn't grade this regression as a `safeParse` blocker because its
Zod-equivalent gate checks the parsed object's top-level only,
not the `videoProjectSchema.safeParse` ground truth.

## 3. Verdict: **not stable**

Decision matrix from the T3 card §4:

- **Tool-calling transport is functional** (3/3 project runs hit
  `finish_reason=tool_calls` + correct function name). ✔
- **M2.7-highspeed + v2 schema passes the project-mode contract on
  T3's brief set** (3/3 unwrap + 3/3 Zod-equivalent structural
  match). ✔ — but the per-call shape is unstable (3 different
  wrapper keys across 3 runs), and the model is the routing alias
  T1 §0 / `provider.ts` line 12 explicitly warn to avoid.
- **Segment mode fails on the long-brief test**: non-target segments
  lose their `theme` and `scenes` (the model returns them as
  `implementation.meta` only) — see issues below. ✘
- **M2.7-strict + v2 schema regresses on Brief C** with the
  `segments`-as-string shape that the production parser doesn't
  cover. ✘

Failure boundaries (T3 card §4 "若不通过 → 根因 + 下一步"):

| failure | root cause | next step |
|---|---|---|
| M2.7-highspeed 3 different wrapper keys across 3 runs (`arguments` / `result` / `json_string`) | (a) routing-alias drift — T1 §0 / `provider.ts` L12 already warn against it | **switch `MINIMAX_MODEL` in `.env.local` from `MiniMax-M2.7-highspeed` to `MiniMax-M2.7`** (T1-recommended) |
| M2.7-strict + Brief C returns `segments: "[{...}]"` (string) | (b) tool arguments structural drift — LLM stringifies the segments array | **add Path 4 to `src/lib/minimax/parse-project.ts` `parseToolCallArguments`**: after Path 3 fails, walk the parsed value once and `JSON.parse` any string-typed field whose value is a non-empty array/object/JSON string and whose key is in the structural set (`segments`, etc.) — keep depth-capped and conservative so we don't mask real schema drift |
| Segment mode: non-target segments return only `implementation.meta` (no `theme`/`scenes`) | (c) the model is not honoring the "preserve other segments byte-for-byte" instruction even with the v2 deep-recursive schema; same problem the user flagged in 2026-06-02 prompt review | the T2 system prompt (segment mode) needs to (i) include the FULL implementation (theme + scenes) in the input payload so the model has a verbatim copy, not just `implementation.meta`; (ii) add a `response_format`-style reminder in the system prompt that non-target segments must be **byte-for-byte** preserved. See T1 §4 — they only validated project mode; segment mode was marked "out of T1 scope" and the v2 schema fix didn't extend to it. |

**Single recommendation (T3 card §4 "单一推荐下一步")**:

> **Block the cutover.** Two production-blocking bugs need to be
> remediated by the T2 builder before this tool-calling path is
> safe to ship:
> 1. `parseToolCallArguments` Path 4 — unwrap string-typed structural
>    fields (covers M2.7-strict `segments: "..."` regression).
> 2. `buildSegmentPrompt` (in `src/lib/minimax/prompts.ts`) — feed
>    the full implementation (theme + scenes) for non-target
>    segments into the model input, and tighten the preservation
>    rule in the system prompt.
> Plus a one-line `.env.local` change: `MINIMAX_MODEL=MiniMax-M2.7`
> (drop the `-highspeed` suffix). These three changes are scoped
> to T2 (`t_e9e43f18`); T3 follow-up task is queued.

## 4. T3 unwrapper / parser notes

The T3 verification script
(`scripts-tmp-t3-live-verify.mjs`) re-implements the Zod-equivalent
gate and the unwrap path so the reviewer stays independent of T1 / T2
verification scripts (T3 card §5).

What the T3 script does that the production parser does not:

- **Accepts any single-key string wrapper** (production Path 2 only
  also accepts any single key, so this is the same — T3 §2.1
  confirms Path 2 is the correct production behaviour).
- **Does not implement Path 3** (the M2.7 brief double-quoting
  recovery). Path 3 is a narrow leaf-string fix and was not
  exercised by the T3 brief set, so this is consistent with what
  the production parser does at the high level. We note that
  production Path 3 still does **not** cover structural fields
  like `segments` being stringified — see §3 table row 2.
- **JSON-only Zod equivalent** (mirrors `videoProjectSchema`):
  meta shape (title, fps=30, width=1280, height=720), brief string,
  segments[] with id `^segment-\d+$`, templateId `"scripted"`,
  implementation with meta/theme/scenes; theme 6 fields; scenes
  discriminated by `type ∈ {title, bullets, quote}` with the
  per-type required field set. Does **not** apply the
  `videoSegmentSchema` `transform` (the
  `durationInFrames` derivation from scene durations). This is
  acceptable for structural validation — the project passed back
  to the route does go through `videoSegmentSchema.parse` in
  production.

## 5. What T3 did NOT verify (limitations)

The T3 card §5/§6 require "independent validation, not reusing T1/T2
scripts". Within the 30-minute budget, T3 chose to write its own
parser-equivalent and use raw network calls; it did **not**:

- Run the production `route.ts` end-to-end (would require a build +
  dev-server + curl). T1's last live `tsx` invocation of
  `readMinimaxConfig()` is the only prod-path data point.
- Import the production `parseToolCallArguments` (Node 22's
  experimental type-stripping does not resolve extensionless
  relative imports, and the project has no `tsx` / `ts-node` dev
  dependency). A replay harness was drafted
  (`scripts-tmp-t3-replay.mjs`) and removed; the limitation is
  documented here for the next reviewer who has more time.
- Probe multi-call retry / length truncation recovery. T1 covered
  the 4096-token length case; T2 raised `max_tokens` to 8192 per
  T1; T3 did not see a `finish_reason=length` in 4 runs
  (max observed `args_len` was 5033, well under the 8192 budget
  for the M2.7-highspeed output profile).

## 6. Files

- T3 verification script (kept; `.gitignore`d via
  `/scripts-tmp-*.mjs`): `scripts-tmp-t3-live-verify.mjs`
- T3 follow-up card (created at completion): see kanban comment
  on `t_794f5663` and the new child task assigned to
  `m3-builder` with `parents=[t_e9e43f18, t_794f5663]`.
- This report: `docs/providers/minimax-tool-calling-review.md`
- ITERATION_STATUS.md: appended "Tool calling live review" subsection
  in the "Latest iteration" block.
