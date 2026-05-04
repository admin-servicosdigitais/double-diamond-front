import { WorkflowCockpitView } from "@/features/workflows/cockpit/workflow-cockpit-view";

type Props = {
  params: { workflowId: string };
  searchParams?: { stage?: string };
};

export default function WorkflowDetailsPage({ params, searchParams }: Props) {
  return <WorkflowCockpitView workflowId={params.workflowId} initialStageKey={searchParams?.stage} />;
}
