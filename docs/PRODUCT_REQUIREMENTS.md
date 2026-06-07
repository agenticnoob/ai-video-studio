# Product Requirements

Status: draft, refined from product-direction discussion.

## 1. Product definition

`ai-video-studio` is a personal AI + Remotion video orchestrator.

The product goal is not a single-template editor.
The product goal is to turn loose creative input into a full video draft composed from one or more video segments, then let the user refine and export it.

## 2. Product vision

Target workflow:
- user provides a creative brief, story, experience, or video requirements
- AI interprets the input and plans the video as one or more segments
- for each segment, the system generates an implementation plan using existing Remotion templates
- the system assembles all segments into one playable full-video draft
- the user reviews the whole video, adjusts segment intent or details, and re-generates as needed
- the user exports the final video

Product direction:
- one segment should be implemented by one primary template
- one template may contain multiple internal Remotion scenes / components /
  transitions / layout primitives
- reusable Remotion examples from external libraries should be treated as
  component / primitive candidates first, even when those libraries call them
  templates
- AI should choose the most suitable existing template from registered
  template descriptions and usage guidance, then generate that template's
  structured parameters
- when templates are developed with AI assistance, prefer small reusable
  Remotion primitives plus template-local block contracts over open-ended
  generated template code
- existing video, image, audio, or color material should be modeled as
  project-level or segment-level media layers

This keeps the user-facing model segment-first while leaving room for richer compositing inside templates.

## 3. Primary user

Current target user:
- the project owner only
- technically capable
- comfortable with iterative product evolution
- prefers starting simple and adding complexity gradually

## 4. Core problem

The product should help the user go from:
- an idea, memory, story, or video requirement

to:
- a viewable, editable, exportable video draft

without manually building every animation or video segment from scratch.

The system must bridge:
- creative intent
- segment planning
- template selection
- structured parameter generation
- review and editing
- final export

## 5. Core domain model

### 5.1 Project

A project is one video creation task.

A project includes:
- the user input / creative intent
- the AI-generated segment plan
- per-segment implementation data
- the assembled full-video draft

### 5.2 Segment

The core editable content unit is a `segment`.

A segment is:
- a self-contained video unit
- something that can stand on its own as a small video piece
- something that can also be combined with other segments into a final full video

A full video may contain:
- only one segment
- or multiple segments

### 5.3 Template

A template is not the same as a segment.

A template is an implementation mechanism, not the primary user-facing content unit.

The user should mainly think in terms of:
- what each segment should express
- what each segment should feel like
- how long each segment should be
- how the full video should flow

The system should mainly decide:
- which primary template best implements a segment
- how to fill template props / structured parameters

Template selection should be driven by each registered template's description,
capabilities, usage scenarios, constraints, and examples. The AI should not
invent new Remotion code as the default path.

External Remotion component libraries can expand the internal visual
vocabulary, but their individual effects should not automatically become
registered templates. A chart, text effect, transition, lower third, logo
reveal, background, or media layout is usually a component that a template can
compose internally.

### 5.4 Segment implementation

Product model:
- one segment is implemented by one primary template instance
- `templateId` determines the schema of `implementation`
- `implementation` is the template-specific parameter payload, not a universal project-level structure
- a template can be internally composed from multiple Remotion components,
  scenes, renderers, layout primitives, transitions, and media helpers
- a template may use template-local block contracts to describe how semantic
  fields map onto reusable Remotion primitives
- reusable component libraries should feed the primitive / block layer before
  any component is promoted into the registered template layer
- segment complexity should first be expressed through template-specific props and internal components
- existing video, image, audio, or color material should be represented as
  media layers rather than as additional templates

Current registered templates:
- `scripted`: `implementation` is `VideoSpec`
- `spotlight`: `implementation` is `SpotlightSpec`
- `VideoSpec.scenes` is the scripted template's internal sequence model
- `SpotlightSpec.callouts` is the spotlight template's focused-card content model
- `scenes` is not a required field for every template; future templates may have completely different implementation fields
- multi-template-per-segment orchestration is not part of the near-term product direction

Potential future media model:
- project-level `media.layers[]`: video, image, audio, or color layers shared
  by the full generated video
- segment-level `media.layers[]`: video, image, audio, or color layers used
  only for that segment
- `baseLayer` should be treated as a layer role for background visual media,
  not as a separate top-level field
- template-specific media props: local images, clips, icons, or other assets
  used inside one template implementation

## 6. Inputs

### 6.1 Required input

The user can provide:
- a prompt
- a story
- an experience
- a set of video requirements
- a textual description of what should happen in the video

The input may contain both:
- content intent
- production guidance

Examples:
- story flow
- emotional beats
- pacing wishes
- segment ideas
- styling hints
- rough timing wishes

### 6.2 Optional future input

The user may later provide existing media such as a video or image.

Planned future use:
- treat the uploaded media as project-level or segment-level base material
- add Remotion-generated content on top of it
- for video input, use text description or AI analysis to understand what happens at which time

This is explicitly a later-phase capability, not required for v1.

## 7. AI responsibilities

Given the user input, the system should:
1. interpret the creative intent
2. split the full video into one or more segments
3. infer the purpose of each segment
4. compare the segment purpose against registered template descriptions,
   capabilities, and usage scenarios
5. in v1, choose one existing template per segment
6. generate structured props / schema-valid JSON for that segment implementation
7. assemble the generated segments into a full-video draft

## 8. User responsibilities and editing model

### 8.1 Primary editing path

The primary editing path should be:
- user reviews the generated full-video draft
- user focuses on a segment
- user edits the segment using natural language
- the system re-generates that segment

This is the preferred interaction mode.

### 8.2 Secondary editing path

The secondary editing path should be:
- user edits structured fields directly
- such as text, timing, colors, or selected parameters

This is useful for fine tuning, but it is not the primary product mental model.

### 8.3 Regeneration behavior

Default behavior after a segment edit:
- re-generate the current segment only

Also support:
- explicit full-video regeneration when the user wants broader re-planning

## 9. V1 product scope

V1 should focus on the simplest version of the product that still proves the core workflow.

### 9.1 V1 must support

- text-only creative input
- AI automatic segment splitting
- one or more generated segments per project
- one template implementation per segment
- AI-selected template per segment
- generated structured props per segment
- assembly of all segments into one full-video draft
- full-video preview as the primary viewing mode
- adjacent segment list for navigation and editing
- segment-level natural-language revision and regeneration
- structured field editing for fine tuning
- local final export

### 9.2 V1 interface shape

Preferred main interface:
- full-video preview as the primary focal area
- segment list visible next to the preview
- selecting a segment reveals its details and editing controls

V1 should feel like:
- watch the draft first
- then refine segment by segment

not:
- configure everything before seeing a video

### 9.3 V1 generation behavior

Preferred flow:
- AI generates the first segment plan automatically
- user adjusts afterward

V1 is not primarily:
- user hand-authoring the whole segment structure from scratch before generation

## 10. Deferred scope

The following are important, but should not define v1.

### 10.1 Existing-media layers

Future capability:
- user supplies existing video, image, audio, or color as media layers
- generated template content is layered with those media layers
- project-level media layers apply to the full generated video
- segment-level media layers apply only to one segment
- visual base layers are represented as media layers with a base/background
  role, not as a separate `baseLayer` field
- timing and overlay behavior are coordinated for video/image/color layers
- timing and volume behavior are coordinated for audio layers

Why deferred:
- significantly increases product and UI complexity
- likely needs lightweight timeline-style editing later

### 10.2 Multi-template implementation inside one segment

Current product decision:
- do not model one segment as multiple template instances by default
- prefer one primary template per segment
- grow expressiveness through template-specific implementation fields, internal
  components, media props, and shared media layers

Why deferred:
- this adds orchestration complexity before the product has proven it needs a segment-internal template timeline
- many near-term cases are better handled inside a richer template

### 10.3 Template-to-template overlap / layered composition

Future capability:
- layered or overlapping animated content across independently scheduled templates

Why deferred:
- this likely needs a lightweight time/layer orchestration UI
- not needed to prove the first product loop

### 10.4 Full professional timeline editor

Not a v1 goal.

If overlap / layering becomes important later, the project should introduce a lightweight orchestration timeline, not a full NLE-style editor at first.

### 10.5 AI-generated brand-new templates

Interesting future direction, but not a near-term core requirement.

Near-term focus should remain:
- existing template library
- better segment planning
- better template selection
- better parameter generation
- reusable Remotion component primitives that templates can compose internally

## 11. Explicit non-goals for v1

- fully open-ended template marketplace / plugin platform
- complete professional editing timeline
- solving all overlay and compositing cases
- AI source-code generation of new Remotion templates as the main product path

## 12. Product principles

### 12.1 Start simple

Do not build the full long-term system in one step.

### 12.2 Segment-first thinking

User-facing product structure should be based on segments, not templates.

### 12.3 Templates are internal execution strategy

Templates matter, but they should not dominate the product mental model.

### 12.4 Preview before perfection

The system should quickly produce a watchable draft, then support iterative refinement.

### 12.5 Local-first exportable workflow

The result should stay previewable, inspectable, editable, and exportable on the local workstation.

## 13. Current recommended implementation direction

Near-term product architecture should evolve from the current single-template model toward:
- project-level video generation
- AI-generated segment plan
- per-segment implementation data
- segment-by-segment regeneration
- full-video assembly and export
- future project-level / segment-level media layers for existing media

Practical v1 shortcut:
- keep one primary template instance per segment
- allow that template to contain multiple scenes and internal components
- preserve the product requirement that a segment is the user-facing editing unit

## 14. Working decisions captured so far

- Start with the simple no-overlay version.
- Model future video / image / audio / color inputs as media layers, not as
  extra templates.
- Do not require a timeline-centric UI in v1.
- Full-video preview should be primary; segment list should be secondary but always visible.
- Segment edits should default to local regeneration.
- Natural-language editing should be primary; structured editing should remain available as a secondary path.
- Existing-media layers are a future milestone.
- One segment should keep one primary template; template internals can grow through template-specific implementation fields/components.
- AI-generated templates are future discussion, not current scope.
