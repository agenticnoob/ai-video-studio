import type { FC } from "react";
import { Composition } from "remotion";
import { getProjectDuration, videoProjectSchema, type VideoProject } from "../lib/project-schema";
import { ProjectVideo } from "./ProjectVideo/ProjectVideo";

const calculateVideoProjectMetadata = ({ props }: { props: VideoProject }) => {
  const parsedProject = videoProjectSchema.parse(props) as VideoProject;

  return {
    durationInFrames: getProjectDuration(parsedProject),
    fps: parsedProject.meta.fps,
    width: parsedProject.meta.width,
    height: parsedProject.meta.height,
  };
};

export const RemotionRoot: FC = () => {
  return (
    <>
      <Composition
        id="ScriptedTemplatePreview"
        component={ProjectVideo}
        schema={videoProjectSchema}
        defaultProps={{
          meta: {
            title: "Scripted Template Preview",
            fps: 30,
            width: 1280,
            height: 720,
          },
          brief: "Render one scripted template segment.",
          segments: [
            {
              id: "segment-1",
              title: "Setup",
              intent: "Explain why staged generation matters before the recap.",
              templateId: "scripted",
              durationInFrames: 150,
              implementation: {
                meta: {
                  title: "Setup",
                  fps: 30,
                  width: 1280,
                  height: 720,
                },
                theme: {
                  background: "#0f172a",
                  panel: "rgba(255,255,255,0.08)",
                  primary: "#38bdf8",
                  secondary: "#f59e0b",
                  text: "#f8fafc",
                  muted: "#cbd5e1",
                },
                scenes: [
                  {
                    id: "setup-title",
                    type: "title",
                    title: "Staged generation",
                    subtitle: "Plan, speak, compile, assemble.",
                    duration: 60,
                  },
                  {
                    id: "setup-bullets",
                    type: "bullets",
                    title: "Why it matters",
                    bullets: [
                      "One primary template per segment",
                      "Narration duration drives visuals",
                    ],
                    duration: 90,
                  },
                ],
              },
            },
          ],
        }}
        durationInFrames={150}
        fps={30}
        width={1280}
        height={720}
        calculateMetadata={calculateVideoProjectMetadata}
      />
      <Composition
        id="SpotlightTemplatePreview"
        component={ProjectVideo}
        schema={videoProjectSchema}
        defaultProps={{
          meta: {
            title: "Spotlight Template Preview",
            fps: 30,
            width: 1280,
            height: 720,
          },
          brief: "Render one spotlight template segment.",
          segments: [
            {
              id: "segment-2",
              title: "Focused recap",
              intent: "Emphasize the key takeaway after the setup.",
              templateId: "spotlight",
              durationInFrames: 120,
              implementation: {
                meta: {
                  title: "Focused recap",
                  fps: 30,
                  width: 1280,
                  height: 720,
                },
                theme: {
                  background: "#111827",
                  panel: "rgba(255,255,255,0.10)",
                  primary: "#22c55e",
                  secondary: "#f97316",
                  text: "#f9fafb",
                  muted: "#d1d5db",
                },
                durationInFrames: 120,
                kicker: "Recap",
                headline: "Edits stay local",
                subheadline: "The final draft remains a validated VideoProject.",
                callouts: ["Plan", "TTS", "Compile"],
              },
            },
          ],
        }}
        durationInFrames={120}
        fps={30}
        width={1280}
        height={720}
        calculateMetadata={calculateVideoProjectMetadata}
      />
      <Composition
        id="StatsDashboardTemplatePreview"
        component={ProjectVideo}
        schema={videoProjectSchema}
        defaultProps={{
          meta: {
            title: "Stats Dashboard Smoke",
            fps: 30,
            width: 1280,
            height: 720,
          },
          brief: "Render one data-statistics segment with segment-owned narration.",
          segments: [
            {
              id: "segment-1",
              title: "Dashboard recap",
              intent: "Summarize a data-backed quarterly growth result.",
              templateId: "stats-dashboard",
              durationInFrames: 180,
              implementation: {
                meta: {
                  title: "Dashboard recap",
                  fps: 30,
                  width: 1280,
                  height: 720,
                },
                theme: {
                  background: "#0f172a",
                  panel: "rgba(248,250,252,0.10)",
                  primary: "#38bdf8",
                  secondary: "#f59e0b",
                  text: "#f8fafc",
                  muted: "#cbd5e1",
                },
                durationInFrames: 180,
                layout: "timeline",
                kicker: "Quarterly KPI",
                title: "Revenue momentum is compounding",
                subtitle:
                  "A sequenced dashboard can reveal KPI, trend, and share blocks inside one segment.",
                blocks: [
                  {
                    id: "revenue-kpi",
                    type: "kpi",
                    title: "Primary signal",
                    value: "+42%",
                    label: "Revenue growth",
                    delta: "+11 pts vs last quarter",
                    deltaDirection: "up",
                  },
                  {
                    id: "revenue-trend",
                    type: "line-chart",
                    title: "Revenue index",
                    chart: {
                      categories: ["Q1", "Q2", "Q3", "Q4"],
                      series: [
                        {
                          name: "Revenue index",
                          values: [42, 58, 73, 96],
                          color: "#38bdf8",
                        },
                      ],
                      unit: "index",
                      maxValue: 100,
                      highlightIndex: 3,
                    },
                  },
                  {
                    id: "channel-mix",
                    type: "donut-chart",
                    title: "Channel mix",
                    centerValue: "52%",
                    centerLabel: "Paid search",
                    segments: [
                      {
                        label: "Paid search",
                        value: 52,
                        color: "#38bdf8",
                      },
                      {
                        label: "Organic",
                        value: 28,
                        color: "#22c55e",
                      },
                      {
                        label: "Referral",
                        value: 20,
                        color: "#f59e0b",
                      },
                    ],
                  },
                  {
                    id: "takeaway",
                    type: "insight",
                    title: "Takeaway",
                    text: "Mid-quarter campaign tuning lifted both revenue velocity and paid-search share.",
                  },
                ],
                timeline: [
                  {
                    from: 0,
                    durationInFrames: 70,
                    blockIds: ["revenue-kpi"],
                    layout: "single",
                  },
                  {
                    from: 58,
                    durationInFrames: 82,
                    blockIds: ["revenue-trend"],
                    layout: "single",
                  },
                  {
                    from: 132,
                    durationInFrames: 48,
                    blockIds: ["revenue-kpi", "revenue-trend", "channel-mix", "takeaway"],
                    layout: "grid",
                  },
                ],
                footerNote: "Fixture data for deterministic template smoke.",
              },
            },
          ],
        }}
        durationInFrames={180}
        fps={30}
        width={1280}
        height={720}
        calculateMetadata={calculateVideoProjectMetadata}
      />
    </>
  );
};
