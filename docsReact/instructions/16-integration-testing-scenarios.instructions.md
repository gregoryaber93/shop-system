---
applyTo: "src/**/*.{ts,tsx,test.ts,test.tsx}"
---
# Integration Testing Scenarios Rules

Integration tests cover real user flows with mocked API endpoints.

## Test Setup With MSW (Mock Service Worker)

```typescript
// src/lib/test/setup.ts

import { setupServer } from 'msw/node';
import { HttpHandler, HttpResponse } from 'msw';

export const createMockServer = (handlers: HttpHandler[]) => {
  const server = setupServer(...handlers);

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  return server;
};
```

## Scenario 1: User Registration -> Login -> View Profile

```typescript
// src/features/auth/tests/authFlow.test.tsx

describe('Auth Flow', () => {
  let server: ReturnType<typeof createMockServer>;

  beforeEach(() => {
    server = createMockServer([
      http.post(`${API_BASE}/api/authentication/register`, () => {
        return HttpResponse.json({
          token: 'mock-jwt-token',
        });
      }),

      http.get(`${API_BASE}/api/users/profile`, () => {
        return HttpResponse.json({
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        });
      }),
    ]);
  });

  it('should register, login, and fetch profile', async () => {
    const { getByText, getByPlaceholderText, getByRole } = render(
      <AuthProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </AuthProvider>
    );

    // Register
    fireEvent.change(getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(getByRole('button', { name: /register/i }));

    await waitFor(() => expect(localStorage.getItem('auth_token')).toBeTruthy());

    // Check profile loaded
    await waitFor(() => expect(getByText('John Doe')).toBeInTheDocument());
  });
});
```

## Scenario 2: Browse Products -> Add to Cart -> Checkout

```typescript
// src/features/orders/tests/checkoutFlow.test.tsx

describe('Checkout Flow', () => {
  let server: ReturnType<typeof createMockServer>;
  const mockProducts = [
    { id: 'prod-1', name: 'Widget', price: 29.99, shopId: 'shop-1' },
    { id: 'prod-2', name: 'Gadget', price: 49.99, shopId: 'shop-1' },
  ];

  const mockPromotions = [
    {
      id: 'promo-1',
      name: '10% Off',
      type: 'ProductDiscount',
      discountPercentage: 10,
      isActive: true,
    },
  ];

  beforeEach(() => {
    server = createMockServer([
      // Products
      http.get(`${API_BASE}/api/products`, () => {
        return HttpResponse.json(mockProducts);
      }),

      // Promotions
      http.get(`${API_BASE}/api/promotions`, () => {
        return HttpResponse.json(mockPromotions);
      }),

      // Evaluate promotions
      http.post(`${API_BASE}/api/promotions/evaluate`, () => {
        return HttpResponse.json({
          approved: true,
          appliedDiscounts: [
            { productId: 'prod-1', discountPercentage: 10 },
          ],
          loyaltyPointsEarned: 3,
        });
      }),

      // Place order
      http.post(`${API_BASE}/api/orders`, ({ request }) => {
        const headers = request.headers;
        const hasIdempotencyKey = headers.has('Idempotency-Key');
        
        if (!hasIdempotencyKey) {
          return HttpResponse.json(
            { detail: 'Idempotency-Key header required' },
            { status: 422 }
          );
        }

        return HttpResponse.json({
          id: 'order-123',
          userId: 'user-123',
          items: mockProducts.map(p => ({
            productId: p.id,
            productName: p.name,
            unitPrice: p.price,
            quantity: 1,
            discountPercentage: 10,
            lineTotal: p.price * 0.9,
          })),
          totalPrice: (mockProducts[0].price * 0.9 + mockProducts[1].price * 0.9),
          discountApplied: mockProducts[0].price * 0.1,
          loyaltyPointsEarned: 3,
          status: 'Created',
        });
      }),
    ]);
  });

  it('should browse products, add to cart, apply promo, and checkout', async () => {
    const { getByText, getByRole, getByPlaceholderText } = render(
      <CartProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </CartProvider>
    );

    // Should see products
    await waitFor(() => expect(getByText('Widget')).toBeInTheDocument());

    // Add to cart
    fireEvent.click(getByRole('button', { name: /add to cart/i }));

    // Open cart
    fireEvent.click(getByRole('button', { name: /view cart/i }));
    await waitFor(() => expect(getByText('Widget')).toBeInTheDocument());

    // Apply promotion
    fireEvent.click(getByRole('button', { name: /apply.*10%/i }));

    // Checkout
    fireEvent.click(getByRole('button', { name: /place order/i }));

    // Should see order confirmation
    await waitFor(() => expect(getByText(/order-123/i)).toBeInTheDocument());
  });
});
```

## Scenario 3: Order Status Polling

```typescript
// src/features/orders/tests/orderPolling.test.tsx

describe('Order Status Polling', () => {
  let server: ReturnType<typeof createMockServer>;
  let callCount = 0;

  beforeEach(() => {
    callCount = 0;
    server = createMockServer([
      http.get(`${API_BASE}/api/orders/order-123`, () => {
        callCount++;

        const statuses = [
          'Created',
          'PaymentPending',
          'PaymentAuthorized',
          'Fulfilled',
        ];

        const status = statuses[Math.min(callCount - 1, statuses.length - 1)];

        return HttpResponse.json({
          id: 'order-123',
          status,
          totalPrice: 79.98,
          createdAt: new Date().toISOString(),
        });
      }),
    ]);
  });

  it('should poll order status until fulfilled', async () => {
    const { getByText } = render(
      <AuthProvider>
        <OrderStatusPage orderId="order-123" />
      </AuthProvider>
    );

    // Initial status
    await waitFor(() => expect(getByText('Created')).toBeInTheDocument());

    // Poll progresses through statuses
    await waitFor(() => expect(getByText('Fulfilled')).toBeInTheDocument(), {
      timeout: 10000,
    });
  });
});
```

## Scenario 4: Error Handling & Retry

```typescript
// src/features/orders/tests/checkoutError.test.tsx

describe('Checkout Error Handling', () => {
  let server: ReturnType<typeof createMockServer>;
  let attemptCount = 0;

  beforeEach(() => {
    attemptCount = 0;
    server = createMockServer([
      http.post(`${API_BASE}/api/orders`, () => {
        attemptCount++;

        // Fail first 2 attempts, succeed on 3rd
        if (attemptCount < 3) {
          return HttpResponse.json(
            { detail: 'Service temporary unavailable' },
            { status: 503 }
          );
        }

        return HttpResponse.json({
          id: 'order-123',
          status: 'Created',
        });
      }),
    ]);
  });

  it('should retry on 503 and eventually succeed', async () => {
    const { getByRole } = render(
      <CartProvider>
        <AuthProvider>
          <Checkout />
        </AuthProvider>
      </CartProvider>
    );

    fireEvent.click(getByRole('button', { name: /place order/i }));

    // Should eventually succeed after retries
    await waitFor(() => expect(attemptCount).toBe(3), { timeout: 10000 });
  });
});
```

## Unit Tests vs Integration Tests

- **Unit tests**: Individual components/hooks in isolation (reducer logic, formatting).
- **Integration tests**: Full flow: auth + data + mutations + UI updates.
- **Test real flows**, not implementation details.

## Test Coverage

- Critical paths: register, login, checkout, order status.
- Error scenarios: 401, 404, 503, timeout.
- Edge cases: empty cart, duplicate order (idempotency), promotion expiry.
- Accessibility: aria-labels, focus, keyboard navigation.
