export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  correlationId?: string;
  instance?: string;
  extensions?: Record<string, unknown>;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly detail: string;
  public readonly correlationId?: string;
  public readonly type?: string;

  constructor(params: {
    message: string;
    status: number;
    detail: string;
    correlationId?: string;
    type?: string;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.detail = params.detail;
    this.correlationId = params.correlationId;
    this.type = params.type;
  }
}

export const toApiError = (error: unknown): ApiError => {
  const axiosLike = error as {
    response?: { status?: number; data?: unknown };
    code?: string;
    message?: string;
  };

  const status = axiosLike.response?.status;
  const data = axiosLike.response?.data as ProblemDetails | undefined;

  if (status && data) {
    const detail = data.detail ?? data.title ?? "Unexpected API error";
    return new ApiError({
      message: detail,
      status,
      detail,
      correlationId: data.correlationId,
      type: data.type,
    });
  }

  if (axiosLike.code === "ECONNABORTED") {
    return new ApiError({
      message: "Request timeout",
      status: 408,
      detail: "The request took too long to complete.",
    });
  }

  return new ApiError({
    message: "Unexpected error",
    status: status ?? 500,
    detail: axiosLike.message ?? "Network error",
  });
};
