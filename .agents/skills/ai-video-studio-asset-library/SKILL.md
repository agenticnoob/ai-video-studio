---
name: ai-video-studio-asset-library
description: Use when working in /data/projects/labs/ai-video-studio to organize, inspect, admit, search, update, deprecate, validate, or rebuild the reusable SVG, PNG, JPEG, and WebP asset library.
---

# AI Video Studio Asset Library

Use this skill for reusable visual-asset admission and maintenance. It is not a
video-production workflow; `.agents/skills/ai-video-studio-agent-producer/`
owns video composition and consumes active library items.

Read `docs/PRODUCER_ASSET_CONTRACT.md` and
`public/assets/library/README.md` before changing the library. Use CodeGraph
before source dependency decisions.

## Boundary

- Support only SVG, PNG, JPEG, and WebP in v1.
- Keep the browser catalog read-only and local.
- Do not require prior composition use. Admission does not require prior
  composition use.
- Do not generate or repair images. Image understanding is allowed for
  classifying and describing user-supplied files.
- Keep creative scene selection outside this skill.
- Prefer `deprecated` over physical deletion.

## Inbox Intake

When the user provides an inbox directory, recursively inventory the requested
inbox batch. Read every description document and inspect every supported asset,
including nested files. One description may cover several assets and several
descriptions may contribute to one asset.

Resolve mappings from explicit references, filenames, directory proximity, and
supplied prose, and visually inspect assets with missing semantic facts. Fill one
canonical record per asset with title, description, subjects, keywords, roles,
recommended and avoided uses, style profiles/tags, colors, transparency, and
lifecycle.

Ask only when an important asset-to-description mapping or creative meaning is
genuinely ambiguous. Repository policy authorizes user-supplied inbox assets
for project use without attribution: the Agent must not ask for source, author,
license, rights, or attribution. Omit `source` from temporary inbox metadata so
the runtime applies its fixed machine-level `user-authorized` record.

Invoke one atomic `producer:library:ingest` operation per accepted asset. Never
move, delete, edit, or commit inbox originals. Report admitted, duplicate,
skipped, ambiguous, and failed outcomes per item.

## Commands

```bash
npm run producer:library:add -- --file <path> --metadata <asset-json>
npm run producer:library:ingest -- --file .producer-assets/library-inbox/<file> --metadata <asset-json>
npm run producer:library:validate
npm run producer:library:list -- --json
npm run producer:library:search -- --text <intent> --json
npm run producer:library:update -- --id <asset-id> --metadata <patch-json>
npm run producer:library:deprecate -- --id <asset-id> --reason <reason>
npm run producer:library:build -- --check
```

Use `add` for Agent-authored SVG or explicit local/URL imports with their real
source facts. Use `ingest` only for files inside the ignored inbox. Every
mutation must pass staged validation and atomic publication; never edit
`asset.json`, `catalog.json`, or `index.html` manually.

After changes, run:

```bash
npm run smoke:producer-asset-library
npm run producer:library:validate
npm run producer:library:build -- --check
git diff --check
```

Do not modify frozen compositions or backfill historical manifests.
