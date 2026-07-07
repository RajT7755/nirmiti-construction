const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText || endpoint}`);
  }

  return res.json() as Promise<T>;
}

export async function apiRequestBlob(
  endpoint: string,
  options: RequestInit = {}
): Promise<Blob> {
  const res = await fetch(`${API_BASE}${endpoint}`, options);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText || endpoint}`);
  }

  return res.blob();
}

export { API_BASE };
