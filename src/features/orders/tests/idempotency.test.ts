import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { createOrderApiClient } from "@/features/orders";
import { clearIdempotencyCache } from "@/shared/lib/idempotency/idempotency";
import { createMockServer } from "@/shared/test/mswServer";

const API_BASE = "http://localhost:3000";
const server = createMockServer([]);

describe("order idempotency", () => {
  it("returns cached response for duplicate idempotency key", async () => {
    clearIdempotencyCache();
    let requestCount = 0;

    server.use(
      http.post(`${API_BASE}/api/orders`, async () => {
        requestCount += 1;

        return HttpResponse.json({
          id: "order-idempotent",
          userId: "user-idempotent",
          items: [],
          totalPrice: 0,
          discountApplied: 0,
          loyaltyPointsEarned: 0,
          status: "Created",
          createdAt: "2026-03-21T00:00:00.000Z",
        });
      }),
    );

    const client = createOrderApiClient(() => "token", () => undefined);

    const request = {
      items: [],
      appliedPromotionIds: [],
      idempotencyKey: "fixed-key-1",
    };

    const first = await client.placeOrder(request);
    const second = await client.placeOrder(request);

    expect(first.id).toBe("order-idempotent");
    expect(second.id).toBe("order-idempotent");
    expect(requestCount).toBe(1);
  });
});
