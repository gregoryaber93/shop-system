import { JwtClaims } from "./auth.types";

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
    const parsed = JSON.parse(json) as JwtClaims;

    return {
      sub: parsed.sub,
      roles: Array.isArray(parsed.roles) ? parsed.roles : [],
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
};
