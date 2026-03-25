import { JwtClaims } from "./auth.types";

const ROLE_CLAIM_URI = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

const normalizeRoles = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string" && value.length > 0) {
    return [value];
  }

  return [];
};

const decodeBase64Url = (value: string): string => {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  return atob(base64);
};

export const decodeJwtClaims = (token: string): JwtClaims | null => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) {
      return null;
    }

    const json = decodeBase64Url(parts[1]);
    const parsed = JSON.parse(json) as Record<string, unknown>;
    const rolesFromClaims = [
      ...normalizeRoles(parsed.roles),
      ...normalizeRoles(parsed.role),
      ...normalizeRoles(parsed[ROLE_CLAIM_URI]),
    ];
    const uniqueRoles = Array.from(new Set(rolesFromClaims));

    return {
      sub: typeof parsed.sub === "string" ? parsed.sub : undefined,
      roles: uniqueRoles,
      exp: typeof parsed.exp === "number" ? parsed.exp : undefined,
    };
  } catch {
    return null;
  }
};
