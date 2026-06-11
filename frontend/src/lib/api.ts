import { API_URL } from "./utils";

// ─── Base Fetch Wrapper ──────────────────────────────────────────

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function baseFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(fetchOptions.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new ApiError(res.status, error.message || `Error ${res.status}`);
  }

  // Handle empty responses (204 No Content)
  if (res.status === 204) return {} as T;

  return res.json();
}

// ─── HTTP Methods ────────────────────────────────────────────────

export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    baseFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    baseFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    baseFetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    baseFetch<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    baseFetch<T>(endpoint, { ...options, method: "DELETE" }),

  upload: <T>(endpoint: string, formData: FormData, options?: FetchOptions) =>
    baseFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
    }),
};

// ─── SSE Stream Helper ───────────────────────────────────────────


