import { useQuery } from "@tanstack/react-query";

import { productApiClient } from "../api/productClient";

export const PRODUCTS_QUERY_KEY = ["products"] as const;

export const useAllProducts = () => {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: () => productApiClient.getAll(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useProductsByShop = (shopId: string | null) => {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, "shop", shopId],
    queryFn: () => (shopId ? productApiClient.getByShop(shopId) : Promise.resolve([])),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: Boolean(shopId),
  });
};

export const useProductById = (productId: string | null) => {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, "detail", productId],
    queryFn: () => (productId ? productApiClient.getById(productId) : Promise.resolve(null)),
    staleTime: 10 * 60 * 1000,
    enabled: Boolean(productId),
  });
};
