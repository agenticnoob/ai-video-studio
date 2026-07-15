# Producer Asset Contract

Status: active Phase 5 Agent Producer asset-supply contract.

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

Visual production uses code and existing assets only.

The implementation sequence is defined by
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

Every visible non-code asset in a maintained sample must have one record in a
strict `ProducerAssetManifest`. Records contain a stable id, kind, repository-
relative local path, purpose, source/provider/license/attribution metadata,
SHA-256 and byte size, plus kind-appropriate media metadata.

## Local Paths

- reusable reviewed assets: `public/assets/library/<file>`
- composition-local working assets: `public/generated/<slug>/assets/<file>`
- final manifest: the dedicated composition's `assets.manifest.json`

Formal renders never use remote URLs. `public/generated/` remains ignored and
local-only. A reusable library asset may be committed only after license,
attribution, integrity, and media review.

## Supply And Preflight

```bash
npm run producer:assets -- --manifest <supply-plan-json>
npm run producer:preflight -- --composition <composition-id>
```

Supply plans use either a named manual file or an HTTP(S) URL. URL records must
keep the exact source URL. Real browser screenshots use the same image record
with a capture provider, source URL, creator/license, and attribution data.
Private/manual source paths are never written to the final manifest.

Video localization normalizes formal assets to H.264, yuv420p, constant frame
rate, and AAC when audio exists. Preflight recalculates checksums and probes
metadata. Missing, corrupt, duplicate, undersized, unlicensed, incomplete-
attribution, remote, or non-normalized assets fail before maintained stills.

If source capture is unavailable or unreadable, record the reason outside the
frame and redesign the scene as an honest code-rendered information graphic.
There is no fabricated screenshot or runtime media fallback.

Asset records must not contain generation `model`, `prompt`, `seed`, or
`workflow` fields.
