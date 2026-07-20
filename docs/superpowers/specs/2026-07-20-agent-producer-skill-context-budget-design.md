# Agent Producer Skill Context-Budget Design

Date: 2026-07-20
Status: implemented and verified on 2026-07-20

## Goal

Reduce the context cost of the only supported video-production skill without
changing its production behavior, supported command chain, creative authority,
or safety boundaries.

The current entrypoint is 580 lines and 3,336 words. In the audited
narration-only scenario, approximately 625 words are relevant and 2,711 words
are unrelated. Its unconditional reading list can expand that narrow task to
approximately 22,366 words before production work starts.

The redesigned skill must make the common entry cheap, route agents to only the
stage guidance needed for the current task, and keep full-video production
discoverable through one Agent Producer entrypoint.

## Selected Architecture

Keep `.agents/skills/ai-video-studio-agent-producer/SKILL.md` as a compact
router. Move operational detail into task-scoped references within the same
skill package:

```txt
.agents/skills/ai-video-studio-agent-producer/
|-- SKILL.md
|-- references/
|   |-- full-video-workflow.md
|   |-- narration.md
|   |-- assets-evidence.md
|   |-- remotion-composition.md
|   `-- render-review-quality.md
|-- remotion-primitives/
`-- voxcpm-expression/
```

This preserves the repository rule that Agent Producer is the only
video-production entrypoint. The reference files are not separately
discoverable skills and do not introduce parallel workflows.

## Entrypoint Contract

`SKILL.md` targets 250-400 words and must remain at or below 500 words,
including frontmatter. It contains only:

- the single-entrypoint statement;
- the supported production command chain;
- non-negotiable production boundaries;
- a task-to-reference routing table;
- the rule to load references just in time rather than all at startup;
- the minimum completion and handoff contract.

It must not contain Roadmap phase history, capability inventories, asset
acquisition procedures, detailed narration mechanics, layout heuristics, or
full validation command lists.

Paths are normal Markdown references, not force-loaded `@` references. A task
must not be instructed to read all supporting files unconditionally.

## Conditional Routing

| Current task | Required guidance |
| --- | --- |
| New end-to-end video | Read `full-video-workflow.md`, then load each stage reference immediately before that stage |
| Narration, voice selection, caption timing, or audio recovery | Read `narration.md`; before final VoxCPM text or controls, also read `voxcpm-expression/VOXCPM_EXPRESSION.md` |
| Asset choice, evidence, library search, capture, or stock fallback | Read `assets-evidence.md` |
| Remotion source, scenes, styles, effects, transitions, media, or sound | Read `remotion-composition.md`; load only the relevant Remotion rules and primitive inventory |
| Stills, render, cover, quality gate, publishing, or final handoff | Read `render-review-quality.md` |
| Roadmap, architecture, migration, or skill maintenance | Read the active authority documents in repository order |

For a narrow task, loading stops after the matching reference unless the task
scope materially expands. For a full production, guidance is loaded by stage;
the workflow reference must not duplicate the stage references.

## Reference Responsibilities

### `full-video-workflow.md`

Owns the production brief, stage order, handoff between stages, dedicated
composition requirement, and the rule that measured narration duration owns
timing. It links to the four stage references rather than restating them.

### `narration.md`

Owns direct VoxCPM modes, punctuation splitting, silence trimming, WAV
concatenation, duration-derived captions, retry fingerprints, local artifact
paths, `/ready` behavior, and fail-closed narration policy. Within the Agent
Producer skill package, it is the detailed source of truth for the accepted
`science-explainer-young-male` default. The active repository authority and
provider documents retain their existing policy statements.

### `assets-evidence.md`

Owns the asset-led/code-led/hybrid decision gate, reusable-library search,
Pexels-only `stock-assets-mcp` fallback, receipt localization, strict
`ProducerAssetManifest`, evidence honesty, capture failure handling, and local
artifact boundaries. Asset-library admission and maintenance remain owned by
the separate Asset Library skill.

### `remotion-composition.md`

Owns composition layout, frame-driven motion, inventory-before-abstraction,
style-profile selection, and routing to current effects, transitions, media,
sound, text fitting, primitive inventory, and Remotion best-practice rules. It
describes current callable surfaces, not Phase 6-9 implementation history.

### `render-review-quality.md`

Owns validation, representative still review, MP4 and ffprobe verification,
Remotion `<Still>` covers, deterministic quality gates, publishing artifacts,
promotion rules, final audiovisual review, and the concise completion summary.

## Content Removal And Deduplication

The existing Roadmap-status paragraph and the Phase 6, 7, 8A, and 9A sections
leave the skill package. Their historical and milestone detail already belongs
to `docs/ITERATION_STATUS.md` and
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

Repeated command descriptions are replaced with one command chain in the
entrypoint and stage-specific details in the owning reference. Repeated
pitfalls move beside the relevant stage instead of remaining in a global
pitfalls section.

The existing `remotion-primitives` and `voxcpm-expression` references remain in
place. They are loaded only when their task predicates apply.

## Mechanical Guards

The current smoke suite structurally forces detailed tokens into `SKILL.md`.
Tests must be reassigned by ownership:

- `skill-alignment-smoke` verifies entrypoint frontmatter, routing, core
  boundaries, command order, reference existence, and the 500-word budget;
- narration and science-profile assertions target `references/narration.md`
  plus the existing VoxCPM reference and active provider documents;
- stock and evidence assertions target `references/assets-evidence.md`;
- Remotion capability, media/sound, and style assertions target
  `references/remotion-composition.md`;
- render and quality assertions target `references/render-review-quality.md`;
- forbidden legacy behavior is scanned across the complete skill package.

Tests must validate each reference independently instead of concatenating the
whole package into a synthetic always-loaded document.

The context-budget assertion is introduced before the rewrite and must fail on
the current 3,336-word entrypoint. The rewritten entrypoint then makes the same
assertion pass.

## Behavior Preservation

The refactor does not change:

- code-and-existing-assets-only visual production;
- VoxCPM as the sole provider for new narration;
- the Chinese science-explainer voice policy or private-file boundary;
- dedicated Remotion composition and explicit style-profile requirements;
- reusable-library-first and Pexels-only fallback ordering;
- asset manifest, preflight, still, render, cover, and quality commands;
- frozen-reference immutability;
- Agent ownership of creative judgment and final audiovisual approval;
- ignored/untracked handling for generated and private artifacts.

## Acceptance

The implementation is accepted when:

1. `SKILL.md` is at most 500 words and routes every supported production task.
2. A narration-only agent can find the science default, direct VoxCPM runtime,
   audio checks, and handoff fields without loading visual, asset, render, or
   Roadmap detail.
3. An asset-only agent can find the complete visual-source decision and stock
   localization contract without loading narration or Remotion capability
   inventories.
4. A Remotion-only agent can find the required style, capability, and
   frame-driven rules without loading acquisition or publishing procedures.
5. A full-video agent can still discover the complete supported command chain
   from the single entrypoint and load every stage just in time.
6. Existing focused architecture, skill, asset, audio, Remotion, style,
   quality, and final-acceptance smokes pass after their assertions are routed
   to the owning references.
7. Docker TypeScript validation remains unchanged because this refactor alters
   documentation and smoke ownership, not runtime behavior.
8. `git diff --check` passes and no generated or private artifact is tracked.

## Non-Goals

- no new production skill or entrypoint;
- no production command, runtime, schema, composition, or generated artifact
  change;
- no Roadmap phase or capability work;
- no rewrite of the separate Asset Library skill;
- no change to completed or frozen compositions;
- no aesthetic automation or automatic creative approval;
- no push.
