---
applyTo: "src/**/*.{ts,tsx}"
---
# Idempotency And Retry Patterns Rules

Critical operations require idempotency. OrderService supports Idempotency-Key.

## Idempotency Flow

1. **Request**: Client sends `Idempotency-Key: {UUID}` header.
2. **Server**: Checks if request with this key already exists in cache.
3. **Response**: Returns cached result or executes operation and caches result.
4. **Retry**: If request times out/fails, client sends same `Idempotency-Key`.
5. **Result**: Server returns same response without duplicating effect.

## Frontend Implementation

```typescript
// src/lib/idempotency.ts

import { v4 as uuidv4 } from 'uuid';

interface IdempotencyCache {
  [key: string]: {
    timestamp: number;
    result: any;
  };
}

// In-memory cache (cleanup after 1h)
const idempotencyCache: IdempotencyCache = {};

export function generateIdempotencyKey(): string {
  return uuidv4();
}

export function cacheIdempotentResult(key: string, result: any): void {
  idempotencyCache[key] = {
    timestamp: Date.now(),
    result,
  };

  // Cleanup old entries (> 1 hour)
  Object.keys(idempotencyCache).forEach((k) => {
    if (Date.now() - idempotencyCache[k].timestamp > 60 * 60 * 1000) {
      delete idempotencyCache[k];
    }
  });
}

export function getIdempotentResult(key: string): any | null {
  return idempotencyCache[key]?.result || null;
}
```

## API Client with Idempotency

```typescript
// src/features/orders/api/orderClient.ts

interface PlaceOrderRequest {
  items: { productId: string; quantity: number }[];
  appliedPromotionIds: string[];
  idempotencyKey: string;
}

export const orderApiClient = {
  placeOrder: async (request: PlaceOrderRequest, token: string): Promise<Order> => {
    // Check if request already cached
    const cached = getIdempotentResult(request.idempotencyKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/api/orders`,
        request,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Idempotency-Key': request.idempotencyKey,
          },
        }
      );

      cacheIdempotentResult(request.idempotencyKey, response.data);
      return response.data;
    } catch (error) {
      // Retry with same key
      if (isRetryableError(error)) {
        return orderApiClient.placeOrder(request, token);
      }
      throw error;
    }
  },
};

function isRetryableError(error: any): boolean {
  const status = error.response?.status;
  // Retry on timeout (408), too many requests (429), and 5xx
  return status === 408 || status === 429 || (status >= 500 && status < 600);
}
```

## Retry Hook

```typescript
// src/lib/hooks/useRetry.ts

export function useRetry() {
  return useCallback(
    async <T,>(
      fn: () => Promise<T>,
      maxRetries = 3,
      baseDelayMs = 1000
    ): Promise<T> => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn();
        } catch (error) {
          const status = (error as any).status;
          
          // Don't retry 4xx (except 408, 429)
          if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
            throw error;
          }

          if (i < maxRetries - 1) {
            // Exponential backoff
            const delay = baseDelayMs * Math.pow(2, i);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      throw new Error('Max retries exceeded');
    },
    []
  );
}
```

## Checkout with Idempotency

```typescript
// src/features/orders/ui/Checkout.tsx

export function Checkout() {
  const { cart, clearCart } = useCart();
  const { token } = useAuth();
  const retry = useRetry();

  const [idempotencyKey] = useState(() => generateIdempotencyKey());
  const [isPlacing, setIsPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    setIsPlacing(true);

    try {
      await retry(
        async () => {
          const order = await orderApiClient.placeOrder(
            {
              items: cart.items.map(i => ({
                productId: i.productId,
                quantity: i.quantity,
              })),
              appliedPromotionIds: cart.appliedPromotions,
              idempotencyKey, // Always the same for this checkout
            },
            token!
          );

          clearCart();
          navigate(`/orders/${order.id}`);
        },
        3,
        1000
      );
    } catch (error) {
      console.error('Failed to place order:', error);
      // Display error message
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div>
      {/* ... */}
      <button onClick={handlePlaceOrder} disabled={isPlacing}>
        {isPlacing ? 'Processing...' : 'Place Order'}
      </button>
    </div>
  );
}
```

## Best Practices

- **Generate UUID v4 for each critical operation** (order, payment).
- **Don't retry POST without Idempotency-Key** (show error instead).
- **For GET requests**, retry is safe (no side effect).
- **Exponential backoff**: 1s, 2s, 4s, ...
- **Max retries**: 3-5 for network timeout, 1 for validation error.
- **Display retry status** in UI: "Retrying... (attempt 2/3)".
