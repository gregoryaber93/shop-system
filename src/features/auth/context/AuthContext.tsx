import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { authApiClient } from "../api/authClient";
import { decodeJwtClaims } from "../model/jwt";
import { type AuthContextType, type AuthState } from "../model/auth.types";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_ID_KEY = "auth_userId";
const AUTH_ROLES_KEY = "auth_roles";

const AuthContext = createContext<AuthContextType | null>(null);

const getInitialState = (): AuthState => {
  if (typeof window === "undefined") {
    return { token: null, userId: null, roles: [] };
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  const userId = window.localStorage.getItem(AUTH_USER_ID_KEY);

  let roles: string[] = [];
  const storedRoles = window.localStorage.getItem(AUTH_ROLES_KEY);
  if (storedRoles) {
    try {
      const parsed = JSON.parse(storedRoles) as unknown;
      if (Array.isArray(parsed)) {
        roles = parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      roles = [];
    }
  }

  return { token, userId, roles };
};

const persistState = (state: AuthState): void => {
  if (typeof window === "undefined") {
    return;
  }

  if (!state.token) {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_USER_ID_KEY);
    window.localStorage.removeItem(AUTH_ROLES_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, state.token);
  window.localStorage.setItem(AUTH_USER_ID_KEY, state.userId ?? "");
  window.localStorage.setItem(AUTH_ROLES_KEY, JSON.stringify(state.roles));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(getInitialState);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const applyToken = useCallback((token: string) => {
    const claims = decodeJwtClaims(token);

    const nextState: AuthState = {
      token,
      userId: claims?.sub ?? null,
      roles: claims?.roles ?? [],
    };

    setAuthState(nextState);
    persistState(nextState);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await authApiClient.login({ email, password });
      applyToken(response.token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed.";
      setErrorMessage(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [applyToken]);

  const register = useCallback(async (email: string, password: string, role?: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await authApiClient.register({ email, password, role });
      applyToken(response.token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed.";
      setErrorMessage(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [applyToken]);

  const logout = useCallback(() => {
    const nextState: AuthState = { token: null, userId: null, roles: [] };
    setAuthState(nextState);
    setErrorMessage(null);
    persistState(nextState);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    ...authState,
    isLoggedIn: Boolean(authState.token),
    isLoading,
    errorMessage,
    login,
    register,
    logout,
    clearError,
  }), [authState, clearError, errorMessage, isLoading, login, logout, register]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
