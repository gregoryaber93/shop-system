---
applyTo: "src/**/*.{ts,tsx}"
---
# Error Handling And ProblemDetails Rules

Backend zwraca standardowe ProblemDetails (RFC 7807). Frontend musi je obsługiwać.

## ProblemDetails Structure

```typescript
// src/lib/types/errors.ts

interface ProblemDetails {
  type: string; // URI
  title: string; // Krótki tytuł błędu
  status: number; // HTTP status
  detail: string; // Szczegółowy opis
  correlationId?: string; // Do śledzenia w logach
  instance?: string; // Resource path
  extensions?: Record<string, any>; // Dodatkowe info
}

interface ApiError extends Error {
  status: number;
  detail: string;
  correlationId?: string;
  type?: string;
}
```

## Axios Error Interceptor

```typescript
// src/lib/apiClient.ts

export const createApiClientWithErrorHandling = (token: string | null) => {
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
      const apiError = parseApiError(error);
      console.error('API Error:', {
        status: apiError.status,
        detail: apiError.detail,
        correlationId: apiError.correlationId,
      });
      return Promise.reject(apiError);
    }
  );

  return client;
};

function parseApiError(error: any): ApiError {
  if (error.response?.data) {
    const problem = error.response.data as ProblemDetails;
    const apiError = new Error(problem.detail || problem.title) as ApiError;
    apiError.status = problem.status || error.response.status;
    apiError.detail = problem.detail;
    apiError.correlationId = problem.correlationId;
    apiError.type = problem.type;
    return apiError;
  }

  if (error.response?.status === 401) {
    const apiError = new Error('Unauthorized. Please log in again.') as ApiError;
    apiError.status = 401;
    apiError.detail = 'Invalid or expired token';
    return apiError;
  }

  if (error.response?.status === 403) {
    const apiError = new Error('Access Denied') as ApiError;
    apiError.status = 403;
    apiError.detail = 'You do not have permission to perform this action';
    return apiError;
  }

  if (error.response?.status === 404) {
    const apiError = new Error('Not Found') as ApiError;
    apiError.status = 404;
    apiError.detail = 'The requested resource was not found';
    return apiError;
  }

  if (error.response?.status === 409) {
    const apiError = new Error('Conflict') as ApiError;
    apiError.status = 409;
    apiError.detail = 'The resource already exists or the operation conflicts with existing data';
    return apiError;
  }

  if (error.response?.status === 422) {
    const apiError = new Error('Validation Error') as ApiError;
    apiError.status = 422;
    apiError.detail = 'The request data is invalid';
    return apiError;
  }

  if (error.code === 'ECONNABORTED') {
    const apiError = new Error('Request Timeout') as ApiError;
    apiError.status = 408;
    apiError.detail = 'The request took too long to complete';
    return apiError;
  }

  const apiError = new Error('An unexpected error occurred') as ApiError;
  apiError.status = error.response?.status || 500;
  apiError.detail = error.message || 'Network error';
  return apiError;
}
```

## Error Component

```typescript
// src/shared/ui/ErrorBoundary.tsx

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.href = '/'}>
            Go to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Error Display Strategy

- **401/403**: Redirect to login or access denied page.
- **404**: Show "not found" message with link to home.
- **409/422**: Show validation error message; umożliwić retry.
- **5xx**: Show "server error" message; encourage user to contact support.
- **Network timeout**: Show "network issue" message; offer retry.

## Retry Logic

```typescript
// src/lib/retry.ts

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  backoffMs = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Nie retry na 4xx errors (except 408, 429)
      const status = (error as any).status;
      if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
        throw error;
      }

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, backoffMs * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
}
```

## CorrelationId Logging

- Każdy request powinien mieć `X-Correlation-Id` header.
- Response zawiera `correlationId` w ProblemDetails.
- Wyświetl `correlationId` w UI przy błędzie do śledzenia w logach serwera.

```typescript
export function ErrorMessage({ error }: { error: ApiError }) {
  return (
    <div className="error-message">
      <p>{error.detail}</p>
      {error.correlationId && (
        <small>Correlation ID: {error.correlationId}</small>
      )}
    </div>
  );
}
```
