import { ArtifactDetailsView } from "@/features/workflows/components/artifact-details-view";

export default function ArtifactDetailsPage({
  params,
}: {
  params: { workflowId: string; stageId: string; artifactName: string };
}) {
  return <ArtifactDetailsView workflowId={params.workflowId} stageId={params.stageId} artifactName={params.artifactName} />;
}
