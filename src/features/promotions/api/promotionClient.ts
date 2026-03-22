import { z } from "zod";

import { CACHE_KEY, cacheGet, cacheSet } from "@/shared/lib/cache/localCache";
import { createApiClient } from "@/shared/lib/http/apiClient";
import { ApiError } from "@/shared/lib/http/errors";
import {
  type EvaluatePromotionResponse,
  type Promotion,
  type UserPromotionProfile,
} from "../model/promotion.types";

const promotionSchema = z.object({
  id: z.string(),
  type: z.enum(["ProductDiscount", "LoyaltyPoints"]),
  name: z.string(),
  description: z.string(),
  discountPercentage: z.number().min(0).max(100),
  requiredPoints: z.number().min(0).optional(),
  isActive: z.boolean(),
  validFrom: z.string(),
  validTo: z.string(),
});

const promotionsSchema = z.array(promotionSchema);

const userPromotionProfileSchema = z.object({
  userId: z.string(),
  totalPoints: z.number().min(0),
  earnedAt: z.string(),
});

const evaluatePromotionResponseSchema = z.object({
  approved: z.boolean(),
  appliedDiscounts: z.array(
    z.object({
      productId: z.string(),
      discountPercentage: z.number().min(0).max(100),
    }),
  ),
  loyaltyPointsEarned: z.number().min(0),
  message: z.string(),
});

const parse = <T>(
  value: unknown,
  parser: z.ZodType<T>,
  message: string,
): T => {
  const result = parser.safeParse(value);

  if (!result.success) {
    throw new ApiError({
      message,
      status: 500,
      detail: message,
    });
  }

  return result.data;
};

export const createPromotionApiClient = (
  getToken: () => string | null,
  onUnauthorized: () => void,
) => {
  const client = createApiClient(getToken, onUnauthorized);
  const publicClient = createApiClient(() => null);

  return {
    async getAllActive(): Promise<Promotion[]> {
      const cached = cacheGet<Promotion[]>(CACHE_KEY.promotionsActive, 60 * 1000);
      if (cached) {
        return cached;
      }

      const response = await publicClient.get("/api/promotions");
      const promotions = parse(response.data, promotionsSchema, "Invalid promotions response.");

      const now = Date.now();
      const activePromotions = promotions.filter((promotion) => {
        const startsAt = new Date(promotion.validFrom).getTime();
        const endsAt = new Date(promotion.validTo).getTime();
        return promotion.isActive && startsAt <= now && now <= endsAt;
      });

      cacheSet(CACHE_KEY.promotionsActive, activePromotions);
      return activePromotions;
    },

    async evaluatePromotions(
      productIds: string[],
      promotionIds: string[],
      userId: string,
    ): Promise<EvaluatePromotionResponse> {
      const response = await client.post("/api/promotions/evaluate", {
        productIds,
        promotionIds,
        userId,
      });

      return parse(
        response.data,
        evaluatePromotionResponseSchema,
        "Invalid promotion evaluation response.",
      );
    },

    async getUserProfile(): Promise<UserPromotionProfile> {
      const response = await client.get("/api/promotions/user-profile");
      return parse(response.data, userPromotionProfileSchema, "Invalid promotion profile response.");
    },
  };
};
