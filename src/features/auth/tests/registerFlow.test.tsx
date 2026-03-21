import { http, HttpResponse } from "msw";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AppRoutes } from "@/app/routes/AppRoutes";
import { AppProviders } from "@/app/providers/AppProviders";
import { createMockServer } from "@/shared/test/mswServer";

const API_BASE = "http://localhost:3000";

const buildJwt = (payload: Record<string, unknown>): string => {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
};

createMockServer([
  http.post(`${API_BASE}/api/authentication/register`, async () => {
    const token = buildJwt({
      sub: "user-2",
      roles: ["User"],
    });

    return HttpResponse.json({ token });
  }),
  http.get(`${API_BASE}/api/users/profile`, async () => {
    return HttpResponse.json({
      id: "user-2",
      email: "alice@example.com",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    });
  }),
  http.get(`${API_BASE}/api/products`, async () => {
    return HttpResponse.json([]);
  }),
]);

describe("register flow", () => {
  it("registers user and stores JWT in localStorage", async () => {
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret123" },
    });
    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "User" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Shop Dashboard" })).toBeInTheDocument();
    });

    expect(localStorage.getItem("auth_token")).toBeTruthy();
    expect(localStorage.getItem("auth_userId")).toBe("user-2");
  });
});
