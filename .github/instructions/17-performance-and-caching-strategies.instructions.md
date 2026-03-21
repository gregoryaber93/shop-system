---
applyTo: "src/**/*.{ts,tsx}"
---
# Performance And Caching Strategies Rules

Application must be fast and responsive, based on efficient caching and load strategies.

## Bundle Size Target

- **Main bundle**: < 150KB (gzipped).
- **React Query bundle**: ~ 30KB (gzipped).
- **UI library**: ~ 40KB (gzipped) - prefer small/headless libraries.
- **Total initial load**: < 300KB.

Monitoring: `npm run analyze-bundle`.

## Code Splitting Strategy

```typescript
// src/routing/routes.tsx

const Layout = lazy(() => import('@/shared/Layout'));
const HomePage = lazy(() => import('@/features/products/pages/HomePage'));
const AuthPage = lazy(() => import('@/features/auth/pages/AuthPage'));
const CheckoutPage = lazy(() => import('@/features/orders/pages/CheckoutPage'));
const ProfilePage = lazy(() => import('@/features/user/pages/ProfilePage'));

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'auth/*', element: <AuthPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
];
```

## React Query Caching Config

```typescript
// src/lib/queryClient.ts

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      gcTime: 30 * 60 * 1000, // 30 min (formerly cacheTime)
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 0, // Mutations don't auto-retry
    },
  },
});
```

## Redis-Like Caching On Frontend

```typescript
// src/lib/localStorage.ts

const CACHE_KEYS = {
  PRODUCTS: 'cache:products:all',
  PRODUCTS_BY_SHOP: 'cache:products:by-shop',
  PROMOTIONS: 'cache:promotions:active',
  USER_PROFILE: 'cache:user:profile',
};

const CACHE_EXPIRY = {
  PRODUCTS: 30 * 60 * 1000, // 30 min
  PROMOTIONS: 1 * 60 * 1000, // 1 min
  PROFILE: 60 * 60 * 1000, // 60 min
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function cacheGet<T>(key: string): T | null {
  const item = localStorage.getItem(key);
  if (!item) return null;

  try {
    const { data, timestamp }: CacheEntry<T> = JSON.parse(item);
    const expiry = CACHE_EXPIRY[key as keyof typeof CACHE_EXPIRY] || 30 * 60 * 1000;

    if (Date.now() - timestamp > expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T): void {
  localStorage.setItem(
    key,
    JSON.stringify({ data, timestamp: Date.now() })
  );
}

export function cacheClear(key?: string): void {
  if (key) {
    localStorage.removeItem(key);
  } else {
    Object.values(CACHE_KEYS).forEach(k => localStorage.removeItem(k));
  }
}
```

## Image Optimization

```typescript
// Use Next Image or equivalent
<img
  src={productImage}
  alt={productName}
  width={400}
  height={400}
  loading="lazy" // Lazy load images below fold
/>
```

## List Virtualization (large datasets)

```typescript
// src/features/products/ui/ProductGridVirtual.tsx

import { FixedSizeGrid } from 'react-window';

export function ProductGridVirtual({ products }: { products: Product[] }) {
  return (
    <FixedSizeGrid
      columnCount={4}
      columnWidth={250}
      height={600}
      rowCount={Math.ceil(products.length / 4)}
      rowHeight={300}
      width={1000}
    >
      {({ columnIndex, rowIndex, style }) => {
        const index = rowIndex * 4 + columnIndex;
        if (index >= products.length) return null;

        return (
          <div style={style} key={products[index].id}>
            <ProductCard product={products[index]} />
          </div>
        );
      }}
    </FixedSizeGrid>
  );
}
```

## Web Vitals Monitoring

```typescript
// src/lib/vitals.ts

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function initWebVitals() {
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
}
```

## Render Optimization

```typescript
// Memoize components that don't change
const ProductCard = memo(({ product }: { product: Product }) => {
  return <div>{product.name}</div>;
}, (prev, next) => prev.product.id === next.product.id);

// Use useCallback for stable references
const handleAddToCart = useCallback(
  (productId: string) => {
    // ...
  },
  [] // Dependencies
);

// Avoid inline objects/functions in props
const buttonProps = useMemo(() => ({ onClick: handleClick }), [handleClick]);
```

## Metrics & Monitoring

- **First Contentful Paint (FCP)**: < 2s.
- **Largest Contentful Paint (LCP)**: < 2.5s.
- **Cumulative Layout Shift (CLS)**: < 0.1.
- **First Input Delay (FID)**: < 100ms.
- **Time To Interactive (TTI)**: < 3s.

Check in Lighthouse: `npm run build && npm run preview`.

## Development Performance

```typescript
// vite.config.ts

export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'data-vendor': ['@tanstack/react-query'],
        },
      },
    },
    minify: 'terser',
    sourcemap: false,
  },
};
```
