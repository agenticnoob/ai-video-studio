# Production Brief — AiDailyNews20260719

## Audience & Publishing Surface
- **Audience**: Chinese AI engineers, developers, and tech decision-makers
- **Aspect ratio**: 16:9 (1920×1080), landscape
- **Duration target**: ~5 minutes (~9,000 frames @ 30fps)
- **Language**: Chinese (zh-CN)
- **Content family**: trend-briefing — AI daily news roundup

## Style Profile
- **Profile**: `hand-drawn-explainer`
- **Palette**: Paper background (#f4ead5), warm surface (#fff8e8), dark ink (#292624), muted (#746b61), accent (#e7573f), secondary (#287f8f)
- **Effect**: `paper-grain` (medium intensity)
- **Transition**: `directional-slide` (12–20 frames)
- **Motion**: `icon-trail` — sequential reveal arrows and marks
- **Captions**: bottom-safe, center-aligned, warm paper strip with dark ink and marker underline
- **Sound**: organic plucks and drawn marks, pencil SFX, paper turns

## Narration
- **Provider**: VoxCPM (direct Producer runtime)
- **Mode**: `high-fidelity-clone` (LYY default — non-science content)
- **Reference**: `voices/clone/lyy.wav` + `voices/clone/lyy.txt` + `voices/clone/lyy-r.wav`
- **Policy**: narration required; fail closed on errors

## Content
- **Date**: 2026-07-19 (weekend edition covering past 24–48 hours)
- **Sections**:
  1. Opening thesis — AI industry shifting from model competition to 4 competitive layers
  2. Meta & Anthropic $10B compute deal
  3. Capital One open-sources VulnHunter
  4. Kimi K3 — 2.8T parameter open-weight model
  5. Australia AI regulation — limiting government automated AI decisions
  6. Databricks $188B valuation
  7. Csquare IPO — $1.05B but below target pricing
  8. Trend summary matrix
  9. Closing — developer signals
- Excluded: Chinese politics, leadership activities, diplomatic content

## Assets
- Code-driven visuals only (SVG diagrams, hand-drawn annotations, paper textures)
- No image/video generation, no stock media, no screenshots
- SVG diagrams created inline where needed

## Deliverables
- `AiDailyNews20260719` Remotion composition (1920×1080, 30fps)
- Direct VoxCPM narration (9 tracks, high-fidelity-clone)
- `producer:stills` review frames
- H.264/AAC MP4 render
- 16:9 cover (1920×1080 Still)
- 9:16 cover (1080×1920 Still)
- Publishing notes