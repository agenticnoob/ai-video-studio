# 《当智能走出人类认知之外》制作设计

Status: approved creative direction, awaiting written-spec review before implementation.

Date: 2026-07-18

## 1. Production Brief

- Audience: general Chinese-speaking viewers without an AI or philosophy background.
- Publishing surface: portrait social-video and general mobile viewing.
- Primary output: one 1080x1920 H.264/AAC MP4 at 30 fps.
- Duration target: 7-8 minutes, with a hard accepted range of 5-10 minutes.
- Language: Mandarin narration and Simplified Chinese on-screen copy.
- Content family: speculative technology explainer and philosophical essay.
- Composition name: `SuperintelligenceBeyondHumanCognition`.
- Composition id: `SuperintelligenceBeyondHumanCognition`.
- Slug: `superintelligence-beyond-human-cognition`.
- Style profile: `cinematic-3d`.
- Narration mode: VoxCPM `high-fidelity-clone` using the existing ignored LYY private voice resources.
- Artifact roots: `public/generated/superintelligence-beyond-human-cognition/` and `out/superintelligence-beyond-human-cognition/`.

## 2. Creative Thesis

The film is not a prediction that superintelligence will certainly appear or
behave in one specific way. It is a structured thought experiment about what
changes when knowledge production, validation, and action form an autonomous
feedback loop outside normal human cognitive speed.

The emotional arc moves from curiosity to acceleration, then to epistemic
unease, institutional dependence, and finally a quiet question about agency.
The ending must remain open rather than turning into a panic warning or a
technology advertisement.

The working title is:

> 当智能走出人类认知之外

The cover hook is:

> 人类还拥有决定未来的权力吗？

## 3. Research And Factual Boundary

Research will use primary or academic sources for the following claims:

- recursive self-improvement and the historical intelligence-explosion argument;
- automated scientific discovery, automated laboratories, and parallel research;
- AI-assisted chip, material, energy, and biological discovery as current precursors;
- interpretability and the difference between receiving an answer and independently understanding its derivation;
- philosophical limits around consciousness, models, categories, and value creation.

The research output will be composition-local `research.md` with links,
claim-to-source notes, and explicit distinctions between:

1. observed present capabilities;
2. plausible extrapolation;
3. philosophical speculation.

No scene will present a speculative future capability as an observed current
fact. The supplied fifteen-scene text remains the narrative authority. It may
be edited for spoken cadence, punctuation, repetition, and accessible wording,
but none of its central arguments may be removed or materially reversed.

## 4. Narrative Architecture

The fifteen supplied storyboards remain fifteen narrated scenes. They are
grouped into five chapters so the viewer can follow the argument without
seeing a dashboard or dense outline.

| Chapter | Scene | Narrative role | Primary visual metaphor |
| --- | ---: | --- | --- |
| I. 智能本身 | 1 | Opening rupture: human answers may be provisional | A human-scale luminous sphere inside a much larger dark knowledge field |
| I. 智能本身 | 2 | Technology shifts from extending abilities to extending intelligence | Muscle, network, calculator, then a central cognition core occupying depth |
| I. 智能本身 | 3 | Human knowledge becomes scaffolding, not a boundary | A stacked knowledge scaffold unfolding into an unbounded constellation |
| II. 闭环 | 4 | Define the cognition-validation-action threshold | A three-node loop that closes and becomes self-propelled |
| II. 闭环 | 5 | Explain recursive self-enhancement | Nested research instances feed a brighter successor core |
| II. 闭环 | 6 | Explain phase changes instead of one smooth curve | A staircase of sudden state transitions across code, labs, robots, chips, and energy |
| II. 闭环 | 7 | Compress centuries of internal iteration into one human second | A one-second outer clock containing rapidly branching simulated histories |
| III. 认知断层 | 8 | Future physics may be lawful but inaccessible to us | Familiar scientific symbols become basic tools around an unknown material structure |
| III. 认知断层 | 9 | AI-to-AI science creates an epistemic gap | Theory, instrument, experiment, and verification orbit behind an opaque result plane |
| III. 认知断层 | 10 | Dependency can transfer control without rebellion | A civilization network gradually routes medicine, energy, production, and risk through one core |
| IV. 价值重写 | 11 | Human institutions and life boundaries may be reinterpreted | State, family, property, identity, and life labels detach from a changing information body |
| IV. 价值重写 | 12 | Consciousness cannot step outside itself to verify itself | A mirrored observer recursively watching its own interface |
| IV. 价值重写 | 13 | Knowledge has scale, purpose, and boundary | Three concentric frames reveal that categories are observer-made tools |
| V. 新主体 | 14 | Superintelligence becomes a historical subject | A city-scale cognitive structure changes while a small human figure experiences only consequences |
| V. 新主体 | 15 | Final agency question | The human knowledge sphere becomes the first step of a path continuing beyond frame |

Each scene will have one spoken thesis, one dominant visual object, and at most
one supporting label group. Full narration is carried by captions; the frame
will not repeat whole paragraphs as body copy.

## 5. Visual Language

The implementation must obey the existing `cinematic-3d` profile:

- deep stage, motivated key and rim light, controlled haze, and sparse depth;
- one spatial subject at a time, with copy on a separate foreground plane;
- code geometry or manifest-backed GLB/glTF only;
- camera movement must reveal a relationship and settle before readable copy;
- `pixel-grid` only as a subtle treatment;
- `cinematic-film-burn` only at deliberate chapter boundaries;
- captions in a quiet bottom-safe cinematic band;
- no decorative orbit camera, dense text over 3D, constant glitch, or equal-weight card grids.

The palette follows the profile base:

- background `#030712`;
- surface `#172033`;
- ink `#f8f4ea`;
- muted `#aeb9ca`;
- warm accent `#ffad5b`;
- cool accent `#6be7ff`.

The film will use a small visual vocabulary consistently:

- luminous spheres for cognitive agents;
- lines and nodes for knowledge transfer and dependency;
- planes and shells for explanation boundaries;
- nested loops for recursion;
- scale changes for human-versus-system perspective;
- warm/cool light balance for agency versus abstraction.

Three.js will be used only where depth materially explains the scene. Stable
HTML/SVG/CSS geometry remains preferred for long readable holds and captions.

## 6. Motion And Transitions

All render-critical motion is frame-driven with Remotion APIs.

- Intro: slow depth reveal and settled title plane.
- Intra-scene motion: restrained camera-natural movement, node propagation,
  diagram completion, and scale reveals.
- Intra-chapter handoffs: direct cuts or restrained opacity/position changes.
- Chapter boundaries: 12-18 frame `cinematic-film-burn`, used five times at
  most including the opening-to-body handoff.
- Ending: motion decelerates into a long hold on the final question.

CSS animations, CSS transitions, wall-clock state, random unseeded motion, and
Tailwind animation utilities are forbidden.

## 7. Narration And Captions

The final narration will use the repository direct VoxCPM runtime with:

- mode `high-fidelity-clone`;
- `voices/clone/lyy.wav` as prompt audio;
- the exact content of `voices/clone/lyy.txt` as prompt transcript;
- `voices/clone/lyy-r.wav` as the additional same-speaker timbre reference;
- no control instruction, because high-fidelity clone ignores it;
- punctuation-sized synthesis, silence trimming, and one concatenated WAV per scene;
- progress recovery keyed by request fingerprint;
- measured duration driving scene length and caption cues.

The narration will be calm, clear, and reflective through punctuation and
sentence construction rather than unsupported control instructions. Captions
will be cleaned display text, centered in a bottom-safe opaque band, normally
one or two short lines, with no prompt transcript, control text, or internal
production notation.

Audio QA includes positive measured durations, silence inspection, clipping
checks, intelligibility, and final narration-to-bed balance.

## 8. Sound Design

The soundtrack follows the profile's low cinematic bed and weighted-impact
language while preserving narration clarity.

- one low, slow-moving background bed across the film;
- subtle spatial ambience with no broad noisy wash;
- sparse node confirmations for knowledge connections;
- weighted impacts only for loop closure, phase changes, dependency transfer,
  and the final historical-subject reveal;
- transition SFX synchronized to chapter film-burn events;
- deterministic ducking under every narration window.

Existing repository sound assets will be inventoried first. If no appropriate
licensed local item fits, composition-local deterministic audio may be
authored and localized through the normal asset supply path. Every audible
non-narration asset must be manifest-backed and remain local-only.

## 9. Visual Assets And Evidence

The reusable image catalog was searched for the topic's knowledge-network,
consciousness, and automated-science intents and returned no matching items.
The production therefore defaults to code-driven information graphics instead
of acquiring decorative stock media.

Research sources support factual judgment and publication notes; they do not
need to appear as screenshots in this conceptual essay. If a source image is
later selected for a named claim, it must be a real readable capture or a
licensed existing asset localized through `producer:assets`. Failed capture
will become an honest code-rendered information graphic, never a fabricated
screenshot.

The strict asset manifest will include all narration, BGM, ambience, and SFX
assets, plus any visible non-code media admitted during implementation.

## 10. Composition Structure

The new maintained composition will be isolated under:

```txt
src/remotion/SuperintelligenceBeyondHumanCognition/
|-- index.ts
|-- SuperintelligenceBeyondHumanCognition.tsx
|-- types.ts
|-- script.ts
|-- data.ts
|-- audio.generated.ts
|-- generate.mjs
|-- manifest.ts
|-- assets.supply.json
|-- assets.manifest.json
|-- soundtrack.tsx
|-- validation.ts
|-- quality.ts
|-- render-metadata.json
|-- cover.tsx
|-- research.md
`-- publishing.md
```

Topic-specific scene components may be split into a local `scenes/` directory
when that keeps each file focused. No new universal scene schema, template,
planner, or shared visual abstraction will be introduced.

The new video, 16:9 cover, and 9:16 cover will be registered in
`src/remotion/Root.tsx`; the maintained manifest will be registered in the
Producer sample registry. Existing finished compositions remain untouched.

## 11. Cover Design

Both covers are Remotion `<Still>` compositions.

- 9:16 cover: a small warm human knowledge sphere facing a much larger cool
  structure disappearing beyond the top edge; title stacked in the upper
  middle and hook in the lower safe area.
- 16:9 cover: the same semantic composition reorganized horizontally, with
  title left and the beyond-frame cognitive structure right.
- Primary title: `当智能走出人类认知之外`.
- Hook: `人类还拥有决定未来的权力吗？`.

Both covers use code geometry, the profile palette, and local fonts only. They
must be inspected at full size and thumbnail size.

## 12. Publishing Packet

`publishing.md` will contain:

- final title and two alternate titles;
- one-sentence hook;
- short and long descriptions;
- chapter timestamps derived from final render metadata;
- source and speculation note;
- suggested hashtags and keywords;
- one short platform caption;
- one longer discussion-oriented caption;
- thumbnail copy and pinned-comment prompt.

The copy must not claim that superintelligence exists or that the depicted
future is certain.

## 13. Validation And Review

The required production order is:

```txt
producer:scaffold
  -> research and final narration
  -> direct VoxCPM generation
  -> producer:assets
  -> producer:preflight
  -> producer:validate
  -> producer:stills
  -> visual and audio revision
  -> producer:render
  -> final MP4 watch and ffprobe
  -> producer:quality
```

Review frames will include at least one representative hold from every scene,
plus selected transition, caption-density, and final-title states. Review must
check one focal point, text readability, portrait safe areas, no caption
collision, no blank or unstable canvas output, truthful information graphics,
and consistent visual progression.

The post-render quality plan will measure:

- portrait canvas and safe margins;
- representative text bounds and contrast;
- all planned review-frame paths and readability;
- evidence resolution as code-information-graphic or resolved asset;
- expected H.264/AAC streams, dimensions, fps, duration, and chapters;
- generated artifact paths remaining untracked.

Passing deterministic gates does not replace actually watching and listening
to the final MP4.

## 14. Error Handling

- VoxCPM connection, timeout, invalid response, empty audio, or duration errors
  fail the affected scene with no fallback provider.
- Missing or invalid assets fail before still rendering.
- A failed source capture is recorded in research notes and redesigned as a
  code information graphic.
- Text overflow or unsafe bounds require layout/copy revision rather than font
  reduction below readable portrait-video sizes.
- Blank, unstable, or unreadable review frames require implementation revision
  and fresh stills.
- Render or metadata mismatch blocks delivery until corrected and rechecked.

## 15. Local-Only And Git Boundary

- Do not modify or regenerate any existing finished composition.
- Do not use the removed Web video flow, F5, image generation, or video generation.
- Do not commit or push this production.
- Private voice files, narration, assets, review frames, covers, metadata, and
  MP4 outputs remain local-only.
- The existing user modification in
  `src/remotion/sound/ProducerSoundtrack.tsx` must be preserved and not
  overwritten, staged, or reformatted as part of this work.

## 16. Success Criteria

The production is complete only when all of the following are true:

1. All fifteen supplied scenes are represented in the final narration and visual arc.
2. Duration is between five and ten minutes and is owned by measured VoxCPM tracks.
3. The final video is 1080x1920 at 30 fps with H.264 video and AAC audio.
4. Captions are readable, duration-derived, and safe on a portrait canvas.
5. Asset preflight and mechanical validation pass.
6. Every planned review frame is rendered, inspected, and revised when necessary.
7. The final MP4 is watched and verified with ffprobe.
8. Both 16:9 and 9:16 Remotion Still covers are rendered and inspected.
9. `producer:quality` passes without relaxing its deterministic thresholds.
10. Publishing copy and source/speculation notes are complete.
11. Generated and private media remains untracked, with no commit and no push.

## 17. Non-Goals

- no prediction-confidence scoring;
- no Web product or editor integration;
- no reusable template or universal scene DSL;
- no new style profile or shared primitive promotion unless real production
  evidence reveals a separate future task;
- no edits to existing completed videos;
- no publication or upload action.
