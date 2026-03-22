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

describe("checkout flow", () => {
  it("places order with idempotency key and opens order details", async () => {
    let seenIdempotencyKey: string | null = null;

    localStorage.setItem("auth_token", buildJwt({ sub: "user-301", roles: ["User"] }));
    localStorage.setItem("auth_userId", "user-301");
    localStorage.setItem("auth_roles", JSON.stringify(["User"]));

    server.use(
      http.get(`${API_BASE}/api/users/profile`, async () => {
        return HttpResponse.json({
          id: "user-301",
          email: "buyer@example.com",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
        });
      }),
      http.get(`${API_BASE}/api/products`, async () => {
        return HttpResponse.json([
          { id: "prod-10", name: "Widget", type: "Tool", price: 25, shopId: "shop-1" },
        ]);
      }),
      http.get(`${API_BASE}/api/promotions`, async () => {
        return HttpResponse.json([]);
      }),
      http.get(`${API_BASE}/api/promotions/user-profile`, async () => {
        return HttpResponse.json({
          userId: "user-301",
          totalPoints: 0,
          earnedAt: "2026-01-01T00:00:00.000Z",
        });
      }),
      http.post(`${API_BASE}/api/orders`, async ({ request }) => {
        seenIdempotencyKey = request.headers.get("Idempotency-Key");

        return HttpResponse.json({
          id: "order-123",
          userId: "user-301",
          items: [
            {
              productId: "prod-10",
              productName: "Widget",
              unitPrice: 25,
              quantity: 1,
              discountPercentage: 0,
              lineTotal: 25,
            },
          ],
          totalPrice: 25,
          discountApplied: 0,
          loyaltyPointsEarned: 0,
          status: "Created",
          createdAt: "2026-03-21T00:00:00.000Z",
        });
      }),
      http.get(`${API_BASE}/api/orders/order-123`, async () => {
        return HttpResponse.json({
          id: "order-123",
          userId: "user-301",
          items: [
            {
              productId: "prod-10",
              productName: "Widget",
              unitPrice: 25,
              quantity: 1,
              discountPercentage: 0,
              lineTotal: 25,
            },
          ],
          totalPrice: 25,
          discountApplied: 0,
          loyaltyPointsEarned: 0,
          status: "Fulfilled",
          createdAt: "2026-03-21T00:00:00.000Z",
        });
      }),
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Widget")).toBeInTheDocument(), { timeout: 4000 });

    fireEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    fireEvent.click(screen.getByRole("button", { name: "View cart" }));
    fireEvent.click(screen.getByRole("link", { name: "Go to checkout" }));

    await waitFor(() => expect(screen.getByRole("heading", { name: "Checkout" })).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Place order" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Order details" })).toBeInTheDocument();
      expect(screen.getByText("Order ID: order-123")).toBeInTheDocument();
    });

    expect(seenIdempotencyKey).toBeTruthy();
  });
});
