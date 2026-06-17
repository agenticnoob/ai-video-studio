/* global console, process, URL */

import { readFile } from "node:fs/promises";

const readSource = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const assertIncludes = (source, needle, label) => {
  if (!source.includes(needle)) {
    throw new Error(`${label} expected to include ${needle}`);
  }
};

const main = async () => {
  const [pageSource, hookSource, panelSource, packageSource] = await Promise.all([
    readSource("src/app/page.tsx"),
    readSource("src/helpers/use-visual-review.ts"),
    readSource("src/components/project/VisualReviewPanel.tsx"),
    readSource("package.json"),
  ]);

  assertIncludes(pageSource, "VisualReviewPanel", "Studio page");
  assertIncludes(pageSource, "useVisualReview", "Studio page");
  assertIncludes(hookSource, 'fetch("/api/visual-review/stills"', "Visual review hook");
  assertIncludes(hookSource, "createProgressId", "Visual review hook");
  assertIncludes(panelSource, "视觉复核", "Visual review panel");
  assertIncludes(panelSource, "ActivityProgress", "Visual review panel");
  assertIncludes(panelSource, "downloadUrl", "Visual review panel");
  assertIncludes(panelSource, 'from "next/image"', "Visual review panel");
  assertIncludes(panelSource, "Image", "Visual review panel");
  assertIncludes(packageSource, "smoke:visual-review-ui", "package scripts");

  console.log("Visual review UI source smoke passed.");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
