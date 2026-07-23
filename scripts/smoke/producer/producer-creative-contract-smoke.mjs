#!/usr/bin/env node
/* global console, process */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");

const contractPath = "src/remotion/producer-samples/creative-contract.ts";
const intentPath = "src/remotion/producer-samples/scaffold/SampleName/visual-intent.ts";

for (const relativePath of [contractPath, intentPath]) {
  assert(
    existsSync(path.join(root, relativePath)),
    `Missing creative-contract surface: ${relativePath}`,
  );
}

const contract = read(contractPath);
const manifest = read("src/remotion/producer-samples/manifest.ts");
const validation = read("scripts/lib/producer-validation.ts");
const scaffoldRenderer = read("src/remotion/producer-samples/scaffold/SampleName/SampleName.tsx");
const scaffoldManifest = read("src/remotion/producer-samples/scaffold/SampleName/manifest.ts");
const scaffoldValidation = read("src/remotion/producer-samples/scaffold/SampleName/validation.ts");
const packageJson = JSON.parse(read("package.json"));

for (const token of [
  "ProducerVisualIntent",
  "validateProducerVisualIntents",
  "validateProducerSourceBoundary",
]) {
  assert(contract.includes(token), `Creative contract is missing ${token}.`);
}

for (const token of [
  "CreativelyGatedMaintainedProducerSampleManifest",
  "creativeContract",
  "visualIntentModule",
  "rendererSourcePath",
]) {
  assert(manifest.includes(token), `Producer manifest is missing ${token}.`);
}

for (const token of [
  "visualIntentSource",
  "readRendererSource",
  "validateProducerVisualIntents",
  "validateProducerSourceGraph",
]) {
  assert(validation.includes(token), `Producer validation is missing ${token}.`);
}

for (const token of [
  "visual-intent.ts",
  "creativeContract",
  "CreativelyGatedMaintainedProducerSampleManifest",
]) {
  assert(scaffoldManifest.includes(token), `Future scaffold manifest is missing ${token}.`);
}

for (const token of ["producerVisualIntents", "visualIntentSource", "sampleNameData.scenes"]) {
  assert(scaffoldValidation.includes(token), `Future scaffold validation is missing ${token}.`);
}

assert(
  !scaffoldRenderer.includes("<h1"),
  "Future scaffold must not ship a repeated centered title-card layout.",
);
assert(
  !scaffoldRenderer.includes("renderScene={(scene) => <Scene"),
  "Future scaffold must not ship one repeated Scene component.",
);
assert(
  scaffoldRenderer.includes("switch (scene.id)"),
  "Future scaffold must route beats to explicit scene components.",
);
assert(
  packageJson.scripts["smoke:producer-creative-contract"],
  "package.json must expose smoke:producer-creative-contract.",
);

const buildRoot = process.env.PRODUCER_CREATIVE_CONTRACT_BUILD_DIR;
if (buildRoot) {
  const {
    validateProducerSourceBoundary,
    validateProducerSourceGraph,
    validateProducerVisualIntents,
  } = await import(path.join(buildRoot, "src/remotion/producer-samples/creative-contract.js"));

  const validIntents = [
    {
      sceneId: "open",
      subject: "A packet entering a network",
      action: "The packet crosses the first boundary",
      shotLanguage: "Wide route-establishing shot",
      intendedMeaning: "The journey starts outside the destination",
      primaryComposition: "left-to-right-route",
      silhouette: "single-node-to-network",
      renderMode: "code-led",
      selectedCapabilities: ["directional-slide"],
      reviewStatus: "approved",
    },
    {
      sceneId: "proof",
      subject: "Resolver evidence",
      action: "The resolver fans out through authoritative layers",
      shotLanguage: "Top-down branching diagram",
      intendedMeaning: "Resolution is a sequence of delegated lookups",
      primaryComposition: "radial-delegation-map",
      silhouette: "center-node-with-branches",
      renderMode: "hybrid",
      selectedCapabilities: ["paper-grain", "fitProducerText"],
      reviewStatus: "approved",
    },
  ];

  assert.doesNotThrow(() =>
    validateProducerVisualIntents({
      compositionId: "FutureVideo",
      sceneIds: ["open", "proof"],
      intents: validIntents,
    }),
  );
  assert.throws(
    () =>
      validateProducerVisualIntents({
        compositionId: "FutureVideo",
        sceneIds: ["open", "proof"],
        intents: validIntents.slice(0, 1),
      }),
    /visual intent ids must exactly match scene ids/u,
  );
  assert.throws(
    () =>
      validateProducerVisualIntents({
        compositionId: "FutureVideo",
        sceneIds: ["open", "proof"],
        intents: [
          validIntents[0],
          {
            ...validIntents[1],
            primaryComposition: validIntents[0].primaryComposition,
          },
        ],
      }),
    /adjacent primary composition/u,
  );
  assert.throws(
    () =>
      validateProducerVisualIntents({
        compositionId: "FutureVideo",
        sceneIds: ["open", "proof"],
        intents: [
          validIntents[0],
          {
            ...validIntents[1],
            intentionalComparison: true,
            primaryComposition: `${validIntents[0].primaryComposition.toUpperCase()} `,
          },
        ],
      }),
    /adjacent primary composition/u,
  );
  assert.doesNotThrow(() =>
    validateProducerVisualIntents({
      compositionId: "FutureVideo",
      sceneIds: ["open", "proof"],
      intents: [
        { ...validIntents[0], intentionalComparison: true },
        {
          ...validIntents[1],
          intentionalComparison: true,
          primaryComposition: validIntents[0].primaryComposition,
          silhouette: validIntents[0].silhouette,
        },
      ],
    }),
  );
  assert.throws(
    () =>
      validateProducerVisualIntents({
        compositionId: "FutureVideo",
        sceneIds: ["open", "proof"],
        intents: [{ ...validIntents[0], reviewStatus: "draft" }, validIntents[1]],
      }),
    /must be explicitly approved/u,
  );
  assert.throws(
    () =>
      validateProducerVisualIntents({
        compositionId: "FutureVideo",
        sceneIds: ["open", "proof"],
        intents: [
          {
            ...validIntents[0],
            subject: "Replace with a real subject",
          },
          validIntents[1],
        ],
      }),
    /still contains scaffold placeholder text/u,
  );

  assert.doesNotThrow(() =>
    validateProducerSourceBoundary({
      compositionId: "FutureVideo",
      rendererPath: "src/remotion/FutureVideo/FutureVideo.tsx",
      source:
        'import {AbsoluteFill} from "remotion";\nimport {fitProducerText} from "../styles";\nimport {data} from "./data";',
    }),
  );
  assert.throws(
    () =>
      validateProducerSourceBoundary({
        compositionId: "FutureVideo",
        rendererPath: "src/remotion/FutureVideo/FutureVideo.tsx",
        source: 'import {OldScene} from "../DnsResolutionExplainer/DnsResolutionExplainer";',
      }),
    /must not import dedicated composition source/u,
  );
  assert.throws(
    () =>
      validateProducerSourceBoundary({
        compositionId: "FutureVideo",
        rendererPath: "src/remotion/FutureVideo/FutureVideo.tsx",
        source: "const OldScene = import(`../DnsResolutionExplainer/DnsResolutionExplainer`);",
      }),
    /must not import dedicated composition source/u,
  );
  assert.throws(
    () =>
      validateProducerSourceBoundary({
        compositionId: "FutureVideo",
        rendererPath: "src/remotion/FutureVideo/FutureVideo.tsx",
        source: "const Scene = import(sceneModulePath);",
      }),
    /must use a static string literal/u,
  );
  assert.throws(
    () =>
      validateProducerSourceBoundary({
        compositionId: "FutureVideo",
        rendererPath: "src/remotion/FutureVideo/FutureVideo.tsx",
        source:
          'import type {DnsResolutionExplainerProps} from "../DnsResolutionExplainer/DnsResolutionExplainer";',
      }),
    /must not import dedicated composition source/u,
  );
  assert.throws(
    () =>
      validateProducerSourceBoundary({
        compositionId: "FutureVideo",
        rendererPath: "src/remotion/FutureVideo/FutureVideo.tsx",
        source:
          'import {OldScene} from "src/remotion/DnsResolutionExplainer/DnsResolutionExplainer";',
      }),
    /must not import dedicated composition source/u,
  );
  assert.throws(
    () =>
      validateProducerSourceBoundary({
        compositionId: "FutureVideo",
        rendererPath: "src/remotion/FutureVideo/FutureVideo.tsx",
        source: 'const OldScene = require("../DnsResolutionExplainer/DnsResolutionExplainer");',
      }),
    /must not import dedicated composition source/u,
  );
  const indirectSources = new Map([
    [
      "src/remotion/FutureVideo/FutureVideo.tsx",
      'import {Scene} from "./scenes"; export const FutureVideo = Scene;',
    ],
    [
      "src/remotion/FutureVideo/scenes.tsx",
      'export {DnsResolutionExplainer as Scene} from "../DnsResolutionExplainer/DnsResolutionExplainer";',
    ],
  ]);
  await assert.rejects(
    () =>
      validateProducerSourceGraph({
        compositionId: "FutureVideo",
        rendererPath: "src/remotion/FutureVideo/FutureVideo.tsx",
        readSource: async (sourcePath) => indirectSources.get(sourcePath),
      }),
    /must not import dedicated composition source/u,
  );
  const absoluteIndirectSources = new Map([
    [
      "src/remotion/FutureVideo/FutureVideo.tsx",
      'import {Scene} from "src/remotion/FutureVideo/scenes"; export const FutureVideo = Scene;',
    ],
    [
      "src/remotion/FutureVideo/scenes.tsx",
      'export {DnsResolutionExplainer as Scene} from "../DnsResolutionExplainer/DnsResolutionExplainer";',
    ],
  ]);
  await assert.rejects(
    () =>
      validateProducerSourceGraph({
        compositionId: "FutureVideo",
        rendererPath: "src/remotion/FutureVideo/FutureVideo.tsx",
        readSource: async (sourcePath) => absoluteIndirectSources.get(sourcePath),
      }),
    /must not import dedicated composition source/u,
  );
}

console.warn("Producer creative contract smoke passed.");
