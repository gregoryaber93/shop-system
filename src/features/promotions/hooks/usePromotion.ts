import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth";
import { dispatchUnauthorizedEvent } from "@/shared/lib/auth/authStorage";
import { createPromotionApiClient } from "../api/promotionClient";
import { type EvaluatePromotionResponse } from "../model/promotion.types";

export const useActivePromotions = () => {
  const apiClient = useMemo(
    () => createPromotionApiClient(() => null, () => undefined),
    [],
  );

  return useQuery({
    queryKey: ["promotions", "active"],
    queryFn: () => apiClient.getAllActive(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useUserPromotionProfile = () => {
  const { isLoggedIn, token } = useAuth();

  const apiClient = useMemo(
    () => createPromotionApiClient(() => token, dispatchUnauthorizedEvent),
    [token],
  );

  return useQuery({
    queryKey: ["promotions", "user-profile", token],
    queryFn: () => apiClient.getUserProfile(),
    enabled: isLoggedIn,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePromotion = () => {
  const { token, userId, isLoggedIn } = useAuth();

  const apiClient = useMemo(
    () => createPromotionApiClient(() => token, dispatchUnauthorizedEvent),
    [token],
  );

  const evaluatePromotions = async (
    productIds: string[],
    promotionIds: string[],
  ): Promise<EvaluatePromotionResponse> => {
    if (!isLoggedIn || !userId) {
      throw new Error("Not authenticated.");
    }

    return apiClient.evaluatePromotions(productIds, promotionIds, userId);
  };

  return { evaluatePromotions };
};
