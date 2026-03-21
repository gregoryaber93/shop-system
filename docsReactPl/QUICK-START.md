# React Frontend - Quick Start Guide

Praktyczne kroki aby zbudować działającą aplikację React + TypeScript integrującą się z mikroserwisami.

## 1. Setup Projektu (30 min)

```bash
npm create vite@latest my-shop-frontend -- --template react-ts
cd my-shop-frontend

# Zainstaluj dependencje
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

Utwórz `.env.development` i `.env.production`:

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

Wykonaj kroki z [08-authentication-and-jwt.instructions.md](instructions/08-authentication-and-jwt.instructions.md):

1. Stwórz AuthContext.
2. API client dla login/register.
3. LoginPage komponent.
4. Axios interceptor do dodawania JWT.
5. ProtectedRoute wrapper.

Test: `npm run dev`, register -> login -> check JWT w localStorage.

## 7. Products Feature (1-2 hours)

Wykonaj kroki z [09-products-listing-and-caching.instructions.md](instructions/09-products-listing-and-caching.instructions.md):

1. ProductService API client.
2. React Query hooks dla products.
3. ProductList komponent.
4. ProductCard komponent.

Test: Powinna wyświetlić listę produktów z backendu.

## 8. Shopping Cart (1-2 hours)

Wykonaj kroki z [10-shopping-cart-and-orders.instructions.md](instructions/10-shopping-cart-and-orders.instructions.md):

1. CartContext + hooks.
2. Cart UI komponenty (CartItem, CartSummary).
3. Checkout form.
4. Order API client.

Test: Add to cart -> view cart -> proceed to checkout (bez płatności na razie).

## 9. Promotions (1 hour)

Wykonaj kroki z [11-promotions-and-discounts.instructions.md](instructions/11-promotions-and-discounts.instructions.md):

1. Promotion API client.
2. Hook do ewaluacji promocji.
3. PromotionSelector komponent.
4. Integracja z checkout.

Test: Wybierz promocję -> apply -> sprawdź korektę ceny w order summary.

## 10. User Profile (1 hour)

Wykonaj kroki z [12-user-profile-and-history.instructions.md](instructions/12-user-profile-and-history.instructions.md):

1. UserProfile API client.
2. ProfilePage komponent.
3. OrderHistory komponent.
4. Polling dla statusu zamówienia.

Test: Profile -> powinien pokazywać user dane i historię zamówień.

## 11. Error Handling (30 min)

Wykonaj kroki z [13-error-handling-problemdetails.instructions.md](instructions/13-error-handling-problemdetails.instructions.md):

1. Axios interceptor do mapowania ProblemDetails.
2. ErrorBoundary komponent.
3. Error UI dla różnych statusów (401, 404, 5xx).

Test: Logout -> spróbuj dostać się do protected resource -> powinno redirect na login.

## 12. Idempotency (30 min)

Wykonaj kroki z [14-idempotency-and-retry-patterns.instructions.md](instructions/14-idempotency-and-retry-patterns.instructions.md):

1. generateIdempotencyKey utility.
2. Idempotency header w checkout request.
3. Retry logic z exponential backoff.

Test: Przed potwierdź checkout -> refresh page -> nie powinno duplikować zamówienia.

## 13. Integration Testing (1-2 hours)

Wykonaj kroki z [16-integration-testing-scenarios.instructions.md](instructions/16-integration-testing-scenarios.instructions.md):

1. Setup MSW dla API mocking.
2. Testy dla auth flow.
3. Testy dla checkout flow.
4. Testy dla error scenarios.

Run: `npm run test` - powinny przejść.

## 14. Performance Optimization (1 hour)

Wykonaj kroki z [17-performance-and-caching-strategies.instructions.md](instructions/17-performance-and-caching-strategies.instructions.md):

1. Code splitting dla lazy loaded pages.
2. React Query cache config.
3. Image optimization.
4. Monitoring Web Vitals.

Test: `npm run build` - bundle powinien być < 300KB (gzipped).

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

Przed pracą, upewnij się że serwisy są uruchomione:

```bash
# z root projektu
docker-compose -f docker-compose.brokers.yml up -d
cd AuthService && docker-compose up -d &
cd UserService && docker-compose up -d &
cd ProductService && docker-compose up -d &
cd OrderService && docker-compose up -d &
cd PromotionService && docker-compose up -d &
```

Sprawdź endpoints:
- AuthService: `http://localhost:5300/swagger`
- UserService: `http://localhost:5301/swagger`
- ProductService: `http://localhost:5294/swagger`
- OrderService: `http://localhost:5297/swagger`
- PromotionService: `http://localhost:5298/swagger`

## Typical Development Flow

1. **Planning**: Otwórz Jirę/GitHub Issue z wymaganiami.
2. **Design**: Naszkicuj UI na papierze lub Figma.
3. **Implement**: Użyj odpowiedniej instrukcji (08-17).
4. **Test**: Uruchom integracyjnie.
5. **Review**: Ask Copilota aby sprawdzić implementation.
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
| 401 Unauthorized | JWT expired - logout i login ponownie |
| 404 Not Found | Sprawdź czy backend service jest uruchomiony |
| CORS error | Sprawdź vite proxy config i environment URLs |
| Cart состояние znika | Wczytaj z localStorage w useEffect |
| Query não cachuje | Sprawdź staleTime/gcTime config |

## Next Steps

Gdy masz działającą aplikację:

1. Dodaj więcej serwisów integracji (Dashboard, Payments).
2. Implementuj WebSocket dla real-time updates.
3. Dodaj offline support (Service Workers).
4. Setup CI/CD dla auto deployment.
5. Monitor performance i errors w production.
