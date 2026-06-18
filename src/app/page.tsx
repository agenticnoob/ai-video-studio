"use client";

import type { NextPage } from "next";
import { useRef, useState } from "react";
import { GenerationPanel } from "../components/project/GenerationPanel";
import { PreviewPanel } from "../components/project/PreviewPanel";
import { ProjectSummary } from "../components/project/ProjectSummary";
import { SegmentEditor } from "../components/project/SegmentEditor";
import { SegmentList } from "../components/project/SegmentList";
import { VisualReviewPanel } from "../components/project/VisualReviewPanel";
import { Card } from "../components/ui/Card";
import { RenderControls } from "../components/ui/RenderControls";
import { useProjectGeneration } from "../helpers/use-project-generation";
import { useRendering } from "../helpers/use-rendering";
import { useVisualReview } from "../helpers/use-visual-review";

const Home: NextPage = () => {
  const generation = useProjectGeneration();
  const segmentEditorSectionRef = useRef<HTMLElement | null>(null);
  const [focusRevisionPromptSignal, setFocusRevisionPromptSignal] = useState(0);
  const {
    renderMedia,
    state: renderState,
    undo: resetRenderState,
  } = useRendering(generation.normalizedProject);
  const {
    reset: resetVisualReviewState,
    reviewProject,
    state: visualReviewState,
  } = useVisualReview(generation.normalizedProject);
  const isRendering = renderState.status === "rendering";
  const isReviewing = visualReviewState.status === "reviewing";
  const isMutatingProject =
    generation.isGenerating || generation.isRegeneratingSegment || isRendering || isReviewing;
  const focusSegmentRevisionPrompt = () => {
    requestAnimationFrame(() => {
      segmentEditorSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setFocusRevisionPromptSignal((signal) => signal + 1);
    });
  };
  const applyVisualReviewRepairPrompt = (segmentId: string, prompt: string) => {
    generation.selectSegment(segmentId);
    generation.setRevisionPrompt(prompt);
    focusSegmentRevisionPrompt();
  };
  const regenerateSelectedSegmentFromVisualReview = async (segmentId: string, prompt: string) => {
    applyVisualReviewRepairPrompt(segmentId, prompt);
    const repairResult = await generation.regenerateSelectedSegment({
      revisionPrompt: prompt,
      segmentId,
    });

    if (!repairResult.ok) {
      throw new Error(repairResult.error);
    }
  };

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-8 text-foreground">
      <div className="space-y-6">
        <Card as="section" tone="workspace">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.22em]">VideoProject</div>
              <h2 className="mt-2 text-lg font-semibold">视频导出工作台</h2>
            </div>
            <div className="bg-foreground px-3 py-1 text-xs uppercase text-background">全局</div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <div className="space-y-6">
              <GenerationPanel
                brief={generation.brief}
                disabled={isMutatingProject}
                error={generation.error}
                generationOperation={generation.generationOperation}
                isGenerating={generation.isGenerating}
                isUploadingVoiceReference={generation.isUploadingVoiceReference}
                onBriefChange={generation.setBrief}
                onGenerate={generation.generateProject}
                onVoiceCloneChange={generation.updateVoiceClone}
                onVoiceReferenceUpload={generation.uploadVoiceReference}
                voiceClone={generation.voiceClone}
                voiceReferenceError={generation.voiceReferenceError}
              />

              <RenderControls
                disabled={
                  generation.isGenerating || generation.isRegeneratingSegment || isReviewing
                }
                onDismissResult={resetRenderState}
                onRender={renderMedia}
                state={renderState}
              />

              <VisualReviewPanel
                disabled={
                  generation.isGenerating || generation.isRegeneratingSegment || isRendering
                }
                onApplyRepairPrompt={applyVisualReviewRepairPrompt}
                onDismissResult={resetVisualReviewState}
                onRegenerateSegmentFromFinding={regenerateSelectedSegmentFromVisualReview}
                onReview={reviewProject}
                state={visualReviewState}
              />
            </div>

            <div className="space-y-6">
              <PreviewPanel
                durationInFrames={generation.durationInFrames}
                project={generation.normalizedProject}
              />

              <ProjectSummary project={generation.normalizedProject} />
            </div>
          </div>
        </Card>

        <section ref={segmentEditorSectionRef}>
          <Card
            as="section"
            className={isRendering ? "pointer-events-none opacity-70" : undefined}
            tone="workspace"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.22em]">Segments</div>
                <h2 className="mt-2 text-lg font-semibold">分镜编辑器</h2>
              </div>
              <div className="bg-foreground px-3 py-1 text-xs uppercase text-background">子级</div>
            </div>

            <div className="space-y-6">
              <SegmentList
                project={generation.normalizedProject}
                selectedSegmentId={generation.selectedSegmentId}
                onSelectSegment={generation.selectSegment}
              />

              <SegmentEditor
                focusRevisionPromptSignal={focusRevisionPromptSignal}
                isRegenerating={generation.isRegeneratingSegment}
                revisionPrompt={generation.revisionPrompt}
                segment={generation.selectedSegment}
                onRegenerateSegment={generation.regenerateSelectedSegment}
                onRevisionPromptChange={generation.setRevisionPrompt}
                onSegmentChange={generation.updateSegment}
              />
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default Home;
