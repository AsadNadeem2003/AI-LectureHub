const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface FetchOptions extends RequestInit {
  token?: string;
  _retry?: boolean;
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Authenticated API client wrapper around fetch.
 * Automatically attaches JWT token and performs silent token rotation on 401 Unauthorized.
 */
export async function apiClient<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, headers, _retry, ...rest } = options;

  // Resolve token: from param, or from localStorage in browser context
  let authToken = token;
  if (!authToken && typeof window !== "undefined") {
    authToken = localStorage.getItem("token") || undefined;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...rest,
    credentials: "include", // Pass httpOnly refresh cookies automatically
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  });

  // Handle 401 Unauthorized - Attempt silent refresh token rotation
  if (res.status === 401 && !_retry && typeof window !== "undefined" && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/refresh")) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch("http://localhost:5000/api/v1/auth/refresh", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newToken = refreshData.accessToken || refreshData.token;
          if (newToken) {
            localStorage.setItem("token", newToken);
            isRefreshing = false;
            onRefreshed(newToken);
            return apiClient<T>(endpoint, { ...options, token: newToken, _retry: true });
          }
        }
      } catch (e) {
        // Refresh failed
      } finally {
        isRefreshing = false;
      }

      // If refresh failed completely, clear session
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    } else {
      // Queue requests while token refresh is in progress
      return new Promise<T>((resolve, reject) => {
        subscribeTokenRefresh((newToken: string) => {
          apiClient<T>(endpoint, { ...options, token: newToken, _retry: true })
            .then(resolve)
            .catch(reject);
        });
      });
    }
  }

  // Handle non-2xx responses
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({
      message: "Network error",
    }));
    throw new ApiError(res.status, errorBody.message || errorBody.error || "Request failed", errorBody.errors);
  }

  return res.json() as Promise<T>;
}

/**
 * Custom error class for API responses with status code and validation errors.
 */
export class ApiError extends Error {
  status: number;
  errors?: Array<{ field: string; message: string }>;

  constructor(
    status: number,
    message: string,
    errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

// ── Convenience Methods ───────────────────────────────────────────────────
export const api = {
  get: <T = unknown>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
