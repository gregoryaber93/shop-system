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

const setAuth = () => {
  localStorage.setItem("auth_token", buildJwt({ sub: "order-errors", roles: ["User"] }));
  localStorage.setItem("auth_userId", "order-errors");
  localStorage.setItem("auth_roles", JSON.stringify(["User"]));
};

describe("order error states", () => {
  it("shows 404 not found state on order details", async () => {
    setAuth();

    server.use(
      http.get(`${API_BASE}/api/users/profile`, async () => {
        return HttpResponse.json({
          id: "order-errors",
          email: "order-errors@example.com",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
        });
      }),
      http.get(`${API_BASE}/api/orders/order-404`, async () => {
        return HttpResponse.json(
          {
            title: "Not Found",
            status: 404,
            detail: "Order does not exist.",
            correlationId: "corr-404-order",
          },
          { status: 404 },
        );
      }),
    );

    render(
      <MemoryRouter initialEntries={["/orders/order-404"]}>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Order unavailable")).toBeInTheDocument();
      expect(screen.getByText("Resource not found.")).toBeInTheDocument();
      expect(screen.getByText("gRPC code: NOT_FOUND")).toBeInTheDocument();
      expect(screen.getByText("Correlation ID: corr-404-order")).toBeInTheDocument();
    });
  });

  it("shows retry path on 503 checkout error and succeeds", async () => {
    setAuth();

    localStorage.setItem(
      "cart",
      JSON.stringify({
        items: [
          {
            productId: "prod-err",
            productName: "Error Product",
            price: 20,
            quantity: 1,
            shopId: "shop-1",
          },
        ],
        totalPrice: 20,
        appliedPromotions: [],
        loyaltyPointsEarned: 0,
      }),
    );

    let attempts = 0;

    server.use(
      http.get(`${API_BASE}/api/users/profile`, async () => {
        return HttpResponse.json({
          id: "order-errors",
          email: "order-errors@example.com",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
        });
      }),
      http.get(`${API_BASE}/api/promotions`, async () => HttpResponse.json([])),
      http.get(`${API_BASE}/api/promotions/user-profile`, async () =>
        HttpResponse.json({ userId: "order-errors", totalPoints: 0, earnedAt: "2026-01-01T00:00:00.000Z" }),
      ),
      http.post(`${API_BASE}/api/orders`, async () => {
        attempts += 1;

        if (attempts <= 3) {
          return HttpResponse.json(
            {
              title: "Unavailable",
              status: 503,
              detail: "Temporary outage.",
              correlationId: "corr-503-order",
            },
            { status: 503 },
          );
        }

        return HttpResponse.json({
          id: "order-ok-503",
          userId: "order-errors",
          items: [],
          totalPrice: 20,
          discountApplied: 0,
          loyaltyPointsEarned: 0,
          status: "Created",
          createdAt: "2026-03-22T00:00:00.000Z",
        });
      }),
      http.get(`${API_BASE}/api/orders/order-ok-503`, async () => {
        return HttpResponse.json({
          id: "order-ok-503",
          userId: "order-errors",
          items: [],
          totalPrice: 20,
          discountApplied: 0,
          loyaltyPointsEarned: 0,
          status: "Fulfilled",
          createdAt: "2026-03-22T00:00:00.000Z",
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

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Checkout" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Place order" }));

    await waitFor(() => {
      expect(screen.getByText("Checkout failed")).toBeInTheDocument();
      expect(screen.getByText("gRPC code: UNAVAILABLE")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Order details" })).toBeInTheDocument();
    });
  });
});
