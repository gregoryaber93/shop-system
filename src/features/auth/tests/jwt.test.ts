import { describe, expect, it } from "vitest";

import { decodeJwtClaims } from "../model/jwt";

const buildJwt = (payload: Record<string, unknown>): string => {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
};

describe("decodeJwtClaims", () => {
  it("extracts subject and roles", () => {
    const token = buildJwt({ sub: "abc", roles: ["Admin"] });

    const claims = decodeJwtClaims(token);

    expect(claims?.sub).toBe("abc");
    expect(claims?.roles).toEqual(["Admin"]);
  });

  it("extracts role from .NET role claim URI", () => {
    const token = buildJwt({
      sub: "abc",
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Admin",
    });

    const claims = decodeJwtClaims(token);

    expect(claims?.sub).toBe("abc");
    expect(claims?.roles).toEqual(["Admin"]);
  });

  it("returns null for invalid token", () => {
    const claims = decodeJwtClaims("bad-token");

    expect(claims).toBeNull();
  });
});
