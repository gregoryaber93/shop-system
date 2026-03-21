export interface JwtClaims {
  sub?: string;
  roles?: string[];
  exp?: number;
}

export interface AuthResponse {
  token: string;
}

export interface AuthState {
  token: string | null;
  userId: string | null;
  roles: string[];
}

export interface AuthContextType extends AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
