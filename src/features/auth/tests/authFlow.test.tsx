import { http, HttpResponse } from "msw";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { createMockServer } from "../../../shared/test/mswServer";
import { AuthProvider } from "../context/AuthContext";
import { LoginPage } from "../ui/LoginPage";
import { ProtectedRoute } from "../ui/ProtectedRoute";

const API_BASE = "http://localhost:3000";

const buildJwt = (payload: Record<string, unknown>): string => {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
};

createMockServer([
  http.post(`${API_BASE}/api/auth/login`, async () => {
    const accessToken = buildJwt({
      sub: "user-1",
      roles: ["User"],
    });

    return HttpResponse.json({
      accessToken,
      email: "john@example.com",
      expiresAtUtc: "2026-03-22T18:31:47.7955889Z",
      roles: ["User"],
      userId: "user-1",
    });
  }),
  http.get(`${API_BASE}/api/users/profile`, async () => {
    return HttpResponse.json({
      id: "user-1",
      email: "john@example.com",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    });
  }),
  http.get(`${API_BASE}/api/products`, async () => {
    return HttpResponse.json([]);
  }),
]);

describe("auth flow", () => {
  it("logs user in and unlocks protected route", async () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={(
                <ProtectedRoute>
                  <h1>Dashboard</h1>
                </ProtectedRoute>
              )}
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    });

    expect(localStorage.getItem("auth_token")).toBeTruthy();
    expect(localStorage.getItem("auth_userId")).toBe("user-1");
    expect(localStorage.getItem("auth_roles")).toContain("User");
  });
});
