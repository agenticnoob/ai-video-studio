/* global console */

const { parseTemplateImplementationToolCallArguments } =
  await import("../src/lib/deepseek/parse-template-implementation.js");

const fail = (message) => {
  throw new Error(message);
};

const createImplementation = () => ({
  meta: {
    title: "Preview full cut",
    fps: 30,
    width: 1280,
    height: 720,
  },
  theme: {
    background: "#0f172a",
    panel: "#1e293b",
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    text: "#f1f5f9",
    muted: "#64748b",
  },
  durationInFrames: 900,
  title: "Preview full cut",
  sections: [
    {
      id: "opening",
      recipeId: "hero-title-reveal",
      title: "Opening",
      durationInFrames: 999,
      primaryText: "Generate the full cut",
      secondaryText: "Provider drift should not break the compiler.",
    },
    {
      id: "product",
      recipeId: "product-ui-zoom",
      title: "Product detail",
      durationInFrames: 12,
      fallbackSummary: "Show the uploaded product screenshot once available.",
    },
  ],
});

const parseTechnicalExplainer = (value) =>
  parseTemplateImplementationToolCallArguments(JSON.stringify(value), "technical-explainer");

const assertSectionDuration = (implementation, index, expectedDuration) => {
  const section = implementation.sections[index];
  if (section?.durationInFrames !== expectedDuration) {
    fail(
      `Expected section ${index} duration ${expectedDuration}, received ${String(
        section?.durationInFrames,
      )}`,
    );
  }
};

const rawImplementation = createImplementation();
const parsedImplementation = parseTechnicalExplainer(rawImplementation);
assertSectionDuration(parsedImplementation, 0, 420);
assertSectionDuration(parsedImplementation, 1, 45);

if (rawImplementation.sections[0].durationInFrames !== 999) {
  fail("Boundary normalization must not mutate the raw provider implementation.");
}

const wrappedImplementation = parseTechnicalExplainer({
  implementation: createImplementation(),
});
assertSectionDuration(wrappedImplementation, 0, 420);
assertSectionDuration(wrappedImplementation, 1, 45);

console.log("template implementation boundary smoke passed");
