# Remotion Primitives

This document explains the reusable Remotion building blocks under
`src/remotion/primitives/`.

These components are video-rendering primitives for dedicated Agent Producer
compositions. They are not page UI components, planner options, or top-level
product concepts. A sample-local scene may compose several primitives while
keeping topic data and narration inside its composition.

External Remotion libraries may call similar assets "templates". In this repo,
those assets should be treated as reusable component or primitive candidates
first. See `docs/REMOTION_COMPONENT_LIBRARY.md` for the intake and promotion
policy.

For Remotion motion rules, keep animation deterministic and frame-driven with
Remotion APIs. Do not use CSS animations, CSS transitions, or Tailwind
animation utilities for render-critical motion.

Mouse-following effects should consume normalized cursor tracks when they need
to be exportable. Use `CursorKeyframeTrack` from
`src/remotion/primitives/interaction/cursor-keyframes.ts` for Remotion-side
playback. Browser-side recording is not part of the current product flow.

## Directory Layers

Reusable Remotion primitives are split by role (91 components total):

| Layer          | Count | Role                                                           |
| -------------- | ----- | -------------------------------------------------------------- |
| `elements/`    | 2     | Small visual atoms: labels, panels                             |
| `layouts/`     | 1     | Reusable arrangements of repeated content                      |
| `backgrounds/` | 10    | Full-frame reusable background treatments                      |
| `charts/`      | 9     | Reusable data visualization components                         |
| `cinematic/`   | 9     | Film, camera, and cinematic-style treatments                   |
| `logos/`       | 9     | Logo reveal and brand-mark treatments                          |
| `media/`       | 9     | Reusable image/video presentation components                   |
| `scenes/`      | 21    | Complete scene-level blocks composed from elements and layouts |
| `text/`        | 9     | Reusable text animation treatments                             |
| `transitions/` | 10    | Frame-driven transition utilities and motion helpers           |
| `interaction/` | 1     | Cursor trajectory model and interpolation helpers              |
| `theme.ts`     | —     | Shared theme type definition                                   |

Keep future additions in the narrowest layer that fits. Promote a primitive
only after a real Producer composition proves a reusable responsibility and
the catalog plus review fixture document it.

## Complete Inventory

### backgrounds/ (10)

| Component                 | File                                      | Visual Effect                                                                                                       | Current Use                |
| ------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `BokehCircles`            | `backgrounds/BokehCircles.tsx`            | Floating blurred circles with slow sinusoidal drift and pulsing size; full-frame ambient depth effect               | Background layer           |
| `GeometricPatterns`       | `backgrounds/GeometricPatterns.tsx`       | Rotating geometric polygonal shapes with frame-driven rotation and spring entrance                                  | Background layer           |
| `GradientShiftBackground` | `backgrounds/GradientShiftBackground.tsx` | Frame-driven ambient gradient that shifts color phases and angle over time over a 4-color palette                   | Primitive catalog showcase |
| `GridPulse`               | `backgrounds/GridPulse.tsx`               | Dot grid with outward pulse wave traveling from center; animated dot opacity ripple                                 | Background layer           |
| `LiquidWave`              | `backgrounds/LiquidWave.tsx`              | Flowing liquid/wave SVG path with smooth vertex motion across the frame width                                       | Background layer           |
| `MatrixRain`              | `backgrounds/MatrixRain.tsx`              | Matrix-style falling character column effect with random glyphs and varied fall speeds                              | Background layer           |
| `MetaBallsPrimitive`      | `backgrounds/MetaBallsPrimitive.tsx`      | Full-frame OGL/WebGL metaball shader with deterministic frame-driven blob motion and optional cursor-like path ball | Studio showcase            |
| `NoiseGrain`              | `backgrounds/NoiseGrain.tsx`              | Deterministic pseudo-random grain texture overlay with configurable cell size and opacity                           | Background layer           |
| `PixelTransition`         | `backgrounds/PixelTransition.tsx`         | Grid of colored pixels that shift HSL hue/saturation/lightness over time; digital mosaic background                 | Background layer           |
| `Starfield`               | `backgrounds/Starfield.tsx`               | Two-layer star field with near/far parallax drift speed, deterministic positions, and pulsing star sizes            | Background layer           |

### charts/ (9)

| Component          | File                          | Visual Effect                                                                                                       | Current Use                                   |
| ------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `AreaChart`        | `charts/AreaChart.tsx`        | Animated SVG area chart with filled region under the line path, left-to-right clip reveal                           | Primitive catalog showcase                    |
| `BarChart`         | `charts/BarChart.tsx`         | Animated SVG bar chart with staggered bar growth, value labels, and prop-driven dimensions/container styling        | Primitive catalog showcase, `stats-dashboard` |
| `CircularProgress` | `charts/CircularProgress.tsx` | Circular ring/radial progress indicator with animated fill arc and percentage text center                           | Primitive catalog showcase                    |
| `ComparisonChart`  | `charts/ComparisonChart.tsx`  | Before/after side-by-side bar comparison with animated values, divider line, and category labels                    | Primitive catalog showcase                    |
| `DonutChart`       | `charts/DonutChart.tsx`       | Animated SVG donut chart with prop-driven segments, center text, dimensions, legend, and ring sizing                | Primitive catalog showcase, `stats-dashboard` |
| `LineChart`        | `charts/LineChart.tsx`        | Animated SVG line chart with prop-driven data, title, colors, dimensions, and y-axis maximum                        | Primitive catalog showcase, `stats-dashboard` |
| `PieChart`         | `charts/PieChart.tsx`         | Animated SVG pie chart with segment arc reveal, color legend, and percentage labels                                 | Primitive catalog showcase                    |
| `ProgressBars`     | `charts/ProgressBars.tsx`     | Horizontal stacked progress bars with staggered fill animation, skill labels, value display, and color per bar      | Primitive catalog showcase                    |
| `StatCounter`      | `charts/StatCounter.tsx`      | Spring-entrance stat display with count-up number animation, label, and optional positive/negative change indicator | Primitive catalog showcase                    |

### cinematic/ (9)

| Component         | File                            | Visual Effect                                                                                                                  | Current Use       |
| ----------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| `CameraShake`     | `cinematic/CameraShake.tsx`     | Multi-frequency sine/cosine shake that decays from ~15px to 0 over duration; organic camera vibration                          | Dynamic treatment |
| `FilmBurn`        | `cinematic/FilmBurn.tsx`        | Heat/film-burn overlay that peaks at mid-animation with orange-tinted intensity ramp                                           | Dynamic treatment |
| `KenBurns`        | `cinematic/KenBurns.tsx`        | Slow push-in or pull-out zoom on an image with easing; classic documentary pan-and-scan effect                                 | Image reveal      |
| `LetterboxReveal` | `cinematic/LetterboxReveal.tsx` | Cinematic letterbox bars animate in from top/bottom; content is revealed as bars retract                                       | Cinematic opener  |
| `ParallaxPan`     | `cinematic/ParallaxPan.tsx`     | Directional parallax pan across an image (`left-right`, `right-left`, `top-bottom`, `bottom-top`) with optional ping-pong loop | Image pan         |
| `SpotlightReveal` | `cinematic/SpotlightReveal.tsx` | Expanding circular clip-path from center (0% to 75%) with glow that peaks mid-animation then fades                             | Cinematic reveal  |
| `VignettePulse`   | `cinematic/VignettePulse.tsx`   | Oscillating vignette intensity between 0.3 and 0.8; subtle radial dark edge pulse                                              | Dynamic treatment |
| `WhipPan`         | `cinematic/WhipPan.tsx`         | Fast horizontal motion-blur stretch simulating a whip-pan camera transition between scenes                                     | Transition effect |
| `ZoomPulse`       | `cinematic/ZoomPulse.tsx`       | Gentle breathing zoom pulse on an image with easing; oscillates between near and slightly closer scale                         | Image motion      |

### elements/ (2)

| Component    | File                      | Visual Effect                                                                                                          | Current Use                                |
| ------------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `Kicker`     | `elements/Kicker.tsx`     | Small uppercase label above primary content, using `theme.secondary` color and wide letter spacing                     | `scripted`, `spotlight`, `stats-dashboard` |
| `VideoPanel` | `elements/VideoPanel.tsx` | Large rounded content panel with themed background, border, shadow, entrance opacity, and slight slide/scale-in motion | `scripted`, `spotlight`, `stats-dashboard` |

### interaction/ (1)

| Component                       | File                              | Visual Effect                                                                                                                                                       | Current Use          |
| ------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `CursorKeyframeTrack` + helpers | `interaction/cursor-keyframes.ts` | Shared normalized cursor trajectory model (`CursorKeyframe`, `CursorKeyframeTrack`, `CursorPoint`) with frame interpolation helpers for mouse-driven render effects | `MetaBallsPrimitive` |

### layouts/ (1)

| Component     | File                      | Visual Effect                                                                                                                  | Current Use |
| ------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `CalloutGrid` | `layouts/CalloutGrid.tsx` | Horizontal grid of short key messages (up to 4 columns), each with an alternating `theme.primary`/`theme.secondary` top border | `spotlight` |

### logos/ (9)

| Component          | File                         | Visual Effect                                                                                                    | Current Use                |
| ------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `LogoBlurReveal`   | `logos/LogoBlurReveal.tsx`   | Logo animates from blur 20→0 and opacity 0.3→1; company name appears after logo is sharp                         | Brand intro                |
| `LogoBounceDrop`   | `logos/LogoBounceDrop.tsx`   | Logo drops from above with spring bounce; squash-and-stretch on landing; name fades in after bounce              | Brand intro                |
| `LogoFadeReveal`   | `logos/LogoFadeReveal.tsx`   | Logo block and brand copy reveal with subtle spring motion and name fade-up                                      | Primitive catalog showcase |
| `LogoGlitchReveal` | `logos/LogoGlitchReveal.tsx` | RGB split glitch effect with decay factor starting at 1 and going to 0; pseudo-random offsets using sin          | Brand intro                |
| `LogoScaleRotate`  | `logos/LogoScaleRotate.tsx`  | Scale 0→1 + full 360° rotation with spring; subtle glow pulse after settling; name slides up                     | Brand intro                |
| `LogoSpinReveal`   | `logos/LogoSpinReveal.tsx`   | 3D-like spin (scale + perspective rotation) with spring; company name slides up after logo settles               | Brand intro                |
| `LogoSplitReveal`  | `logos/LogoSplitReveal.tsx`  | Logo split into left/right halves that expand outward from center; company name fades in                         | Brand intro                |
| `LogoStrokeDraw`   | `logos/LogoStrokeDraw.tsx`   | SVG stroke-dasharray draw effect on hexagon + triangle logo; fill fades in after outlines are complete           | Brand intro                |
| `LogoTypewriter`   | `logos/LogoTypewriter.tsx`   | Icon appears via spring scale; typewriter text reveal character-by-character after icon settles; blinking cursor | Brand intro                |

### media/ (9)

| Component               | File                              | Visual Effect                                                                                                  | Current Use                |
| ----------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `GalleryGrid`           | `media/GalleryGrid.tsx`           | Staggered six-cell gallery reveal with spring-entrance for image or gradient-card layouts; themed cell styling | Primitive catalog showcase |
| `ImageCarousel`         | `media/ImageCarousel.tsx`         | Horizontal carousel of image/gradient cards that auto-rotate by translating the strip; card labels overlay     | Image showcase             |
| `ImageComparisonSlider` | `media/ImageComparisonSlider.tsx` | Before/after comparison with animated sliding divider bar and circular handle; left/right label overlays       | Comparison display         |
| `ImageZoomReveal`       | `media/ImageZoomReveal.tsx`       | Image zooms from 2x→1x with blur 10→0; title fades in after zoom settles                                       | Image reveal               |
| `MasonryGallery`        | `media/MasonryGallery.tsx`        | Three-column masonry layout of color/gradient blocks with staggered spring entrance per column position        | Gallery layout             |
| `PhotoStack`            | `media/PhotoStack.tsx`            | Stacked photos with staggered rotation offsets (fan layout); each photo springs in with delay                  | Photo display              |
| `PictureInPicture`      | `media/PictureInPicture.tsx`      | Large main panel with small PiP inset panel that springs in from bottom-right; labeled overlays                | Multi-view layout          |
| `PolaroidFrame`         | `media/PolaroidFrame.tsx`         | Photo with white Polaroid-style border and slight rotation; spring entrance and label area below               | Photo display              |
| `SplitScreen`           | `media/SplitScreen.tsx`           | Left/right 50/50 split screen with panels sliding in from each side; center divider fades in after panels      | Comparison layout          |

### scenes/ (21)

| Component             | File                             | Visual Effect                                                                                       | Current Use         |
| --------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------- |
| `AnimatedList`        | `scenes/AnimatedList.tsx`        | Icon + label list items with staggered spring slide-in from left and fade-in                        | List display        |
| `BulletScene`         | `scenes/BulletScene.tsx`         | Heading plus bullet list via `Kicker` + title + bullet items with `theme` styling                   | `scripted`          |
| `CardFlip`            | `scenes/CardFlip.tsx`            | 3D card flip (front→back) with spring rotation on Y axis; content labels on each face               | Card reveal         |
| `ChapterTitle`        | `scenes/ChapterTitle.tsx`        | Section label + large chapter title + subtitle with spring entrance; decorative line + dot dividers | Chapter break       |
| `CinematicTitleIntro` | `scenes/CinematicTitleIntro.tsx` | Large title with spring rise-up + underline bar grows from center; subtitle fades in after title    | Title intro         |
| `CountdownIntro`      | `scenes/CountdownIntro.tsx`      | Circular countdown 3→2→1 with animated ring arc, number zoom, and "GO!" reveal                      | Video intro         |
| `CountdownTimer`      | `scenes/CountdownTimer.tsx`      | Digital countdown timer with digits flipping/animating; minutes:seconds format                      | Timer display       |
| `CreditsRoll`         | `scenes/CreditsRoll.tsx`         | Classic vertical scrolling credits with role labels (colored) and name pairs; bottom-to-top scroll  | End credits         |
| `EndCard`             | `scenes/EndCard.tsx`             | "Thanks for Watching" with title fade, subtitle slide-up, social icon row, and copyright line       | Video outro         |
| `LowerThird`          | `scenes/LowerThird.tsx`          | Name/title/prompt slide-in from left with accent bar and strikethrough divider; spring entrance     | Interview/graphics  |
| `NotificationPop`     | `scenes/NotificationPop.tsx`     | Stacked notification cards (title + body) with staggered spring pop-in; icon + colored accent       | UI notification     |
| `ParticleExplosion`   | `scenes/ParticleExplosion.tsx`   | Particle burst from center with random directions, spring-based speed, and color/size variation     | Motion effect       |
| `ProgressSteps`       | `scenes/ProgressSteps.tsx`       | Multi-step timeline with numbered circles + labels + connecting lines; step-by-step fill animation  | Process/wizard      |
| `QuoteCard`           | `scenes/QuoteCard.tsx`           | Large quote text with cyan left accent bar + decorative curly quote marks; author attribution below | Quote display       |
| `QuoteScene`          | `scenes/QuoteScene.tsx`          | Large quote text with optional `Kicker` and author; `theme`-styled text/secondary colors            | `scripted`          |
| `RotatingCarousel`    | `scenes/RotatingCarousel.tsx`    | 3D carousel of labeled cards that rotate around a central Y axis; each card has icon + label        | Card carousel       |
| `SoundWave`           | `scenes/SoundWave.tsx`           | Audio visualizer bars with random height oscillation per frame; full-width bar array                | Audio visualization |
| `SubscribeReminder`   | `scenes/SubscribeReminder.tsx`   | Bell icon + "Subscribe" heading + "Hit the bell" subtext; spring entrance with notification accent  | Call-to-action      |
| `TextHighlight`       | `scenes/TextHighlight.tsx`       | Words revealed with animated underline highlight sweeping left-to-right per word; sequential reveal | Emphasis effect     |
| `TitleScene`          | `scenes/TitleScene.tsx`          | Title block with optional `Kicker` and `subtitle`; `theme`-styled text/muted colors                 | `scripted`          |
| `TitleSplit`          | `scenes/TitleSplit.tsx`          | Split text animation: each half of title slides apart from center with gradient fill + spring       | Title effect        |

### text/ (9)

| Component            | File                          | Visual Effect                                                                                                | Current Use                |
| -------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------- |
| `AnimatedText`       | `text/AnimatedText.tsx`       | Character-by-character spring pop-in with staggered delay; each letter bounces in                            | Text entrance              |
| `BounceText`         | `text/BounceText.tsx`         | Title line bounces up with spring + subtitle slides up with slight delay; dual-line entrance                 | Text entrance              |
| `BubblePopText`      | `text/BubblePopText.tsx`      | Text characters enclosed in circular bubbles that pop in with spring scale; bubble layout                    | Text entrance              |
| `FloatingBubbleText` | `text/FloatingBubbleText.tsx` | Floating bubble containers with text inside; staggered upward float with spring                              | Text entrance              |
| `GlitchText`         | `text/GlitchText.tsx`         | RGB split glitch: cyan offset layer + magenta offset layer over white base text with horizontal displacement | Text effect                |
| `PoppingText`        | `text/PoppingText.tsx`        | Character-by-character pop entrance with per-character color and text-shadow outline; spring-based           | Primitive catalog showcase |
| `PulsingText`        | `text/PulsingText.tsx`        | Text with circular icon that pulses (scale oscillation); label fades in beside the icon                      | Text + icon                |
| `SlideText`          | `text/SlideText.tsx`          | Title slides in from left + subtitle slides in from right with spring; horizontal reveal                     | Text entrance              |
| `TypewriterSubtitle` | `text/TypewriterSubtitle.tsx` | Character-by-character typing reveal with blinking cursor; blue accent line below                            | Text reveal                |

### transitions/ (10)

| Component             | File                                 | Visual Effect                                                                                                            | Current Use                            |
| --------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| `BlindsTransition`    | `transitions/BlindsTransition.tsx`   | Venetian blind-style horizontal strips that flip/reveal; configurable blind count                                        | Scene transition                       |
| `ClockWipe`           | `transitions/ClockWipe.tsx`          | Radial clock wipe rotation revealing new scene underneath; circular sweep                                                | Scene transition                       |
| `CrossDissolve`       | `transitions/CrossDissolve.tsx`      | Classic opacity dissolve between two full-frame scene nodes; configurable duration                                       | Primitive catalog showcase             |
| `FadeThroughBlack`    | `transitions/FadeThroughBlack.tsx`   | Scene A fades out → black overlay peaks at midpoint → Scene B fades in                                                   | Scene transition                       |
| `IrisTransition`      | `transitions/IrisTransition.tsx`     | Iris closes (75%→0%) in first half, then opens (0%→75%) in second half; circular reveal                                  | Scene transition                       |
| `MorphTransition`     | `transitions/MorphTransition.tsx`    | Scene A scales 1→0.5 + opacity 1→0 while Scene B scales 1.5→1 + opacity 0→1                                              | Scene transition                       |
| `PushTransition`      | `transitions/PushTransition.tsx`     | New scene pushes old scene off-screen horizontally with spring motion                                                    | Scene transition                       |
| `SlideWipe`           | `transitions/SlideWipe.tsx`          | Old scene panel slides 0%→100% off-screen right revealing new scene underneath                                           | Scene transition                       |
| `ZoomThrough`         | `transitions/ZoomThrough.tsx`        | Scene A scales 1→3 + opacity 1→0 while Scene B scales 3→1 + opacity 0→1                                                  | Scene transition                       |
| `useEntranceProgress` | `transitions/useEntranceProgress.ts` | Frame-driven spring progress hook returning `0..1` for entrance animation; configurable `durationInFrames` and `damping` | `scripted`, `spotlight`, `scene-graph` |

### theme.ts

```ts
type RemotionTheme = {
  background: string; // Full-frame background color
  panel: string; // Content panel/card fill color
  primary: string; // Primary accent (borders, headings)
  secondary: string; // Secondary accent (kickers, author text)
  text: string; // Primary text color
  muted: string; // Muted/secondary text (subtitles, metadata)
};
```

## Parameter Ownership Model

Primitive props are render-focused code contracts selected by the Agent
Producer, not provider-authored schemas.

```txt
topic data and narration
  src/remotion/<CompositionName>/

Producer discovery and review
  src/remotion/catalog/
  src/remotion/producer-samples/

runtime helpers and primitive props
  src/remotion/standalone-video/
  src/remotion/primitives/
```

This keeps primitives reusable without creating a scene DSL. The dedicated
composition owns layout and motion choices explicitly.

## Detailed Component Descriptions

### Elements

#### `Kicker`

**Props**

- `children: string` — short uppercase label text
- `theme: RemotionTheme` — visual colors, uses `theme.secondary`
- `style?: CSSProperties` — optional size/spacing overrides

**Effect**: Renders a short uppercase label above main content with `theme.secondary` color, bold weight, wide letter spacing, and compact spacing below.

**Use when**: a scene needs a category, section label, hook label, or tone marker to visually precede the primary headline.

**Current examples**: TitleScene, BulletScene, QuoteScene, spotlight, stats-dashboard.

---

#### `VideoPanel`

**Props**

- `children: ReactNode` — content rendered inside the panel
- `entrance?: number` — motion progress (0..1), usually from `useEntranceProgress()`
- `maxWidth?: number` — maximum panel width (default 980)
- `padding?: string` — panel spacing (default "48px 56px")
- `style?: CSSProperties` — composition-local layout overrides
- `theme: RemotionTheme` — visual colors

**Effect**: Creates a large rounded panel for foreground content with `theme.panel` fill, subtle `theme.primary` border, soft shadow from `theme.background`, entrance opacity, and slight upward slide/scale-in motion.

**Use when**: a dedicated composition needs a stable content card or feature panel; multiple scenes share the same container treatment.

**Current examples**: scripted (wraps all scene types), spotlight (focused-card surface), stats-dashboard (full-frame report panel).

---

### Layouts

#### `CalloutGrid`

**Props**

- `callouts: string[]` — short text items (up to 4)
- `theme: RemotionTheme` — visual colors

**Effect**: Horizontal grid of short key messages (up to 4 equal columns), each with a top border alternating between `theme.primary` and `theme.secondary`.

**Use when**: a composition needs quick scan-friendly takeaways; a focused card needs 2-4 supporting points under a main headline.

**Current examples**: spotlight (bottom supporting-message row).

---

### Core Scenes

#### `TitleScene`

**Props**

- `title: string` — primary heading
- `subtitle?: string` — optional supporting line
- `kicker?: string` — optional label above heading
- `theme: RemotionTheme` — visual colors

**Effect**: Renders an optional `Kicker`, large 64px bold title, and optional subtitle in `theme.muted` color.

**Use when**: opening a segment, introducing a new section, presenting one strong idea with optional supporting copy.

**Historical example**: removed scripted-template runtime; retain the primitive itself.

---

#### `BulletScene`

**Props**

- `title: string` — scene heading
- `bullets?: string[]` — short list items
- `kicker?: string` — optional label above heading
- `theme: RemotionTheme` — visual colors

**Effect**: Renders optional `Kicker`, large heading, and short bullet lines below.

**Use when**: explaining a few key points, listing steps/benefits/reasons/takeaways.

**Historical example**: removed scripted-template runtime; retain the primitive itself.

---

#### `QuoteScene`

**Props**

- `quote: string` — quoted text
- `author?: string` — optional attribution
- `kicker?: string` — optional label above quote
- `theme: RemotionTheme` — visual colors

**Effect**: Renders optional `Kicker`, large quote block, and optional author line in `theme.secondary` color.

**Use when**: showing a testimonial, highlighting a memorable sentence, creating an emotional or reflective beat.

**Historical example**: removed scripted-template runtime; retain the primitive itself.

---

### Transitions

#### `useEntranceProgress`

**Parameters**

- `durationInFrames: number` — how long the entrance takes
- `damping?: number` — spring damping (default 200)

**Effect**: Returns a spring-driven progress value (0..1) for entrance animation. Keeps motion frame-driven through Remotion's `spring()`.

**Use when**: a composition needs deterministic entrance motion and several components should share the same entrance progress.

**Current examples**: scripted (`useEntranceProgress(Math.min(40, scene.duration))`), spotlight (`useEntranceProgress(38, 180)`).

---

#### `CrossDissolve`

**Props**

- `durationInFrames?: number` — optional override for dissolve length

**Effect**: Classic opacity dissolve between two full-frame scene nodes (Scene A fades out while Scene B fades in). Wraps children as `<SceneA>` and `<SceneB>`.

**Use when**: a simple crossfade between two scenes is needed.

---

### Backgrounds

Most background components are self-contained full-frame layers with no or minimal props. They read `useCurrentFrame()` and `useVideoConfig()` internally.

Notable typed backgrounds:

#### `GradientShiftBackground`

**Props**

- `colors?: [string, string, string, string]` — 4-color hex palette (default: blue-purple- teal-rose)
- No children; renders a full-frame animated gradient `<div>`

#### `MetaBallsPrimitive`

**Props**

- `animationSize?: number` — blob size (default 30)
- `color?: string` — metaball color (default "#ffffff")
- Uses WebGL/OGL shader; supports live cursor tracking via DOM events

---

### Charts

#### `BarChart`

**Props**

- `data?: BarChartDatum[]` — `{ label, value }` array
- `title?: string` — chart title (default "Monthly Performance")
- `subtitle?: string` — chart subtitle (default "Data visualization for 2023")
- `colors?: string[]` — bar color palette (default 6-color)
- `width?: number` — SVG width (default 900)
- `height?: number` — SVG height (default 500)

**Effect**: Animated SVG bar chart with staggered bar growth, value labels above bars, and prop-driven dimensions. Bars grow from bottom in sequence.

---

#### `LineChart`

**Props**

- `data?: LineChartDatum[]` — `{ label, value }` array
- `title?: string` — chart title (default "Revenue Growth")
- `lineColor?: string` — line stroke color
- `width?: number` — SVG width (default 900)
- `height?: number` — SVG height (default 500)
- `maxValue?: number` — y-axis maximum override

**Effect**: Animated SVG line chart with point markers, connecting line path drawn left-to-right, and labeled axes.

---

#### `DonutChart`

**Props**

- `segments?: DonutChartSegment[]` — `{ label, value, color? }` array
- `title?: string` — chart title (default "Completion Rate")
- `width?: number` — SVG width (default 600)
- `height?: number` — SVG height (default 520)
- `ringWidth?: number` — donut ring thickness
- `showLegend?: boolean` — toggle legend display (default true)

**Effect**: Animated SVG donut chart with segmented arc reveal, center summary text, legend, and prop-driven segment sizing/colors.

---

#### `AreaChart`

**Effect**: Animated SVG area chart with filled gradient region under the line path and left-to-right clip-reveal animation. Currently uses hardcoded data.

---

#### `PieChart`

**Effect**: Animated SVG pie chart with segment arc reveal from starting angle, color legend, percentage labels on segments.

---

#### `ComparisonChart`

**Effect**: Before/after side-by-side bar comparison with animated value labels, divider line, and category title.

---

#### `ProgressBars`

**Effect**: Horizontal stacked progress bars with label, percentage value, staggered fill animation, and glow per bar. Skills/scores display.

---

#### `StatCounter`

**Effect**: Spring-entrance stat display with count-up number animation, label, and optional positive/negative change indicator with color.

---

#### `CircularProgress`

**Effect**: Ring/radial progress indicator with animated fill arc stroke, loading rotation effect, and percentage text in center.

---

### Cinematic

#### `KenBurns`

**Props** (internal type)

- `imageUrl: string` — source image
- `direction?: "in" | "out"` — zoom direction
- `durationInFrames?: number` — custom duration override

**Effect**: Slow push-in or pull-out zoom on an image with easing; classic documentary pan-and-scan portrait-to-landscape effect.

---

#### `ParallaxPan`

**Props** (internal type)

- `imageUrl: string` — source image
- `direction?: "left-right" | "right-left" | "top-bottom" | "bottom-top"` — pan direction
- `pingPong?: boolean` — reverse direction on loop
- `durationInFrames?: number` — custom duration override

**Effect**: Directional parallax pan across an image with smooth easing and optional ping-pong loop.

---

#### `ZoomPulse`

**Props** (internal type)

- `imageUrl: string` — source image
- `amplitude?: number` — zoom oscillation range
- `durationInFrames?: number` — custom duration override

**Effect**: Gentle breathing zoom pulse on an image; oscillates between near and slightly closer scale.

---

### Logos

All logo components are self-contained full-frame treatments. They display a placeholder icon/logo shape with company name text and various entrance animations. None accept external image sources — they render inline SVG icons.

| Component          | Entrance Animation                      | Companion Text                    |
| ------------------ | --------------------------------------- | --------------------------------- |
| `LogoBlurReveal`   | Blur 20→0 + opacity 0.3→1               | Name appears after logo sharpens  |
| `LogoBounceDrop`   | Spring drop from above + squash/stretch | Name fades in after bounce        |
| `LogoFadeReveal`   | Spring fade + slight scale              | Name fades up with spring         |
| `LogoGlitchReveal` | RGB split glitch with decay             | Name fades in after glitch        |
| `LogoScaleRotate`  | Scale 0→1 + 360° rotation + spring      | Name slides up after settling     |
| `LogoSpinReveal`   | 3D spin with spring                     | Name slides up after spin         |
| `LogoSplitReveal`  | Left/right halves expand outward        | Name fades in                     |
| `LogoStrokeDraw`   | SVG stroke-dasharray draw               | Fill fades in after draw          |
| `LogoTypewriter`   | Icon spring scale                       | Typewriter text + blinking cursor |

All use `useCurrentFrame()` and `useVideoConfig()` internally.

---

### Media

| Component               | Layout             | Animation                     | Content                           |
| ----------------------- | ------------------ | ----------------------------- | --------------------------------- |
| `GalleryGrid`           | 6-cell (2×3) grid  | Staggered spring scale        | Gradient cards or images          |
| `ImageCarousel`         | Horizontal strip   | Translate rotation            | Gradient cards with labels        |
| `ImageComparisonSlider` | Left/right split   | Divider slide                 | Gradient panels with labels       |
| `ImageZoomReveal`       | Full-frame         | 2x→1x zoom + blur             | Image placeholder + title overlay |
| `MasonryGallery`        | 3-column masonry   | Staggered spring per column   | Color/gradient blocks             |
| `PhotoStack`            | Stacked fan layout | Staggered rotation + spring   | Card photos with labels           |
| `PictureInPicture`      | Large + PiP inset  | Spring PiP entrance           | Labeled panels                    |
| `PolaroidFrame`         | Frame + label area | Spring entrance               | Photo with white border           |
| `SplitScreen`           | Left/right 50/50   | Slide-in from edges + divider | Labeled panels                    |

Media components currently use gradient/solid-color placeholders rather than functional image URLs. They demonstrate spatial layout and entrance patterns. For production video, replace gradients with actual `<Img>` elements using `staticFile()` paths.

---

### Text Animation

| Component            | Technique                                                      | Layout                                |
| -------------------- | -------------------------------------------------------------- | ------------------------------------- |
| `AnimatedText`       | Character-by-character spring pop-in                           | Single horizontal line                |
| `BounceText`         | Line bounce + subtitle slide-up                                | Title/subtitle stacked                |
| `BubblePopText`      | Characters in circular bubbles with spring scale               | Horizontal bubble row                 |
| `FloatingBubbleText` | Bubbles float upward with spring stagger                       | Vertical floating stack               |
| `GlitchText`         | RGB offset layers with displacement                            | Single line with glitch artifacts     |
| `PoppingText`        | Per-character spring pop + custom colors + text-shadow outline | Horizontal, per-character color cycle |
| `PulsingText`        | Scale oscillation pulse + label fade                           | Icon + text side-by-side              |
| `SlideText`          | Title left-in + subtitle right-in with spring                  | Title/subtitle stacked                |
| `TypewriterSubtitle` | Character-by-character typing + blinking cursor                | Single line + accent bar              |

`PoppingText` is the only typed text component:

**PoppingText Props**

- `colors?: string[]` — per-character color cycle (default 6-color palette)
- Uses `useCurrentFrame()` and `useVideoConfig()` internally

---

### Scene Primitives (additional)

Beyond the core scripted scenes (TitleScene, BulletScene, QuoteScene), these self-contained scene components provide specialized visual treatments:

| Component             | Best For                       | Key Visual                        |
| --------------------- | ------------------------------ | --------------------------------- |
| `AnimatedList`        | Feature/bullet list with icons | Staggered spring left-slide       |
| `CardFlip`            | Interactive card reveal        | 3D Y-axis flip                    |
| `ChapterTitle`        | Section/part transitions       | Line + dot dividers + spring      |
| `CinematicTitleIntro` | Opening credits                | Underline bar + spring rise       |
| `CountdownIntro`      | Countdown before start         | Ring arc + number zoom            |
| `CountdownTimer`      | Live/remaining time display    | Digital flip animation            |
| `CreditsRoll`         | End credits                    | Vertical scroll                   |
| `EndCard`             | Video outro                    | Social icons + call-to-action     |
| `LowerThird`          | Name/title overlay             | Left slide with accent bar        |
| `NotificationPop`     | UI notification sequence       | Staggered card pop-in             |
| `ParticleExplosion`   | Emphatic reveal/burst          | Random particle scatter           |
| `ProgressSteps`       | Process/timeline flow          | Numbered steps + connecting lines |
| `QuoteCard`           | Testimonial highlight          | Accent bar + decorative quotes    |
| `RotatingCarousel`    | Feature/card overview          | 3D Y-axis carousel                |
| `SoundWave`           | Audio/music visualization      | Oscillating bars                  |
| `SubscribeReminder`   | Channel CTA                    | Bell icon + spring                |
| `TextHighlight`       | Sequential emphasis            | Underline sweep per word          |
| `TitleSplit`          | Dramatic title reveal          | Split-apart text                  |

---

### Transition Primitives (additional)

Each transition renders two scenes (A→B) with a specific animation. They follow a consistent pattern: Scene A is revealed underneath as Scene B animates away.

| Transition         | Mechanism                      | Feel           |
| ------------------ | ------------------------------ | -------------- |
| `BlindsTransition` | Horizontal strip flip          | Venetian blind |
| `ClockWipe`        | Radial rotation sweep          | Clock hand     |
| `FadeThroughBlack` | A fade out → black → B fade in | Fade to black  |
| `IrisTransition`   | Circular close → open          | Classic iris   |
| `MorphTransition`  | Scale + opacity cross          | Morph/blend    |
| `PushTransition`   | Horizontal spring slide        | Slide push     |
| `SlideWipe`        | Panel slides off-right         | Wipe reveal    |
| `ZoomThrough`      | Scale zoom cross               | Tunnel zoom    |

---

## Agent Producer Development Rule

Before adding or sourcing an equivalent visual, search the Agent-managed
reusable SVG/PNG/JPEG/WebP catalog with `producer:library:search`. Inspect
candidate semantics and preview as needed; the shortlist informs Agent creative
judgment and never mandates use. Record any selected active item in the future
composition's `ProducerAssetManifest`.

When adding a visual capability:

1. Reuse a primitive or Producer block when it fits the visual intent.
2. Otherwise implement the scene locally in the dedicated composition.
3. Promote only a stable, topic-independent responsibility after still/MP4
   evidence from real Producer work.
4. Update the primitive catalog, this reference, and a deterministic fixture
   when promotion is justified.

This keeps creative composition agent-owned without restoring a planner,
template registry, or universal scene schema.

## Adding A New Primitive

When adding a reusable Remotion primitive:

1. Put it under `src/remotion/primitives/`, grouped by role:
   `scenes/`, `elements/`, `transitions/`, or another clear runtime category.
2. Keep the component parameterized and topic-agnostic.
3. Use Remotion frame-driven APIs for motion.
4. Export it from `src/remotion/primitives/index.ts`.
5. Add an entry to the inventory table and detailed sections of this document
   describing its visual effect, props, and intended use.
6. Document when the Agent Producer should select it; do not expose it through
   a provider prompt or planner manifest.
