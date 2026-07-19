import { aiDailyNews20260719Audio } from "./audio.generated";
import {
  AI_DAILY_NEWS_20260719_CONTENT_FAMILY,
  AI_DAILY_NEWS_20260719_PROFILE_ID,
  type Data,
  type Scene,
  type SceneId,
} from "./types";
import { narrationBeats } from "./script";

const SCENE_TAIL_PADDING_FRAMES = 8;

const audioBySceneId = new Map(
  aiDailyNews20260719Audio.map((track) => [track.sceneId, track]),
);

const trackFor = (sceneId: SceneId) => {
  const track = audioBySceneId.get(sceneId);
  if (!track) {
    throw new Error(`Missing audio metadata for ${sceneId}`);
  }
  return track;
};

export const data: Data = {
  contentFamily: AI_DAILY_NEWS_20260719_CONTENT_FAMILY,
  generatedAt: "2026-07-19T22:00:00.000+08:00",
  profileId: AI_DAILY_NEWS_20260719_PROFILE_ID,
  scenes: narrationBeats.map((beat): Scene => {
    const track = trackFor(beat.id);
    return {
      accent: beat.accent,
      audioFile: track.audioFile,
      captions: track.captions,
      durationInFrames: track.durationInFrames + SCENE_TAIL_PADDING_FRAMES,
      headline: beat.headline,
      id: beat.id,
      kicker: beat.kicker,
      narration: beat.narration,
      supportingText: beat.supportingText,
      visual: { kind: beat.visualKind },
    };
  }),
  topic: {
    date: "2026-07-19",
    primaryHeadline: "AI 行业正在从模型竞赛进入四个竞争层",
  },
};

export const getDuration = (_data: Data): number =>
  _data.scenes.reduce((total, scene) => total + scene.durationInFrames, 0);

export const buildSceneStarts = (scenes: readonly Scene[]): readonly number[] =>
  scenes.reduce<number[]>((starts, scene, index) => {
    if (index === 0) return [0];
    return [...starts, starts[index - 1] + scenes[index - 1].durationInFrames];
  }, []);