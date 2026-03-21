---
applyTo: "src/**/*.{ts,tsx}"
---
# Products Listing And Caching Rules

Products come from ProductService. Read them without changing prices (prices are read-only).

## Data Structure

```typescript
interface Product {
  id: string;
  name: string;
  type: string;
  price: number; // READ ONLY - never edit on frontend
  shopId: string;
}

interface ProductsPerShop {
  shopId: string;
  products: Product[];
}
```

## API Client with Caching

```typescript
// src/features/products/api/productClient.ts

import axios from 'axios';

const API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:5294';

export const productApiClient = {
  getAll: async (): Promise<Product[]> => {
    const response = await axios.get(`${API_BASE}/api/products`);
    return response.data;
  },

  getByShop: async (shopId: string): Promise<Product[]> => {
    const response = await axios.get(`${API_BASE}/api/products/shop/${shopId}`);
    return response.data;
  },

  getById: async (productId: string): Promise<Product> => {
    const response = await axios.get(`${API_BASE}/api/products/${productId}`);
    return response.data;
  },
};
```

## React Query Setup

```typescript
// src/features/products/hooks/useProducts.ts

import { useQuery } from '@tanstack/react-query';
import { productApiClient } from '../api/productClient';

const PRODUCTS_QUERY_KEY = ['products'];

export const useAllProducts = () => {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: () => productApiClient.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useProductsByShop = (shopId: string | null) => {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, shopId],
    queryFn: () => (shopId ? productApiClient.getByShop(shopId) : Promise.resolve([])),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!shopId,
  });
};

export const useProductById = (productId: string | null) => {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, productId],
    queryFn: () => (productId ? productApiClient.getById(productId) : Promise.resolve(null)),
    staleTime: 10 * 60 * 1000,
    enabled: !!productId,
  });
};
```

## Product List Component

```typescript
// src/features/products/ui/ProductList.tsx

import { useAllProducts } from '../hooks/useProducts';

export function ProductList() {
  const { data: products, isLoading, error, refetch } = useAllProducts();

  if (error) {
    return (
      <div className="error-container">
        <p>Failed to load products. {error.message}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  if (isLoading) {
    return <ProductListSkeleton count={6} />;
  }

  if (!products?.length) {
    return (
      <div className="empty-state">
        <p>No products available.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

## Filtering And Sorting

- Sort and filter client-side as long as product count does not exceed 1000.
- For large datasets, delegate sorting/filtering to backend with query params.
- Cache results separately for each filter combination.

## Cache Invalidation

- After a change (e.g., in admin panel), invalidate cache: `queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] })`.
- For product updates (if allowed), update local data and cache in one step.

## Optimistic Update (admin/manager only)

```typescript
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateProductRequest) => productApiClient.update(data),
    onMutate: async (newData) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
      
      const previous = queryClient.getQueryData([PRODUCTS_QUERY_KEY]);
      
      // Optimistic update
      queryClient.setQueryData([PRODUCTS_QUERY_KEY], (old: Product[]) =>
        old.map(p => p.id === newData.id ? { ...p, ...newData } : p)
      );
      
      return { previous };
    },
    onError: (err, newData, context) => {
      if (context?.previous) {
        queryClient.setQueryData([PRODUCTS_QUERY_KEY], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
    },
  });
};
```

## Price Validation

- Price is a `number` >= 0, always with max 2 decimal places.
- Never allow user to edit price on frontend; it is read-only from backend.
- When displaying, format currency: `${price.toFixed(2)} USD`.
