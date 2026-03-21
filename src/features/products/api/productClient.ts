import { z } from "zod";

import { createApiClient } from "@/shared/lib/http/apiClient";
import { ApiError } from "@/shared/lib/http/errors";
import { type Product } from "../model/product.types";

const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  price: z.number().min(0),
  shopId: z.string().min(1),
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
    const response = await client.get("/api/products");
    return parseProducts(response.data);
  },

  async getByShop(shopId: string): Promise<Product[]> {
    const response = await client.get(`/api/products/shop/${shopId}`);
    return parseProducts(response.data);
  },

  async getById(productId: string): Promise<Product> {
    const response = await client.get(`/api/products/${productId}`);
    return parseProduct(response.data);
  },
};
