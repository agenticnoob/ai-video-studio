"use client";

import type { NextPage } from "next";
import { GenerationPanel } from "../components/project/GenerationPanel";
import { PreviewPanel } from "../components/project/PreviewPanel";
import { ProjectSummary } from "../components/project/ProjectSummary";
import { SegmentEditor } from "../components/project/SegmentEditor";
import { SegmentList } from "../components/project/SegmentList";
import { RenderControls } from "../components/ui/RenderControls";
import { useProjectGeneration } from "../helpers/use-project-generation";
import { useRendering } from "../helpers/use-rendering";

const Home: NextPage = () => {
  const generation = useProjectGeneration();
  const {
    renderMedia,
    state: renderState,
    undo: resetRenderState,
  } = useRendering(generation.normalizedProject);
  const isRendering = renderState.status === "rendering";
  const isMutatingProject =
    generation.isGenerating || generation.isRegeneratingSegment || isRendering;

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-8 text-foreground">
      <div className="space-y-6">
        <section className="rounded-geist border border-foreground bg-background p-4">
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
                generationPipeline={generation.generationPipeline}
                generationOperation={generation.generationOperation}
                isGenerating={generation.isGenerating}
                isStagedGeneration={generation.isStagedGeneration}
                isUploadingVoiceReference={generation.isUploadingVoiceReference}
                onBriefChange={generation.setBrief}
                onGenerate={generation.generateProject}
                onGenerationPipelineChange={generation.setGenerationPipeline}
                onVoiceCloneChange={generation.updateVoiceClone}
                onVoiceReferenceUpload={generation.uploadVoiceReference}
                voiceClone={generation.voiceClone}
                voiceReferenceError={generation.voiceReferenceError}
              />

              <RenderControls
                disabled={generation.isGenerating || generation.isRegeneratingSegment}
                onDismissResult={resetRenderState}
                onRender={renderMedia}
                state={renderState}
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
        </section>

        <section
          className={`rounded-geist border border-foreground bg-background p-4 ${
            isRendering ? "pointer-events-none opacity-70" : ""
          }`}
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
              isRegenerating={generation.isRegeneratingSegment}
              revisionPrompt={generation.revisionPrompt}
              segment={generation.selectedSegment}
              onRegenerateSegment={generation.regenerateSelectedSegment}
              onRevisionPromptChange={generation.setRevisionPrompt}
              onSegmentChange={generation.updateSegment}
            />
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;
