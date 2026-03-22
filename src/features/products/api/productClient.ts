import { z } from "zod";

import { createApiClient } from "@/shared/lib/http/apiClient";
import { ApiError } from "@/shared/lib/http/errors";
import { CACHE_KEY, cacheGet, cacheSet } from "@/shared/lib/cache/localCache";
import { type Product } from "../model/product.types";

const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  price: z.number().min(0),
  shopId: z.string().min(1),
  imageUrl: z.string().url().optional(),
});

const productsSchema = z.array(productSchema);

const client = createApiClient(() => null);

const parseProducts = (value: unknown): Product[] => {
  const parsed = productsSchema.safeParse(value);

  if (!parsed.success) {
    throw new ApiError({
      message: "Invalid products response",
      status: 500,
      detail: "Backend returned invalid products data.",
    });
  }

  return parsed.data;
};

const parseProduct = (value: unknown): Product => {
  const parsed = productSchema.safeParse(value);

  if (!parsed.success) {
    throw new ApiError({
      message: "Invalid product response",
      status: 500,
      detail: "Backend returned invalid product data.",
    });
  }

  return parsed.data;
};

export const productApiClient = {
  async getAll(): Promise<Product[]> {
    const cached = cacheGet<Product[]>(CACHE_KEY.productsAll, 30 * 60 * 1000);
    if (cached) {
      return cached;
    }

    const response = await client.get("/api/products");
    const products = parseProducts(response.data);
    cacheSet(CACHE_KEY.productsAll, products);
    return products;
  },

  async getByShop(shopId: string): Promise<Product[]> {
    const cacheKey = `${CACHE_KEY.productsByShop}${shopId}`;
    const cached = cacheGet<Product[]>(cacheKey, 30 * 60 * 1000);
    if (cached) {
      return cached;
    }

    const response = await client.get(`/api/products/shop/${shopId}`);
    const products = parseProducts(response.data);
    cacheSet(cacheKey, products);
    return products;
  },

  async getById(productId: string): Promise<Product> {
    const cacheKey = `${CACHE_KEY.productDetail}${productId}`;
    const cached = cacheGet<Product>(cacheKey, 30 * 60 * 1000);
    if (cached) {
      return cached;
    }

    const response = await client.get(`/api/products/${productId}`);
    const product = parseProduct(response.data);
    cacheSet(cacheKey, product);
    return product;
  },
};
