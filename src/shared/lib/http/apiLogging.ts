interface ApiLogInput {
  method: string;
  url: string;
  correlationId?: string;
  status?: number;
}

const isDev = (): boolean => import.meta.env.MODE !== "production";

export const logApiCall = ({ method, url, correlationId, status }: ApiLogInput): void => {
  if (!isDev()) {
    return;
  }

  console.log("[API]", {
    method,
    url,
    status,
    correlationId,
    timestamp: new Date().toISOString(),
  });
};
