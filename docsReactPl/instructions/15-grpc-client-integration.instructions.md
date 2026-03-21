---
applyTo: "src/**/*.{ts,tsx}"
---
# GRpc Client Integration Rules

Backend serwisy komunikują się przez gRPC. Frontend musi wiedzieć o tym dla logging/debugging.

## Kiedy gRPC jest stosowany

- **OrderService** -> **ProductService** (GET product price, shop)
- **OrderService** -> **PromotionService** (EVALUATE promotions)
- **AuthService** -> **UserService** (CREATE user profile)
- **PromotionService** -> **LoggerService** (LOG events)

## Implikacje dla frontu

1. **Latencja**: gRPC call może mieć ~100-500ms delay. Oczekuj tego w time budgets.
2. **Errors**: Błędy gRPC mapują się na HTTP responses z ProblemDetails.
3. **Timeout**: Każde gRPC call ma timeout ~10s. Backend zwraca error jeśli backend service unavailable.
4. **Correlation**: Wszystkie gRPC calls propagują `X-Correlation-Id` dla tracing.

## Obsługa gRPC Errors na froncie

```typescript
// src/lib/types/grpcErrors.ts

export type GrpcErrorCode =
  | 'UNAVAILABLE' // Service not available
  | 'DEADLINE_EXCEEDED' // Timeout
  | 'INVALID_ARGUMENT' // Bad input
  | 'NOT_FOUND' // Resource not found
  | 'PERMISSION_DENIED' // Auth failed
  | 'INTERNAL' // Server error
  | 'UNAUTHENTICATED'; // JWT invalid

interface GrpcError {
  code: GrpcErrorCode;
  message: string;
  details?: string;
}

export function mapApiErrorToGrpc(apiError: ApiError): GrpcError | null {
  // Mapuj ProblemDetails na gRPC codes
  
  if (apiError.status === 503) {
    return { code: 'UNAVAILABLE', message: 'Service temporarily unavailable' };
  }

  if (apiError.status === 408) {
    return { code: 'DEADLINE_EXCEEDED', message: 'Request timeout (gRPC service slow)' };
  }

  if (apiError.status === 422) {
    return { code: 'INVALID_ARGUMENT', message: apiError.detail };
  }

  if (apiError.status === 404) {
    return { code: 'NOT_FOUND', message: apiError.detail };
  }

  if (apiError.status === 401) {
    return { code: 'UNAUTHENTICATED', message: 'JWT validation failed' };
  }

  if (apiError.status === 403) {
    return { code: 'PERMISSION_DENIED', message: 'Authorization failed' };
  }

  return null;
}
```

## Handling gRPC Unavailability

```typescript
// src/features/orders/hooks/useCheckout.ts

export const useCheckout = () => {
  const retry = useRetry();

  const checkout = async (cartData: CartData, token: string) => {
    // Timeout dla gRPC calls: 15s total (cztery 3s gRPC calls + margin)
    const checkoutPromise = orderApiClient.cartCheckout(cartData, token);
    
    return Promise.race([
      checkoutPromise,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Checkout timeout - service may be slow')),
          15000
        )
      ),
    ]);
  };

  return { checkout };
};
```

## Debugging gRPC Calls

- Sprawdź `X-Correlation-Id` w response headers - to będzie w logach serwera.
- Jeśli timeout, sprawdź czy backend services są uruchomione (np. `docker ps`).
- W development mode, możesz logować correlation IDs:

```typescript
export function logApiCall(url: string, method: string, correlationId?: string) {
  console.log(`[API] ${method} ${url}`, {
    correlationId,
    timestamp: new Date().toISOString(),
  });
}
```

## Retry Strategy dla gRPC

```typescript
// Dla operacji zależnych od gRPC (checkout):
// - Max 2 retries (gRPC jest slow, więcej retries = frustracja)
// - Backoff: 2s, 4s
// - Timeout per attempt: 10s

const GRPC_DEPENDENT_RETRY_CONFIG = {
  maxRetries: 2,
  baseDelayMs: 2000,
  timeoutMs: 10000,
};
```

## Performance Hints

- Nie czekaj na gRPC calls dla non-critical UI interactions.
- Cache wyniki gdzie możliwe (promotions, product details).
- Loading state powinien pokazywać "Evaluating promotions..." zamiast generic spinner.
