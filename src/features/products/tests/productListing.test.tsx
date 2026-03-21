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

describe("product listing", () => {
  it("loads products and filters by shop", async () => {
    localStorage.setItem("auth_token", buildJwt({ sub: "user-1", roles: ["User"] }));
    localStorage.setItem("auth_userId", "user-1");
    localStorage.setItem("auth_roles", JSON.stringify(["User"]));

    server.use(
      http.get(`${API_BASE}/api/users/profile`, async () => {
        return HttpResponse.json({
          id: "user-1",
          email: "john@example.com",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
        });
      }),
      http.get(`${API_BASE}/api/products`, async () => {
        return HttpResponse.json([
          { id: "prod-1", name: "Widget", type: "Tool", price: 29.99, shopId: "shop-1" },
          { id: "prod-2", name: "Gadget", type: "Accessory", price: 19.99, shopId: "shop-2" },
        ]);
      }),
      http.get(`${API_BASE}/api/products/shop/shop-1`, async () => {
        return HttpResponse.json([
          { id: "prod-1", name: "Widget", type: "Tool", price: 29.99, shopId: "shop-1" },
        ]);
      }),
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
      expect(screen.getByText("Gadget")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Shop"), {
      target: { value: "shop-1" },
    });

    await waitFor(() => {
      expect(screen.getByText("Widget")).toBeInTheDocument();
      expect(screen.queryByText("Gadget")).not.toBeInTheDocument();
    });
  });
});
