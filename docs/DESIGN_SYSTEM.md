# AI Video Studio Design System

## 1. Atmosphere & Identity

AI Video Studio should feel like a technical production bench: precise, visual, and ready to render. The signature is "evidence in motion": dense technical facts become clear scenes with screenshot-like panels, terminal surfaces, and narrated visual proof. The product should avoid generic SaaS decoration and make every visual choice serve the generated video subject.

## 2. Color

### Palette

| Role              | Token               | Light   | Dark    | Usage                           |
| ----------------- | ------------------- | ------- | ------- | ------------------------------- |
| Surface/primary   | --surface-primary   | #f8fafc | #06111f | Video and app background        |
| Surface/secondary | --surface-secondary | #e2e8f0 | #0d1b2f | Panels, cards, code areas       |
| Surface/elevated  | --surface-elevated  | #ffffff | #14243b | Raised visual blocks            |
| Text/primary      | --text-primary      | #0f172a | #f8fafc | Headlines and body              |
| Text/secondary    | --text-secondary    | #475569 | #b7c4d8 | Supporting copy                 |
| Text/tertiary     | --text-tertiary     | #64748b | #7f8ea3 | Captions and labels             |
| Border/default    | --border-default    | #cbd5e1 | #28405d | Panel outlines                  |
| Border/subtle     | --border-subtle     | #e2e8f0 | #1d314b | Soft dividers                   |
| Accent/primary    | --accent-primary    | #2563eb | #5eead4 | Primary focus and visual routes |
| Accent/secondary  | --accent-secondary  | #7c3aed | #a78bfa | Secondary emphasis              |
| Accent/warm       | --accent-warm       | #d97706 | #f59e0b | Highlights, command status      |
| Status/success    | --status-success    | #16a34a | #22c55e | Positive states                 |
| Status/error      | --status-error      | #dc2626 | #fb7185 | Loss, removal, warnings         |

### Rules

- Video surfaces default to dark mode.
- Use accent colors as semantic guides: teal for pixel/visual retrieval, violet for model/embedding, amber for commands or evidence.
- Avoid single-hue blue or purple dominance; at least one cool and one warm accent should appear in technical video scenes.

## 3. Typography

### Scale

| Level         | Size | Weight | Line Height | Tracking | Usage                       |
| ------------- | ---- | ------ | ----------- | -------- | --------------------------- |
| Video/display | 72px | 900    | 0.98        | 0        | Main video thesis           |
| Video/h1      | 48px | 900    | 1.04        | 0        | Scene title                 |
| Video/h2      | 38px | 850    | 1.08        | 0        | Panel headline              |
| Body/lg       | 24px | 650    | 1.32        | 0        | Video narration support     |
| Body          | 18px | 600    | 1.4         | 0        | Labels, cards               |
| Caption       | 14px | 700    | 1.35        | 0        | Technical metadata          |
| Mono/code     | 18px | 700    | 1.45        | 0        | Commands and code-like data |

### Font Stack

- Primary: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- Mono: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace

### Rules

- Video text uses no negative letter spacing.
- Monospace is for commands, APIs, file names, and pipeline tokens, not decorative headings.
- Long technical phrases should be split across labels and supporting copy instead of shrinking below readable size.

## 4. Spacing & Layout

### Base Unit

All spacing derives from 4px.

| Token      | Value | Usage                        |
| ---------- | ----- | ---------------------------- |
| --space-2  | 8px   | Tight inline groups          |
| --space-3  | 12px  | Chips and compact labels     |
| --space-4  | 16px  | Default inner rhythm         |
| --space-6  | 24px  | Panel padding                |
| --space-8  | 32px  | Scene blocks                 |
| --space-10 | 40px  | Major group separation       |
| --space-12 | 48px  | Video section top rhythm     |
| --space-16 | 64px  | Full scene padding           |
| --space-20 | 80px  | Wide video safe-area padding |

### Grid

- Video canvas: 1280x720, 30fps, 16:9.
- Default video safe area: 80px horizontal, 64px vertical.
- Split scenes use a 430px explanatory column plus a flexible evidence panel.

### Rules

- Fixed-format video elements need explicit dimensions to prevent layout jumps.
- Captions live outside the lower 96px of visual-heavy scenes.

### Content-First Scene Grammar

- Perform content-first visual review before implementation: record the subject,
  action or change, shot language, intended meaning, and distinct silhouette.
- A paused frame must communicate its event without asking the caption to act
  as the picture.
- Adjacent scenes use distinct primary composition unless repetition is a
  deliberate comparison. Style profiles define production language, not a
  storyboard template.
- Review every scene and each meaning-changing early/middle/late state. Covers
  use a topic-specific focal metaphor, centered safe whitespace, and separate
  full-size plus thumbnail checks for 16:9 and 9:16.

## 5. Components

### Technical Video Scene

- **Structure**: full-bleed scene background, one thesis/title region, one evidence region.
- **Variants**: hero, contrast, workflow, terminal, metric, architecture, timeline.
- **Spacing**: scene safe area uses --space-16 and --space-20.
- **Motion**: Remotion frame-driven `transform`, `opacity`, and `filter` only.

### Evidence Panel

- **Structure**: elevated dark panel with subtle border, typed labels, and one dominant artifact.
- **Variants**: screenshot tile, terminal, table, pipeline map.
- **Spacing**: --space-6 inner padding, --space-8 between repeated panels.
- **Motion**: panels enter as grouped objects, not independent decorative pieces.

## 6. Motion & Interaction

### Timing

| Type           | Duration      | Easing                        | Usage                     |
| -------------- | ------------- | ----------------------------- | ------------------------- |
| Micro          | 100-150ms     | ease-out                      | UI controls               |
| Standard       | 200-300ms     | ease-in-out                   | Editor state changes      |
| Video reveal   | 24-48 frames  | cubic-bezier(0.16, 1, 0.3, 1) | Scene object entrance     |
| Video emphasis | 60-120 frames | cubic-bezier(0.16, 1, 0.3, 1) | Zoom, route, or key claim |

### Rules

- Render-critical motion uses Remotion APIs and frame math only.
- CSS transitions, CSS animations, and Tailwind animation utilities are not used for video timing.
- Narration/TTS duration owns segment duration; visuals adapt to audio, not the reverse.

## 7. Depth & Surface

### Strategy

Mixed: tonal-shift plus subtle borders, with shadows only for video evidence panels.

| Level          | Value                           | Usage                   |
| -------------- | ------------------------------- | ----------------------- |
| Subtle border  | 1px solid var(--border-subtle)  | Soft panel separation   |
| Default border | 1px solid var(--border-default) | Evidence panel boundary |
| Video shadow   | 0 30px 90px rgba(0,0,0,0.36)    | Main evidence panel     |

Depth should suggest layered technical artifacts, not decorative cards.
