export type ProducerQualityRect = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type ProducerQualityPlan = {
  readonly compositionId: string;
  readonly canvas: { readonly width: number; readonly height: number; readonly fps: number };
  readonly safeMargins: {
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
  };
  readonly textLayouts: readonly {
    readonly id: string;
    readonly text: string;
    readonly box: ProducerQualityRect;
    readonly measuredWidth: number;
    readonly measuredHeight: number;
    readonly fits: boolean;
    readonly foregroundColor: string;
    readonly backgroundColor: string;
  }[];
  readonly visibleElements: readonly {
    readonly id: string;
    readonly bounds: ProducerQualityRect;
  }[];
  readonly evidence: readonly {
    readonly id: string;
    readonly status: "resolved-asset" | "code-information-graphic" | "unresolved";
    readonly reason?: string;
  }[];
  readonly reviewFrames: readonly {
    readonly frame: number;
    readonly label: string;
    readonly path: string;
  }[];
  readonly artifact: {
    readonly mp4Path: string;
    readonly metadataPath: string;
    readonly expectedWidth: number;
    readonly expectedHeight: number;
    readonly expectedFps: number;
    readonly expectedDurationInFrames: number;
    readonly chapters: readonly { readonly name: string; readonly durationInFrames: number }[];
  };
  readonly artifactPaths: readonly string[];
};

export type ProducerQualityGateInput = ProducerQualityPlan & {
  readonly renderedReviewFrames: readonly {
    readonly frame: number;
    readonly path: string;
    readonly readable: boolean;
    readonly meanLuma: number;
    readonly lumaStandardDeviation: number;
  }[];
  readonly observedArtifact: {
    readonly videoCodec?: string;
    readonly audioCodec?: string;
    readonly width?: number;
    readonly height?: number;
    readonly fps?: number;
    readonly durationSeconds?: number;
    readonly metadataDurationSeconds?: number;
    readonly metadataDurationInFrames?: number;
    readonly metadataFps?: number;
    readonly chapters: readonly { readonly name: string; readonly startFrame: number }[];
  };
  readonly trackedArtifactPaths: readonly string[];
};

export type ProducerQualityGateThresholds = {
  readonly minimumTextContrastRatio: number;
  readonly minimumFrameLumaStandardDeviation: number;
  readonly durationToleranceSeconds: number;
  readonly chapterToleranceFrames: number;
};

const requireFinite = (value: number, label: string): void => {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite.`);
};

const requirePositive = (value: number, label: string): void => {
  requireFinite(value, label);
  if (value <= 0) throw new Error(`${label} must be positive.`);
};

const requireText = (value: string, label: string): void => {
  if (!value.trim()) throw new Error(`${label} must be non-empty text.`);
};

const assertRect = (rect: ProducerQualityRect, label: string): void => {
  requireFinite(rect.x, `${label}.x`);
  requireFinite(rect.y, `${label}.y`);
  requirePositive(rect.width, `${label}.width`);
  requirePositive(rect.height, `${label}.height`);
};

const parseHexColor = (value: string, label: string): readonly [number, number, number] => {
  const match = /^#([a-f0-9]{6})$/i.exec(value);
  if (!match) throw new Error(`${label} must be a six-digit hex color.`);
  return [0, 2, 4].map((offset) => Number.parseInt(match[1].slice(offset, offset + 2), 16)) as [
    number,
    number,
    number,
  ];
};

const relativeLuminance = (color: readonly [number, number, number]): number => {
  const channels = color.map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};

export const getProducerTextContrastRatio = (
  foregroundColor: string,
  backgroundColor: string,
): number => {
  const foreground = relativeLuminance(parseHexColor(foregroundColor, "foregroundColor"));
  const background = relativeLuminance(parseHexColor(backgroundColor, "backgroundColor"));
  return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
};

export const validateProducerQualityGateInput = (
  input: ProducerQualityGateInput,
  thresholds: Partial<ProducerQualityGateThresholds> = {},
): void => {
  requireText(input.compositionId, "compositionId");
  requirePositive(input.canvas.width, "canvas.width");
  requirePositive(input.canvas.height, "canvas.height");
  requirePositive(input.canvas.fps, "canvas.fps");

  const resolvedThresholds: ProducerQualityGateThresholds = {
    minimumTextContrastRatio: thresholds.minimumTextContrastRatio ?? 3,
    minimumFrameLumaStandardDeviation: thresholds.minimumFrameLumaStandardDeviation ?? 8,
    durationToleranceSeconds: thresholds.durationToleranceSeconds ?? 1 / input.canvas.fps,
    chapterToleranceFrames: thresholds.chapterToleranceFrames ?? 1,
  };
  for (const [key, value] of Object.entries(resolvedThresholds)) {
    requirePositive(value, `thresholds.${key}`);
  }

  for (const [edge, margin] of Object.entries(input.safeMargins)) {
    requireFinite(margin, `safeMargins.${edge}`);
    if (margin < 0) throw new Error(`safeMargins.${edge} must be non-negative.`);
  }
  if (input.safeMargins.left + input.safeMargins.right >= input.canvas.width) {
    throw new Error("Horizontal safe margins leave no visible canvas.");
  }
  if (input.safeMargins.top + input.safeMargins.bottom >= input.canvas.height) {
    throw new Error("Vertical safe margins leave no visible canvas.");
  }
  if (input.textLayouts.length === 0)
    throw new Error("At least one measured text layout is required.");
  if (input.visibleElements.length === 0)
    throw new Error("At least one visible-element bound is required.");

  for (const textLayout of input.textLayouts) {
    requireText(textLayout.id, "text layout id");
    requireText(textLayout.text, `${textLayout.id} text`);
    assertRect(textLayout.box, `${textLayout.id}.box`);
    requirePositive(textLayout.measuredWidth, `${textLayout.id}.measuredWidth`);
    requirePositive(textLayout.measuredHeight, `${textLayout.id}.measuredHeight`);
    if (
      textLayout.fits !== true ||
      textLayout.measuredWidth > textLayout.box.width ||
      textLayout.measuredHeight > textLayout.box.height
    ) {
      throw new Error(`${textLayout.id} text overflow detected.`);
    }
    const contrastRatio = getProducerTextContrastRatio(
      textLayout.foregroundColor,
      textLayout.backgroundColor,
    );
    if (contrastRatio < resolvedThresholds.minimumTextContrastRatio) {
      throw new Error(`${textLayout.id} text contrast is below the deterministic minimum.`);
    }
  }

  const safeLeft = input.safeMargins.left;
  const safeTop = input.safeMargins.top;
  const safeRight = input.canvas.width - input.safeMargins.right;
  const safeBottom = input.canvas.height - input.safeMargins.bottom;
  for (const visibleElement of input.visibleElements) {
    requireText(visibleElement.id, "visible element id");
    assertRect(visibleElement.bounds, `${visibleElement.id}.bounds`);
    const { x, y, width, height } = visibleElement.bounds;
    if (x < safeLeft || y < safeTop || x + width > safeRight || y + height > safeBottom) {
      throw new Error(`${visibleElement.id} violates the declared safe margins.`);
    }
  }

  for (const evidence of input.evidence) {
    requireText(evidence.id, "evidence id");
    if (evidence.status === "unresolved") {
      throw new Error(`${evidence.id} is an unresolved evidence asset.`);
    }
    if (evidence.status === "code-information-graphic" && !evidence.reason?.trim()) {
      throw new Error(`${evidence.id} code information graphic must record its source reason.`);
    }
  }

  if (input.reviewFrames.length === 0)
    throw new Error("At least one planned review frame is required.");
  const plannedFrames = new Map<number, string>();
  for (const reviewFrame of input.reviewFrames) {
    if (!Number.isInteger(reviewFrame.frame) || reviewFrame.frame < 0) {
      throw new Error(`Invalid planned review frame: ${reviewFrame.frame}.`);
    }
    requireText(reviewFrame.label, `review frame ${reviewFrame.frame} label`);
    requireText(reviewFrame.path, `review frame ${reviewFrame.frame} path`);
    if (plannedFrames.has(reviewFrame.frame)) {
      throw new Error(`Duplicate planned review frame: ${reviewFrame.frame}.`);
    }
    plannedFrames.set(reviewFrame.frame, reviewFrame.path);
  }
  const renderedFrames = new Map<
    number,
    ProducerQualityGateInput["renderedReviewFrames"][number]
  >();
  for (const renderedFrame of input.renderedReviewFrames) {
    if (renderedFrames.has(renderedFrame.frame)) {
      throw new Error(`Duplicate rendered review frame: ${renderedFrame.frame}.`);
    }
    renderedFrames.set(renderedFrame.frame, renderedFrame);
  }
  for (const [frame, expectedPath] of plannedFrames) {
    const renderedFrame = renderedFrames.get(frame);
    if (!renderedFrame || renderedFrame.path !== expectedPath) {
      throw new Error(`Missing planned review frame: ${frame}.`);
    }
    if (!renderedFrame.readable) throw new Error(`Review frame ${frame} is unreadable.`);
    requireFinite(renderedFrame.meanLuma, `review frame ${frame} mean luma`);
    requireFinite(
      renderedFrame.lumaStandardDeviation,
      `review frame ${frame} luma standard deviation`,
    );
    if (
      renderedFrame.lumaStandardDeviation < resolvedThresholds.minimumFrameLumaStandardDeviation
    ) {
      throw new Error(`Review frame ${frame} is near-blank or severely low-contrast.`);
    }
  }
  for (const frame of renderedFrames.keys()) {
    if (!plannedFrames.has(frame)) throw new Error(`Unexpected rendered review frame: ${frame}.`);
  }

  const expected = input.artifact;
  const observed = input.observedArtifact;
  requirePositive(expected.expectedWidth, "artifact.expectedWidth");
  requirePositive(expected.expectedHeight, "artifact.expectedHeight");
  requirePositive(expected.expectedFps, "artifact.expectedFps");
  requirePositive(expected.expectedDurationInFrames, "artifact.expectedDurationInFrames");
  if (observed.videoCodec !== "h264") throw new Error("Final MP4 video codec must be H.264.");
  if (observed.audioCodec !== "aac") throw new Error("Final MP4 audio codec must be AAC.");
  if (observed.width !== expected.expectedWidth || observed.height !== expected.expectedHeight) {
    throw new Error("Final MP4 dimensions do not match quality expectations.");
  }
  if (
    observed.fps === undefined ||
    Math.abs(observed.fps - expected.expectedFps) > 0.001 ||
    observed.metadataFps === undefined ||
    Math.abs(observed.metadataFps - expected.expectedFps) > 0.001
  ) {
    throw new Error("Final MP4 or metadata FPS does not match quality expectations.");
  }
  const expectedDurationSeconds = expected.expectedDurationInFrames / expected.expectedFps;
  for (const [label, value] of [
    ["MP4 duration", observed.durationSeconds],
    ["metadata duration", observed.metadataDurationSeconds],
  ] as const) {
    if (
      value === undefined ||
      !Number.isFinite(value) ||
      Math.abs(value - expectedDurationSeconds) > resolvedThresholds.durationToleranceSeconds
    ) {
      throw new Error(`${label} does not match expected frames.`);
    }
  }
  if (observed.metadataDurationInFrames !== expected.expectedDurationInFrames) {
    throw new Error("Metadata durationInFrames does not match quality expectations.");
  }

  let chapterStart = 0;
  if (observed.chapters.length !== expected.chapters.length) {
    throw new Error("Final metadata chapter count does not match quality expectations.");
  }
  expected.chapters.forEach((chapter, index) => {
    requireText(chapter.name, `chapter ${index} name`);
    requirePositive(chapter.durationInFrames, `chapter ${index} durationInFrames`);
    const observedChapter = observed.chapters[index];
    if (
      !observedChapter ||
      observedChapter.name !== chapter.name ||
      !Number.isFinite(observedChapter.startFrame) ||
      Math.abs(observedChapter.startFrame - chapterStart) >
        resolvedThresholds.chapterToleranceFrames
    ) {
      throw new Error(`Chapter ${chapter.name} start does not match expected timing.`);
    }
    chapterStart += chapter.durationInFrames;
  });
  if (chapterStart !== expected.expectedDurationInFrames) {
    throw new Error("Chapter durations do not sum to the expected final duration.");
  }

  if (input.trackedArtifactPaths.length > 0) {
    throw new Error(
      `Generated artifact path is tracked by Git: ${input.trackedArtifactPaths.join(", ")}`,
    );
  }
};
