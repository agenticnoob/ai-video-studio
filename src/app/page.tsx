import type { ReactElement } from "react";

import { ProjectWorkbench } from "../components/project/ProjectWorkbench";
import { sampleProject } from "../lib/sample-video";
import { technicalExplainerPreviewProject } from "../lib/staged-smoke-fixtures";

type PageSearchParams = {
  readonly qaProject?: string | string[];
};

const readSearchParam = (value: string | string[] | undefined): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  return Array.isArray(value) ? value[0] : undefined;
};

export default async function Page({
  searchParams,
}: {
  readonly searchParams: Promise<PageSearchParams>;
}): Promise<ReactElement> {
  const resolvedSearchParams = await searchParams;
  const qaProject = readSearchParam(resolvedSearchParams.qaProject);
  const initialProject =
    qaProject === "technical-explainer-preview" ? technicalExplainerPreviewProject : sampleProject;

  return <ProjectWorkbench initialProject={initialProject} />;
}
