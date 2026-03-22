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

const renderAuthorizedApp = () => {
  localStorage.setItem("auth_token", buildJwt({ sub: "user-11", roles: ["User"] }));
  localStorage.setItem("auth_userId", "user-11");
  localStorage.setItem("auth_roles", JSON.stringify(["User"]));

  server.use(
    http.get(`${API_BASE}/api/users/profile`, async () => {
      return HttpResponse.json({
        id: "user-11",
        email: "shopper@example.com",
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      });
    }),
    http.get(`${API_BASE}/api/products`, async () => {
      return HttpResponse.json([
        { id: "prod-1", name: "Widget", type: "Tool", price: 29.99, shopId: "shop-1" },
      ]);
    }),
    http.get(`${API_BASE}/api/promotions`, async () => {
      return HttpResponse.json([]);
    }),
    http.get(`${API_BASE}/api/promotions/user-profile`, async () => {
      return HttpResponse.json({
        userId: "user-11",
        totalPoints: 0,
        earnedAt: "2026-01-01T00:00:00.000Z",
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
};

describe("cart actions", () => {
  it("adds item to cart and shows it in modal", async () => {
    renderAuthorizedApp();

    await waitFor(() => {
      expect(screen.getByText("Widget")).toBeInTheDocument();
    }, { timeout: 4000 });

    fireEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    fireEvent.click(screen.getByRole("button", { name: "View cart" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Your cart" })).toBeInTheDocument();
      expect(screen.getByText("Line total: 29.99 USD")).toBeInTheDocument();
    });
  });

  it("updates quantity from selector", async () => {
    renderAuthorizedApp();

    await waitFor(() => {
      expect(screen.getByText("Widget")).toBeInTheDocument();
    }, { timeout: 4000 });

    fireEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    fireEvent.click(screen.getByRole("button", { name: "View cart" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Increase quantity")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("Increase quantity"));

    await waitFor(() => {
      expect(screen.getByText("Line total: 59.98 USD")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2")).toBeInTheDocument();
    });
  });

  it("clears cart items", async () => {
    renderAuthorizedApp();

    await waitFor(() => {
      expect(screen.getByText("Widget")).toBeInTheDocument();
    }, { timeout: 4000 });

    fireEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    fireEvent.click(screen.getByRole("button", { name: "View cart" }));

    await waitFor(() => {
      expect(screen.getByText("Line total: 29.99 USD")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Clear cart" }));

    await waitFor(() => {
      expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
    });
  });
});
