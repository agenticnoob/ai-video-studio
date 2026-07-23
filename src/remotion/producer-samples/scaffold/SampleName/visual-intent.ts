import type { ProducerVisualIntent } from "../../creative-contract";
import type { SampleNameSceneId } from "./types";

/**
 * Replace every field from the real narration beats before writing scene TSX.
 * The scaffold intentionally stays draft so producer:validate fails closed.
 */
export const producerVisualIntents = [
  {
    sceneId: "open",
    subject: "Replace with the opening beat's visible subject",
    action: "Replace with the visible change that starts the explanation",
    shotLanguage: "Replace with a topic-specific establishing shot",
    intendedMeaning: "Replace with what a paused opening frame must communicate",
    primaryComposition: "replace-opening-primary-composition",
    silhouette: "replace-opening-silhouette",
    renderMode: "code-led",
    selectedCapabilities: ["replace-with-reviewed-shared-or-local-capability"],
    reviewStatus: "draft",
  },
  {
    sceneId: "proof",
    subject: "Replace with the evidence beat's visible subject",
    action: "Replace with the mechanism, comparison, or evidence change",
    shotLanguage: "Replace with a topic-specific evidence shot",
    intendedMeaning: "Replace with what a paused evidence frame must prove",
    primaryComposition: "replace-evidence-primary-composition",
    silhouette: "replace-evidence-silhouette",
    renderMode: "hybrid",
    selectedCapabilities: ["replace-with-reviewed-shared-or-local-capability"],
    reviewStatus: "draft",
  },
  {
    sceneId: "close",
    subject: "Replace with the takeaway's visible subject",
    action: "Replace with the final consequence or resolved state",
    shotLanguage: "Replace with a topic-specific resolution shot",
    intendedMeaning: "Replace with what a paused closing frame must leave behind",
    primaryComposition: "replace-closing-primary-composition",
    silhouette: "replace-closing-silhouette",
    renderMode: "code-led",
    selectedCapabilities: ["replace-with-reviewed-shared-or-local-capability"],
    reviewStatus: "draft",
  },
] as const satisfies readonly (ProducerVisualIntent & {
  readonly sceneId: SampleNameSceneId;
})[];
