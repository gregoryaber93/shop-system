import { type ReactNode } from "react";

import { mapApiErrorToGrpc } from "@/shared/lib/grpc/grpcErrors";
import { ApiError } from "@/shared/lib/http/errors";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  retryLabel?: string;
  title?: string;
  extraActions?: ReactNode;
}

const mapStatusMessage = (status: number): string => {
  if (status === 401) {
    return "Unauthorized. Please sign in again.";
  }

  if (status === 403) {
    return "Access denied. You do not have permission for this action.";
  }

  if (status === 404) {
    return "Resource not found.";
  }

  if (status === 409) {
    return "Conflict detected. Refresh the page and try again.";
  }

  if (status === 422) {
    return "Validation error. Please verify input data.";
  }

  if (status === 408) {
    return "Request timeout. Please check connection and retry.";
  }

  if (status >= 500) {
    return "Server error. Please try again later.";
  }

  return "Unexpected error.";
};

const normalizeError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    const status = (error as { status?: number }).status ?? 500;
    const detail = (error as { detail?: string }).detail ?? error.message;
    const correlationId = (error as { correlationId?: string }).correlationId;

    return new ApiError({
      message: error.message,
      status,
      detail,
      correlationId,
    });
  }

  return new ApiError({
    message: "Unexpected error",
    status: 500,
    detail: "An unknown error occurred.",
  });
};

export const ErrorState = ({
  error,
  onRetry,
  retryLabel = "Retry",
  title = "Something went wrong",
  extraActions,
}: ErrorStateProps) => {
  const normalized = normalizeError(error);
  const statusMessage = mapStatusMessage(normalized.status);
  const grpcError = mapApiErrorToGrpc(normalized);

  return (
    <section className="error-state" role="alert" aria-live="polite">
      <h2>{title}</h2>
      <p>{statusMessage}</p>
      <p>{normalized.detail}</p>
      {grpcError ? <p>gRPC code: {grpcError.code}</p> : null}
      {normalized.correlationId ? <p>Correlation ID: {normalized.correlationId}</p> : null}
      {onRetry ? <button type="button" onClick={onRetry}>{retryLabel}</button> : null}
      {extraActions}
    </section>
  );
};