import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

/* global console */

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const assertIgnoredPath = (path) => {
  try {
    execFileSync("git", ["check-ignore", "-q", path], { stdio: "ignore" });
  } catch {
    throw new Error(`${path} must stay ignored by Git for local-only producer artifacts.`);
  }
};

const evidenceLensModule = await import("../src/remotion/producer-samples/evidence-lens/index.js");
const indexSource = readFileSync("src/remotion/producer-samples/evidence-lens/index.ts", "utf8");
const componentSource = readFileSync(
  "src/remotion/producer-samples/evidence-lens/evidence-lens.tsx",
  "utf8",
);
const typesSource = readFileSync("src/remotion/producer-samples/evidence-lens/types.ts", "utf8");

assert(
  typeof evidenceLensModule.EvidenceScreenshotBackdrop === "function",
  "Evidence Lens should export EvidenceScreenshotBackdrop.",
);
assert(
  typeof evidenceLensModule.EvidenceOverlayPanel === "function",
  "Evidence Lens should export EvidenceOverlayPanel.",
);
assert(
  indexSource.includes("export type") && indexSource.includes("ScreenshotFocus"),
  "Evidence Lens should export the shared ScreenshotFocus type.",
);
assert(
  typesSource.includes("readonly targetDescription: string"),
  "ScreenshotFocus should name the visual claim target.",
);
assert(
  typesSource.includes("readonly zoomInFrame: number") &&
    typesSource.includes("readonly zoomHoldFrame: number") &&
    typesSource.includes("readonly zoomOutFrame: number"),
  "ScreenshotFocus should model zoom-in, hold, and return timing.",
);
assert(
  componentSource.includes("staticFile(asset.src)"),
  "EvidenceScreenshotBackdrop should resolve public screenshots through staticFile().",
);
assert(
  componentSource.includes("scale: interpolate("),
  "EvidenceScreenshotBackdrop should use frame-driven Remotion scale interpolation.",
);
assert(
  componentSource.includes("translate: `${interpolate("),
  "EvidenceScreenshotBackdrop should use frame-driven Remotion pan interpolation.",
);
assert(
  componentSource.includes("readableScreenshotFilter"),
  "EvidenceScreenshotBackdrop should keep screenshots readable with a local filter contract.",
);
assert(
  componentSource.includes("linear-gradient(90deg, rgba(7,19,15,0.22)") &&
    componentSource.includes("boxShadow: \"inset 0 0 90px rgba(0,0,0,0.34)\""),
  "EvidenceScreenshotBackdrop should keep the existing light vignette treatment.",
);
assert(
  componentSource.includes("background: \"rgba(6, 18, 14, 0.58)\""),
  "EvidenceOverlayPanel should keep the compact translucent proof-panel treatment.",
);
assert(
  componentSource.includes("backdropFilter: \"blur(2px)\""),
  "EvidenceOverlayPanel should blur only the local panel background.",
);
assert(
  componentSource.includes("useCurrentFrame()") && componentSource.includes("interpolate("),
  "Evidence Lens should remain frame-driven Remotion code.",
);
assert(
  !componentSource.includes("animation:") && !componentSource.includes("transition:"),
  "Evidence Lens should not use CSS animation or transition styles.",
);

assertIgnoredPath("public/generated/");
assertIgnoredPath("out/");
assert(existsSync("src/remotion/producer-samples/evidence-lens"), "Evidence Lens folder is missing.");

console.log("Evidence Lens smoke passed.");
