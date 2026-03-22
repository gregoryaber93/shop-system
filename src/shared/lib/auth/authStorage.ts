import { type AuthState } from "@/features/auth/model/auth.types";
import { clearAppCaches } from "@/shared/lib/cache/localCache";

export const AUTH_TOKEN_KEY = "auth_token";
export const AUTH_USER_ID_KEY = "auth_userId";
export const AUTH_ROLES_KEY = "auth_roles";
export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";

export const getStoredAuthState = (): AuthState => {
  if (typeof window === "undefined") {
    return { token: null, userId: null, roles: [] };
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  const userId = window.localStorage.getItem(AUTH_USER_ID_KEY);
  const rawRoles = window.localStorage.getItem(AUTH_ROLES_KEY);

  let roles: string[] = [];
  if (rawRoles) {
    try {
      const parsed = JSON.parse(rawRoles) as unknown;
      if (Array.isArray(parsed)) {
        roles = parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      roles = [];
    }
  }

  return { token, userId, roles };
};

export const persistStoredAuthState = (state: AuthState): void => {
  if (typeof window === "undefined") {
    return;
  }

  if (!state.token) {
    clearStoredAuthState();
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, state.token);
  window.localStorage.setItem(AUTH_USER_ID_KEY, state.userId ?? "");
  window.localStorage.setItem(AUTH_ROLES_KEY, JSON.stringify(state.roles));
};

export const clearStoredAuthState = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_ID_KEY);
  window.localStorage.removeItem(AUTH_ROLES_KEY);
  clearAppCaches();
};

export const dispatchUnauthorizedEvent = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
};
