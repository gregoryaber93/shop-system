import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { logApiCall } from "./apiLogging";
import { toApiError } from "./errors";

const DEFAULT_TIMEOUT_MS = 0;//10_000;

const makeCorrelationId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const createApiClient = (
  getToken: () => string | null,
  onUnauthorized?: () => void,
): AxiosInstance => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5280",
    timeout: DEFAULT_TIMEOUT_MS,
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getToken();
    const correlationId = makeCorrelationId();

    const headers = config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers);
    headers.set("X-Correlation-Id", correlationId);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    config.headers = headers;

    return config;
  });

  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: unknown) => {
      const apiError = toApiError(error);
      const request = (error as { config?: { method?: string; url?: string; headers?: Record<string, unknown> } }).config;

      logApiCall({
        method: request?.method?.toUpperCase() ?? "UNKNOWN",
        url: request?.url ?? "unknown",
        correlationId: apiError.correlationId,
        status: apiError.status,
      });

      if (apiError.status === 401 && onUnauthorized) {
        onUnauthorized();
      }

      return Promise.reject(apiError);
    },
  );

  return client;
};
