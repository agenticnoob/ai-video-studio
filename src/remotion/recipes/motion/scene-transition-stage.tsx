import type { FC, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

export const SCENE_CONTENT_PREROLL_IN_FRAMES = 36;

export const RECIPE_SCENE_TRANSITION_MOTIONS = ["stage-push", "fly-through", "cube-turn"] as const;

export type RecipeSceneTransitionMotion = (typeof RECIPE_SCENE_TRANSITION_MOTIONS)[number];

export type SceneTransitionStageProps = {
  children: ReactNode;
  height: number;
  index: number;
  motion: RecipeSceneTransitionMotion;
  overlapFrames: number;
  sceneCount: number;
  sceneDurationInFrames: number;
  transitionFrames: number;
  width: number;
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const stageMotionEase = {
  ...clamp,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
};

const stageProgress = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], stageMotionEase);

const stageOpacity = ({
  frame,
  index,
  overlapFrames,
  sceneCount,
  sceneDurationInFrames,
  transitionFrames,
}: {
  frame: number;
  index: number;
  overlapFrames: number;
  sceneCount: number;
  sceneDurationInFrames: number;
  transitionFrames: number;
}) => {
  const enterOpacity =
    index === 0 ? 1 : interpolate(frame, [0, transitionFrames * 0.7], [0, 1], stageMotionEase);
  const exitOpacity =
    index === sceneCount - 1
      ? 1
      : interpolate(
          frame,
          [sceneDurationInFrames - transitionFrames * 0.65, sceneDurationInFrames + overlapFrames],
          [1, 0.18],
          { ...clamp, easing: Easing.in(Easing.ease) },
        );

  return Math.min(enterOpacity, exitOpacity);
};

const getOutgoingProgress = ({
  frame,
  index,
  overlapFrames,
  sceneCount,
  sceneDurationInFrames,
  transitionFrames,
}: {
  frame: number;
  index: number;
  overlapFrames: number;
  sceneCount: number;
  sceneDurationInFrames: number;
  transitionFrames: number;
}) =>
  index === sceneCount - 1
    ? 0
    : stageProgress(
        frame,
        sceneDurationInFrames - transitionFrames,
        sceneDurationInFrames + overlapFrames,
      );

const stagePushStyle = ({
  frame,
  height: _height,
  index,
  overlapFrames,
  sceneCount,
  sceneDurationInFrames,
  transitionFrames,
  width,
}: Omit<SceneTransitionStageProps, "children" | "motion"> & { frame: number }) => {
  const incoming = index === 0 ? 1 : stageProgress(frame, 0, transitionFrames);
  const outgoing = getOutgoingProgress({
    frame,
    index,
    overlapFrames,
    sceneCount,
    sceneDurationInFrames,
    transitionFrames,
  });

  const enterX = interpolate(incoming, [0, 1], [width * 0.62, 0], clamp);
  const enterScale = interpolate(incoming, [0, 1], [0.78, 1], clamp);
  const enterRotateY = interpolate(incoming, [0, 1], [34, 0], clamp);
  const exitX = interpolate(outgoing, [0, 1], [0, -width * 0.72], clamp);
  const exitScale = interpolate(outgoing, [0, 1], [1, 0.82], clamp);
  const exitRotateY = interpolate(outgoing, [0, 1], [0, -42], clamp);

  return {
    filter: `blur(${interpolate(Math.max(1 - incoming, outgoing), [0, 1], [0, 1.8], clamp)}px)`,
    transform: `translate3d(${enterX + exitX}px, 0, 0) rotateY(${enterRotateY + exitRotateY}deg) scale(${
      enterScale * exitScale
    })`,
  };
};

const flyThroughStyle = ({
  frame,
  height,
  index,
  overlapFrames,
  sceneCount,
  sceneDurationInFrames,
  transitionFrames,
  width,
}: Omit<SceneTransitionStageProps, "children" | "motion"> & { frame: number }) => {
  const incoming = index === 0 ? 1 : stageProgress(frame, 0, transitionFrames);
  const outgoing = getOutgoingProgress({
    frame,
    index,
    overlapFrames,
    sceneCount,
    sceneDurationInFrames,
    transitionFrames,
  });

  const enterX = interpolate(incoming, [0, 1], [width * 0.46, 0], clamp);
  const enterY = interpolate(incoming, [0, 1], [height * 0.24, 0], clamp);
  const enterScale = interpolate(incoming, [0, 1], [1.28, 1], clamp);
  const enterRotateY = interpolate(incoming, [0, 1], [24, 0], clamp);
  const enterRotateZ = interpolate(incoming, [0, 1], [7, 0], clamp);
  const exitX = interpolate(outgoing, [0, 1], [0, -width * 0.86], clamp);
  const exitY = interpolate(outgoing, [0, 1], [0, -height * 0.28], clamp);
  const exitScale = interpolate(outgoing, [0, 1], [1, 0.44], clamp);
  const exitRotateY = interpolate(outgoing, [0, 1], [0, -38], clamp);
  const exitRotateZ = interpolate(outgoing, [0, 1], [0, -10], clamp);

  return {
    filter: `blur(${interpolate(Math.max(1 - incoming, outgoing), [0, 1], [0, 3.2], clamp)}px)`,
    transform: `translate3d(${enterX + exitX}px, ${enterY + exitY}px, 0) rotateZ(${
      enterRotateZ + exitRotateZ
    }deg) rotateY(${enterRotateY + exitRotateY}deg) scale(${enterScale * exitScale})`,
  };
};

const cubeTurnStyle = ({
  frame,
  height: _height,
  index,
  overlapFrames,
  sceneCount,
  sceneDurationInFrames,
  transitionFrames,
  width,
}: Omit<SceneTransitionStageProps, "children" | "motion"> & { frame: number }) => {
  const incoming = index === 0 ? 1 : stageProgress(frame, 0, transitionFrames);
  const outgoing = getOutgoingProgress({
    frame,
    index,
    overlapFrames,
    sceneCount,
    sceneDurationInFrames,
    transitionFrames,
  });

  const enterX = interpolate(incoming, [0, 1], [width * 0.22, 0], clamp);
  const enterRotateY = interpolate(incoming, [0, 1], [88, 0], clamp);
  const exitX = interpolate(outgoing, [0, 1], [0, -width * 0.25], clamp);
  const exitRotateY = interpolate(outgoing, [0, 1], [0, -88], clamp);

  return {
    filter: `blur(${interpolate(Math.max(1 - incoming, outgoing), [0, 1], [0, 1.4], clamp)}px)`,
    transform: `translate3d(${enterX + exitX}px, 0, 0) rotateY(${enterRotateY + exitRotateY}deg) scale(${interpolate(
      Math.max(1 - incoming, outgoing),
      [0, 1],
      [1, 0.9],
      clamp,
    )})`,
  };
};

const motionStyle = (
  motion: RecipeSceneTransitionMotion,
  props: Omit<SceneTransitionStageProps, "children" | "motion"> & { frame: number },
) => {
  if (motion === "fly-through") {
    return flyThroughStyle(props);
  }

  if (motion === "cube-turn") {
    return cubeTurnStyle(props);
  }

  return stagePushStyle(props);
};

export const SceneTransitionStage: FC<SceneTransitionStageProps> = ({
  children,
  height,
  index,
  motion,
  overlapFrames,
  sceneCount,
  sceneDurationInFrames,
  transitionFrames,
  width,
}) => {
  const frame = useCurrentFrame();
  const stage = motionStyle(motion, {
    frame,
    height,
    index,
    overlapFrames,
    sceneCount,
    sceneDurationInFrames,
    transitionFrames,
    width,
  });

  return (
    <AbsoluteFill
      style={{
        filter: stage.filter,
        opacity: stageOpacity({
          frame,
          index,
          overlapFrames,
          sceneCount,
          sceneDurationInFrames,
          transitionFrames,
        }),
        perspective: 1200,
        transform: stage.transform,
        transformOrigin:
          motion === "cube-turn" ? (index % 2 === 0 ? "right center" : "left center") : "50% 50%",
        transformStyle: "preserve-3d",
        willChange: "transform, opacity, filter",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const getSceneTransitionSequenceTiming = ({
  index,
  overlapFrames,
  sceneDurationInFrames,
}: {
  index: number;
  overlapFrames: number;
  sceneDurationInFrames: number;
}) => ({
  durationInFrames: sceneDurationInFrames + overlapFrames,
  from: Math.max(0, index * sceneDurationInFrames - (index === 0 ? 0 : overlapFrames)),
});

export const getSceneContentPrerollFrom = (index: number) =>
  index === 0 ? 0 : -SCENE_CONTENT_PREROLL_IN_FRAMES;
