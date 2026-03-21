export type PromotionType = "ProductDiscount" | "LoyaltyPoints";

export interface Promotion {
  id: string;
  type: PromotionType;
  name: string;
  description: string;
  discountPercentage: number;
  requiredPoints?: number;
  isActive: boolean;
  validFrom: string;
  validTo: string;
}

export interface UserPromotionProfile {
  userId: string;
  totalPoints: number;
  earnedAt: string;
}

export interface EvaluatePromotionRequest {
  productIds: string[];
  promotionIds: string[];
  userId: string;
}

export interface EvaluatePromotionResponse {
  approved: boolean;
  appliedDiscounts: {
    productId: string;
    discountPercentage: number;
  }[];
  loyaltyPointsEarned: number;
  message: string;
}
