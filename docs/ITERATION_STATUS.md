# Iteration Status

Last updated: 2026-07-16

## Current Authority

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

Visual production uses code and existing assets only.

The implementation sequence is defined by
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

## Current Milestone

Phase 6 version gate is complete.

Phase 6A effects and text-layout foundation is complete.

Phase 6 overall remains incomplete.

Phase 6B transitions and remaining showcase coverage have not started.

Phase 0 authority reset, Phase 1 direct VoxCPM runtime, Phase 2 F5 removal,
Phase 3 Web product removal, and Phase 4 Producer OS consolidation remain
complete. Phase 5 existing asset supply also remains complete. Phase 6B is the
next bounded slice, but its official transition dependency is still unavailable
at the repository's exact Remotion version.

## Implemented Phase 6A Boundary

- installed `@remotion/effects` and `@remotion/layout-utils` at exact `4.0.489`
  without introducing a mixed Remotion closure
- added `getProducerEffectPreset()` with `comic-print`, `cyber-scan`,
  `paper-grain`, and `pixel-grid` selection metadata and frame-driven inputs
- added `fitProducerText()` with guarded geometry, CJK-aware line fitting,
  width/height/line limits, and explicit `fits` diagnostics
- added `AgentProducerCapabilityShowcase` as an isolated code-only inventory
  composition under `Agent-Producer-Inventory` in Remotion Studio
- enabled Chromium OpenGL `swangle`, the documented no-GPU backend, for
  Docker-reproducible WebGL effect rendering
- did not add transitions, light leaks, custom shaders, HtmlInCanvas/CanvasImage
  media proof, dynamic media, sound design, style profiles, or frozen migration

## Implemented Phase 6 Version-Gate Boundary

- selected exact Remotion `4.0.489`, above the Roadmap capability floor of
  `4.0.487` required by `roughenEdges()`
- locked every currently installed direct and lockfile `remotion` / `@remotion/*`
  package to exact `4.0.489`, including removal of the `@remotion/three` caret
- added `smoke:remotion-version-gate` to guard dependency, lockfile, active-doc,
  inventory, and capability-not-started boundaries
- verified the existing non-frozen primitive fixture before and after the
  upgrade without modifying or rendering any finished composition
- the version-gate slice itself did not install capability packages or add
  showcase code; Phase 6A subsequently admitted only effects and layout-utils
- recorded the upstream blocker: npm currently publishes
  `@remotion/transitions` only through `4.0.477`, whose own Remotion dependencies
  are pinned to exact `4.0.477`; mixed versions and npm overrides are not an
  accepted workaround

## Implemented Phase 5 Boundary

- added a strict `ProducerAssetManifest` with local path, source, license,
  optional attribution, SHA-256, byte size, media metadata, and minimum media
  requirements
- added deterministic parsing/serialization with explicit rejection of image-
  or video-generation model, prompt, seed, and workflow fields
- added manual-file and HTTP(S) URL localization without persisting private
  source paths
- added screenshot/capture-compatible source records through normal image asset
  provenance instead of a fabricated screenshot type
- added SHA-256 duplicate detection, SVG/Lottie parsing, ffprobe image/video/
  audio metadata, and FFmpeg H.264/yuv420p/CFR/AAC normalization
- added `producer:assets` and `producer:preflight`
- made maintained validation agree with the asset manifest and made maintained
  still/render entrypoints preflight before planning or spawning render jobs
- added `public/assets/library/` and ignored
  `public/generated/<slug>/assets/` conventions
- removed remote default images from Ken Burns, Parallax Pan, and Zoom Pulse;
  their no-asset state is an honest deterministic code fallback
- preserved every finished composition, frozen registry entry, historical
  narration metadata, and local/private/generated artifact boundary

## Verification

Phase 5 RED evidence:

- the initial Docker `smoke:producer-assets` exited 1 with
  `Missing Phase 5 surface: src/remotion/producer-samples/asset-manifest.ts`
- after the contract existed, the same smoke exited 1 with
  `Producer primitives must not contain remote default assets`
- the Producer OS smoke exited 1 with
  `scripts/render-producer-review-frames.mjs must invoke Producer asset preflight`

Phase 5 GREEN evidence:

- focused asset, Producer OS, and validation smokes pass
- asset smoke uses real manual and mocked URL inputs, real SHA-256, real SVG
  metadata, tamper/missing/undersized/license/attribution/duplicate failures,
  and a real FFmpeg-normalized H.264/yuv420p/CFR/AAC fixture
- direct scaffold asset preflight passes
- an isolated Remotion fixture renders the three code fallbacks at frame 45;
  visual inspection confirms three visible panels with no blank or overlap
- full Docker-first and changed-file verification is recorded in the Phase 5
  plan execution record and final handoff

The Phase 6 version gate RED failed on the old `@remotion/cli` value
`4.0.467` instead of exact `4.0.489`. Fresh GREEN and Docker evidence is
recorded in
`docs/superpowers/plans/2026-07-16-remotion-version-gate-phase-6.md`.

Phase 6A RED failed because `@remotion/effects` was absent rather than exact
`4.0.489`. Fresh GREEN, render hashes, and Docker evidence are recorded in
`docs/superpowers/plans/2026-07-16-remotion-effects-text-layout-phase-6a.md`.

Repository-wide Docker lint retains the freshly confirmed historical baseline
of 39 errors and 2 warnings unless the final post-upgrade run proves otherwise.
Phase 6A does not claim unrelated lint cleanup.

VoxCPM provider docs, `.env.example`, Compose, Producer sample manifests, and
frozen compositions remain unchanged. Phase 6A adds only the isolated showcase
registration to Root.

## Current Commands

```bash
npm run producer:scaffold -- --name <CompositionName> --slug <slug>
npm run producer:assets -- --manifest <supply-plan-json>
npm run producer:preflight -- --composition <composition-id>
npm run producer:validate -- --module <validation-module>
npm run producer:stills -- --composition <composition-id>
npm run producer:render -- --composition <composition-id>
npm run smoke:remotion-version-gate
npm run smoke:remotion-capabilities
```

## Next Bounded Slice

The next bounded slice is Phase 6B transitions and remaining showcase coverage.
It has not started. Before it starts, `@remotion/transitions` must have a
supported exact-version resolution; do not lower the Roadmap target, vendor a
replacement, use overrides, or mix `4.0.477` into the verified `4.0.489`
closure merely to proceed.

## Frozen History

Existing finished compositions, historical generated-audio provider metadata,
ignored private voice/model files, and local generated artifacts remain
read-only or local-only. Prior delivery history remains under `docs/archive/`.
