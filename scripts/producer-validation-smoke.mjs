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

await assert.doesNotReject(() => validate());
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
