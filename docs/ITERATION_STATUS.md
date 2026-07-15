# Iteration Status

Last updated: 2026-07-16

## Current Authority

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

Visual production uses code and existing assets only.

The implementation sequence is defined by
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

## Current Milestone

Phase 4 — consolidate Agent Producer OS — is complete.

Phase 0 authority reset, Phase 1 direct VoxCPM runtime, Phase 2 F5 removal,
and Phase 3 Web product removal remain complete. Phase 5 existing-asset supply
is next and has not started.

## Implemented Phase 4 Boundary

- replaced recipe/template productization values with Producer-owned promotion
  targets: primitive, block, effect, transition, and style profile
- classified every current finished registry entry as `frozen-reference`
- added a strict `maintained` manifest contract for future compositions,
  including production brief, VoxCPM narration, local assets, validation,
  review frames, render metadata, two Remotion Still covers, publishing copy,
  and promotion evidence
- added `producer:scaffold` to create the complete dedicated source skeleton
- kept one registry and exposed maintained entries separately without inventing
  an unfinished real sample
- composed existing audio, manifest, registration, and artifact checks through
  `producer:validate`
- retained the manifest-driven `producer:stills` review-frame entrypoint
- added `producer:render` for MP4, final metadata, and both code-rendered covers
- preserved every finished composition and all local/private/generated artifact
  boundaries

## Verification

RED evidence:

- the pre-Phase 4 `smoke:producer-sample-manifest` passed its manifest stage,
  then exited 1 because the old promotion smoke still required recipe/template
  decisions that active Producer-only docs correctly omitted
- the new `smoke:producer-os` exited 1 with
  `Missing Phase 4 command: producer:scaffold` before implementation

GREEN evidence:

- Phase 4 OS, manifest, promotion, validation, review-frame, architecture,
  skill, direct VoxCPM, and standalone focused smokes pass
- the scaffold smoke creates and inspects an isolated `/tmp` sample and removes
  it without touching `src/remotion/Root.tsx`
- Docker TypeScript, Remotion bundle build, and composition listing pass
- changed-file ESLint and Prettier, shell/Compose syntax, forbidden/frozen/
  artifact scans, and `git diff --check` pass

Repository-wide Docker lint reports 39 historical errors plus 2 ignored
generated warnings, all outside the Phase 4 changed-file set. Phase 4 does not
claim a clean whole-repository lint gate.

No representative still was rendered because no registered composition or
finished render code changed. The new cover is a future scaffold component;
its first real sample must register both Stills, render them, and inspect them.

VoxCPM provider documentation, `.env.example`, and Docker Compose remain
unchanged: Phase 4 composes the existing direct provider and `producer` service
instead of adding a provider, environment variable, or service boundary.

## Current Commands

```bash
npm run producer:scaffold -- --name <CompositionName> --slug <slug>
npm run producer:validate -- --module <validation-module>
npm run producer:stills -- --composition <composition-id>
npm run producer:render -- --composition <composition-id>
```

## Next Bounded Slice

Phase 5 — existing asset supply system — is next. It has not started. Its
future plan owns localization, checksums, provenance, licenses, media metadata,
and preflight; none of those capabilities were pulled into Phase 4.

## Frozen History

Existing finished compositions, historical generated-audio provider metadata,
ignored private voice/model files, and local generated artifacts remain
read-only or local-only. Prior delivery history remains under `docs/archive/`.
