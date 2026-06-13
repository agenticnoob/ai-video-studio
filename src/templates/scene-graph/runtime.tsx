import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, spring, useCurrentFrame } from "remotion";

import { CJK_SANS_FONT_STACK } from "../../remotion/font-stack";
import { useEntranceProgress } from "../../remotion/primitives/transitions/useEntranceProgress";
import { defineRuntimeTemplate } from "../runtime-definition";
import type { RuntimeTemplateEditorProps } from "../editor-types";
import { SceneGraphEditor } from "./editor";
import {
  BrowserWindowLayer,
  CodePanelLayer,
  CursorLayer,
  LinePathLayer,
  NodeGraphLayer,
  TerminalPanelLayer,
} from "./primitives";
import type { SceneGraphSegment, SceneGraphSpec } from "./schema";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getCameraTransform = (spec: SceneGraphSpec, frame: number): string => {
  const intensity =
    spec.camera.intensity === "strong" ? 1 : spec.camera.intensity === "medium" ? 0.65 : 0.35;
  const progress = clamp(frame / spec.durationInFrames, 0, 1);
  const move = 26 * intensity * progress;
  const zoom = 1 + 0.045 * intensity * progress;

  switch (spec.camera.movement) {
    case "push-in":
      return `scale(${zoom})`;
    case "pan-left":
      return `translateX(${-move}px) scale(${1 + 0.015 * intensity})`;
    case "pan-right":
      return `translateX(${move}px) scale(${1 + 0.015 * intensity})`;
    case "drift":
      return `translate(${Math.sin(progress * Math.PI * 2) * move}px, ${Math.cos(progress * Math.PI * 1.5) * move * 0.45}px) scale(${1 + 0.012 * intensity})`;
    case "zoom-through":
      return `scale(${1 + 0.085 * intensity * progress}) translateY(${-move * 0.4}px)`;
    case "static":
    default:
      return "none";
  }
};

const getLayerProgress = (
  layer: SceneGraphSpec["layers"][number],
  frame: number,
  durationInFrames: number,
): number => {
  const startFrame = layer.startFrame ?? 0;
  const layerDuration = layer.durationInFrames ?? durationInFrames - startFrame;
  const localFrame = frame - startFrame;
  const reveal = interpolate(localFrame, [0, 22], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(localFrame, [layerDuration - 18, layerDuration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return Math.min(reveal, exit);
};

const SceneBackground: FC<{ spec: SceneGraphSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [0, spec.durationInFrames], [-18, 118], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gridOffset = frame * 0.35;

  return (
    <AbsoluteFill style={{ background: spec.theme.background, overflow: "hidden" }}>
      <div
        style={{
          inset: -80,
          position: "absolute",
          transform: getCameraTransform(spec, frame),
          transformOrigin: "center",
        }}
      >
        <div
          style={{
            background: `radial-gradient(circle at 20% 22%, ${spec.theme.primary}4d 0, transparent 30%), radial-gradient(circle at 78% 18%, ${spec.theme.secondary}40 0, transparent 28%), linear-gradient(135deg, ${spec.theme.background} 0%, #020617 70%)`,
            inset: 0,
            position: "absolute",
          }}
        />
        <div
          style={{
            backgroundImage: `linear-gradient(${spec.theme.text}10 1px, transparent 1px), linear-gradient(90deg, ${spec.theme.text}10 1px, transparent 1px)`,
            backgroundPosition: `${gridOffset}px ${gridOffset}px`,
            backgroundSize: "54px 54px",
            inset: 0,
            opacity: 0.45,
            position: "absolute",
          }}
        />
        <div
          style={{
            background: `linear-gradient(105deg, transparent ${sweep - 10}%, ${spec.theme.primary}20 ${sweep}%, transparent ${sweep + 10}%)`,
            inset: 0,
            position: "absolute",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const panelStyle = (spec: SceneGraphSpec, progress: number): CSSProperties => ({
  background: `linear-gradient(135deg, ${spec.theme.panel}, rgba(15,23,42,0.30))`,
  border: `1px solid ${spec.theme.text}24`,
  borderRadius: 8,
  boxShadow: `0 24px 90px ${spec.theme.background}aa`,
  opacity: progress,
  transform: `translateY(${(1 - progress) * 24}px) scale(${0.98 + progress * 0.02})`,
});

const TextBlock: FC<{
  children: ReactNode;
  style?: CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      maxWidth: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      ...style,
    }}
  >
    {children}
  </div>
);

const toneFill = (spec: SceneGraphSpec, tone: "primary" | "secondary" | "muted" | "dark") => {
  switch (tone) {
    case "secondary":
      return spec.theme.secondary;
    case "muted":
      return spec.theme.muted;
    case "dark":
      return spec.theme.background;
    case "primary":
    default:
      return spec.theme.primary;
  }
};

const KineticTitleLayer: FC<{
  layer: Extract<SceneGraphSpec["layers"][number], { type: "kinetic-title" }>;
  progress: number;
  spec: SceneGraphSpec;
}> = ({ layer, progress, spec }) => {
  const frame = useCurrentFrame();
  const emphasis = layer.emphasis ?? [];
  const isFullBleed = layer.layout === "full-bleed" || layer.layout === "lockup";
  const align =
    layer.layout === "left" || layer.layout === "split" || layer.layout === "lockup"
      ? "left"
      : "center";
  const left = layer.layout === "left" || layer.layout === "split" ? 88 : 150;
  const right = layer.layout === "split" ? 520 : 150;
  const top = layer.layout === "split" ? 96 : 118;
  const wipe = interpolate(progress, [0, 1], [0, 100], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        bottom: layer.layout === "lockup" ? 138 : undefined,
        left: isFullBleed ? 82 : left,
        position: "absolute",
        right: isFullBleed ? 82 : right,
        textAlign: align,
        top: layer.layout === "lockup" ? undefined : isFullBleed ? 96 : top,
        ...(isFullBleed
          ? {
              opacity: progress,
              transform: `translateY(${(1 - progress) * 18}px) scale(${0.98 + progress * 0.02})`,
            }
          : panelStyle(spec, progress)),
        padding: isFullBleed ? "0" : layer.layout === "split" ? "40px 46px" : "42px 56px",
      }}
    >
      {isFullBleed ? (
        <div
          style={{
            background: `linear-gradient(90deg, ${spec.theme.primary}, ${spec.theme.secondary})`,
            height: 6,
            marginBottom: 28,
            transform: `scaleX(${wipe / 100})`,
            transformOrigin: "left center",
            width: layer.layout === "lockup" ? 420 : 520,
          }}
        />
      ) : null}
      <TextBlock
        style={{
          color: spec.theme.text,
          fontSize:
            layer.layout === "lockup" ? 74 : isFullBleed ? 86 : layer.layout === "split" ? 54 : 68,
          fontWeight: 950,
          lineHeight: 0.96,
          maxWidth: layer.layout === "lockup" ? 760 : undefined,
          transform: `translateX(${Math.sin(frame / 28) * 6}px)`,
        }}
      >
        {layer.text}
      </TextBlock>
      {emphasis.length ? (
        <div
          style={{
            color: spec.theme.secondary,
            display: "flex",
            flexWrap: "wrap",
            fontSize: 18,
            fontWeight: 800,
            gap: 10,
            justifyContent: align === "center" ? "center" : "flex-start",
            marginTop: 22,
          }}
        >
          {emphasis.map((item) => (
            <span
              key={item}
              style={{
                border: `1px solid ${spec.theme.secondary}66`,
                borderRadius: isFullBleed ? 2 : 999,
                background: isFullBleed ? `${spec.theme.background}99` : undefined,
                padding: "7px 12px",
              }}
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const CalloutLayer: FC<{
  layer: Extract<SceneGraphSpec["layers"][number], { type: "callout" }>;
  progress: number;
  spec: SceneGraphSpec;
}> = ({ layer, progress, spec }) => {
  const anchorStyles: Record<typeof layer.anchor, CSSProperties> = {
    left: { left: 84, top: 420, width: 390 },
    right: { right: 84, top: 420, width: 390 },
    center: { left: 360, right: 360, top: 430 },
  };

  return (
    <div
      style={{
        color: spec.theme.text,
        fontSize: 25,
        fontWeight: 850,
        lineHeight: 1.18,
        padding: "24px 26px",
        position: "absolute",
        ...anchorStyles[layer.anchor],
        ...panelStyle(spec, progress),
      }}
    >
      <TextBlock>{layer.text}</TextBlock>
    </div>
  );
};

const MetricLayer: FC<{
  layer: Extract<SceneGraphSpec["layers"][number], { type: "metric-highlight" }>;
  progress: number;
  spec: SceneGraphSpec;
}> = ({ layer, progress, spec }) => {
  const frame = useCurrentFrame();
  const pulse = spring({ frame, fps: spec.meta.fps, config: { damping: 16, stiffness: 80 } });

  return (
    <div
      style={{
        bottom: spec.captionSafeZone ? 132 : 82,
        left: 90,
        padding: "30px 34px",
        position: "absolute",
        width: 380,
        ...panelStyle(spec, progress),
      }}
    >
      <TextBlock style={{ color: spec.theme.muted, fontSize: 18, fontWeight: 800 }}>
        {layer.label}
      </TextBlock>
      <TextBlock
        style={{
          color: spec.theme.primary,
          fontSize: 76,
          fontWeight: 950,
          lineHeight: 0.95,
          marginTop: 8,
          transform: `scale(${0.96 + pulse * 0.04})`,
          transformOrigin: "left center",
        }}
      >
        {layer.value}
      </TextBlock>
      {layer.context ? (
        <TextBlock style={{ color: spec.theme.text, fontSize: 18, fontWeight: 750, marginTop: 14 }}>
          {layer.context}
        </TextBlock>
      ) : null}
    </div>
  );
};

const ProcessStepLayer: FC<{
  layer: Extract<SceneGraphSpec["layers"][number], { type: "process-step" }>;
  progress: number;
  spec: SceneGraphSpec;
}> = ({ layer, progress, spec }) => {
  const column = (layer.index - 1) % 3;
  const row = Math.floor((layer.index - 1) / 3);

  return (
    <div
      style={{
        left: 100 + column * 360,
        padding: "26px 28px",
        position: "absolute",
        top: 170 + row * 170,
        width: 300,
        ...panelStyle(spec, progress),
      }}
    >
      <div
        style={{
          alignItems: "center",
          background: spec.theme.primary,
          borderRadius: 999,
          color: spec.theme.background,
          display: "flex",
          fontSize: 19,
          fontWeight: 950,
          height: 44,
          justifyContent: "center",
          marginBottom: 16,
          width: 44,
        }}
      >
        {layer.index}
      </div>
      <TextBlock
        style={{ color: spec.theme.text, fontSize: 26, fontWeight: 900, lineHeight: 1.05 }}
      >
        {layer.title}
      </TextBlock>
      {layer.detail ? (
        <TextBlock
          style={{
            color: spec.theme.muted,
            fontSize: 17,
            fontWeight: 700,
            lineHeight: 1.25,
            marginTop: 10,
          }}
        >
          {layer.detail}
        </TextBlock>
      ) : null}
    </div>
  );
};

const CaptionReserveLayer: FC<{ progress: number; spec: SceneGraphSpec }> = ({
  progress,
  spec,
}) => (
  <div
    style={{
      background: `linear-gradient(180deg, transparent, ${spec.theme.background}b8)`,
      bottom: 0,
      height: 104,
      left: 0,
      opacity: progress * 0.65,
      position: "absolute",
      right: 0,
    }}
  />
);

const TextLayer: FC<{
  layer: Extract<SceneGraphSpec["layers"][number], { type: "text" }>;
  progress: number;
  spec: SceneGraphSpec;
}> = ({ layer, progress, spec }) => {
  const roleSize = {
    annotation: 20,
    eyebrow: 17,
    headline: 48,
    label: 24,
  }[layer.role];
  const layoutStyle: Record<typeof layer.layout, CSSProperties> = {
    center: { left: 220, right: 220, textAlign: "center", top: 112 },
    left: { left: 88, maxWidth: 520, top: 118 },
    right: { maxWidth: 520, right: 88, textAlign: "right", top: 118 },
    "safe-bottom": { bottom: spec.captionSafeZone ? 132 : 80, left: 88, right: 88 },
  };

  return (
    <div
      style={{
        color: layer.role === "eyebrow" ? spec.theme.secondary : spec.theme.text,
        fontSize: roleSize,
        fontWeight: layer.role === "headline" ? 950 : 850,
        lineHeight: 1.08,
        opacity: progress,
        position: "absolute",
        transform: `translateY(${(1 - progress) * 16}px)`,
        ...layoutStyle[layer.layout],
      }}
    >
      {layer.text}
    </div>
  );
};

const RichTextLayer: FC<{
  layer: Extract<SceneGraphSpec["layers"][number], { type: "rich-text" }>;
  progress: number;
  spec: SceneGraphSpec;
}> = ({ layer, progress, spec }) => {
  const style: Record<typeof layer.layout, CSSProperties> = {
    "safe-lockup": { bottom: spec.captionSafeZone ? 146 : 98, left: 88, maxWidth: 540 },
    "split-left": { left: 88, top: 184, width: 420 },
    "split-right": { right: 88, top: 184, width: 420 },
  };

  return (
    <div
      style={{
        color: spec.theme.text,
        opacity: progress,
        position: "absolute",
        transform: `translateY(${(1 - progress) * 20}px)`,
        ...style[layer.layout],
      }}
    >
      <div style={{ color: spec.theme.secondary, fontSize: 18, fontWeight: 900, marginBottom: 14 }}>
        {layer.title}
      </div>
      {layer.body.map((item, index) => (
        <div
          key={item}
          style={{
            alignItems: "center",
            display: "flex",
            fontSize: 22,
            fontWeight: 820,
            gap: 12,
            marginTop: index ? 12 : 0,
          }}
        >
          <span style={{ background: spec.theme.primary, height: 2, width: 34 }} />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
};

const ShapeLayer: FC<{
  layer: Extract<SceneGraphSpec["layers"][number], { type: "shape" }>;
  progress: number;
  spec: SceneGraphSpec;
}> = ({ layer, progress, spec }) => {
  const color = toneFill(spec, layer.tone);
  const base: CSSProperties = {
    background: color,
    opacity: progress * (layer.tone === "dark" ? 0.28 : 0.5),
    position: "absolute",
  };

  if (layer.shape === "beam") {
    return (
      <div
        style={{
          ...base,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          height: 180,
          left: -80,
          right: -80,
          top: layer.layout === "center-mark" ? 270 : 140,
          transform: `rotate(-10deg) scaleX(${0.35 + progress * 0.65})`,
        }}
      />
    );
  }

  if (layer.shape === "frame") {
    return (
      <div
        style={{
          border: `2px solid ${color}77`,
          bottom: layer.layout === "full-bleed" ? 72 : 128,
          left: layer.layout === "left-rail" ? 70 : 118,
          opacity: progress,
          position: "absolute",
          right: layer.layout === "right-rail" ? 70 : 118,
          top: 82,
        }}
      />
    );
  }

  return (
    <div
      style={{
        ...base,
        borderRadius: layer.shape === "circle" ? 999 : layer.shape === "mask" ? 0 : 2,
        bottom: layer.layout === "full-bleed" ? 0 : undefined,
        height: layer.shape === "circle" ? 260 : 8,
        left: layer.layout === "right-rail" ? undefined : layer.layout === "center-mark" ? 520 : 0,
        right: layer.layout === "right-rail" ? 0 : undefined,
        top: layer.layout === "center-mark" ? 210 : 0,
        transform: `scale(${0.8 + progress * 0.2})`,
        width: layer.shape === "circle" ? 260 : layer.layout === "full-bleed" ? "100%" : 12,
      }}
    />
  );
};

const ImagePlaneLayer: FC<{
  layer: Extract<SceneGraphSpec["layers"][number], { type: "image-plane" }>;
  progress: number;
  spec: SceneGraphSpec;
}> = ({ layer, progress, spec }) => (
  <div
    style={{
      background: `linear-gradient(135deg, ${spec.theme.primary}20, ${spec.theme.secondary}16)`,
      border: `1px solid ${spec.theme.text}24`,
      color: spec.theme.muted,
      fontSize: 18,
      fontWeight: 850,
      height: layer.treatment === "full-bleed" ? "100%" : 280,
      inset: layer.layout === "background" ? 0 : undefined,
      left: layer.layout === "split" ? 660 : layer.layout === "center" ? 300 : undefined,
      opacity: progress * (layer.layout === "background" ? 0.42 : 1),
      padding: 24,
      position: "absolute",
      top: layer.layout === "split" ? 154 : layer.layout === "center" ? 150 : undefined,
      transform: `translateY(${(1 - progress) * 18}px)`,
      width: layer.treatment === "full-bleed" ? "100%" : 520,
    }}
  >
    {layer.label}
  </div>
);

const renderLayer = (
  layer: SceneGraphSpec["layers"][number],
  spec: SceneGraphSpec,
  frame: number,
): ReactNode => {
  const progress = getLayerProgress(layer, frame, spec.durationInFrames);
  if (progress <= 0) {
    return null;
  }

  switch (layer.type) {
    case "background":
      return null;
    case "kinetic-title":
      return <KineticTitleLayer layer={layer} progress={progress} spec={spec} />;
    case "text":
      return <TextLayer layer={layer} progress={progress} spec={spec} />;
    case "rich-text":
      return <RichTextLayer layer={layer} progress={progress} spec={spec} />;
    case "shape":
      return <ShapeLayer layer={layer} progress={progress} spec={spec} />;
    case "image-plane":
      return <ImagePlaneLayer layer={layer} progress={progress} spec={spec} />;
    case "code-panel":
      return <CodePanelLayer layer={layer} progress={progress} spec={spec} />;
    case "terminal-panel":
      return <TerminalPanelLayer layer={layer} progress={progress} spec={spec} />;
    case "browser-window":
      return <BrowserWindowLayer layer={layer} progress={progress} spec={spec} />;
    case "node-graph":
      return <NodeGraphLayer layer={layer} progress={progress} spec={spec} />;
    case "line-path":
      return <LinePathLayer layer={layer} progress={progress} spec={spec} />;
    case "cursor":
      return <CursorLayer layer={layer} progress={progress} spec={spec} />;
    case "callout":
      return <CalloutLayer layer={layer} progress={progress} spec={spec} />;
    case "metric-highlight":
      return <MetricLayer layer={layer} progress={progress} spec={spec} />;
    case "process-step":
      return <ProcessStepLayer layer={layer} progress={progress} spec={spec} />;
    case "caption":
      return <CaptionReserveLayer progress={progress} spec={spec} />;
    default:
      return null;
  }
};

export const UniversalSceneRenderer: FC<SceneGraphSpec> = (spec) => {
  const frame = useCurrentFrame();
  const entrance = useEntranceProgress(32, 170);
  const transitionInOffset = spec.transitionIn?.type === "slide-up" ? (1 - entrance) * 40 : 0;

  return (
    <AbsoluteFill
      style={{
        color: spec.theme.text,
        fontFamily: CJK_SANS_FONT_STACK,
        overflow: "hidden",
      }}
    >
      <SceneBackground spec={spec} />
      <AbsoluteFill
        style={{
          opacity: entrance,
          transform: `translateY(${transitionInOffset}px)`,
        }}
      >
        {spec.layers.map((layer) => (
          <Sequence
            durationInFrames={layer.durationInFrames}
            from={layer.startFrame ?? 0}
            key={layer.id}
            layout="none"
          >
            {renderLayer(layer, spec, frame)}
          </Sequence>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SceneGraphRuntimeEditor: FC<RuntimeTemplateEditorProps> = (props) => (
  <SceneGraphEditor
    inputClassName={props.inputClassName}
    parsePositiveInteger={props.parsePositiveInteger}
    segment={props.segment as SceneGraphSegment}
    onSegmentChange={props.onSegmentChange as (segment: SceneGraphSegment) => void}
  />
);

export const sceneGraphRuntimeTemplate = defineRuntimeTemplate({
  renderSegment: (segment) => (
    <UniversalSceneRenderer {...(segment.implementation as SceneGraphSpec)} />
  ),
  Editor: SceneGraphRuntimeEditor,
});
