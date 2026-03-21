import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { toApiError } from "./errors";

const DEFAULT_TIMEOUT_MS = 10_000;

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
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
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

      if (apiError.status === 401 && onUnauthorized) {
        onUnauthorized();
      }

      return Promise.reject(apiError);
    },
  );

  return client;
};
