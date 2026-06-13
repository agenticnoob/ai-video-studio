import type { FC } from "react";

import { Card } from "../../components/ui/Card";
import type { TemplateEditorProps } from "../editor-types";
import type { SceneGraphSegment, SceneGraphSpec } from "./schema";

const formatJson = (value: unknown) => JSON.stringify(value, null, 2);

const parseJsonArray = <TValue,>(value: string, fallback: TValue[]): TValue[] => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as TValue[]) : fallback;
  } catch {
    return fallback;
  }
};

const updateImplementation = (
  segment: SceneGraphSegment,
  patch: Partial<SceneGraphSpec>,
): SceneGraphSegment => ({
  ...segment,
  implementation: {
    ...segment.implementation,
    ...patch,
  },
});

export const SceneGraphEditor: FC<TemplateEditorProps<SceneGraphSegment>> = ({
  inputClassName,
  parsePositiveInteger,
  segment,
  onSegmentChange,
}) => {
  const fieldClassName = "block text-xs font-medium text-foreground";
  const layersJson = formatJson(segment.implementation.layers);
  const beatsJson = formatJson(segment.implementation.beats ?? []);

  return (
    <Card className="mt-5" tone="nested">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">Scene Graph</h3>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <label className={fieldClassName}>
            Composition
            <select
              className={inputClassName}
              value={segment.implementation.composition}
              onChange={(event) =>
                onSegmentChange(
                  updateImplementation(segment, {
                    composition: event.currentTarget.value as SceneGraphSpec["composition"],
                  }),
                )
              }
            >
              <option value="hero">Hero</option>
              <option value="path">Path</option>
              <option value="split">Split</option>
              <option value="node-graph">Node graph</option>
              <option value="code-terminal">Code terminal</option>
              <option value="lockup">Lockup</option>
            </select>
          </label>
          <label className={fieldClassName}>
            Layout
            <select
              className={inputClassName}
              value={segment.implementation.layout}
              onChange={(event) =>
                onSegmentChange(
                  updateImplementation(segment, {
                    layout: event.currentTarget.value as SceneGraphSpec["layout"],
                  }),
                )
              }
            >
              <option value="full-bleed">Full bleed</option>
              <option value="center">Center</option>
              <option value="split">Split</option>
              <option value="path-horizontal">Path horizontal</option>
              <option value="node-graph">Node graph</option>
              <option value="code-terminal-split">Code terminal split</option>
              <option value="safe-lockup">Safe lockup</option>
            </select>
          </label>
          <label className={fieldClassName}>
            Scene type
            <select
              className={inputClassName}
              value={segment.implementation.sceneType}
              onChange={(event) =>
                onSegmentChange(
                  updateImplementation(segment, {
                    sceneType: event.currentTarget.value as SceneGraphSpec["sceneType"],
                  }),
                )
              }
            >
              <option value="opener">Opener</option>
              <option value="explain">Explain</option>
              <option value="proof">Proof</option>
              <option value="comparison">Comparison</option>
              <option value="process">Process</option>
              <option value="transition">Transition</option>
              <option value="closing">Closing</option>
            </select>
          </label>
          <label className={fieldClassName}>
            Camera
            <select
              className={inputClassName}
              value={segment.implementation.camera.movement}
              onChange={(event) =>
                onSegmentChange(
                  updateImplementation(segment, {
                    camera: {
                      ...segment.implementation.camera,
                      movement: event.currentTarget.value as SceneGraphSpec["camera"]["movement"],
                    },
                  }),
                )
              }
            >
              <option value="static">Static</option>
              <option value="push-in">Push in</option>
              <option value="pan-left">Pan left</option>
              <option value="pan-right">Pan right</option>
              <option value="drift">Drift</option>
              <option value="zoom-through">Zoom through</option>
            </select>
          </label>
          <label className={fieldClassName}>
            Intensity
            <select
              className={inputClassName}
              value={segment.implementation.camera.intensity}
              onChange={(event) =>
                onSegmentChange(
                  updateImplementation(segment, {
                    camera: {
                      ...segment.implementation.camera,
                      intensity: event.currentTarget.value as SceneGraphSpec["camera"]["intensity"],
                    },
                  }),
                )
              }
            >
              <option value="subtle">Subtle</option>
              <option value="medium">Medium</option>
              <option value="strong">Strong</option>
            </select>
          </label>
          <label className={fieldClassName}>
            Frames
            <input
              className={inputClassName}
              min={45}
              type="number"
              value={segment.implementation.durationInFrames}
              onChange={(event) =>
                onSegmentChange(
                  updateImplementation(segment, {
                    durationInFrames: parsePositiveInteger(
                      event.currentTarget.value,
                      segment.implementation.durationInFrames,
                      45,
                      1200,
                    ),
                  }),
                )
              }
            />
          </label>
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <label className={fieldClassName}>
          Layers JSON
          <textarea
            className={`${inputClassName} min-h-56 font-mono text-[11px] leading-relaxed`}
            value={layersJson}
            onChange={(event) =>
              onSegmentChange(
                updateImplementation(segment, {
                  layers: parseJsonArray<SceneGraphSpec["layers"][number]>(
                    event.currentTarget.value,
                    segment.implementation.layers,
                  ),
                }),
              )
            }
          />
        </label>
        <label className={fieldClassName}>
          Beats JSON
          <textarea
            className={`${inputClassName} min-h-56 font-mono text-[11px] leading-relaxed`}
            value={beatsJson}
            onChange={(event) =>
              onSegmentChange(
                updateImplementation(segment, {
                  beats: parseJsonArray<SceneGraphSpec["beats"][number]>(
                    event.currentTarget.value,
                    segment.implementation.beats ?? [],
                  ),
                }),
              )
            }
          />
        </label>
      </div>
    </Card>
  );
};
