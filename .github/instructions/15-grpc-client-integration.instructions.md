---
applyTo: "src/**/*.{ts,tsx}"
---
# gRpc Client Integration Rules

Backend services communicate via gRPC. Frontend must understand this for logging/debugging.

## When gRPC Is Used

- **OrderService** -> **ProductService** (GET product price, shop)
- **OrderService** -> **PromotionService** (EVALUATE promotions)
- **AuthService** -> **UserService** (CREATE user profile)
- **PromotionService** -> **LoggerService** (LOG events)

## Implications For Frontend

1. **Latency**: gRPC call may have ~100-500ms delay. Expect this in time budgets.
2. **Errors**: gRPC errors map to HTTP responses with ProblemDetails.
3. **Timeout**: Each gRPC call has timeout ~10s. Backend returns error if service unavailable.
4. **Correlation**: All gRPC calls propagate `X-Correlation-Id` for tracing.

## Handling gRPC Errors On Frontend

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
  // Map ProblemDetails to gRPC codes
  
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
    // Timeout for gRPC calls: 15s total (four 3s gRPC calls + margin)
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

- Check `X-Correlation-Id` in response headers - it will be in server logs.
- If timeout, check if backend services are running (e.g., `docker ps`).
- In development mode, you can log correlation IDs:

```typescript
export function logApiCall(url: string, method: string, correlationId?: string) {
  console.log(`[API] ${method} ${url}`, {
    correlationId,
    timestamp: new Date().toISOString(),
  });
}
```

## Retry Strategy For gRPC

```typescript
// For operations dependent on gRPC (checkout):
// - Max 2 retries (gRPC is slow, more retries = frustration)
// - Backoff: 2s, 4s
// - Timeout per attempt: 10s

const GRPC_DEPENDENT_RETRY_CONFIG = {
  maxRetries: 2,
  baseDelayMs: 2000,
  timeoutMs: 10000,
};
```

## Performance Hints

- Don't wait for gRPC calls for non-critical UI interactions.
- Cache results where possible (promotions, product details).
- Loading state should show "Evaluating promotions..." instead of generic spinner.
