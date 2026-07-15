# Producer Sample Scaffold

Copy `SampleName/` to `src/remotion/<SampleName>/` when starting a maintained Agent Producer sample.
After copying, update scaffold-relative imports so they point from the new
sample folder to `../standalone-video` and its Producer-owned `caption-types` contract.

The committed sample folder should contain:

- `index.ts`
- `<SampleName>.tsx`
- `types.ts`
- `script.ts`
- `data.ts`
- `audio.generated.ts` or another committed metadata file when the sample needs generated narration metadata
- `generate.mjs` using the shared `scripts/lib/producer-audio/` functions
- `validation.ts` exporting `producerValidationInput`

Do not copy a completed sample's TTS request, duration, metadata, or validation
logic. Adapt the scaffold's `generate.mjs` and `validation.ts` instead.

Generated screenshots, generated narration audio, and rendered videos stay local-only:

- `public/generated/<slug>/`
- `out/`

Do not commit generated screenshots, audio, or mp4 files unless the user explicitly asks.

After the sample is renderable and maintained, add a manifest entry in `src/remotion/producer-samples/registry.ts`, register the composition in `src/remotion/Root.tsx`, and add a focused smoke script.

Then run:

```bash
npm run producer:validate -- --module <compiled-validation-module>
npm run producer:stills -- --composition <composition-id>
```

Use `--dry-run` with `producer:stills` when reviewing the planned commands
before invoking Remotion. These commands validate mechanical contracts and
render declared review frames; the Agent must still inspect the actual audio,
stills, and MP4 and make creative revisions.
