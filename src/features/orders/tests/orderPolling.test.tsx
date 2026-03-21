import { http, HttpResponse } from "msw";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AppProviders } from "@/app/providers/AppProviders";
import { AppRoutes } from "@/app/routes/AppRoutes";
import { createMockServer } from "@/shared/test/mswServer";

const API_BASE = "http://localhost:3000";
const server = createMockServer([]);

const buildJwt = (payload: Record<string, unknown>): string => {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
};

describe("order polling", () => {
  it("polls status until fulfilled", async () => {
    let callCount = 0;

    localStorage.setItem("auth_token", buildJwt({ sub: "user-303", roles: ["User"] }));
    localStorage.setItem("auth_userId", "user-303");
    localStorage.setItem("auth_roles", JSON.stringify(["User"]));

    server.use(
      http.get(`${API_BASE}/api/users/profile`, async () => {
        return HttpResponse.json({
          id: "user-303",
          email: "poll@example.com",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
        });
      }),
      http.get(`${API_BASE}/api/orders/order-789`, async () => {
        callCount += 1;

        const statuses = ["Created", "PaymentPending", "Fulfilled"];
        const status = statuses[Math.min(callCount - 1, statuses.length - 1)];

        return HttpResponse.json({
          id: "order-789",
          userId: "user-303",
          items: [],
          totalPrice: 20,
          discountApplied: 0,
          loyaltyPointsEarned: 0,
          status,
          createdAt: "2026-03-21T00:00:00.000Z",
        });
      }),
    );

    render(
      <MemoryRouter initialEntries={["/orders/order-789"]}>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Status: Created")).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(screen.getByText("Status: Fulfilled")).toBeInTheDocument();
      },
      { timeout: 8000 },
    );

    expect(callCount).toBeGreaterThanOrEqual(3);
  });
});
