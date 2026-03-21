---
applyTo: "src/**/*.{ts,tsx}"
---
# Products Listing And Caching Rules

Produkty pochodza z ProductService. Czytaj je bez zmieniania cen (ceny sa read-only).

## Struktura danych

```typescript
interface Product {
  id: string;
  name: string;
  type: string;
  price: number; // READ ONLY - nigdy nie edytuj na froncie
  shopId: string;
}

interface ProductsPerShop {
  shopId: string;
  products: Product[];
}
```

## API Client z cache'owaniem

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

## Komponent listy produktów

```typescript
// src/features/products/ui/ProductList.tsx

import { useAllProducts } from '../hooks/useProducts';

export function ProductList() {
  const { data: products, isLoading, error, isRefetching } = useAllProducts();

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

## Filtrowanie i sortowanie

- Sortowanie i filtrowanie rób po stronie klienta dopoki liczba produktow nie przekroczy 1000.
- Dla duzych zbiorow deleguj sortowanie/filtrowanie do backendu z query params.
- Cache'uj rezultaty oddzielnie dla kazdej kombinacji filtrow.

## Invalidacja cache

- Po zmianie (np. w admin panel), invalidduj cache: `queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] })`.
- Dla update produktu (jesli dozwolone), update local data oraz cache w jednym kroku.

## Optimistic Update (tylko dla admin/manager)

```typescript
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateProductRequest) => productApiClient.update(data),
    onMutate: async (newData) => {
      // Anuluj toczace sie zapytania
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

## Walidacja cen

- Cena to `number` >= 0, zawsze z maksymalnie 2 miejscami po przecinku.
- Nigdy nie pozwalaj uzytkownikowi edytowac cene na froncie; to jest read-only z backendu.
- Przy wyswietlaniu, formatuj walutę: `${price.toFixed(2)} PLN`.
