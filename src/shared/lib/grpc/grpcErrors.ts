import { ApiError } from "@/shared/lib/http/errors";

export type GrpcErrorCode =
  | "UNAVAILABLE"
  | "DEADLINE_EXCEEDED"
  | "INVALID_ARGUMENT"
  | "NOT_FOUND"
  | "PERMISSION_DENIED"
  | "INTERNAL"
  | "UNAUTHENTICATED";

export interface GrpcError {
  code: GrpcErrorCode;
  message: string;
  details?: string;
}

export const mapApiErrorToGrpc = (error: ApiError): GrpcError | null => {
  if (error.status === 503) {
    return {
      code: "UNAVAILABLE",
      message: "Service temporarily unavailable",
      details: error.detail,
    };
  }

  if (error.status === 408) {
    return {
      code: "DEADLINE_EXCEEDED",
      message: "Request timeout (gRPC service slow)",
      details: error.detail,
    };
  }

  if (error.status === 422) {
    return {
      code: "INVALID_ARGUMENT",
      message: "Invalid request",
      details: error.detail,
    };
  }

  if (error.status === 404) {
    return {
      code: "NOT_FOUND",
      message: "Resource not found",
      details: error.detail,
    };
  }

  if (error.status === 401) {
    return {
      code: "UNAUTHENTICATED",
      message: "JWT validation failed",
      details: error.detail,
    };
  }

  if (error.status === 403) {
    return {
      code: "PERMISSION_DENIED",
      message: "Authorization failed",
      details: error.detail,
    };
  }

  if (error.status >= 500) {
    return {
      code: "INTERNAL",
      message: "Internal gRPC-dependent service error",
      details: error.detail,
    };
  }

  return null;
};
