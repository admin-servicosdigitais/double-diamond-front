import { StageOutputsView } from "@/features/workflows/components/stage-outputs-view";

export default function StageOutputsPage({ params }: { params: { workflowId: string; stageId: string } }) {
  return <StageOutputsView workflowId={params.workflowId} stageId={params.stageId} />;
}
