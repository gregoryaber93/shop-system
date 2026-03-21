import { http, HttpResponse } from "msw";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

describe("checkout retry", () => {
  it("retries on 503 and succeeds", async () => {
    let attempts = 0;

    localStorage.setItem("auth_token", buildJwt({ sub: "user-302", roles: ["User"] }));
    localStorage.setItem("auth_userId", "user-302");
    localStorage.setItem("auth_roles", JSON.stringify(["User"]));

    localStorage.setItem(
      "cart",
      JSON.stringify({
        items: [
          {
            productId: "prod-11",
            productName: "Retry Product",
            price: 30,
            quantity: 1,
            shopId: "shop-2",
          },
        ],
        totalPrice: 30,
        appliedPromotions: [],
        loyaltyPointsEarned: 0,
      }),
    );

    server.use(
      http.get(`${API_BASE}/api/users/profile`, async () => {
        return HttpResponse.json({
          id: "user-302",
          email: "retry@example.com",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
        });
      }),
      http.post(`${API_BASE}/api/orders`, async () => {
        attempts += 1;

        if (attempts < 3) {
          return HttpResponse.json(
            {
              title: "Temporary unavailable",
              status: 503,
              detail: "Service temporary unavailable",
            },
            { status: 503 },
          );
        }

        return HttpResponse.json({
          id: "order-retry-1",
          userId: "user-302",
          items: [
            {
              productId: "prod-11",
              productName: "Retry Product",
              unitPrice: 30,
              quantity: 1,
              discountPercentage: 0,
              lineTotal: 30,
            },
          ],
          totalPrice: 30,
          discountApplied: 0,
          loyaltyPointsEarned: 0,
          status: "Created",
          createdAt: "2026-03-21T00:00:00.000Z",
        });
      }),
      http.get(`${API_BASE}/api/promotions`, async () => {
        return HttpResponse.json([]);
      }),
      http.get(`${API_BASE}/api/promotions/user-profile`, async () => {
        return HttpResponse.json({
          userId: "user-302",
          totalPoints: 0,
          earnedAt: "2026-01-01T00:00:00.000Z",
        });
      }),
      http.get(`${API_BASE}/api/orders/order-retry-1`, async () => {
        return HttpResponse.json({
          id: "order-retry-1",
          userId: "user-302",
          items: [],
          totalPrice: 30,
          discountApplied: 0,
          loyaltyPointsEarned: 0,
          status: "Fulfilled",
          createdAt: "2026-03-21T00:00:00.000Z",
        });
      }),
    );

    render(
      <MemoryRouter initialEntries={["/checkout"]}>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByRole("heading", { name: "Checkout" })).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Place order" }));

    await waitFor(() => {
      expect(screen.getByText(/Retrying.../i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Order details" })).toBeInTheDocument();
    });

    expect(attempts).toBe(3);
  });
});
