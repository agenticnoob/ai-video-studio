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
