---
applyTo: "src/**/*.{ts,tsx}"
---
# Authentication And JWT Rules

Autentykacja jest fundamentem bezpieczenswa. Pracujesz z AuthService i UserService za pomoca JWT.

## Jak dziala flow

1. Uzytkownik rejestru się na froncie (email, password, opcjonalnie role).
2. Frontend wysyla `POST /api/authentication/register` do AuthService.
3. AuthService zwraca JWT (access token).
4. Frontend przechowuje JWT w secure context (Context API + maybe localStorage, ale nigdy nie w globalnym state bez enkrypcji).
5. Kazde API call ma naglowek `Authorization: Bearer {jwt}`.
6. JWT jest walidowany przez backend przy kazdym zapytaniu.

## Implementacja

### Stwórz AuthContext z JWT

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

  // Dekodowanie JWT i ekstraktowanie claim'ow
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

### API Client z autentykacja

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

### Axios Interceptor do automatycznego dodawania JWT

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
        // Token wygasl - wyloguj uzytkownika
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};
```

## Walidacja i role-based access

- Nie ufaj roli wyswietlanej na froncie; zawsze waliduj po stronie serwera.
- Dla ekranów wymagających roli, sprawdzaj `useAuth().roles` przed renderowaniem.
- Role moga byc: `Admin`, `Manager`, `User`.

## Bezpieczenstwo

- Przechowuj JWT w secure context lub sessionStorage, nie globalnym obiekcie.
- Nie wysylaj JWT w URL query string.
- Dodaj ekspiracji tokena i refresh flow gdy JWT sie wygas.
- Sanityzuj email na input; waliduj format.
