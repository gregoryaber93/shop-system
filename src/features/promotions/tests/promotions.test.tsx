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
  localStorage.setItem("auth_token", buildJwt({ sub: "promo-user", roles: ["User"] }));
  localStorage.setItem("auth_userId", "promo-user");
  localStorage.setItem("auth_roles", JSON.stringify(["User"]));
};

const activePromotionsResponse = [
  {
    id: "promo-1",
    type: "ProductDiscount",
    name: "Ten Percent",
    description: "10% off selected products",
    discountPercentage: 10,
    isActive: true,
    validFrom: "2020-01-01T00:00:00.000Z",
    validTo: "2099-01-01T00:00:00.000Z",
  },
  {
    id: "promo-2",
    type: "LoyaltyPoints",
    name: "Loyalty Boost",
    description: "Requires 200 points",
    discountPercentage: 15,
    requiredPoints: 200,
    isActive: true,
    validFrom: "2020-01-01T00:00:00.000Z",
    validTo: "2099-01-01T00:00:00.000Z",
  },
];

describe("promotions", () => {
  it("shows available promotions on checkout", async () => {
    setAuth();
    localStorage.setItem(
      "cart",
      JSON.stringify({
        items: [
          {
            productId: "prod-20",
            productName: "Promo Product",
            price: 50,
            quantity: 1,
            shopId: "shop-1",
          },
        ],
        totalPrice: 50,
        appliedPromotions: [],
        loyaltyPointsEarned: 0,
      }),
    );

    server.use(
      http.get(`${API_BASE}/api/users/profile`, async () => {
        return HttpResponse.json({
          id: "promo-user",
          email: "promo@example.com",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
        });
      }),
      http.get(`${API_BASE}/api/promotions`, async () => HttpResponse.json(activePromotionsResponse)),
      http.get(`${API_BASE}/api/promotions/user-profile`, async () =>
        HttpResponse.json({ userId: "promo-user", totalPoints: 300, earnedAt: "2026-01-01T00:00:00.000Z" }),
      ),
    );

    render(
      <MemoryRouter initialEntries={["/checkout"]}>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Available promotions")).toBeInTheDocument();
      expect(screen.getByText("Ten Percent")).toBeInTheDocument();
      expect(screen.getByText("Loyalty Boost")).toBeInTheDocument();
    });
  });

  it("applies and removes promotion in cart modal", async () => {
    setAuth();

    server.use(
      http.get(`${API_BASE}/api/users/profile`, async () => {
        return HttpResponse.json({
          id: "promo-user",
          email: "promo@example.com",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
        });
      }),
      http.get(`${API_BASE}/api/products`, async () =>
        HttpResponse.json([
          { id: "prod-21", name: "Widget", type: "Tool", price: 25, shopId: "shop-1" },
        ]),
      ),
      http.get(`${API_BASE}/api/promotions`, async () => HttpResponse.json(activePromotionsResponse)),
      http.get(`${API_BASE}/api/promotions/user-profile`, async () =>
        HttpResponse.json({ userId: "promo-user", totalPoints: 300, earnedAt: "2026-01-01T00:00:00.000Z" }),
      ),
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Widget")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    fireEvent.click(screen.getByRole("button", { name: "View cart" }));

    await waitFor(() => {
      expect(screen.getByText("Ten Percent")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole("button", { name: "Apply" })[0]);

    await waitFor(() => {
      expect(screen.getByText("promo-1")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() => {
      expect(screen.queryByText("promo-1")).not.toBeInTheDocument();
    });
  });

  it("evaluates promotions before placing order", async () => {
    setAuth();

    localStorage.setItem(
      "cart",
      JSON.stringify({
        items: [
          {
            productId: "prod-22",
            productName: "Eval Product",
            price: 80,
            quantity: 1,
            shopId: "shop-1",
          },
        ],
        totalPrice: 80,
        appliedPromotions: ["promo-1"],
        loyaltyPointsEarned: 0,
      }),
    );

    let evaluateCalled = false;
    let evaluatePromotionIds: string[] = [];
    let orderPromotionIds: string[] = [];

    server.use(
      http.get(`${API_BASE}/api/users/profile`, async () => {
        return HttpResponse.json({
          id: "promo-user",
          email: "promo@example.com",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
        });
      }),
      http.get(`${API_BASE}/api/promotions`, async () => HttpResponse.json(activePromotionsResponse)),
      http.get(`${API_BASE}/api/promotions/user-profile`, async () =>
        HttpResponse.json({ userId: "promo-user", totalPoints: 300, earnedAt: "2026-01-01T00:00:00.000Z" }),
      ),
      http.post(`${API_BASE}/api/promotions/evaluate`, async ({ request }) => {
        evaluateCalled = true;
        const payload = (await request.json()) as { promotionIds?: string[] };
        evaluatePromotionIds = payload.promotionIds ?? [];

        return HttpResponse.json({
          approved: true,
          appliedDiscounts: [{ productId: "prod-22", discountPercentage: 10 }],
          loyaltyPointsEarned: 5,
          message: "Promotion applied",
        });
      }),
      http.post(`${API_BASE}/api/orders`, async ({ request }) => {
        const payload = (await request.json()) as { appliedPromotionIds?: string[] };
        orderPromotionIds = payload.appliedPromotionIds ?? [];

        return HttpResponse.json({
          id: "order-promo-1",
          userId: "promo-user",
          items: [
            {
              productId: "prod-22",
              productName: "Eval Product",
              unitPrice: 80,
              quantity: 1,
              discountPercentage: 10,
              lineTotal: 72,
            },
          ],
          totalPrice: 72,
          discountApplied: 8,
          loyaltyPointsEarned: 5,
          status: "Created",
          createdAt: "2026-03-21T00:00:00.000Z",
        });
      }),
      http.get(`${API_BASE}/api/orders/order-promo-1`, async () => {
        return HttpResponse.json({
          id: "order-promo-1",
          userId: "promo-user",
          items: [],
          totalPrice: 72,
          discountApplied: 8,
          loyaltyPointsEarned: 5,
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

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Checkout" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Place order" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Order details" })).toBeInTheDocument();
    });

    expect(evaluateCalled).toBe(true);
    expect(evaluatePromotionIds).toEqual(["promo-1"]);
    expect(orderPromotionIds).toEqual(["promo-1"]);
  });
});
