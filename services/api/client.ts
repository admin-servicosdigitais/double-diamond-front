const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

if (!API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn("NEXT_PUBLIC_API_BASE_URL is not defined. Configure it in .env.local.");
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions extends Omit<RequestInit, "body" | "method"> {
  method?: HttpMethod;
  body?: unknown;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function resolveErrorMessage(status: number, fallback?: string) {
  if (status >= 500) return fallback ?? "Erro interno no servidor. Tente novamente em instantes.";
  if (status === 404) return fallback ?? "Recurso não encontrado.";
  if (status === 400) return fallback ?? "Dados inválidos. Revise e tente novamente.";
  if (status === 401 || status === 403) return fallback ?? "Você não tem permissão para esta ação.";
  return fallback ?? "Não foi possível concluir a operação.";
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text || null;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
    cache: "no-store",
  });

  const parsed = await parseResponseBody(response);

  if (!response.ok) {
    const backendMessage =
      typeof parsed === "object" && parsed && "message" in parsed ? String(parsed.message) : undefined;

    throw new ApiError(resolveErrorMessage(response.status, backendMessage), response.status, parsed);
  }

  return parsed as T;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado.";
}
