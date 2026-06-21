/* global console, process, URL */

import { readFile } from "node:fs/promises";

const readSource = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const assertIncludes = (source, needle, label) => {
  if (!source.includes(needle)) {
    throw new Error(`${label} expected to include ${needle}`);
  }
};

const assertNotIncludes = (source, needle, label) => {
  if (source.includes(needle)) {
    throw new Error(`${label} expected not to include ${needle}`);
  }
};

const normalizeWhitespace = (source) => source.replace(/\s+/g, " ");

const assertIncludesNormalized = (source, needle, label) => {
  if (!normalizeWhitespace(source).includes(needle)) {
    throw new Error(`${label} expected to include ${needle}`);
  }
};

const sourceSlice = (source, startNeedle, endNeedle, label) => {
  const start = source.indexOf(startNeedle);
  if (start < 0) {
    throw new Error(`${label} expected to find ${startNeedle}`);
  }

  const end = endNeedle ? source.indexOf(endNeedle, start + startNeedle.length) : -1;
  return source.slice(start, end < 0 ? undefined : end);
};

const main = async () => {
  const [agentNotesSource, patternDocsSource, readmeSource, remotionRootSource, fixturesSource] =
    await Promise.all([
      readSource("AGENTS.md"),
      readSource("docs/REMOTION_GENERATION_PATTERNS.md"),
      readSource("README.md"),
      readSource("src/remotion/Root.tsx"),
      readSource("src/lib/staged-smoke-fixtures.ts"),
    ]);

  assertIncludes(remotionRootSource, 'id="ProjectVideo"', "Remotion root");
  assertIncludes(remotionRootSource, 'id="SceneGraphTemplatePreview"', "Remotion root");
  assertIncludes(remotionRootSource, 'id="NodeGraphFlowDensePreview"', "Remotion root");

  const previewNarrationBody = sourceSlice(
    fixturesSource,
    "const previewNarrationFromAsset",
    "const templateMacroStrategyDecision",
    "Preview narration helper",
  );
  assertIncludes(previewNarrationBody, "captions: narration.captions", "Preview narration helper");
  assertNotIncludes(previewNarrationBody, "audio:", "Preview narration helper");
  assertNotIncludes(previewNarrationBody, "audioSrc", "Preview narration helper");

  const densePreviewFixture = sourceSlice(
    fixturesSource,
    "export const nodeGraphFlowDensePreviewProject",
    "const proceduralGeneratorPlannedSegment",
    "Node graph dense preview fixture",
  );
  assertIncludes(
    densePreviewFixture,
    "narration: previewNarrationFromAsset",
    "Node graph dense preview fixture",
  );
  assertNotIncludes(
    densePreviewFixture,
    "narration: segmentNarrationFromAsset",
    "Node graph dense preview fixture",
  );

  const sceneGraphPreviewFixture = sourceSlice(
    fixturesSource,
    "const sceneGraphSegments",
    "export const sceneGraphSmokeProject",
    "Scene graph preview fixture",
  );
  assertIncludes(
    sceneGraphPreviewFixture,
    "narration: previewNarrationFromAsset",
    "Scene graph preview fixture",
  );
  assertNotIncludes(
    sceneGraphPreviewFixture,
    "narration: segmentNarrationFromAsset",
    "Scene graph preview fixture",
  );

  for (const source of [agentNotesSource, patternDocsSource, readmeSource]) {
    assertIncludes(source, "UnsupportedInputFormatError", "Remotion preview docs");
    assertIncludesNormalized(source, "placeholder narration audio", "Remotion preview docs");
    assertIncludes(source, "smoke:remotion-preview", "Remotion preview docs");
  }

  console.log("Remotion preview source smoke passed.");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
