import type { CSSProperties, FC } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { recipeBlockClamp, recipeBlockEnter, recipeBlockFocusedOut } from "./block-animation";

export type WorkflowMapNode = {
  id: string;
  label: string;
  tint: string;
  x: number;
  y: number;
};

export type WorkflowMapBlockProps = {
  edgeStartFrame?: number;
  edgeStepFrames?: number;
  height?: number;
  nodeHeight?: number;
  nodeStartFrame?: number;
  nodeStepFrames?: number;
  nodeWidth?: number;
  nodes: WorkflowMapNode[];
  panelColor: string;
  style?: CSSProperties;
  textColor: string;
  width?: number;
};

export const WorkflowMapBlock: FC<WorkflowMapBlockProps> = ({
  edgeStartFrame = 66,
  edgeStepFrames = 26,
  height = 470,
  nodeHeight = 94,
  nodeStartFrame = 34,
  nodeStepFrames = 26,
  nodeWidth = 140,
  nodes,
  panelColor,
  style,
  textColor,
  width = 1050,
}) => {
  const frame = useCurrentFrame();
  const svgTop = 90;

  return (
    <div style={{ height, position: "relative", width, ...style }}>
      <svg height={360} style={{ position: "absolute", top: svgTop }} width={width}>
        {nodes.slice(0, -1).map((node, index) => {
          const next = nodes[index + 1];
          const edgeProgress = recipeBlockEnter(
            frame,
            edgeStartFrame + index * edgeStepFrames,
            edgeStartFrame + 30 + index * edgeStepFrames,
          );

          return (
            <line
              key={`${node.id}-${next.id}`}
              stroke={node.tint}
              strokeDasharray="10 12"
              strokeLinecap="round"
              strokeWidth={4}
              x1={node.x + nodeWidth * 0.41}
              x2={next.x - nodeWidth * 0.41}
              y1={node.y}
              y2={next.y}
              opacity={edgeProgress}
            />
          );
        })}
      </svg>
      {nodes.map((node, index) => {
        const nodeIn = recipeBlockEnter(
          frame,
          nodeStartFrame + index * nodeStepFrames,
          nodeStartFrame + 34 + index * nodeStepFrames,
        );
        const pulse = interpolate(frame, [130 + index * 12, 160 + index * 12], [0, 1], {
          ...recipeBlockClamp,
          easing: recipeBlockFocusedOut,
        });

        return (
          <div
            key={node.id}
            style={{
              alignItems: "center",
              backgroundColor: panelColor,
              border: `1px solid ${node.tint}88`,
              borderRadius: 20,
              boxShadow: `0 0 ${Math.round(18 + pulse * 22)}px ${node.tint}33`,
              color: textColor,
              display: "flex",
              fontSize: 20,
              fontWeight: 900,
              height: nodeHeight,
              justifyContent: "center",
              left: node.x - nodeWidth / 2,
              opacity: nodeIn,
              position: "absolute",
              top: svgTop + node.y - nodeHeight / 2,
              transform: `scale(${interpolate(nodeIn, [0, 1], [0.82, 1], recipeBlockClamp)})`,
              width: nodeWidth,
            }}
          >
            {node.label}
          </div>
        );
      })}
    </div>
  );
};
