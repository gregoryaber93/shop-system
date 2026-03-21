import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

import { authApiClient } from "../api/authClient";
import { decodeJwtClaims } from "../model/jwt";
import { type AuthContextType, type AuthState } from "../model/auth.types";
import {
  AUTH_UNAUTHORIZED_EVENT,
  clearStoredAuthState,
  getStoredAuthState,
  persistStoredAuthState,
} from "@/shared/lib/auth/authStorage";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>(getStoredAuthState);
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
    persistStoredAuthState(nextState);
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
    clearStoredAuthState();
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      navigate("/login", { replace: true });
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [logout, navigate]);

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
