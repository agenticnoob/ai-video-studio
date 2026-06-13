# Scene Graph Video Language Plan

Status: active product direction. The first registered `scene-graph` MVP and
the deterministic Scene Graph Visual IR v1 quality slice are implemented. The
full phased architecture roadmap lives in
`docs/VISUAL_IR_COMPILER_ROADMAP.md`.

This document captures the recommended direction after the current registered
template system exposed a creative ceiling: the active pipeline can produce
valid segment structures, narration, captions, preview, and export, but the
current fixed templates still tend to look like animated information cards.

The goal of this plan is to improve visual language, continuity, and creative
range without letting the LLM write unrestricted Remotion code.

## 1. Problem Statement

The current model is useful for a stable MVP:

```txt
brief
  -> StoryboardPlan
  -> per-segment narration synthesis
  -> audio + captions
  -> render strategy / visual implementation compilation
  -> assembled VideoProject
```

The weak point is the visual implementation layer.

Current registered templates such as `scripted`, `spotlight`, and
`stats-dashboard` are stable macro/preset paths. The `scene-graph` template is
now the first bounded Visual IR compiler path: deterministic fixtures can
render full-bleed opener, node graph/path/code/terminal process, and final
lockup treatments instead of only text-filled cards or dashboard panels.

The product needs stronger shot language:

- richer openers, reveals, transitions, and closings
- recurring visual motifs across the whole video
- motion rhythm that changes between hook, explanation, proof, and close
- media-bearing layouts that can carry screenshots, images, video, and product
  visuals
- shared caption-safe layout and timing behavior
- enough flexibility for AI direction without arbitrary generated code

## 2. Decision

Move toward a controlled Visual IR / Scene Graph generation model:

```txt
LLM generates structured shot intent
System compiles that structure into Remotion
```

Do not make unrestricted LLM-generated TSX the default product path.

Do not keep growing only fixed one-off templates. Treat those templates as
macro / preset paths that can provide stable quality for common structures.
Broader expression should come from validated Visual IR primitives, layout
presets, motion grammar, bounded procedural modules, and later asset
composition.

Recommended middle path:

```txt
Creative brief
  -> StoryboardPlan
  -> ShotLanguagePlan
  -> render strategy decision
  -> per-segment SceneGraph
  -> Visual IR compiler / UniversalSceneRenderer
  -> VideoProject preview/edit/export
```

The LLM is responsible for creative direction and shot structure. The app is
responsible for rendering, validation, asset safety, duration rules, captions,
and fallback behavior.

## 3. Relationship To Existing Product Model

Keep these stable boundaries:

- `VideoProject` remains the preview, edit, regenerate, and export boundary.
- `VideoSegment` remains the user-facing editable unit.
- segment-owned `VideoSegment.narration.audio` and
  `VideoSegment.narration.captions` remain outside visual implementation data.
- real narration duration continues to drive visual timing.
- caption cues remain segment-local and are rendered through shared
  preview/export code.
- existing registered templates remain valid fallback and compatibility paths.

The change is focused on the visual implementation layer:

```txt
Stable macro paths:
VideoSegment.templateId -> fixed template schema -> fixed renderer

Scene graph path:
VideoSegment.templateId -> scene-graph Visual IR -> bounded primitive renderer
```

The target has started as one registered template, `scene-graph`, whose
`implementation` is a validated scene graph. The deterministic Visual IR v1
slice now makes that template act less like another fixed card layout and more
like a bounded primitive compiler. The next step is provider-backed Visual IR
generation and bounded repair, not unrestricted TSX.

## 3.1 Render Strategies

The long-term system should decide the render strategy per shot:

```ts
type RenderStrategy =
  | "template_macro"
  | "primitive_scene_graph"
  | "procedural_generator"
  | "media_asset_composite"
  | "generated_component";
```

Strategy roles:

- `template_macro`: high-stability common structures. Current registered
  templates belong here.
- `primitive_scene_graph`: flexible validated composition from text, shapes,
  paths, code/terminal panels, browser frames, node graphs, cursors, and
  caption-safe zones. This is the current deterministic `scene-graph` Visual
  IR v1 path.
- `procedural_generator`: bounded built-in modules for visuals such as node
  graphs, line paths, code diffs, terminal flows, timelines, particles, and
  other deterministic graphics.
- `media_asset_composite`: future path for screenshots, generated images,
  videos, stock clips, or other concrete assets.
- `generated_component`: future restricted codegen escape hatch only, guarded
  by allowed imports, TypeScript/lint/still review, and fallback to Visual IR.

Do not implement `generated_component` in the current Visual IR path. It
remains a future restricted escape hatch only.

## 4. ShotLanguagePlan

`ShotLanguagePlan` describes the full video's visual grammar before individual
segments are compiled. It prevents each segment from feeling unrelated.

Example shape:

```ts
type ShotLanguagePlan = {
  visualStyle: string;
  colorSystem: {
    background: string;
    foreground: string;
    accent: string;
    contrast: "low" | "medium" | "high";
  };
  motionSystem: {
    camera: Array<"static" | "push-in" | "pan" | "drift" | "zoom-through">;
    transitions: Array<"cut" | "match-cut" | "soft-wipe" | "slide" | "zoom">;
    textMotion: "minimal" | "kinetic" | "editorial" | "bold";
  };
  rhythm: {
    opener: "fast" | "steady" | "slow";
    middle: "fast" | "steady" | "slow";
    ending: "fast" | "steady" | "slow";
  };
  recurringMotifs: string[];
  captionStyle?: {
    position: "bottom" | "center" | "top";
    treatment: "clean" | "boxed" | "cinematic";
  };
};
```

Responsibilities:

- define the whole video's visual identity
- keep colors, movement, transitions, and typography coherent
- give each segment enough continuity to feel authored
- guide scene graph generation without exposing Remotion source code

Non-responsibilities:

- do not replace `StoryboardPlan`
- do not own narration text or audio
- do not contain final renderer implementation details
- do not become arbitrary prompt text without schema validation

## 5. SceneGraph

`SceneGraph` describes one segment's shot structure.

Example shape:

```ts
type SceneGraph = {
  sceneType:
    | "opener"
    | "explain"
    | "proof"
    | "comparison"
    | "process"
    | "transition"
    | "closing";
  durationInFrames: number;
  camera: {
    movement: "static" | "push-in" | "pan-left" | "pan-right" | "drift" | "zoom-through";
    intensity: "subtle" | "medium" | "strong";
  };
  transitionIn?: SceneTransition;
  transitionOut?: SceneTransition;
  layers: SceneLayer[];
  beats: SceneBeat[];
};
```

Layer examples:

```ts
type SceneLayer =
  | {
      type: "background";
      treatment: "solid" | "depth-gradient" | "noise-grid" | "media-blur";
    }
  | {
      type: "kinetic-title";
      text: string;
      emphasis?: string[];
      layout: "center" | "left" | "split";
    }
  | {
      type: "media-frame";
      assetRef: string;
      treatment: "device" | "floating-card" | "full-bleed" | "cutout";
    }
  | {
      type: "callout";
      text: string;
      anchor: "left" | "right" | "center";
    }
  | {
      type: "metric-highlight";
      label: string;
      value: string;
      context?: string;
    }
  | {
      type: "process-step";
      index: number;
      title: string;
      detail?: string;
    }
  | {
      type: "caption";
      source: "segment-narration";
    };
```

Beat examples:

```ts
type SceneBeat = {
  atFrame: number;
  action:
    | "reveal-layer"
    | "emphasize-text"
    | "advance-step"
    | "change-camera"
    | "exit-layer";
  targetLayerId?: string;
};
```

Responsibilities:

- express shot composition, timing, and visual beats
- remain schema-valid and repairable
- refer to existing assets by id/reference instead of inventing URLs
- stay independent from narration audio and caption cue storage
- compile deterministically into Remotion components

Non-responsibilities:

- do not contain TSX source code
- do not import packages
- do not access filesystem, network, environment variables, or runtime APIs
- do not own global project timeline outside the segment duration

## 6. UniversalSceneRenderer

`UniversalSceneRenderer` is the Remotion renderer for scene graph segments.

It should provide reusable rendering primitives for:

- cinematic backgrounds
- kinetic title treatment
- media frames and reveals
- callouts
- metric highlights
- process steps
- comparison layouts
- camera motion
- layer reveal / exit
- segment transitions
- caption-safe layout zones

Rendering rules:

- use Remotion frame-driven animation only:
  `useCurrentFrame()`, `interpolate()`, `spring()`, `<Sequence>`, `<Series>`,
  or Remotion transition primitives
- do not use CSS animations, CSS transitions, or Tailwind animation utilities
  for render-critical motion
- keep text within stable layout regions
- keep caption-safe zones reserved when captions are enabled
- make the same `VideoProject` payload drive page preview and export

The renderer can live behind a normal registered template bundle:

```txt
src/templates/scene-graph/
  schema.ts
  definition.ts
  runtime.tsx
  editor.tsx
  index.ts
```

This lets the current registry and component-registry architecture continue to
work while the visual model becomes more flexible.

## 7. LLM Generation Strategy

Generation should be staged:

```txt
brief
  -> StoryboardPlan
  -> ShotLanguagePlan
  -> per-segment SceneGraph
  -> validate / repair SceneGraph
  -> assemble VideoProject
```

The LLM should see:

- `StoryboardPlan`
- selected segment narration and visual brief
- real audio duration
- `ShotLanguagePlan`
- available scene layer types
- allowed transitions
- allowed asset references
- caption-safe layout rules
- examples of good scene graphs

The LLM should not see:

- renderer source code
- local filesystem paths
- secrets or environment variables
- arbitrary package import options
- project write permissions

Validation and repair:

- validate `ShotLanguagePlan` and `SceneGraph` with Zod
- repair only the invalid structured payload, not the whole project by default
- cap repair attempts
- fall back to existing registered templates if scene graph compilation fails
- surface diagnostics so the user can tell when a fallback happened

## 8. Editing Model

The first editor does not need to be a full visual timeline.

Useful initial controls:

- scene type
- color style / accent
- camera movement
- transition in/out
- layer order
- text for title/callouts/process steps
- media asset references
- regenerate visuals while preserving narration/audio

Keep regeneration dependencies explicit:

- narration text change: rerun TTS, captions, and scene graph timing
- visual direction change: reuse narration audio, regenerate scene graph
- asset change: preserve narration, regenerate or adjust scene graph only
- caption style change: preserve audio and visual graph unless layout repair is
  required

## 9. Migration Plan

Recommended bounded rollout:

1. Done: add `docs/SCENE_GRAPH_VIDEO_LANGUAGE_PLAN.md` and align roadmap docs.
2. Done: implement the first scene graph registered-template landing.
   Completed goal and handoff notes are archived under `docs/archive/`.
3. Done: keep Subagent-Driven execution boundaries in the archived handoff
   notes for historical reference.
4. Done: add `src/lib/scene-graph-schema.ts` with `ShotLanguagePlan` and
   `SceneGraph` contracts.
5. Done: add a registered `scene-graph` template with a small
   `UniversalSceneRenderer`.
6. Done: support the first layer set:
   - background
   - kinetic title
   - callout
   - metric highlight
   - process step
   - caption source marker
7. Done: add deterministic smoke fixtures before provider-backed generation.
8. Done: upgrade the renderer into a bounded Visual IR compiler path with
   primitives, layout presets, and motion grammar. The completed Visual IR v1
   goal and handoff notes are archived under `docs/archive/`.
9. Next: follow `docs/VISUAL_IR_COMPILER_ROADMAP.md` and add Visual IR
   Generation v1 for `primitive_scene_graph` only after deterministic renderer
   quality is stable.
10. Add render strategy decision, procedural generators, media asset
   composition, review/repair, and restricted generated component escape hatch
   as later bounded phases.
11. Let the planner select `scene-graph` for visually expressive segments.
12. Keep `scripted`, `spotlight`, and `stats-dashboard` as fallback and
   specialized templates until scene-graph coverage is proven.

Do not start by generating arbitrary Remotion TSX per segment. That path may be
useful later for experiments, but it should remain a sandboxed optional path,
not the default product architecture.

## 10. Success Criteria

The direction is working when:

- the same brief produces segments with visibly different shot types
- the whole video keeps one coherent visual system
- opener, explanation, proof, and closing segments feel intentionally paced
- generated output no longer looks like a sequence of static cards
- captions remain aligned and readable
- preview and export stay driven by the same `VideoProject`
- invalid scene graph payloads fail clearly or repair safely
- existing registered templates still work as fallback

## 11. Non-goals

Do not include these in the first implementation:

- unrestricted LLM-generated TSX as the primary path
- installing packages during generation
- full video editor timeline
- arbitrary browser/network access from generated content
- multi-replica job orchestration
- persistence/history/database changes
- media asset library beyond the minimum references needed by scene layers
- automatic promotion of every primitive into a standalone registered template
