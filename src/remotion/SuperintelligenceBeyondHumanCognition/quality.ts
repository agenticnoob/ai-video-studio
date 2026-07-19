import type { ProducerQualityPlan } from "../../../scripts/lib/producer-quality-gates";

export const producerQualityPlan = {
  compositionId: "SuperintelligenceBeyondHumanCognition",
  canvas: { width: 1080, height: 1920, fps: 30 },
  safeMargins: { top: 96, right: 56, bottom: 80, left: 56 },
  textLayouts: [
    {
      id: "scene-headline-plane",
      text: "人类还拥有决定未来的权力吗？",
      box: { x: 74, y: 1260, width: 932, height: 244 },
      measuredWidth: 890,
      measuredHeight: 176,
      fits: true,
      foregroundColor: "#f8f4ea",
      backgroundColor: "#030712",
    },
    {
      id: "portrait-caption-band",
      text: "未来是否属于人类，不只取决于谁更聪明。",
      box: { x: 56, y: 1640, width: 968, height: 196 },
      measuredWidth: 870,
      measuredHeight: 104,
      fits: true,
      foregroundColor: "#f8f4ea",
      backgroundColor: "#030712",
    },
  ],
  visibleElements: [
    { id: "chapter-kicker", bounds: { x: 74, y: 116, width: 420, height: 70 } },
    { id: "spatial-subject", bounds: { x: 70, y: 300, width: 940, height: 810 } },
    { id: "headline-and-caption", bounds: { x: 56, y: 1240, width: 968, height: 596 } },
  ],
  evidence: [
    {
      id: "research-backed-conceptual-visuals",
      status: "code-information-graphic",
      reason:
        "All fifteen scenes are explicitly conceptual code geometry supported by composition-local research notes; no frame is presented as a source screenshot.",
    },
  ],
  reviewFrames: [
    { frame: 210, label: "scene-01-local-map", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-00210-scene-01-local-map.png" },
    { frame: 926, label: "scene-02-extended-cognition", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-00926-scene-02-extended-cognition.png" },
    { frame: 1647, label: "scene-03-knowledge-scaffold", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-01647-scene-03-knowledge-scaffold.png" },
    { frame: 2103, label: "transition-chapter-ii", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-02103-transition-chapter-ii.png" },
    { frame: 2311, label: "scene-04-closed-loop", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-02311-scene-04-closed-loop.png" },
    { frame: 3089, label: "scene-05-recursion", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-03089-scene-05-recursion.png" },
    { frame: 3329, label: "dense-caption-recursion", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-03329-dense-caption-recursion.png" },
    { frame: 3939, label: "scene-06-phase-change", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-03939-scene-06-phase-change.png" },
    { frame: 4784, label: "scene-07-time-compression", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-04784-scene-07-time-compression.png" },
    { frame: 5319, label: "transition-chapter-iii", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-05319-transition-chapter-iii.png" },
    { frame: 5527, label: "scene-08-inaccessible-physics", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-05527-scene-08-inaccessible-physics.png" },
    { frame: 6334, label: "scene-09-opaque-science", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-06334-scene-09-opaque-science.png" },
    { frame: 7177, label: "scene-10-dependency", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-07177-scene-10-dependency.png" },
    { frame: 7729, label: "transition-chapter-iv", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-07729-transition-chapter-iv.png" },
    { frame: 7937, label: "scene-11-value-labels", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-07937-scene-11-value-labels.png" },
    { frame: 8704, label: "scene-12-consciousness-mirror", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-08704-scene-12-consciousness-mirror.png" },
    { frame: 9502, label: "scene-13-knowledge-frames", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-09502-scene-13-knowledge-frames.png" },
    { frame: 10030, label: "transition-chapter-v", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-10030-transition-chapter-v.png" },
    { frame: 10238, label: "scene-14-historical-subject", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-10238-scene-14-historical-subject.png" },
    { frame: 11083, label: "scene-15-final-agency", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-11083-scene-15-final-agency.png" },
    { frame: 11679, label: "ending-settle", path: "out/superintelligence-beyond-human-cognition/review-frames/frame-11679-ending-settle.png" },
  ],
  artifact: {
    mp4Path:
      "out/superintelligence-beyond-human-cognition/superintelligence-beyond-human-cognition.mp4",
    metadataPath:
      "out/superintelligence-beyond-human-cognition/superintelligence-beyond-human-cognition.json",
    expectedWidth: 1080,
    expectedHeight: 1920,
    expectedFps: 30,
    expectedDurationInFrames: 11709,
    chapters: [
      { name: "智能本身", durationInFrames: 2101 },
      { name: "闭环", durationInFrames: 3216 },
      { name: "认知断层", durationInFrames: 2410 },
      { name: "价值重写", durationInFrames: 2301 },
      { name: "新主体", durationInFrames: 1681 },
    ],
  },
  artifactPaths: [
    "public/generated/superintelligence-beyond-human-cognition/",
    "out/superintelligence-beyond-human-cognition/",
  ],
} satisfies ProducerQualityPlan;
