import type { SampleNameSceneId } from "./types";

export type SampleNameNarrationBeat = {
  readonly sceneId: SampleNameSceneId;
  readonly text: string;
};

export const sampleNameNarrationBeats = [
  { sceneId: "open", text: "Start with the real topic and the viewer promise." },
  { sceneId: "proof", text: "Show one concrete source, data point, or product state." },
  { sceneId: "close", text: "End with the reusable takeaway." },
] as const satisfies readonly SampleNameNarrationBeat[];
