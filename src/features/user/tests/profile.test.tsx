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
  localStorage.setItem("auth_token", buildJwt({ sub: "profile-user", roles: ["User"] }));
  localStorage.setItem("auth_userId", "profile-user");
  localStorage.setItem("auth_roles", JSON.stringify(["User"]));
};

describe("profile page", () => {
  it("loads profile and order history", async () => {
    setAuth();

    server.use(
      http.get(`${API_BASE}/api/users/profile`, async () => {
        return HttpResponse.json({
          id: "profile-user",
          email: "profile@example.com",
          firstName: "Alice",
          lastName: "Smith",
          phoneNumber: "+48111222333",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        });
      }),
      http.get(`${API_BASE}/api/orders/my`, async () => {
        return HttpResponse.json([
          {
            id: "order-55",
            userId: "profile-user",
            items: [
              {
                productId: "prod-a",
                productName: "A",
                unitPrice: 10,
                quantity: 2,
                discountPercentage: 0,
                lineTotal: 20,
              },
            ],
            totalPrice: 20,
            discountApplied: 0,
            loyaltyPointsEarned: 1,
            status: "Created",
            createdAt: "2026-03-01T00:00:00.000Z",
          },
        ]);
      }),
    );

    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "My profile" })).toBeInTheDocument();
      expect(screen.getByText("Email: profile@example.com")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Order history" })).toBeInTheDocument();
      expect(screen.getByText(/order-55/i)).toBeInTheDocument();
    });
  });

  it("updates profile details", async () => {
    setAuth();

    let savedFirstName = "";

    server.use(
      http.get(`${API_BASE}/api/users/profile`, async () => {
        return HttpResponse.json({
          id: "profile-user",
          email: "profile@example.com",
          firstName: "Alice",
          lastName: "Smith",
          phoneNumber: "+48111222333",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        });
      }),
      http.get(`${API_BASE}/api/orders/my`, async () => HttpResponse.json([])),
      http.put(`${API_BASE}/api/users/profile`, async ({ request }) => {
        const payload = (await request.json()) as { firstName?: string };
        savedFirstName = payload.firstName ?? "";

        return HttpResponse.json({
          id: "profile-user",
          email: "profile@example.com",
          firstName: savedFirstName,
          lastName: "Smith",
          phoneNumber: "+48111222333",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2026-03-21T00:00:00.000Z",
        });
      }),
    );

    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Edit profile" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Edit profile" }));

    const firstNameInput = screen.getByLabelText("First name");
    fireEvent.change(firstNameInput, { target: { value: "Alicja" } });

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(screen.getByText("Profile updated successfully.")).toBeInTheDocument();
    });

    expect(savedFirstName).toBe("Alicja");
  });
});
