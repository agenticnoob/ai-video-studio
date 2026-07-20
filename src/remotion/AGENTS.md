# REMOTION KNOWLEDGE BASE

## OVERVIEW

`src/remotion` is the deterministic Agent Producer rendering surface.
Supported new work is a dedicated composition; there is no shared Web project
preview/export composition or planner-selected template runtime.

## STRUCTURE

```txt
src/remotion/
|-- index.ts                  # Remotion entry
|-- Root.tsx                  # dedicated/frozen composition registry
|-- primitives/               # maintained visual primitives
|-- catalog/                  # Agent-facing primitive discovery
|-- effects/                  # Phase 6A Producer-owned effect presets
|-- styles/                   # measured text fitting and Phase 8 style profiles
|-- transitions/              # Phase 6B official presets and duration accounting
|-- media/                    # Phase 7 local Video, AnimatedImage, and Lottie blocks
|-- motion/                   # Phase 7 fixed motion-blur and trail treatments
|-- sound/                    # Phase 7 soundtrack, envelopes, library, and SFX mapping
|-- capability-showcase/      # complete isolated Agent Producer inventory composition
|-- standalone-video/         # Producer timing/audio/caption/canvas runtime
|-- producer-samples/         # future sample manifest, profiled scaffold, and blocks
|-- recipes/blocks/           # frozen composition compatibility only
|-- recipes/timing/           # direct dependency of frozen recipe blocks
|-- standalone-samples/       # frozen reference compositions
`-- <CompositionName>/        # purpose-built dedicated compositions
```
## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Composition registry | `Root.tsx` | Register dedicated compositions and Stills. |
| Visual primitives | `primitives/`, `catalog/` | Inventory before adding local components. |
| Producer runtime | `standalone-video/` | Future timing, captions, audio, canvas profiles. |
| Producer Sample OS | `producer-samples/` | Strict future manifests, mandatory style-profile scaffold selection, frozen-reference metadata, and blocks. |
| Existing asset contract | `producer-samples/asset-manifest.ts` | Local manifest type used by Phase 5 preflight. |
| Effect presets | `effects/` | `comic-print`, `cyber-scan`, `paper-grain`, and `pixel-grid`. |
| Text fitting | `styles/fit-text.ts` | Guarded CJK-aware width/height/line fitting. |
| Style profiles | `styles/profiles.ts`, `styles/profile-ids.ts` | Six validated Phase 8 production-language constraints. |
| Transition presets | `transitions/` | Four official Producer presets and overlap-aware duration accounting. |
| Dynamic media | `media/` | Local manifest-backed video, animated image, and Lottie rendering. |
| Motion treatments | `motion/` | Fixed camera, typography, icon, and particle blur/trail ids. |
| Sound design | `sound/` | Local role library, bed envelopes, ducking, soundtrack, and transition SFX. |
| Capability inventory | `capability-showcase/` | `AgentProducerCapabilityShowcase`; not a template. |
| Frozen recipe compatibility | `recipes/blocks/`, `recipes/timing/` | Do not extend for future work. |

## CONVENTIONS

- Load `.agents/skills/remotion-best-practices/SKILL.md` before render edits.
- Keep motion frame-driven with Remotion APIs.
- Use fixed composition bounds and deterministic local assets.
- Keep every maintained non-code asset manifest-backed and preflighted before stills.
- Keep the installed Remotion dependency closure exact at `4.0.489` and run
  `smoke:remotion-version-gate` and `smoke:remotion-capabilities` before using
  Phase 6 effects, text layout, transitions, or canvas-source capabilities.
- Run `smoke:producer-media-sound` and asset preflight before using Phase 7
  local dynamic media or sound-design surfaces.
- Run `smoke:producer-style-profile-sample-contract` and record a validated
  `styleProfileId` before implementing a new maintained composition.
- Keep `TcpHandshakeEditorial` and `TcpHandshakeTerminal` as the maintained
  real proofs for `editorial-tech` and `retro-terminal`; Phase 8 is complete.
- Every future scaffold owns a `quality.ts` module and runs `producer:quality`
  after render. Phase 9A deterministic quality gates are complete; Phase 9B
  final acceptance video and Roadmap closure are complete.
- Build topic data, narration, and scene order inside the dedicated
  composition.
- Apply content-first visual review: record subject, action or change, shot
  language, intended meaning, and distinct silhouette before scene code; make
  paused frames self-explanatory and keep adjacent primary compositions
  distinct unless comparison is intentional.
- Treat style profiles as constraints, not storyboards. Inspect every scene and
  meaning-changing early/middle/late state, review both cover ratios full-size
  and as thumbnails with centered safe whitespace, and benchmark a
  representative expensive scene before long renders.
- When narrated H.264/AAC mux duration exceeds narration frames, add an
  explicit visual end hold and include it in the final chapter; do not widen
  quality tolerance to mask the mismatch.
- Use `standalone-video/caption-types` for future Producer captions.
- Treat finished compositions and historical recipe helpers as read-only.

## ANTI-PATTERNS

- Do not restore `ProjectVideo`, `VideoProject`, `src/templates`, a
  planner/compiler, or RecipeShowcase.
- Do not use CSS animation, CSS transitions, or wall-clock timers.
- Do not add provider/LLM logic to render code.
- Do not fabricate source captures or generate scene imagery.

## VALIDATION

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx remotion compositions src/remotion/index.ts'
npm run smoke:remotion-version-gate
npm run smoke:remotion-capabilities
npm run smoke:producer-media-sound
npm run smoke:producer-style-profile-sample-contract
npm run smoke:producer-quality-gates
npm run producer:stills -- --composition <composition-id>
```
