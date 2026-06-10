export class TtsConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TtsConfigError";
  }
}

export class TtsProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TtsProviderError";
  }
}

export class StoryboardSegmentNotFoundError extends Error {
  constructor(segmentId: string) {
    super(`Storyboard segment not found: ${segmentId}`);
    this.name = "StoryboardSegmentNotFoundError";
  }
}
