# Media Layer Model

Status: implementation-boundary note plus segment-owned narration alignment.

Roadmap relationship:
- `docs/FINAL_PRODUCT_GOAL.md` is the authoritative final generation target.
- TTS narration audio belongs to the main generation pipeline. Generated
  narration audio should be represented outside template-specific
  `implementation` fields.
- Narration audio and caption/subtitle cues should be owned by the segment
  under `VideoSegment.narration`. Generated narration audio now lives in
  `VideoSegment.narration.audio`; top-level narration media layers remain only
  as a compatibility path.
- Caption/subtitle cues are also part of the narration pipeline, preferably
  returned by the in-project F5-TTS provider and normalized as segment-local
  caption data. They are not part of the generic media-layer MVP described in
  this document.
- This document defines how existing or timeline-level image/video/audio/color
  material should be modeled when the project intentionally widens into media
  compositing.

This document records the unified media-layer model for images, videos, audio,
and color layers. It replaces the earlier separate planning ideas of
`baseLayer` for visual media and `audio.tracks` for sound.

The key decision for media layers:

```txt
project.media.layers[] for full-video assets
segment.media.layers[] for media that belongs to one segment
segment.narration for generated narration audio and captions
```

All externally supplied media should use one layer array. `baseLayer` becomes
a semantic role on a media layer, not a separate field.

## Feasibility Decision

This is feasible if the first implementation is deliberately small.

The first implemented slice carried generated narration audio as project-level
media. That path works for preview/export, but it is no longer the target
ownership model. Future media-layer expansion should still stay deliberately
small and avoid becoming a general-purpose timeline editor:

- project-level media for full-video assets: `VideoProject.media.layers[]`
- segment-owned narration for generated narration audio and captions:
  `VideoSegment.narration`
- segment-level media for non-narration assets that belong to one segment:
  `VideoSegment.media.layers[]`
- each layer requires `startFrame` and `durationInFrames`
- each layer renders through one shared Remotion `<Sequence>` wrapper
- current generated narration audio uses `sourceType: "route"` for
  `/api/tts/assets/...`; future existing media can use `public` or `remote`
- editing is a compact structured form, not drag/drop timeline editing
- MiniMax preserves or omits media; it does not invent asset URLs
- no uploads, generated assets, waveform UI, keyframes, ducking, or beat sync

The hard part is not the Remotion `<Sequence>` wrapper. The hard parts are
asset source policy, duration rules, editing UX, and provider behavior. The
MVP keeps those bounded.

## Current Code Facts

The current product boundary is still `VideoProject`.

```txt
page state
  src/app/page.tsx
  -> normalized VideoProject
  -> Remotion Player inputProps
  -> POST /api/render body

render endpoint
  src/app/api/render/route.ts
  -> videoProjectSchema
  -> renderProjectVideo()
  -> ProjectVideo composition

Remotion runtime
  src/remotion/ProjectVideo/ProjectVideo.tsx
  -> Sequence per VideoSegment
  -> renderRegisteredSegment(segment)
  -> template runtime renderer
```

Segment timing is derived from template definitions:

```txt
VideoSegment.templateId
  -> getTemplateDefinition(templateId).getDuration(implementation)
  -> getSegmentDuration(segment)
  -> getSegmentStart(project, index)
  -> ProjectVideo <Sequence from durationInFrames>
```

The scripted template used to expose a template-internal scene audio hook. That
field is now quarantined out of generation/provider-visible schemas and is no
longer rendered by `ScriptedVideo`. New narration audio must use
template-external segment-owned data.

Current code includes segment-owned generated narration audio plus a
deliberately small project-level audio compatibility path:

- `VideoProject.media.layers[]`
- audio layers with `type: "audio"` and `kind: "narration"` for legacy/current
  compatibility
- shared rendering through `ProjectMediaLayers`
- `VideoSegment.narration.audio` stores generated TTS audio metadata for staged
  output
- `ProjectNarrationLayers` flattens segment-owned narration audio to the global
  project timeline during preview/export
- `/api/tts/assets/...` supports byte ranges for preview seeking
- `/api/render` converts route media to an absolute Next app origin before
  Remotion rendering
- no image/video/color layer renderer yet

This is current implementation fact. The next alignment slice should add
captions into `VideoSegment.narration.captions`, then flatten those
segment-owned caption cues to the project timeline in `ProjectVideo`.

## Product Boundary

Media layers should be added without changing the segment/template decision
model.

Keep:

```txt
VideoProject
  -> media.layers[]?        // full-video assets only
  -> VideoSegment[]
      -> narration?         // generated speech audio and captions
      -> media.layers[]?    // segment-owned non-narration media
      -> one primary templateId
      -> template-specific implementation
      -> template runtime / Remotion primitives
```

Do not model image, video, color, or audio media as additional templates inside
a segment. Media layers are timeline data. Templates remain segment-level
implementation mechanisms.

`baseLayer` should no longer be introduced as a top-level field. Use
`media.layers[].role = "base"` or `placement = "background"` when a layer acts
as the old base layer.

## Recommended Media Schema

Keep project and segment media layers small and renderable. Do not use this
generic media-layer schema as the primary narration contract.

```ts
type VideoProjectMedia = {
  layers: MediaLayer[];
};

type MediaLayer =
  | ImageMediaLayer
  | VideoMediaLayer
  | AudioMediaLayer
  | ColorMediaLayer;

type BaseMediaLayer = {
  id: string;
  label: string;
  startFrame: number;
  durationInFrames: number;
  muted?: boolean;
  locked?: boolean;
  role?: "base" | "overlay" | "audio" | "reference";
};

type VisualLayerPlacement = "background" | "foreground";
type VisualFit = "cover" | "contain" | "fill";

type VisualTransform = {
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
};

type VisualAdjustment = {
  brightness?: number;
  contrast?: number;
  blur?: number;
};

type ImageMediaLayer = BaseMediaLayer & {
  type: "image";
  src: string;
  sourceType?: "public" | "remote";
  placement?: VisualLayerPlacement;
  fit?: VisualFit;
  opacity?: number;
  zIndex?: number;
  transform?: VisualTransform;
  adjustments?: VisualAdjustment;
};

type VideoMediaLayer = BaseMediaLayer & {
  type: "video";
  src: string;
  sourceType?: "public" | "remote";
  placement?: VisualLayerPlacement;
  fit?: VisualFit;
  opacity?: number;
  zIndex?: number;
  trimStartFrame?: number;
  volume?: number;
  transform?: VisualTransform;
  adjustments?: VisualAdjustment;
};

type AudioMediaLayer = BaseMediaLayer & {
  type: "audio";
  src: string;
  sourceType?: "public" | "remote" | "route";
  kind?: "narration" | "music" | "sfx" | "ambient";
  trimStartFrame?: number;
  volume?: number;
  loop?: boolean;
};

type ColorMediaLayer = BaseMediaLayer & {
  type: "color";
  color: string;
  placement?: VisualLayerPlacement;
  opacity?: number;
  zIndex?: number;
};
```

Initial rules:

- `startFrame` is project-relative for project-level layers.
- `durationInFrames` is required in the first implementation. This avoids
  async source-duration probing in `calculateMetadata`.
- `src` is a local public asset path via `staticFile()` or a remote URL.
- `sourceType` defaults to `public` for relative paths and `remote` for
  absolute HTTP(S) URLs.
- `trimStartFrame` offsets into video or audio sources when present.
- `volume` is normalized from `0` to `1`, defaulting to `1`.
- `opacity` is normalized from `0` to `1`, defaulting to `1`.
- `loop` should only be used with `durationInFrames`, so looping media remains
  bounded by the project timeline.
- `muted` preserves a layer while excluding its sound or visual output from
  render.
- `locked` preserves a layer while telling the editor not to allow destructive
  edits such as remove or type changes.
- `zIndex` only applies to visual layers.
- `transform` and `adjustments` only apply to visual layers and are rendered
  by the shared media-layer renderer, not by templates.

Do not add gain envelopes, waveform editing, beat detection, ducking, subtitle
sync as a media-layer feature, upload persistence, source-duration probing,
keyframed transforms, or generated media assets in the first slice.

## Project vs Segment Media

Use project-level layers for media that spans or coordinates multiple
segments:

- background music
- ambient bed
- full-video base image, video, or color
- full-video watermark or foreground overlay

Use segment-level ownership for assets that belong to one segment:

- generated narration audio and captions, preferably through
  `segment.narration`
- segment-specific image, video, audio, or color layers when media editing
  widens beyond narration
- segment-local sound effects or visual overlays

For future timeline editing, this gives a clean split: segment data owns
content assets, while the project timeline owns segment order, transitions,
global layers, and absolute placement.

```ts
type VideoSegment = {
  narration?: SegmentNarration;
  media?: VideoSegmentMedia;
  templateId: TemplateId;
  implementation: unknown;
};

type VideoSegmentMedia = {
  layers: SegmentMediaLayer[];
};

type SegmentMediaLayer = Omit<MediaLayer, "startFrame"> & {
  startFrame?: number;
};
```

Segment-owned narration captions and segment-level media `startFrame` values
should be relative to the segment, not the full project. `ProjectVideo` can
translate them with `getSegmentStart(project, index)` when rendering.

Do not put reusable media fields into every template implementation just to
make media available. Template implementations should only own media props when
the media is part of that template's semantic contract.

## Rendering Path

Add a shared project media renderer under the Remotion runtime layer, for
example:

```txt
src/remotion/ProjectVideo/ProjectMediaLayers.tsx
src/remotion/ProjectVideo/MediaLayerSequence.tsx
src/remotion/ProjectVideo/RenderMediaLayer.tsx
src/remotion/ProjectVideo/media-layer-source.ts
src/remotion/ProjectVideo/media-layer-style.ts
```

`ProjectMediaLayers` should be the public runtime entry. Other project code
should not hand-wrap media in `<Sequence>`, and templates should not import the
media-layer renderer directly.

Expected render order:

```txt
ProjectVideo
  -> project background visual media layers
  -> project audio media layers
  -> segment sequences
       -> segment narration audio
       -> optional segment captions
       -> optional segment background layers
       -> segment renderer
       -> optional segment foreground/audio layers
  -> project foreground visual media layers
```

Media should render from the same `VideoProject` passed to both the Player and
`POST /api/render`, so preview and export stay aligned.

Use Remotion media in a timeline-driven way:

- treat each media layer as a timeline item
- render each media layer through its own `<Sequence>`
- use `from` for timeline placement
- use `durationInFrames` for bounded playback or visibility
- use `staticFile()` for public assets when the source is local
- use Remotion media components for image, video, and audio output
- use `volume`, `opacity`, `fit`, and `zIndex` as data

Conceptually, the renderer should look like:

```tsx
const MediaLayerSequence = ({ layer }: { layer: MediaLayer }) => {
  if (layer.muted) {
    return null;
  }

  return (
    <Sequence from={layer.startFrame} durationInFrames={layer.durationInFrames}>
      <RenderMediaLayer layer={layer} />
    </Sequence>
  );
};
```

The project-level call site should stay simple:

```tsx
<ProjectMediaLayers
  layers={project.media?.layers ?? []}
  projectDurationInFrames={getProjectDuration(project)}
  stage="background"
/>

{project.segments.map(...)}

<ProjectMediaLayers
  layers={project.media?.layers ?? []}
  projectDurationInFrames={getProjectDuration(project)}
  stage="foreground"
/>
```

Audio layers can be rendered during either stage because audio does not
participate in visual stacking. Keep audio ordering data-driven by
`startFrame`, `durationInFrames`, and `volume`, not by visual `zIndex`.

For project-level layers, `startFrame` is already absolute on the full video
timeline. For segment-owned narration, captions, and media layers, the renderer
should convert segment-relative time into project-relative time:

```txt
absoluteStartFrame = getSegmentStart(project, segmentIndex) + layer.startFrame
```

This keeps media layers parallel to segment sequences without making them
additional templates.

If a layer starts before frame `0`, normalize it before validation or reject it
with a bounded schema error. Do not let negative timeline math leak into the
renderer.

## Adjustment Model

Media-layer adjustment belongs to the layer, not to the selected template.

The first adjustment model should be deliberately simple:

- timeline: `startFrame`, `durationInFrames`
- source trim: `trimStartFrame` for video/audio
- sound: `volume`, `muted`, `loop`
- visual layout: `placement`, `fit`, `zIndex`
- visual transform: `x`, `y`, `scale`, `rotate`
- visual appearance: `opacity`, optional `brightness`, `contrast`, `blur`

Do not add keyframed adjustments in the first slice. If motion is needed later,
add a small discriminated model such as:

```ts
type MediaLayerAnimation =
  | { type: "none" }
  | { type: "kenBurns"; intensity?: number }
  | { type: "fadeInOut"; fadeInFrames?: number; fadeOutFrames?: number };
```

Keep this separate from template internals. A template can decide how to render
its own implementation fields, but media layers should be editable and
renderable even when no template knows about them.

## Implementation Shape

The implementation should be split into small pieces:

```txt
src/lib/project-schema.ts
  media layer Zod schemas
  VideoProject.media
  normalizeProject() defaults

src/remotion/ProjectVideo/ProjectMediaLayers.tsx
  filters layers by stage and type
  sorts visual layers
  delegates each item to MediaLayerSequence

src/remotion/ProjectVideo/MediaLayerSequence.tsx
  owns the Remotion <Sequence> wrapper
  applies global start offsets later for segment-level media

src/remotion/ProjectVideo/RenderMediaLayer.tsx
  switches on layer.type
  renders color, image, video, or audio

src/remotion/ProjectVideo/media-layer-source.ts
  resolves public vs remote src

src/remotion/ProjectVideo/media-layer-style.ts
  maps fit, opacity, transform, adjustments, and zIndex to styles
```

Keep this renderer independent from template modules. The renderer consumes
validated `MediaLayer` data and does not know whether the current segment is
`scripted`, `spotlight`, or a future template.

## First Implementation Slice

Implement in this order:

1. Add segment-owned caption normalization helpers.
2. Generate fallback caption cues from narration text and measured audio
   duration when provider alignment is unavailable.
3. Add render-time flattening for segment-owned captions.
4. Keep `project.media.layers[]` for true full-video media.
5. Add source resolution for `sourceType: "public" | "remote"`.
6. Add visual style helpers for `fit`, `opacity`, `zIndex`, and simple
   transforms.
7. Add `RenderMediaLayer` for `color`, `image`, `video`, and `audio`.
8. Add `MediaLayerSequence` as the single `<Sequence>` wrapper for generic
   media.
9. Add one or two sample project/segment layers for smoke testing when generic
   media work resumes.
10. Add a compact media panel after rendering works.
11. Update MiniMax schema/prompt only to preserve existing media or omit it.

This means preview/export support lands before editing polish. That is the
safest order because the UI can stay simple once the render contract is real.

## Not In The First Slice

Do not implement these until the segment-owned narration/caption loop and basic
render path are stable:

- media uploads
- generated images or video
- TTS as a generic project media-layer feature
- source duration probing
- waveform or filmstrip previews
- drag/drop timeline editing
- keyframed transforms
- beat sync, silence detection, ducking, or captions
- provider-created media layers without a known asset library

Caption/subtitle work should be handled through the narration-provider target
instead: F5-TTS returns audio plus aligned caption cues, segment-owned
narration stores them, and shared project rendering flattens them for
preview/export parity outside template `implementation`.

## Generation Contract

For the first media slice, keep MiniMax from inventing arbitrary asset URLs.

Recommended sequence:

1. Add schema/render/editor support for user-provided or sample project media.
2. Keep provider prompts saying media layers are optional and should usually be
   omitted unless the request explicitly asks for a known available asset.
3. Only expose provider-generated media layers after there is an asset source
   policy: public sample assets, uploaded files, generated TTS files, generated
   images/videos, or a dedicated media library.

When media becomes provider-visible, update:

- `src/lib/project-schema.ts`
- `src/lib/minimax/tool-schema.ts`
- `src/lib/minimax/prompts.ts`
- `docs/providers/minimax.md`

Provider-visible media fields should stay top-level project or segment media
fields, not template ids.

## Editor Contract

The first UI should be a simple project-level media layer panel:

- add / remove layer
- edit label
- edit type
- edit src or color
- edit role / placement
- edit start time in seconds or frames
- edit duration in seconds or frames
- edit volume for audio/video
- edit opacity / fit / zIndex for visual layers
- edit simple transform values for visual layers
- respect `locked` by disabling destructive edits for that layer
- mute toggle
- loop toggle for audio/video

Do not build waveform trimming, drag editing, keyframed transforms, or a
multi-lane timeline in the first slice. The current page is a segment-first
workbench, so the first media editor should be a compact structured panel, not
a full video editor timeline.

## Migration Notes

The old scripted scene audio hook should not be reintroduced into
provider-visible schemas, prompts, compiler outputs, or runtime rendering.
Generated narration audio belongs in template-external segment-owned data. The
current minimal project-level audio media layer path is a compatibility carrier
and should not be treated as the generated narration ownership model.

Do not add a separate `baseLayer` field. Existing references to `baseLayer`
should be interpreted as a planned `media.layers[]` visual layer with
`role: "base"` and `placement: "background"`.

## Validation

Use Docker-first validation for the implementation slice:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
```

When render code lands, also smoke test a project with at least:

- one background color or image layer
- one audio layer with volume below `1`
- one foreground visual layer
- one normal segment rendered through the existing template registry

The smoke test should confirm the same `VideoProject` previews in the page and
exports through `POST /api/render`.
