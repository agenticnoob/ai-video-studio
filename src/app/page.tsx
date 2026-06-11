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
    <main className="mx-auto max-w-screen-2xl px-4 py-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <GenerationPanel
            brief={generation.brief}
            disabled={isMutatingProject}
            error={generation.error}
            generationPipeline={generation.generationPipeline}
            isGenerating={generation.isGenerating}
            isStagedGeneration={generation.isStagedGeneration}
            onBriefChange={generation.setBrief}
            onGenerate={generation.generateProject}
            onGenerationPipelineChange={generation.setGenerationPipeline}
          />

          <PreviewPanel
            durationInFrames={generation.durationInFrames}
            project={generation.normalizedProject}
          />

          <RenderControls
            disabled={generation.isGenerating || generation.isRegeneratingSegment}
            onDismissResult={resetRenderState}
            onRender={renderMedia}
            state={renderState}
          />

          <ProjectSummary project={generation.normalizedProject} />

          <div className={isRendering ? "pointer-events-none opacity-70" : undefined}>
            <SegmentEditor
              isRegenerating={generation.isRegeneratingSegment}
              revisionPrompt={generation.revisionPrompt}
              segment={generation.selectedSegment}
              onRegenerateSegment={generation.regenerateSelectedSegment}
              onRevisionPromptChange={generation.setRevisionPrompt}
              onSegmentChange={generation.updateSegment}
            />
          </div>
        </div>

        <div
          className={`space-y-6 xl:sticky xl:top-6 xl:self-start ${
            isRendering ? "pointer-events-none opacity-70" : ""
          }`}
        >
          <SegmentList
            project={generation.normalizedProject}
            selectedSegmentId={generation.selectedSegmentId}
            onSelectSegment={generation.selectSegment}
          />
        </div>
      </div>
    </main>
  );
};

export default Home;
