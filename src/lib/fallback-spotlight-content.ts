import type { StoryboardSegmentPlan } from "./storyboard-plan-schema";

const sentenceParts = (value: string): string[] =>
  value
    .split(/[.!?。！？,，;；]/)
    .map((part) => part.trim())
    .filter(Boolean);

export const truncateFallbackText = (value: string, maxLength: number): string => {
  const trimmed = value.trim();
  return trimmed.length <= maxLength ? trimmed : `${trimmed.slice(0, maxLength - 3)}...`;
};

export type FallbackSpotlightContent = {
  callouts: string[];
  headline: string;
  kicker?: string;
  subheadline?: string;
  title: string;
};

export const buildFallbackSpotlightContent = ({
  narrationText,
  segment,
}: {
  narrationText: string;
  segment: StoryboardSegmentPlan;
}): FallbackSpotlightContent => {
  const title = truncateFallbackText(segment.title ?? segment.purpose, 120);
  const narrationParts = sentenceParts(narrationText);
  const headlineSource = narrationParts[0] ?? segment.title ?? segment.purpose;
  const subheadlineSource =
    narrationParts.length > 1 ? narrationParts.slice(1, 3).join("，") : segment.purpose;
  const calloutSources =
    narrationParts.length > 1 ? narrationParts.slice(1, 5) : [segment.purpose, narrationText];

  return {
    title,
    kicker: segment.title ? truncateFallbackText(segment.title, 40) : undefined,
    headline: truncateFallbackText(headlineSource, 72),
    subheadline: truncateFallbackText(subheadlineSource, 120),
    callouts: calloutSources
      .map((part) => truncateFallbackText(part, 60))
      .filter((part, index, list) => part && list.indexOf(part) === index)
      .slice(0, 4),
  };
};
