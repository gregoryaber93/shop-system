---
applyTo: "src/**/*.{ts,tsx}"
---
# Authentication And JWT Rules

Authentication is fundamental to security. You work with AuthService and UserService via JWT.

## How The Flow Works

1. User registers on frontend (email, password, optionally role).
2. Frontend sends `POST /api/authentication/register` to AuthService.
3. AuthService returns JWT (access token).
4. Frontend stores JWT in secure context (Context API + maybe localStorage, but never in global state without encryption).
5. Every API call includes `Authorization: Bearer {jwt}`.
6. JWT is validated by backend on every request.

## Implementation

### Create AuthContext with JWT

```typescript
interface AuthContextType {
  token: string | null;
  userId: string | null;
  roles: string[];
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => 
    localStorage.getItem('auth_token')
  );
  const [userId, setUserId] = useState<string | null>(() => 
    localStorage.getItem('auth_userId')
  );
  const [roles, setRoles] = useState<string[]>(() => 
    JSON.parse(localStorage.getItem('auth_roles') || '[]')
  );

  // Decode JWT and extract claims
  const decodeToken = (jwt: string) => {
    try {
      const part = jwt.split('.')[1];
      const decoded = JSON.parse(atob(part));
      return decoded;
    } catch {
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApiClient.login(email, password);
    setToken(response.token);
    const claims = decodeToken(response.token);
    setUserId(claims.sub);
    setRoles(claims.roles || []);
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_userId', claims.sub);
    localStorage.setItem('auth_roles', JSON.stringify(claims.roles || []));
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setRoles([]);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_userId');
    localStorage.removeItem('auth_roles');
  };

  const register = async (email: string, password: string, role?: string) => {
    const response = await authApiClient.register(email, password, role);
    setToken(response.token);
    const claims = decodeToken(response.token);
    setUserId(claims.sub);
    setRoles(claims.roles || []);
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_userId', claims.sub);
    localStorage.setItem('auth_roles', JSON.stringify(claims.roles || []));
  };

  return (
    <AuthContext.Provider value={{ token, userId, roles, isLoggedIn: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### API Client with Authentication

```typescript
// src/features/auth/api/authClient.ts

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  role?: string;
}

interface AuthResponse {
  token: string;
}

export const authApiClient = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${AUTH_SERVICE_URL}/api/authentication/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new AuthError(error.detail || 'Login failed');
    }

    return response.json();
  },

  register: async (email: string, password: string, role?: string): Promise<AuthResponse> => {
    const response = await fetch(`${AUTH_SERVICE_URL}/api/authentication/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role: role || 'User' }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new AuthError(error.detail || 'Registration failed');
    }

    return response.json();
  },
};
```

### Axios Interceptor For Automatic JWT Injection

```typescript
// src/lib/apiClient.ts

import axios from 'axios';
import { useAuth } from '@/features/auth/context/AuthContext';

export const createApiClient = (token: string | null) => {
  const client = axios.create({
    baseURL: process.env.VITE_API_BASE_URL,
    timeout: 10000,
  });

  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired - logout user
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};
```

## Validation And Role-Based Access

- Do not trust the role displayed on the frontend; always validate on the server.
- For screens requiring a role, check `useAuth().roles` before rendering.
- Roles can be: `Admin`, `Manager`, `User`.

## Security

- Store JWT in secure context or sessionStorage, not in a global object.
- Never send JWT in URL query string.
- Add token expiration and refresh flow when JWT expires.
- Sanitize email on input; validate format.
