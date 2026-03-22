import { describe, expect, it } from "vitest";

import { withRetry } from "./withRetry";

describe("withRetry", () => {
  it("retries retryable errors and eventually succeeds", async () => {
    let attempts = 0;

    const result = await withRetry(
      async () => {
        attempts += 1;

        if (attempts < 3) {
          throw { status: 503 };
        }

        return "ok";
      },
      { maxRetries: 3, baseDelayMs: 1 },
    );

    expect(result).toBe("ok");
    expect(attempts).toBe(3);
  });

  it("does not retry non-retryable client errors", async () => {
    let attempts = 0;

    await expect(withRetry(
      async () => {
        attempts += 1;
        throw { status: 422, message: "invalid" };
      },
      { maxRetries: 3, baseDelayMs: 1 },
    )).rejects.toEqual({ status: 422, message: "invalid" });

    expect(attempts).toBe(1);
  });
});
