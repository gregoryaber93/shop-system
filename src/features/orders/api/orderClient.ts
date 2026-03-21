import { z } from "zod";

import {
  cacheIdempotentResult,
  getIdempotentResult,
} from "@/shared/lib/idempotency/idempotency";
import { createApiClient } from "@/shared/lib/http/apiClient";
import { ApiError } from "@/shared/lib/http/errors";
import { type Order, type PlaceOrderRequest } from "../model/order.types";

const orderItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  unitPrice: z.number().min(0),
  quantity: z.number().int().min(1),
  discountPercentage: z.number().min(0),
  lineTotal: z.number().min(0),
});

const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  items: z.array(orderItemSchema),
  totalPrice: z.number().min(0),
  discountApplied: z.number().min(0),
  loyaltyPointsEarned: z.number().min(0),
  status: z.enum(["Created", "PaymentPending", "PaymentAuthorized", "PaymentFailed", "Fulfilled"]),
  createdAt: z.string(),
});

const ordersSchema = z.array(orderSchema);

const placeOrderRequestSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1).max(99),
    }),
  ),
  appliedPromotionIds: z.array(z.string()),
  idempotencyKey: z.string().min(1),
});

const parseOrder = (value: unknown): Order => {
  const parsed = orderSchema.safeParse(value);

  if (!parsed.success) {
    throw new ApiError({
      message: "Invalid order response",
      status: 500,
      detail: "Backend returned invalid order data.",
    });
  }

  return parsed.data;
};

export const createOrderApiClient = (
  getToken: () => string | null,
  onUnauthorized: () => void,
) => {
  const client = createApiClient(getToken, onUnauthorized);

  return {
    async placeOrder(requestInput: PlaceOrderRequest): Promise<Order> {
      const request = placeOrderRequestSchema.parse(requestInput);

      const cached = getIdempotentResult<Order>(request.idempotencyKey);
      if (cached) {
        return cached;
      }

      const response = await client.post(
        "/api/orders",
        {
          items: request.items,
          appliedPromotionIds: request.appliedPromotionIds,
        },
        {
          headers: {
            "Idempotency-Key": request.idempotencyKey,
          },
        },
      );

      const order = parseOrder(response.data);
      cacheIdempotentResult(request.idempotencyKey, order);

      return order;
    },

    async getMyOrders(): Promise<Order[]> {
      const response = await client.get("/api/orders/my");
      const parsed = ordersSchema.safeParse(response.data);

      if (!parsed.success) {
        throw new ApiError({
          message: "Invalid orders response",
          status: 500,
          detail: "Backend returned invalid orders data.",
        });
      }

      return parsed.data;
    },

    async getById(orderId: string): Promise<Order> {
      const response = await client.get(`/api/orders/${orderId}`);
      return parseOrder(response.data);
    },
  };
};
