# React Frontend - Quick Start Guide

Practical steps to build a working React + TypeScript application integrated with microservices.

## 1. Project Setup (30 min)

```bash
npm create vite@latest my-shop-frontend -- --template react-ts
cd my-shop-frontend

# Install dependencies
npm install

# Dev dependencies
npm install -D @types/node @types/react @types/react-dom
npm install -D tailwindcss postcss autoprefixer
npm install -D @testing-library/react @testing-library/jest-dom vitest msw
npm install -D eslint eslint-config-react typescript

# Production dependencies
npm install react-router-dom axios zod uuid
npm install @tanstack/react-query
npm install lucide-react # Icons
```

## 2. Project Structure (15 min)

```
src/
├── app/                        # Global app setup
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers.tsx
├── features/                   # Feature modules
│   ├── auth/
│   │   ├── api/
│   │   │   └── authClient.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── pages/
│   │   │   └── LoginPage.tsx
│   │   └── tests/
│   ├── products/
│   ├── orders/
│   ├── cart/
│   ├── promotions/
│   └── user/
├── shared/                     # Reusable components
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── layouts/
│   │   └── MainLayout.tsx
│   └── icons/
├── lib/                        # Utilities
│   ├── apiClient.ts
│   ├── queryClient.ts
│   ├── retry.ts
│   ├── errors.ts
│   └── test/
├── main.tsx
└── styles/
    └── globals.css
```

## 3. Environment Setup (10 min)

Create `.env.development` and `.env.production`:

```env
# .env.development
VITE_API_BASE_URL=http://localhost:5294
VITE_AUTH_SERVICE_URL=http://localhost:5300
VITE_ORDER_SERVICE_URL=http://localhost:5297
VITE_PROMOTION_SERVICE_URL=http://localhost:5298
```

## 4. Configure Vite (10 min)

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL,
        changeOrigin: true,
      },
    },
  },
})
```

## 5. Bootstrap App Providers (20 min)

```typescript
// src/app/providers.tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { CartProvider } from '@/features/cart/context/CartContext'
import { UserProvider } from '@/features/user/context/UserContext'

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
```

## 6. Start with Auth (1-2 hours)

Follow steps from [08-authentication-and-jwt.instructions.md](instructions/08-authentication-and-jwt.instructions.md):

1. Create AuthContext.
2. API client for login/register.
3. LoginPage component.
4. Axios interceptor to add JWT.
5. ProtectedRoute wrapper.

Test: `npm run dev`, register -> login -> check JWT in localStorage.

## 7. Products Feature (1-2 hours)

Follow steps from [09-products-listing-and-caching.instructions.md](instructions/09-products-listing-and-caching.instructions.md):

1. ProductService API client.
2. React Query hooks for products.
3. ProductList component.
4. ProductCard component.

Test: Should display product list from backend.

## 8. Shopping Cart (1-2 hours)

Follow steps from [10-shopping-cart-and-orders.instructions.md](instructions/10-shopping-cart-and-orders.instructions.md):

1. CartContext + hooks.
2. Cart UI components (CartItem, CartSummary).
3. Checkout form.
4. Order API client.

Test: Add to cart -> view cart -> proceed to checkout (no payment yet).

## 9. Promotions (1 hour)

Follow steps from [11-promotions-and-discounts.instructions.md](instructions/11-promotions-and-discounts.instructions.md):

1. Promotion API client.
2. Hook to evaluate promotions.
3. PromotionSelector component.
4. Integration with checkout.

Test: Select promotion -> apply -> check price adjustment in order summary.

## 10. User Profile (1 hour)

Follow steps from [12-user-profile-and-history.instructions.md](instructions/12-user-profile-and-history.instructions.md):

1. UserProfile API client.
2. ProfilePage component.
3. OrderHistory component.
4. Polling for order status.

Test: Profile -> should show user data and order history.

## 11. Error Handling (30 min)

Follow steps from [13-error-handling-problemdetails.instructions.md](instructions/13-error-handling-problemdetails.instructions.md):

1. Axios interceptor to map ProblemDetails.
2. ErrorBoundary component.
3. Error UI for different statuses (401, 404, 5xx).

Test: Logout -> try accessing protected resource -> should redirect to login.

## 12. Idempotency (30 min)

Follow steps from [14-idempotency-and-retry-patterns.instructions.md](instructions/14-idempotency-and-retry-patterns.instructions.md):

1. generateIdempotencyKey utility.
2. Idempotency header in checkout request.
3. Retry logic with exponential backoff.

Test: Before confirming checkout -> refresh page -> should not duplicate order.

## 13. Integration Testing (1-2 hours)

Follow steps from [16-integration-testing-scenarios.instructions.md](instructions/16-integration-testing-scenarios.instructions.md):

1. Setup MSW for API mocking.
2. Auth flow tests.
3. Checkout flow tests.
4. Error scenario tests.

Run: `npm run test` - should pass.

## 14. Performance Optimization (1 hour)

Follow steps from [17-performance-and-caching-strategies.instructions.md](instructions/17-performance-and-caching-strategies.instructions.md):

1. Code splitting for lazy loaded pages.
2. React Query cache config.
3. Image optimization.
4. Web Vitals monitoring.

Test: `npm run build` - bundle should be < 300KB (gzipped).

## 15. Deployment Preparation (30 min)

```bash
# Build
npm run build

# Preview production build
npm run preview

# Check for lint/type errors
npm run lint
npm run type-check
```

## Backend Services Status Check

Before working, make sure services are running:

```bash
# from root project
docker-compose -f docker-compose.brokers.yml up -d
cd AuthService && docker-compose up -d &
cd UserService && docker-compose up -d &
cd ProductService && docker-compose up -d &
cd OrderService && docker-compose up -d &
cd PromotionService && docker-compose up -d &
```

Check endpoints:
- AuthService: `http://localhost:5300/swagger`
- UserService: `http://localhost:5301/swagger`
- ProductService: `http://localhost:5294/swagger`
- OrderService: `http://localhost:5297/swagger`
- PromotionService: `http://localhost:5298/swagger`

## Typical Development Flow

1. **Planning**: Open Jira/GitHub Issue with requirements.
2. **Design**: Sketch UI on paper or Figma.
3. **Implement**: Use appropriate instruction (08-17).
4. **Test**: Run integration tests.
5. **Review**: Ask Copilot to check implementation.
6. **Merge**: Add to staging, deploy.

## Common Commands

```bash
# Development
npm run dev

# Build
npm run build

# Test
npm run test
npm run test:coverage

# Lint
npm run lint
npm run format

# Type check
npm run type-check

# Preview production
npm run preview
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| 401 Unauthorized | JWT expired - logout and login again |
| 404 Not Found | Check if backend service is running |
| CORS error | Check vite proxy config and environment URLs |
| Cart state disappears | Load from localStorage in useEffect |
| Query not caching | Check staleTime/gcTime config |

## Next Steps

When you have a working application:

1. Add more service integrations (Dashboard, Payments).
2. Implement WebSocket for real-time updates.
3. Add offline support (Service Workers).
4. Setup CI/CD for auto deployment.
5. Monitor performance and errors in production.
