# Iteration Status

Last updated: 2026-07-21

## Current Authority

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

`.agents/skills/ai-video-studio-asset-library/` is the separate reusable-asset
admission and maintenance entrypoint.

Visual production uses code and existing assets only.

The implementation sequence is defined by
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

## Status Boundary

Iteration status tracks supported product capabilities and milestones. An
individual video production and its render, cover, audiovisual review, or
quality state do not create, block, or reopen an iteration unless an approved
milestone explicitly names that composition as acceptance evidence.

For ordinary production delivery status, use the composition-local manifest,
validation and quality modules, research and publishing notes, plus ignored
local artifacts. Do not infer the current iteration from an unfinished or
finished production output.

## Current Milestone

Phase 6 version gate is complete.

Phase 6A effects and text-layout foundation is complete.

Phase 6B transitions and remaining showcase coverage is complete.

Phase 6 Remotion capability core is complete.

Phase 7 dynamic existing media and sound design is complete.

Phase 8A style-profile contract and showcase is complete.

Phase 8B style-profile sample contract is complete.

Phase 8B real-composition proof is complete.

Phase 8 is complete.

Phase 9A deterministic quality gates are complete.

Phase 9B final acceptance video and final Roadmap closure are complete.

Phase 9 and the Agent Producer-only Roadmap are complete.

### Post-Roadmap: Chinese Science-Explainer VoxCPM Voice (2026-07-19)

Qualified the selected `science-explainer-young-male` private reference as the
future Chinese science-explainer default without starting a new Roadmap phase
or changing non-science narration. Three real direct VoxCPM
`controllable-clone` tracks use the same ignored
`voices/clone/science-explainer-young-male.wav` reference and the approved
calm, energetic, and curious delivery controls.

All three proof WAVs are decodable mono 48 kHz `pcm_s16le`, run 7.412104,
6.976500, and 9.307208 seconds, have audible finite signal with -0.1 dBFS
peaks, and keep leading/trailing silence below 250 ms. Proof WAVs,
`summary.json`, and `index.md` remain ignored under
`public/generated/science-explainer-voice-proof/audio/`; the private WAV and
exact transcript remain ignored under `voices/clone/`.

For future Chinese science-explainer narration, the normal science mode is
`controllable-clone` with
`voices/clone/science-explainer-young-male.wav` and compact per-beat delivery
controls. Highest-fidelity work may use `high-fidelity-clone` with the same WAV
and exact same-name transcript at
`voices/clone/science-explainer-young-male.txt` and no control. An explicit
production brief may override the science-only default; non-science content
retains the existing default clone configuration. Missing private files must
fail closed and must not silently fall back to `lyy`, F5, or another provider.
Mechanical qualification does not approve speaker identity, timbre
consistency, or expressive quality.

User audition status: accepted on 2026-07-19. The user confirmed the overall
voice effect is strong, completing the subjective timbre/expression gate and
making `science-explainer-young-male` fully qualified for future Chinese
science-explainer narration.

### Post-Roadmap: Producer Voice Profile Registry v1 (2026-07-21)

The bounded VoxCPM-only voice profile registry is complete at
`scripts/lib/producer-audio/voice-profiles.json`. Registry v1 contains exactly
`lyy` and `science-explainer-young-male`. Future scaffolds require
`--voice-profile <voice-profile-id>` and record the resolved profile/mode in
both the manifest and generator. Agent judgment applies the science default;
an explicit production brief may select registered `lyy` for non-science
content. Unknown ids, unsupported profile/mode pairs, invalid paths, and
missing private files fail closed with no fallback.

This is future-only: existing completed/frozen source and generated artifacts
remain unchanged. VoxCPM remains the only provider, no environment/config
provider selector is introduced, Phase 9 and the Roadmap remain complete, and
no Phase 10 starts.

### Post-Roadmap: Content-First Creative Review Hardening (2026-07-21)

The `AiDaily20260720` production exposed repeated scene grammar, style
literalism that obscured meaning, insufficient motion-state still coverage, a
title-card cover, premature long rendering, JSON compiler/metadata drift, and
an AAC/container tail that exceeded the one-frame duration tolerance.
The Agent Producer skill now requires content-first visual review: every beat
records subject, action or change, shot language, intended meaning, and a
distinct silhouette; paused frames must communicate the event; adjacent scenes
remain visually distinct unless comparison is intentional; and style profiles
remain constraints rather than storyboards.

All scenes plus meaning-changing early/middle/late states are reviewed before a
long render. Covers use a topic-specific focal metaphor, centered safe
whitespace, and full-size/thumbnail inspection in both ratios. Long portrait
work benchmarks a representative expensive scene and confirms export ownership
before full rendering. JSON-importing TypeScript CLI wrappers now compile with
`--resolveJsonModule`. Narrated muxes use an explicit visual end hold included
in the last chapter rather than a wider tolerance. This is workflow hardening
backed by one real production, not Phase 10, a new planner, or a change to
completed/frozen compositions.

The approved Agent-managed reusable asset library is complete as one bounded
post-Roadmap v1 capability. Agent-only CLI operations manage standalone
SVG/PNG/JPEG/WebP records, deterministic catalog/report views, ignored inbox
ingestion, deprecated lifecycle, atomic rollback, local search, and
forward-only Producer manifest cross-validation. It does not create another
Roadmap phase.

The v1 inbox workflow now accepts mixed nested asset batches and multiple
free-form description documents at the Agent layer. The Agent resolves
many-to-many description mappings, visually completes missing semantics, and
uses one atomic ingest per accepted item. User-supplied inbox assets inherit the
approved project authorization/no-attribution record, so source and license
questions are not part of semantic intake. This remains the same post-Roadmap
v1 capability rather than a new phase or v2 slice. Its dedicated
`ai-video-studio-asset-library` skill owns management; Agent Producer retains
only search, selection, manifest snapshotting, and preflight consumption.

### Post-Roadmap: stock-assets-mcp (2026-07-20)

The independently installable `packages/stock-assets-mcp/` package is complete
as one bounded post-Roadmap local Pexels-only stdio capability. Agent Producer
classifies named beats as asset-led, code-led, or hybrid, searches the reviewed
library first, and invokes the MCP only for unmatched asset-led or hybrid work.
The selected candidate remains ignored under `.producer-assets/stock-candidates/`;
its `acquisition.json` receipt maps into the existing `producer:assets` flow and
the current video renders only the localized composition copy.

Later reusable-library review remains explicit and owned by the Asset Library
skill. The capability starts no Phase 10, changes no production entrypoint, and
adds no HTTP, OAuth, UI, Unsplash, Pixabay, stock video, automatic promotion, or
automatic deletion. Completed and frozen compositions remain unchanged.

Phase 0 authority reset, Phase 1 direct VoxCPM runtime, Phase 2 F5 removal,
Phase 3 Web product removal, and Phase 4 Producer OS consolidation remain
complete. Phase 5 existing asset supply, Phase 6 capability core, and Phase 7
dynamic media/sound also remain complete. Phase 8 is complete after its
contract/showcase, sample-contract, and two-real-composition proof slices.
Phase 9A is complete after its future-only quality contract, real
FFmpeg/ffprobe/Git evidence collector, and post-render CLI. Phase 9B is
complete after its final acceptance composition, real artifact proof,
forbidden scan, and active-document closure.

## Implemented Phase 9B Boundary

- added `DnsResolutionExplainer` as one future-contract maintained composition
  with explicit `hand-drawn-explainer`, a strict quality module, Root/registry
  registration, publishing copy, and 16:9/9:16 Remotion `<Still>` covers
- generated three real direct high-fidelity VoxCPM tracks at 218, 258, and 261
  frames; narration, progress, summary, and private reference files remain
  ignored and no provider fallback was introduced
- localized nine strict assets: three narration tracks, BGM, ambience, three
  intentional SFX cues, and one repo-authored DNS SVG; asset preflight and
  composition validation pass
- used deterministic code paper/SVG treatment and the official
  `directional-slide`; a headless `<Solid>` canvas artifact was isolated during
  review and replaced with stable code gradients before acceptance
- visually reviewed three representative frames and both code-rendered covers;
  the 739-frame 1920x1080 render contains H.264 video, AAC audio, and matching
  three-chapter metadata
- passed `producer:quality` without relaxing Phase 9A thresholds; a two-frame
  silent visual hold makes video duration own the mux contract while preserving
  the exact duration-derived narration/caption tracks
- completed the Phase 9B forbidden scan and aligned active docs, skills,
  package commands, provider evidence, and removal inventory; environment and
  Docker topology required no change
- preserved every completed/frozen composition and kept `public/generated/`,
  `out/`, private voices, audio, stills, covers, metadata, and MP4 untracked

## Implemented Phase 9A Boundary

- added one pure deterministic gate for measured text overflow/contrast,
  visible safe margins, evidence resolution, planned-vs-rendered frames,
  near-blank/low-contrast luma, H.264/AAC metadata/chapter agreement, and Git-
  tracked generated artifacts
- added `producer:quality -- --module <quality-module>` with fresh FFmpeg PNG,
  ffprobe MP4, final metadata, and `git ls-files` evidence collection
- made every future scaffold own a strict quality module while all three
  completed maintained proofs and every frozen composition remain unchanged
- retained asset preflight and Producer validation as the owners of remote,
  missing, codec, provenance/license, audio, caption-control, and Root failures
- kept aesthetic and audio/visual approval with the Agent; the gate rejects
  deterministic failures only
- added `smoke:producer-quality-gates`; its real synthetic binaries live only
  under `/tmp` and no generated media is committed

## Implemented Phase 8B Real-Composition Proof

- added `TcpHandshakeEditorial` and `TcpHandshakeTerminal` as maintained,
  dedicated compositions using `editorial-tech` and `retro-terminal`
- kept their three Chinese narration/display beats identical while changing
  composition, motion, texture, SVG media treatment, captions, BGM, ambience,
  transition SFX, and cover language through the selected profiles
- generated six real direct VoxCPM narration tracks with no provider fallback;
  localized seven audio assets plus one SVG per composition through strict
  asset manifests and preflight
- registered both videos and four code-rendered cover Stills without modifying
  the completed Phase 7 proof or any frozen composition
- reviewed six stable representative frames and four covers; same-frame A/B
  SHA-256 checks were deterministic
- rendered 658-frame and 646-frame 1920x1080 H.264/AAC MP4s; full decode and
  ffprobe passed at 30 fps with mean audio levels of -22.2 dB and -23.0 dB
- generated narration, localized assets, screenshots, covers, MP4s, and private
  voice inputs remain ignored and uncommitted

## Implemented Phase 8B Sample Contract Boundary

- extracted the six canonical profile ids into a lightweight module shared by
  the Phase 8A registry and Producer sample contract
- added a strict `ProfiledMaintainedProducerSampleManifest` for new samples
  while retaining compatibility for the unchanged Phase 7 maintained proof
- made `producer:scaffold` require `--style-profile <profile-id>` with no CLI
  default and exact rejection of unsupported ids
- tokenized the selected id into every generated future manifest and extended
  Producer OS, manifest, validation, architecture, and skill guards
- added `smoke:producer-style-profile-sample-contract` as the focused contract
  gate; no real composition, registry record, Root registration, narration,
  asset, cover, MP4, provider/config, or generated artifact was added

## Implemented Phase 8A Boundary

- added `getProducerStyleProfile()` plus strict runtime validation for
  `editorial-tech`, `comic-anime`, `cinematic-3d`, `retro-terminal`,
  `documentary-media`, and `hand-drawn-explainer`
- each profile defines palette/typography, material/background rules, a unique
  layout grammar, approved primitives/blocks, effects/intensity, transitions,
  motion policy, media mix, Three.js policy, captions, BGM/SFX strategy, and
  forbidden defaults
- extended `AgentProducerCapabilityShowcase` from 610 to 1150 frames with six
  90-frame code-only fixtures that apply the same message through visibly
  different composition, motion, texture, and media languages
- the `cinematic-3d` fixture uses new isolated code geometry, explicit lights,
  and frame-derived motion through `ThreeCanvas`; no finished composition code
  was reused or modified
- profile selection remains Agent Producer judgment and returns constraints,
  not a template, planner schema, scene DSL, or automatic composition builder
- Phase 8A adds no real sample, narration, local asset, registry record, cover,
  MP4, provider/config change, or committed generated artifact; Phase 8B owns
  the two-real-composition acceptance proof

## Implemented Phase 7 Boundary

- installed exact `@remotion/gif`, `@remotion/media`, `@remotion/lottie`, and
  `@remotion/motion-blur` `4.0.489` plus exact `lottie-web@5.13.0`; Rive remains
  unadmitted without an approved local `.riv` asset and real proof
- added local Video, animated-image, and Lottie blocks plus fixed
  CameraMotionBlur and Trail treatments; GIF uses `@remotion/gif` so LAN HTTP
  Studio does not require WebCodecs `ImageDecoder`, while APNG/AVIF/WebP retain
  `AnimatedImage`; local Video retains Remotion's native-video fallback when
  LAN HTTP Studio lacks WebCodecs `VideoDecoder`; all paths fail closed on
  remote/absolute/traversal input
- added manifest-backed narration/BGM/ambience/SFX roles, deterministic bed
  fades and narration ducking, transition-SFX mappings, and local Audio rendering
- extended asset supply/preflight with sound policy, FFmpeg peak and long-silence
  checks, and Lottie expression metadata
- added `AgentProducerMediaSoundProof` source, fixture generation, one maintained
  registry entry, video registration, and two code-only cover Stills
- generated fixture media and cover review artifacts stay ignored; existing
  finished compositions and every frozen registry record remain unchanged
- generated three real direct VoxCPM narration WAV files; the service's normal
  idle-unloaded `503/loading` state was handled by calling narration directly,
  which reloaded the model automatically without a provider fallback
- localized 11 manifest assets and passed checksum, provenance/license,
  media/Lottie metadata, peak, long-silence, and maintained-sample preflight
- reviewed three representative frames and both covers, proved identical
  Lottie-frame SHA-256 across duplicate renders, and rendered a 19.050667-second
  1920x1080 30fps H.264 video with 48kHz stereo AAC audio

## Implemented Phase 6B Boundary

- installed exact `@remotion/transitions@4.0.489` and
  `@remotion/light-leaks@4.0.489` without overrides or a mixed Remotion closure
- added `editorial-fade`, `directional-slide`, `signal-wipe`, and
  `cinematic-film-burn` Producer transition presets using official
  presentations and `linearTiming()`
- added guarded overlap-aware total-duration accounting based on each official
  timing object's `getDurationInFrames()` result
- expanded `AgentProducerCapabilityShowcase` to 610 frames with a 145-frame
  transition sequence, separate light-leak overlay and film-burn proof, and
  HTML/SVG/image/video canvas-effect coverage
- enabled HTML-in-canvas explicitly, added source-preserving media effect
  presets, and bound every interactive canvas source to its 120-frame page
- added an FFmpeg-only ignored local video fixture; no generated media entered
  source control and no Phase 7 reusable media block was introduced
- preserved providers, environment/Compose configuration, Producer manifests,
  and every frozen composition unchanged

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
  media proof, dynamic media, sound design, style profiles, or frozen migration;
  those statements describe the completed Phase 6A slice only

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
- recorded the original stale-mirror blocker; the Phase 6B activation rerun
  later verified exact `@remotion/transitions@4.0.489` and its aligned
  dependencies through synchronized registry/package metadata

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

Phase 9B RED evidence:

- the first Docker `smoke:producer-final-acceptance` exited on the missing
  `src/remotion/DnsResolutionExplainer/manifest.ts`
- the same focused smoke later advanced to the still-open removal inventory and
  active-document status, proving implementation and closure are both required
- asset preflight rejected the initial under-threshold ambience as 40 seconds
  of silence; the fixture source level was corrected and the same gate passed
- visual review exposed non-deterministic black regions from a Remotion
  `<Solid>` canvas; isolated renders ruled out SVG clipping and transition
  timing before the unstable canvas path was removed
- the first real `producer:quality` rejected AAC mux padding against the exact
  737-frame contract; a two-frame silent visual hold made the 739-frame video
  stream own the container duration without loosening the gate

Phase 9B GREEN evidence:

- direct VoxCPM generation, nine-asset localization, asset preflight, Producer
  validation, three review stills, two covers, MP4/metadata rendering, and
  `producer:quality` pass through the final supported path
- ffprobe reports 739 H.264 frames at 1920x1080/30 fps, AAC audio, and a
  24.633333-second container; final metadata records 739 frames and three
  matching chapter starts
- all three final review frames and both covers were inspected with no blank
  region, overlap, unsafe caption placement, or cropped portrait evidence

Phase 9A RED evidence:

- the first Docker `smoke:producer-quality-gates` exited on
  `Missing Phase 9A quality surface: scripts/lib/producer-quality-gates.ts`
- later sub-REDs exposed the missing scaffold contract, Node Buffer typing,
  and repository-external `/tmp` Git path handling before the same command
  reached GREEN

Phase 9A GREEN evidence:

- the focused Docker smoke compiles the quality runtime, creates a real
  high-contrast and blank PNG plus a one-second H.264/AAC MP4 under `/tmp`,
  runs real FFmpeg/ffprobe/Git analysis, and executes `producer:quality`
- the same gate accepts the good fixture and rejects blank/missing frames,
  overflow, low text contrast, unsafe bounds, unresolved evidence, codec/
  metadata mismatch, chapter mismatch, and tracked artifact input
- Producer OS, sample-manifest/promotion, and validation smokes pass while all
  completed maintained manifests remain without Phase 9 retrofit

Phase 8A RED evidence:

- the first Docker `smoke:producer-style-profiles` exited 1 with
  `Missing Phase 8A surface: src/remotion/styles/profiles.ts`
- after the registry existed, the same guard advanced to the missing
  `StyleProfileShowcase` and then the missing inventory-status boundary before
  becoming GREEN

Phase 8A GREEN evidence:

- the focused style-profile smoke passes both static and compiled-runtime
  stages; it proves six exact ids, unique layout grammars and sound signatures,
  at least four effect/transition/motion combinations, strict unknown-id
  failure, forbidden-source boundaries, and the exact 1150-frame duration
- duplicate Docker renders at frames 655, 745, 835, 925, 1015, and 1105 have
  identical SHA-256 pairs respectively: `25595f6c...d2972`,
  `c9100e9a...fa29`, `259e2b2a...cb20`, `916ecd1b...a12f3`,
  `3cb91445...61f4`, and `85a08be3...4410`
- visual review found and fixed one tight-wrap collision in the initial
  `cinematic-3d` headline; the final six frames have one clear focal point,
  readable safe-area copy, no overlap or blank source, visible 3D geometry,
  and composition differences that do not depend on profile labels
- the fresh ten-command focused Docker suite passes. Docker typecheck, build,
  and composition listing pass with `AgentProducerCapabilityShowcase` at 1150
  frames; changed-file ESLint and Prettier are clean
- repository-wide Docker lint remains the historical 39-error/2-warning
  baseline, with no Phase 8A file in the failure set
- all review PNGs remain ignored under `out/phase8a-style-profiles/`; frozen
  compositions, sample manifests/registry, package dependencies, provider,
  asset contract, environment, Compose, and generated/private artifacts remain
  unchanged

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

Phase 6B RED first failed because `@remotion/transitions` was absent rather
than exact `4.0.489`; after activation, the expanded guard failed on the missing
`cinematic-film-burn` contract and later on the incomplete inventory status.
GREEN proves exact dependencies, four transition presets, executable duration
arithmetic, a 610-frame registered composition, and deterministic duplicate
stills for transition, light-leak, film-burn, and four-source canvas frames.
Full evidence is recorded in
`docs/superpowers/plans/2026-07-16-remotion-transitions-showcase-phase-6b.md`.

Repository-wide Docker lint is not currently clean. A fresh 2026-07-20 run
reports 170 errors and 0 warnings across ignored/generated stock-package
output, ignored local proof files, historical one-off tools, and pre-existing
composition source. Focused alignment smokes, changed-file lint, typecheck,
build, and composition listing remain the scoped gates; this status does not
claim unrelated lint cleanup.

VoxCPM provider docs now record the 10-minute idle unload and request-triggered
reload contract. `.env.example` and Compose remain unchanged. Every frozen
composition remains unchanged.

## Current Commands

```bash
npm run producer:scaffold -- --name <CompositionName> --slug <slug> --style-profile <profile-id> --voice-profile <voice-profile-id>
```

### Post-Roadmap: AiDaily20260721 (2026-07-21)

`AiDaily20260721` is a composition-local maintained 12-scene 9:16 portrait AI
daily news briefing. It uses the `hand-drawn-explainer` style profile and
`science-explainer-young-male` in `high-fidelity-clone` mode. 12 real VoxCPM
narration tracks were generated for a total of 14613 frames (487.1 seconds).
All scenes use code-led hand-drawn information graphics. Seven representative
review frames, two legacy-ratio 16:9/9:16 covers, and a 1080x1920 H.264/AAC
local render exist. The composition has not passed its declared all-scene
review plan or post-render `producer:quality`, so this is not a final delivery
or a new iteration milestone.

### Post-Roadmap: AiDaily20260722 (2026-07-22)

`AiDaily20260722` is a registered composition-local 12-scene 9:16 portrait AI
daily news briefing using `editorial-tech`. Its 12 real VoxCPM narration tracks
use `science-explainer-young-male` in `controllable-clone` mode. A 1080x1920
H.264/AAC local render, five representative scene stills, and both legacy
16:9/9:16 plus current 4:3/3:4 cover outputs exist. The source does not yet own
the strict maintained Producer manifest, asset manifest, validation module,
publishing copy, or executable `ProducerQualityPlan`; it therefore remains an
incomplete composition-local production rather than a maintained sample or
final delivery.

Composition-local generated narration, stills, covers, metadata, and MP4s stay
ignored and uncommitted:

- `src/remotion/AiDaily20260721/` - full composition source
- `src/remotion/AiDaily20260722/` - current composition source
- `src/remotion/Root.tsx` - composition registration
- `public/generated/ai-daily-2026-07-21/audio/` and
  `public/generated/ai-daily-2026-07-22/audio/` - local VoxCPM WAV tracks
- `out/ai-daily-2026-07-21/` and `out/ai-daily-2026-07-22/` - local review and
  render artifacts

```bash
npm run producer:assets -- --manifest <supply-plan-json>
npm run producer:preflight -- --composition <composition-id>
npm run producer:validate -- --module <validation-module>
npm run producer:stills -- --composition <composition-id>
npm run producer:render -- --composition <composition-id>
npm run smoke:remotion-version-gate
npm run smoke:remotion-capabilities
npm run smoke:producer-media-sound
npm run smoke:producer-style-profile-sample-contract
npm run smoke:producer-style-profile-real-compositions
npm run smoke:producer-quality-gates
npm run smoke:producer-final-acceptance
npm run smoke:stock-assets-mcp-alignment
npm run producer:quality -- --module <quality-module>
npm run producer:library:add -- --file <path> --metadata <asset-json>
npm run producer:library:ingest -- --file .producer-assets/library-inbox/<file> --metadata <asset-json>
npm run producer:library:validate
npm run producer:library:list -- --json
npm run producer:library:search -- --text <scene-intent> --json
npm run producer:library:update -- --id <asset-id> --metadata <patch-json>
npm run producer:library:deprecate -- --id <asset-id> --reason <reason>
npm run producer:library:build -- --check
npm run producer:media-sound-fixtures
```

## Next Bounded Phase

The Roadmap is complete through Phase 9B. There is no next Roadmap phase, and
no additional phase has started.

## Frozen History

Existing finished compositions, historical generated-audio provider metadata,
ignored private voice/model files, and local generated artifacts remain
read-only or local-only. Prior delivery history remains under `docs/archive/`.
