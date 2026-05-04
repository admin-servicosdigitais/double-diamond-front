export type HeaderAction = {
  label: string;
  href: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
};

export type RouteContext = {
  title: string;
  primaryAction?: HeaderAction;
};

const NEW_WORKFLOW: HeaderAction = { label: "Novo workflow", href: "/workflows/new" };

export function getRouteContext(pathname: string): RouteContext {
  if (pathname === "/" || pathname.startsWith("/dashboard")) {
    return { title: "Dashboard", primaryAction: NEW_WORKFLOW };
  }

  if (pathname.startsWith("/workflows")) {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 1) {
      return { title: "Workflows", primaryAction: NEW_WORKFLOW };
    }

    if (segments[1] === "new") {
      return {
        title: "Novo workflow",
        primaryAction: { label: "Ver lista", href: "/workflows", variant: "outline" },
      };
    }

    return { title: "Workflow", primaryAction: NEW_WORKFLOW };
  }

  if (pathname.startsWith("/agents")) {
    return { title: "Agentes" };
  }

  if (pathname.startsWith("/health")) {
    return { title: "Saúde da API" };
  }

  return { title: "Dashboard", primaryAction: NEW_WORKFLOW };
}
