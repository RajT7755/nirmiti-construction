const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

/** Shared API key (optional). Inventory can override with VITE_INVENTORY_API_KEY. */
function resolveApiKey(scope: "default" | "inventory" = "default"): string | undefined {
  if (scope === "inventory") {
    return (
      import.meta.env.VITE_INVENTORY_API_KEY ||
      import.meta.env.VITE_API_KEY ||
      undefined
    );
  }
  return import.meta.env.VITE_API_KEY || undefined;
}

function buildHeaders(
  options: RequestInit = {},
  scope: "default" | "inventory" = "default"
): HeadersInit {
  const key = resolveApiKey(scope);
  return {
    "Content-Type": "application/json",
    ...(key
      ? {
          "X-API-Key": key,
          Authorization: `Bearer ${key}`,
        }
      : {}),
    ...options.headers,
  };
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  scope: "default" | "inventory" = "default"
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: buildHeaders(options, scope),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText || endpoint}`);
  }

  return res.json() as Promise<T>;
}

export async function apiRequestBlob(
  endpoint: string,
  options: RequestInit = {},
  scope: "default" | "inventory" = "default"
): Promise<Blob> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: buildHeaders(options, scope),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText || endpoint}`);
  }

  return res.blob();
}

export { API_BASE, resolveApiKey };
