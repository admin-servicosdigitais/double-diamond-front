import { AgentDetailsView } from "@/features/agents/components/agent-details-view";

export default function AgentDetailsPage({ params }: { params: { agentId: string } }) {
  return <AgentDetailsView agentId={params.agentId} />;
}
