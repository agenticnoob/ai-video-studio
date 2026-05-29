# Product architecture notes

Intent: build a local-first AI video generation workbench.

Core loop:
1. user writes a brief
2. LLM returns structured JSON
3. UI binds JSON to editable controls
4. Remotion Player previews output
5. user tweaks parameters
6. render endpoint exports final video

Suggested next implementation tasks:
- add `VideoProjectSchema` with scene-level props
- replace the single text input with a multi-panel editor
- add `/api/generate` for prompt -> JSON
- split preview-safe draft state from final render state
- add saved presets / draft files under a local project workspace
