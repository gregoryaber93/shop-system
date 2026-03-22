import { describe, expect, it } from "vitest";

import { toApiError } from "./errors";

describe("toApiError", () => {
  it("maps timeout errors to 408", () => {
    const error = toApiError({
      code: "ECONNABORTED",
      message: "timeout",
    });

    expect(error.status).toBe(408);
    expect(error.detail).toContain("too long");
  });

  it("maps ProblemDetails including correlation id", () => {
    const error = toApiError({
      response: {
        status: 409,
        data: {
          title: "Conflict",
          detail: "Version mismatch.",
          correlationId: "corr-409",
          type: "urn:problem:conflict",
        },
      },
    });

    expect(error.status).toBe(409);
    expect(error.detail).toBe("Version mismatch.");
    expect(error.correlationId).toBe("corr-409");
    expect(error.type).toBe("urn:problem:conflict");
  });
});
