import type { SegmentCaptions } from "../../../src/lib/caption-schema";

const supportedNonLanguageTags = [
  "laughing",
  "sigh",
  "Uhm",
  "Shh",
  "Question-ah",
  "Question-ei",
  "Question-en",
  "Question-oh",
  "Surprise-wa",
  "Surprise-yo",
  "Dissatisfaction-hnn",
] as const;

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const tagPattern = new RegExp(
  `\\[(?:${supportedNonLanguageTags.map(escapeRegExp).join("|")})\\]`,
  "g",
);

export const cleanProducerDisplayText = (text: string | undefined): string =>
  (text ?? "")
    .replace(/^\s*\([^\r\n)]*\)\s*/, "")
    .replace(tagPattern, " ")
    .replace(/\s+/g, " ")
    .trim();

const DECIMAL_POINT = "\u0000DECIMAL_POINT\u0000";

export const splitProducerNarrationText = (text: string): string[] => {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const protectedText = normalized.replace(/(?<=\d)\.(?=\d)/g, DECIMAL_POINT);
  return (protectedText.match(/[^,，.。!?！？;；:：]+[,，.。!?！？;；:：]?/g) ?? [protectedText])
    .map((chunk) => chunk.replaceAll(DECIMAL_POINT, ".").trim())
    .filter(Boolean);
};

export const buildProducerCaptionCues = ({
  chunkDurationsInSeconds,
  displayChunks,
  durationInFrames,
  language,
  fps = 30,
}: {
  readonly chunkDurationsInSeconds: readonly number[];
  readonly displayChunks: readonly string[];
  readonly durationInFrames: number;
  readonly language?: string;
  readonly fps?: number;
}): SegmentCaptions => {
  if (displayChunks.length === 0 || displayChunks.length !== chunkDurationsInSeconds.length) {
    throw new Error("Producer caption punctuation chunks must match measured audio chunks.");
  }
  if (durationInFrames < displayChunks.length) {
    throw new Error("Measured narration duration is too short for its caption chunks.");
  }

  let cursor = 0;
  const cues = displayChunks.map((text, index) => {
    const remainingCues = displayChunks.length - index;
    const remainingFrames = durationInFrames - cursor;
    const measuredFrames = Math.max(1, Math.round((chunkDurationsInSeconds[index] ?? 0) * fps));
    const duration =
      index === displayChunks.length - 1
        ? remainingFrames
        : Math.min(measuredFrames, remainingFrames - (remainingCues - 1));
    const cue = {
      id: `caption-${index + 1}`,
      text: cleanProducerDisplayText(text),
      startFrame: cursor,
      durationInFrames: duration,
    };
    cursor += duration;
    return cue;
  });

  return { ...(language ? { language } : {}), cues };
};

export const normalizeProducerCaptions = ({
  captions,
  displayText,
  durationInFrames,
}: {
  readonly captions?: SegmentCaptions;
  readonly displayText?: string;
  readonly durationInFrames: number;
}): SegmentCaptions => {
  const cleanedCues = (captions?.cues ?? [])
    .map((cue) => ({ ...cue, text: cleanProducerDisplayText(cue.text) }))
    .filter((cue) => cue.text.length > 0);

  if (cleanedCues.length > 0) {
    return { ...captions, cues: cleanedCues };
  }

  const fallbackText = cleanProducerDisplayText(displayText);
  return {
    ...(captions?.language ? { language: captions.language } : {}),
    ...(captions?.style ? { style: captions.style } : {}),
    cues: fallbackText
      ? [
          {
            id: "caption-1",
            text: fallbackText,
            startFrame: 0,
            durationInFrames,
          },
        ]
      : [],
  };
};
