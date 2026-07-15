# SRC/LIB KNOWLEDGE BASE

## OVERVIEW

Phase 3 removed the Web product domain and server utilities from `src/lib`.
This directory now contains only narrow frozen-composition compatibility
contracts. It is not a future Agent Producer extension point.

## RETAINED FILES

| File | Ownership |
| --- | --- |
| `caption-schema.ts` | Historical caption schema imported by frozen composition types. |
| `storyboard-plan-schema.ts` | Minimal frozen storyboard metadata parser/types. |
| `template-registry.ts` | Literal historical template ids required by the parser and frozen scripts. |

Future captions live in
`src/remotion/standalone-video/caption-types.ts`. Future narration lives in
`scripts/lib/producer-audio/`.

## CONVENTIONS

- Keep these compatibility files free of `src/templates`, provider, prompt,
  editor, project, render, and API imports.
- Do not broaden them to support new workflows.
- Do not modify frozen composition callers merely to remove historical names.
- Put new Producer runtime contracts under the owning Producer/Remotion path.

## VALIDATION

```bash
npm run smoke:agent-producer-web-removal
npm run smoke:agent-producer-architecture
docker compose run --rm producer bash -lc 'npx tsc --noEmit --pretty false'
```
