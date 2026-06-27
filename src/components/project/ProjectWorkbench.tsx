"use client";

import type { FC } from "react";

import { Card } from "../ui/Card";
import { GenerationPanel } from "./GenerationPanel";
import { PreviewPanel } from "./PreviewPanel";
import { ProjectSummary } from "./ProjectSummary";
import { RenderControls } from "../ui/RenderControls";
import { SegmentEditor } from "./SegmentEditor";
import { SegmentList } from "./SegmentList";
import { useProjectGeneration } from "../../helpers/use-project-generation";
import { useRendering } from "../../helpers/use-rendering";
import type { VideoProject } from "../../lib/project-schema";

type ProjectWorkbenchProps = {
  readonly initialProject?: VideoProject;
};

export const ProjectWorkbench: FC<ProjectWorkbenchProps> = ({ initialProject }) => {
  const generation = useProjectGeneration({ initialProject });
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
                isUploadingProductUiAsset={generation.isUploadingProductUiAsset}
                isUploadingVoiceReference={generation.isUploadingVoiceReference}
                onBriefChange={generation.setBrief}
                onGenerate={generation.generateProject}
                onProductUiAssetRemove={generation.removeProductUiAsset}
                onProductUiAssetUpload={generation.uploadProductUiAsset}
                onVoiceCloneChange={generation.updateVoiceClone}
                onVoiceReferenceUpload={generation.uploadVoiceReference}
                productUiAssetError={generation.productUiAssetError}
                productUiAssets={generation.productUiAssets}
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
        </Card>

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
              isUploadingProductUiAsset={generation.isUploadingProductUiAsset}
              isRegenerating={generation.isRegeneratingSegment}
              onProductUiAssetRemove={generation.removeProductUiAsset}
              onProductUiAssetUpload={generation.uploadProductUiAsset}
              revisionPrompt={generation.revisionPrompt}
              segment={generation.selectedSegment}
              productUiAssetError={generation.productUiAssetError}
              productUiAssets={generation.productUiAssets}
              onRegenerateSegment={generation.regenerateSelectedSegment}
              onRevisionPromptChange={generation.setRevisionPrompt}
              onSegmentChange={generation.updateSegment}
            />
          </div>
        </Card>
      </div>
    </main>
  );
};
