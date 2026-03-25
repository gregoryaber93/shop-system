import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { createMockServer } from "@/shared/test/mswServer";
import { createManagerUserApiClient } from "./managerUserClient";

const API_BASE = "http://localhost:5280";

const server = createMockServer([
  http.get(`${API_BASE}/api/users`, async () => HttpResponse.json({ items: [] })),
  http.post(`${API_BASE}/api/users`, async () => HttpResponse.json({}, { status: 201 })),
  http.post(`${API_BASE}/api/auth/register`, async () =>
    HttpResponse.json({ accessToken: "token", userId: "mgr-1", roles: ["Manager"] }),
  ),
]);

describe("managerUserClient", () => {
  it("creates manager using only email, password, and roles payload", async () => {
    let capturedBody: unknown = null;

    server.use(
      http.post(`${API_BASE}/api/users`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({}, { status: 201 });
      }),
    );

    const client = createManagerUserApiClient(() => "token", () => undefined);

    await client.createManager({
      email: "mia.harper@shopsystem.local",
      password: "secret123",
      roles: ["Manager"],
    });

    expect(capturedBody).toEqual({
      email: "mia.harper@shopsystem.local",
      password: "secret123",
      roles: ["Manager"],
    });
  });

  it("loads and maps manager users from API", async () => {
    server.use(
      http.get(`${API_BASE}/api/users`, async () => {
        return HttpResponse.json({
          items: [
            {
              id: "mgr-1",
              email: "ava.holt@shopsystem.local",
              firstName: "Ava",
              lastName: "Holt",
              role: "Manager",
              isActive: true,
            },
            {
              id: "usr-2",
              email: "user@shopsystem.local",
              firstName: "Regular",
              lastName: "User",
              role: "User",
              isActive: true,
            },
          ],
        });
      }),
    );

    const client = createManagerUserApiClient(() => "token", () => undefined);
    const result = await client.getManagers();

    expect(result).toEqual([
      {
        id: "mgr-1",
        fullName: "Ava Holt",
        email: "ava.holt@shopsystem.local",
        status: "Active",
      },
    ]);
  });

  it("falls back to auth registration endpoint when user-create endpoint is unavailable", async () => {
    let registerCalled = false;
    let fallbackPayload: unknown = null;

    server.use(
      http.post(`${API_BASE}/api/users`, async () => {
        return HttpResponse.json({ detail: "Not found" }, { status: 404 });
      }),
      http.post(`${API_BASE}/api/auth/register`, async ({ request }) => {
        registerCalled = true;
        fallbackPayload = await request.json();
        return HttpResponse.json({ accessToken: "token", userId: "mgr-9", roles: ["Manager"] });
      }),
    );

    const client = createManagerUserApiClient(() => "token", () => undefined);

    await client.createManager({
      email: "noah.stone@shopsystem.local",
      password: "secret123",
      roles: ["Manager"],
    });

    expect(registerCalled).toBe(true);
    expect(fallbackPayload).toEqual({
      email: "noah.stone@shopsystem.local",
      password: "secret123",
      roles: ["Manager"],
    });
  });
});
