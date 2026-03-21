import { http, HttpResponse } from "msw";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AppProviders } from "@/app/providers/AppProviders";
import { AppRoutes } from "@/app/routes/AppRoutes";
import { createMockServer } from "@/shared/test/mswServer";

const API_BASE = "http://localhost:3000";

const server = createMockServer([]);

describe("auth guards", () => {
  it("redirects unauthenticated users to login", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    });
  });

  it("redirects to login on 401 from protected request", async () => {
    localStorage.setItem("auth_token", "header.payload.signature");
    localStorage.setItem("auth_userId", "user-3");
    localStorage.setItem("auth_roles", JSON.stringify(["User"]));

    const validProblemDetails = {
      title: "Unauthorized",
      status: 401,
      detail: "Invalid or expired token",
      correlationId: "corr-123",
    };

    server.use(
      http.get(`${API_BASE}/api/users/profile`, async () => {
        return HttpResponse.json(validProblemDetails, { status: 401 });
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
      expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    });

    expect(localStorage.getItem("auth_token")).toBeNull();
  });
});
