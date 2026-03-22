import { describe, expect, it } from "vitest";

import { ApiError } from "@/shared/lib/http/errors";
import { mapApiErrorToGrpc } from "./grpcErrors";

const makeApiError = (status: number, detail: string) => {
  return new ApiError({
    message: detail,
    status,
    detail,
  });
};

describe("mapApiErrorToGrpc", () => {
  it("maps 503 to UNAVAILABLE", () => {
    const grpc = mapApiErrorToGrpc(makeApiError(503, "service down"));
    expect(grpc?.code).toBe("UNAVAILABLE");
  });

  it("maps 408 to DEADLINE_EXCEEDED", () => {
    const grpc = mapApiErrorToGrpc(makeApiError(408, "timeout"));
    expect(grpc?.code).toBe("DEADLINE_EXCEEDED");
  });

  it("maps 401 to UNAUTHENTICATED", () => {
    const grpc = mapApiErrorToGrpc(makeApiError(401, "expired jwt"));
    expect(grpc?.code).toBe("UNAUTHENTICATED");
  });
});
