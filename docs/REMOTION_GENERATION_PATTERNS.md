# Remotion Generation Patterns

Status: active reference for Remotion generation workflow and external-skill
intake.

This document records what `ai-video-studio` should learn from
`wshuyi/remotion-video-skill` without changing the current Visual IR compiler
architecture.

Reviewed source:
- Repository: `https://github.com/wshuyi/remotion-video-skill/tree/main`
- Skill entrypoint: `SKILL.md`
- TTS scripts: `scripts/generate_audio_minimax.py`,
  `scripts/generate_audio_edge.py`
- Timing template: `templates/audioConfig.ts`

## Positioning

`wshuyi/remotion-video-skill` is a Claude Code Skill for creating standalone
programmatic Remotion videos. Its value for this repo is process knowledge:
scene-based video authoring, TTS-driven timing, resumable audio generation,
and Remotion rendering guardrails.

It is not a product architecture to import directly. This repo already has a
higher-level product pipeline:

```txt
brief
  -> StoryboardPlan
  -> segment narration synthesis
  -> audio + aligned captions
  -> visual implementation compile
  -> VideoProject
  -> preview / edit / export
```

Use the external skill as a pattern source, not as a dependency or scaffold.

## What To Adopt

### Skillized Generation Rules

The external repo treats video creation as an agent skill with explicit
trigger phrases, setup rules, TTS choices, scene structure, and rendering
constraints.

Adopt that shape locally by keeping repo-specific Remotion guidance in
`.agents/skills/remotion-best-practices/SKILL.md` and linking it to this
document. Local guidance should emphasize this repo's actual boundaries:

- no unrestricted generated TSX as the normal path
- no package installation from generated content
- no dynamic imports or arbitrary filesystem/network access in generated
  visual payloads
- compile bounded schema-valid data into existing Remotion renderers
- keep `VideoProject` as the preview/edit/export boundary

### Audio-First Timing

The external scripts generate TTS audio, measure duration with `ffprobe`, and
write frame counts back into Remotion-facing timing data. That reinforces this
repo's current direction: real narration duration should drive visual
implementation compilation.

Local mapping:

- keep generated audio in `VideoSegment.narration.audio`
- keep captions in `VideoSegment.narration.captions`
- keep audio and captions outside template-specific `implementation`
- pass real duration into the selected visual compiler
- keep preview/export flattening shared through `VideoProject`

Do not copy the external `audioConfig.ts` source-of-truth pattern. In this
repo, timing belongs to validated project/segment data, not to a generated
single-project config file.

### Resumable Provider Work

The MiniMax script's practical strengths are operational: skip existing audio,
show progress, preserve completed work on failure, and resume later.

Local mapping:

- keep process-local progress nodes visible for generation and export
- keep artifact identity deterministic enough that failed work can be inspected
- prefer bounded reruns for one selected segment over full-project redo
- keep provider failures diagnosable without leaking internal errors into
  audience-facing video copy

This should strengthen the existing staged generation and selected-segment
regeneration UX, not introduce a new side-channel script as the main path.

### Scene-Based Explanation Grammar

The external skill is optimized for tutorial, data visualization, music
visualization, and 3D/programmatic videos. The useful pattern is not the
specific starter scene tree; it is the grammar:

- one concept per scene or shot
- progressive reveal instead of static cards
- semantic color and emphasis
- narration-aligned beats
- visual state changes tied to frame time
- explicit scene names and local responsibilities

Local mapping:

- promote recurring explanation patterns into `scene-graph` primitives or
  bounded procedural generators
- keep generated plans schema-valid and caption-safe
- treat educational/tutorial patterns as Visual IR vocabulary, not as a pile
  of new full-segment templates

Potential future bounded generators:

- `step-by-step-explainer`
- `calculation-flow`
- `semantic-highlight`
- `concept-build-up`
- `code-diff`
- `timeline-sequence`

Each candidate should follow the existing procedural generator rule: schema
first, deterministic compile-to-SceneGraph second, provider surface last.

### Remotion Render Guardrails

The external skill reinforces baseline Remotion rules that remain mandatory
here:

- render-critical motion must be frame-driven with Remotion APIs
- CSS animations and CSS transitions are not render-critical timing sources
- media duration must be measured, not guessed
- complex visual effects should still be deterministic during export
- 3D/WebGL work needs explicit render and resource boundaries before it becomes
  provider-selectable

If future `media_asset_composite`, 3D, or WebGL visuals are added, they should
enter through bounded runtime components and fixture coverage before appearing
in provider prompts.

## What Not To Adopt

- Do not replace the current in-project F5-TTS provider boundary with Edge TTS
  as the product default.
- Do not write generated project state into `src/audioConfig.ts`.
- Do not treat a standalone Remotion project structure as this repo's runtime
  architecture.
- Do not register every tutorial scene, text effect, or visual treatment as a
  `templateId`.
- Do not allow provider output to install packages, write scripts, or generate
  unrestricted React/Remotion source.
- Do not expose provider-facing choices before the deterministic compiler and
  fallback behavior exist.

## Intake Checklist

When a future external Remotion skill, example, or component library looks
useful:

1. Identify its layer: workflow rule, primitive, block pattern, procedural
   generator, media composite, or full segment template.
2. Map it onto the Visual IR roadmap vocabulary before writing code.
3. Prefer primitive or procedural-generator intake over new full templates.
4. Keep narration/audio/captions outside visual `implementation`.
5. Add deterministic fixtures before exposing the idea to provider prompts.
6. Document the source link and the local interpretation.

This keeps external Remotion inspiration useful without weakening the
compiler-first product model.
