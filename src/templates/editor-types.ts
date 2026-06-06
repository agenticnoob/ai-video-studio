import type { VideoSegment } from "../lib/project-schema";

export type TemplateEditorProps<TSegment> = {
  inputClassName: string;
  parsePositiveInteger: (value: string, fallback: number, min: number, max: number) => number;
  segment: TSegment;
  onSegmentChange: (segment: TSegment) => void;
};

export type RuntimeTemplateEditorProps = {
  inputClassName: string;
  parsePositiveInteger: (value: string, fallback: number, min: number, max: number) => number;
  segment: VideoSegment;
  onSegmentChange: (segment: VideoSegment) => void;
};
