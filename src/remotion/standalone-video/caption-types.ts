export type ProducerCaptionCue = {
  readonly id: string;
  readonly text: string;
  readonly startFrame: number;
  readonly durationInFrames: number;
};

export type ProducerCaptions = {
  readonly language?: string;
  readonly cues: readonly ProducerCaptionCue[];
  readonly style?: {
    readonly preset?: string;
    readonly position?: "bottom" | "center" | "top";
  };
};

export type SegmentCaptionCue = ProducerCaptionCue;
export type SegmentCaptions = ProducerCaptions;
