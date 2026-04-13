import { WorkflowDetailsView } from "@/features/workflows/components/workflow-details-view";

export default function WorkflowDetailsPage({ params }: { params: { workflowId: string } }) {
  return <WorkflowDetailsView workflowId={params.workflowId} />;
}
