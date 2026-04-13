export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type HeaderAction = {
  label: string;
  href: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
};

export type RouteContext = {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  actions: HeaderAction[];
};

const defaultContext: RouteContext = {
  title: "Dashboard",
  breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }],
  actions: [{ label: "Novo workflow", href: "/workflows/new" }],
};

function createWorkflowContext(pathname: string): RouteContext {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 1) {
    return {
      title: "Workflows",
      breadcrumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Workflows", href: "/workflows" },
      ],
      actions: [{ label: "Novo workflow", href: "/workflows/new" }],
    };
  }

  if (segments[1] === "new") {
    return {
      title: "Novo workflow",
      breadcrumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Workflows", href: "/workflows" },
        { label: "Novo" },
      ],
      actions: [{ label: "Ver lista", href: "/workflows", variant: "outline" }],
    };
  }

  const workflowId = segments[1];
  const workflowLabel = `Workflow ${workflowId}`;

  if (segments.length === 2) {
    return {
      title: workflowLabel,
      breadcrumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Workflows", href: "/workflows" },
        { label: workflowLabel },
      ],
      actions: [
        { label: "Outputs", href: `/workflows/${workflowId}/stages/overview/outputs`, variant: "outline" },
        { label: "Novo estágio", href: `/workflows/${workflowId}/stages/new` },
      ],
    };
  }

  if (segments[2] === "stages") {
    const stageId = segments[3] ?? "unknown";
    const stageLabel = `Estágio ${stageId}`;

    if (segments[4] !== "outputs") {
      return {
        title: stageLabel,
        breadcrumbs: [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Workflows", href: "/workflows" },
          { label: workflowLabel, href: `/workflows/${workflowId}` },
          { label: stageLabel },
        ],
        actions: [
          { label: "Ver outputs", href: `/workflows/${workflowId}/stages/${stageId}/outputs`, variant: "outline" },
          { label: "Aprovar estágio", href: "#" },
        ],
      };
    }

    if (segments.length === 5) {
      return {
        title: `Outputs · ${stageLabel}`,
        breadcrumbs: [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Workflows", href: "/workflows" },
          { label: workflowLabel, href: `/workflows/${workflowId}` },
          { label: stageLabel, href: `/workflows/${workflowId}/stages/${stageId}` },
          { label: "Outputs" },
        ],
        actions: [{ label: "Gerar output", href: "#" }],
      };
    }

    const artifactName = decodeURIComponent(segments[5] ?? "artifact");
    return {
      title: artifactName,
      breadcrumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Workflows", href: "/workflows" },
        { label: workflowLabel, href: `/workflows/${workflowId}` },
        { label: stageLabel, href: `/workflows/${workflowId}/stages/${stageId}` },
        { label: "Outputs", href: `/workflows/${workflowId}/stages/${stageId}/outputs` },
        { label: artifactName },
      ],
      actions: [{ label: "Baixar", href: "#", variant: "outline" }],
    };
  }

  return defaultContext;
}

export function getRouteContext(pathname: string): RouteContext {
  if (pathname.startsWith("/dashboard") || pathname === "/") {
    return {
      title: "Dashboard",
      breadcrumbs: [{ label: "Dashboard" }],
      actions: [{ label: "Novo workflow", href: "/workflows/new" }],
    };
  }

  if (pathname.startsWith("/workflows")) {
    return createWorkflowContext(pathname);
  }

  if (pathname.startsWith("/agents")) {
    const segments = pathname.split("/").filter(Boolean);
    const agentId = segments[1];

    return {
      title: agentId ? `Agent ${agentId}` : "Agents",
      breadcrumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Agents", href: "/agents" },
        ...(agentId ? [{ label: `Agent ${agentId}` }] : []),
      ],
      actions: [{ label: "Registrar agent", href: "#" }],
    };
  }

  if (pathname.startsWith("/health")) {
    return {
      title: "System Health",
      breadcrumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "System Health" },
      ],
      actions: [{ label: "Atualizar status", href: "#", variant: "outline" }],
    };
  }

  return defaultContext;
}
