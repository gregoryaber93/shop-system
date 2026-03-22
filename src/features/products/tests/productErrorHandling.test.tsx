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

describe("product error handling", () => {
  it("shows status-aware error with correlation id and retries successfully", async () => {
    let productRequestCount = 0;

    localStorage.setItem("auth_token", buildJwt({ sub: "user-err-1", roles: ["User"] }));
    localStorage.setItem("auth_userId", "user-err-1");
    localStorage.setItem("auth_roles", JSON.stringify(["User"]));

    server.use(
      http.get(`${API_BASE}/api/users/profile`, async () => {
        return HttpResponse.json({
          id: "user-err-1",
          email: "error-flow@example.com",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
        });
      }),
      http.get(`${API_BASE}/api/products`, async () => {
        productRequestCount += 1;

        if (productRequestCount <= 2) {
          return HttpResponse.json(
            {
              title: "Server error",
              status: 500,
              detail: "Catalog service unavailable.",
              correlationId: "corr-products-500",
            },
            { status: 500 },
          );
        }

        return HttpResponse.json([
          { id: "prod-ok-1", name: "Recovered Product", type: "Tool", price: 10, shopId: "shop-1" },
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
      expect(screen.getByText("Products unavailable")).toBeInTheDocument();
      expect(screen.getByText("Server error. Please try again later.")).toBeInTheDocument();
      expect(screen.getByText("Catalog service unavailable.")).toBeInTheDocument();
      expect(screen.getByText("Correlation ID: corr-products-500")).toBeInTheDocument();
    }, { timeout: 4000 });

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(screen.getByText("Recovered Product")).toBeInTheDocument();
    });
  });
});
