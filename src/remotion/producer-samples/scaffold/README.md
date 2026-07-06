# Producer Sample Scaffold

Copy `SampleName/` to `src/remotion/<SampleName>/` when starting a maintained Agent Producer sample.
After copying, update scaffold-relative imports so they point from the new
sample folder to `../standalone-video` and `../../lib/caption-schema`.

The committed sample folder should contain:

- `index.ts`
- `<SampleName>.tsx`
- `types.ts`
- `script.ts`
- `data.ts`
- `audio.generated.ts` or another committed metadata file when the sample needs generated narration metadata

Generated screenshots, generated narration audio, and rendered videos stay local-only:

- `public/generated/<slug>/`
- `out/`

Do not commit generated screenshots, audio, or mp4 files unless the user explicitly asks.

After the sample is renderable and maintained, add a manifest entry in `src/remotion/producer-samples/registry.ts`, register the composition in `src/remotion/Root.tsx`, and add a focused smoke script.
