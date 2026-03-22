import { describe, expect, it } from "vitest";

import { toApiError } from "@/shared/lib/http/errors";
import { mapApiErrorToGrpc } from "@/shared/lib/grpc/grpcErrors";

describe("checkout timeout handling", () => {
  it("maps timeout transport error to grpc deadline exceeded", () => {
    const apiError = toApiError({
      code: "ECONNABORTED",
      message: "timeout exceeded",
    });

    const grpc = mapApiErrorToGrpc(apiError);

    expect(apiError.status).toBe(408);
    expect(grpc?.code).toBe("DEADLINE_EXCEEDED");
  });
});
