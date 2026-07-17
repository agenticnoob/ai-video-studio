/* global console */
import assert from "node:assert/strict";
import { fixtureProducerValidationInput } from "./fixtures/producer-tools/fixture-config.js";
import { validateProducerSample } from "./lib/producer-validation.js";

const validate = (overrides = {}) =>
  validateProducerSample({
    ...fixtureProducerValidationInput,
    isIgnoredPath: async () => true,
    ...overrides,
  });

const maintainedAssetManifest = {
  version: 1,
  compositionId: "FixtureProducerVideo",
  slug: "fixture-producer-video",
  assets: [
    {
      id: "narration-audio",
      kind: "audio",
      localPath: "public/generated/fixture-producer-video/assets/narration.wav",
      purpose: "Fixture narration.",
      source: { provider: "voxcpm", license: "producer-generated-local" },
      integrity: { sha256: "a".repeat(64), sizeInBytes: 1 },
      media: { durationInSeconds: 1, sampleRate: 48000, codec: "pcm_s16le" },
      sound: { role: "narration", maxAllowedPeakDb: -1, maxSilenceSeconds: 0.5 },
    },
    {
      id: "bgm-audio",
      kind: "audio",
      localPath: "public/generated/fixture-producer-video/assets/bgm.wav",
      purpose: "Fixture background music.",
      source: { provider: "repo-fixture", license: "CC0-1.0" },
      integrity: { sha256: "b".repeat(64), sizeInBytes: 1 },
      media: { durationInSeconds: 1, sampleRate: 48000, codec: "pcm_s16le" },
      sound: { role: "bgm", maxAllowedPeakDb: -1, maxSilenceSeconds: 0.5 },
    },
    {
      id: "ambience-audio",
      kind: "audio",
      localPath: "public/generated/fixture-producer-video/assets/ambience.wav",
      purpose: "Fixture ambience.",
      source: { provider: "repo-fixture", license: "CC0-1.0" },
      integrity: { sha256: "c".repeat(64), sizeInBytes: 1 },
      media: { durationInSeconds: 1, sampleRate: 48000, codec: "pcm_s16le" },
      sound: { role: "ambience", maxAllowedPeakDb: -1, maxSilenceSeconds: 0.5 },
    },
    {
      id: "sfx-audio",
      kind: "audio",
      localPath: "public/generated/fixture-producer-video/assets/sfx.wav",
      purpose: "Fixture sound effect.",
      source: { provider: "repo-fixture", license: "CC0-1.0" },
      integrity: { sha256: "d".repeat(64), sizeInBytes: 1 },
      media: { durationInSeconds: 1, sampleRate: 48000, codec: "pcm_s16le" },
      sound: { role: "sfx", maxAllowedPeakDb: -1, maxSilenceSeconds: 0.5 },
    },
  ],
};

const maintainedManifest = {
  sampleStatus: "maintained",
  compositionId: "FixtureProducerVideo",
  sampleName: "FixtureProducerVideo",
  slug: "fixture-producer-video",
  contentFamily: "tutorial",
  canvasProfile: "landscape-16x9",
  styleProfileId: "editorial-tech",
  localArtifactRoot: "public/generated/fixture-producer-video/",
  ttsStatus: "planned",
  productionBrief: {
    audience: "Fixture viewers",
    publishingSurface: "Local verification",
    durationTargetSeconds: 11,
  },
  narration: {
    required: true,
    provider: "voxcpm",
    mode: "voice-design",
    scriptPath: "fixtures/script.ts",
    audioMetadataPath: "fixtures/audio.generated.ts",
  },
  assets: { manifestPath: "fixtures/assets.manifest.json" },
  soundDesign: {
    soundtrackModulePath: "fixtures/soundtrack.tsx",
    narrationAssetIds: ["narration-audio"],
    bgmAssetIds: ["bgm-audio"],
    ambienceAssetIds: ["ambience-audio"],
    sfxAssetIds: ["sfx-audio"],
  },
  validationModule: "fixtures/validation.ts",
  render: {
    metadataPath: "fixtures/render-metadata.json",
    cover16x9CompositionId: "FixtureProducerVideoCover16x9",
    cover9x16CompositionId: "FixtureProducerVideoCover9x16",
  },
  publishingCopyPath: "fixtures/publishing.md",
  reviewFrames: [{ frame: 45, label: "opening", purpose: "Check the fixture opening." }],
  sourceFiles: [
    { path: "fixtures/script.ts", kind: "script" },
    { path: "fixtures/audio.generated.ts", kind: "audio-metadata" },
    { path: "fixtures/validation.ts", kind: "validation" },
    { path: "fixtures/cover.tsx", kind: "cover" },
    { path: "fixtures/render-metadata.json", kind: "render-metadata" },
    { path: "fixtures/publishing.md", kind: "publishing-copy" },
    { path: "fixtures/manifest.ts", kind: "manifest" },
    { path: "fixtures/assets.manifest.json", kind: "asset-manifest" },
    { path: "fixtures/soundtrack.tsx", kind: "soundtrack" },
    { path: "src/remotion/Root.tsx", kind: "root-registration" },
  ],
  promotionCandidates: [],
  notes: [],
};

await assert.doesNotReject(() => validate());
await assert.doesNotReject(() =>
  validate({
    manifest: maintainedManifest,
    assetManifest: maintainedAssetManifest,
    registeredCompositionIds: [
      "FixtureProducerVideo",
      "FixtureProducerVideoCover16x9",
      "FixtureProducerVideoCover9x16",
    ],
  }),
);
const qualityGatedManifest = {
  ...maintainedManifest,
  qualityModule: "fixtures/quality.ts",
  sourceFiles: [
    ...maintainedManifest.sourceFiles,
    { path: "fixtures/quality.ts", kind: "quality" },
  ],
};
await assert.doesNotReject(() =>
  validate({
    manifest: qualityGatedManifest,
    assetManifest: maintainedAssetManifest,
    registeredCompositionIds: [
      "FixtureProducerVideo",
      "FixtureProducerVideoCover16x9",
      "FixtureProducerVideoCover9x16",
    ],
  }),
);
await assert.rejects(
  () =>
    validate({
      manifest: { ...qualityGatedManifest, qualityModule: "https://example.com/quality.ts" },
      assetManifest: maintainedAssetManifest,
    }),
  /quality module.*repository-local/i,
);
await assert.rejects(
  () =>
    validate({
      manifest: {
        ...qualityGatedManifest,
        sourceFiles: maintainedManifest.sourceFiles,
      },
      assetManifest: maintainedAssetManifest,
    }),
  /sourceFiles.*quality/i,
);
await assert.rejects(
  () =>
    validate({
      manifest: { ...maintainedManifest, styleProfileId: "unknown-profile" },
      assetManifest: maintainedAssetManifest,
      registeredCompositionIds: [
        "FixtureProducerVideo",
        "FixtureProducerVideoCover16x9",
        "FixtureProducerVideoCover9x16",
      ],
    }),
  /style profile/i,
);
await assert.rejects(
  () =>
    validate({
      manifest: maintainedManifest,
      assetManifest: undefined,
      registeredCompositionIds: [
        "FixtureProducerVideo",
        "FixtureProducerVideoCover16x9",
        "FixtureProducerVideoCover9x16",
      ],
    }),
  /asset manifest/i,
);
await assert.rejects(
  () =>
    validate({
      manifest: {
        ...maintainedManifest,
        render: { ...maintainedManifest.render, cover9x16CompositionId: "" },
      },
      assetManifest: maintainedAssetManifest,
    }),
  /cover composition id/i,
);
await assert.rejects(
  () =>
    validate({
      manifest: {
        ...maintainedManifest,
        soundDesign: { ...maintainedManifest.soundDesign, bgmAssetIds: ["sfx-audio"] },
      },
      assetManifest: maintainedAssetManifest,
      registeredCompositionIds: [
        "FixtureProducerVideo",
        "FixtureProducerVideoCover16x9",
        "FixtureProducerVideoCover9x16",
      ],
    }),
  /bgm.*role/i,
);
await assert.rejects(
  () => validate({ tracks: fixtureProducerValidationInput.tracks.slice(1) }),
  /missing audio id/i,
);
await assert.rejects(
  () =>
    validate({
      tracks: [
        ...fixtureProducerValidationInput.tracks,
        { ...fixtureProducerValidationInput.tracks[0], sceneId: "extra" },
      ],
    }),
  /extra audio id/i,
);
await assert.rejects(
  () =>
    validate({
      tracks: [
        { ...fixtureProducerValidationInput.tracks[0], provider: "f5-tts" },
        fixtureProducerValidationInput.tracks[1],
      ],
    }),
  /direct VoxCPM/i,
);
await assert.rejects(
  () =>
    validate({
      tracks: [
        { ...fixtureProducerValidationInput.tracks[0], provider: undefined },
        fixtureProducerValidationInput.tracks[1],
      ],
    }),
  /direct VoxCPM/i,
);
await assert.rejects(
  () =>
    validate({
      tracks: [
        { ...fixtureProducerValidationInput.tracks[0], audioFile: "" },
        fixtureProducerValidationInput.tracks[1],
      ],
    }),
  /audio file/i,
);
await assert.rejects(
  () =>
    validate({
      tracks: [
        { ...fixtureProducerValidationInput.tracks[0], durationInFrames: 0 },
        fixtureProducerValidationInput.tracks[1],
      ],
    }),
  /positive duration/i,
);
await assert.rejects(
  () =>
    validate({
      tracks: [
        {
          ...fixtureProducerValidationInput.tracks[0],
          captions: {
            cues: [{ id: "bad", text: "bad", startFrame: 149, durationInFrames: 2 }],
          },
        },
        fixtureProducerValidationInput.tracks[1],
      ],
    }),
  /caption cue range/i,
);
await assert.rejects(
  () =>
    validate({
      tracks: [
        {
          ...fixtureProducerValidationInput.tracks[0],
          captions: {
            cues: [{ id: "bad", text: "[Uhm] bad", startFrame: 0, durationInFrames: 10 }],
          },
        },
        fixtureProducerValidationInput.tracks[1],
      ],
    }),
  /display caption/i,
);
await assert.rejects(
  () =>
    validate({
      scenes: [{ id: "opening", durationInFrames: 157 }, fixtureProducerValidationInput.scenes[1]],
    }),
  /scene duration/i,
);
await assert.rejects(() => validate({ isIgnoredPath: async () => false }), /artifact root/i);
await assert.rejects(() => validate({ registeredCompositionIds: [] }), /registration/i);

const silentBeat = { id: "silent", narrationRequired: false, durationInFrames: 90 };
const silentTrack = {
  sceneId: "silent",
  narration: "",
  audioFile: "",
  captions: { cues: [] },
  durationInFrames: 90,
  durationInSeconds: 3,
};
await assert.doesNotReject(() =>
  validate({
    beats: [...fixtureProducerValidationInput.beats, silentBeat],
    tracks: [...fixtureProducerValidationInput.tracks, silentTrack],
    scenes: [...fixtureProducerValidationInput.scenes, { id: "silent", durationInFrames: 90 }],
  }),
);
await assert.rejects(
  () =>
    validate({
      beats: [...fixtureProducerValidationInput.beats, silentBeat],
      tracks: [
        ...fixtureProducerValidationInput.tracks,
        { ...silentTrack, audioFile: "generated/silent.wav", provider: "voxcpm" },
      ],
      scenes: [...fixtureProducerValidationInput.scenes, { id: "silent", durationInFrames: 90 }],
    }),
  /intentionally silent/i,
);

console.log("Producer validation smoke passed.");
