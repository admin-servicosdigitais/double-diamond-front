import { StageDetailsView } from "@/features/workflows/components/stage-details-view";

export default function StageDetailsPage({ params }: { params: { workflowId: string; stageId: string } }) {
  return <StageDetailsView workflowId={params.workflowId} stageId={params.stageId} />;
}
