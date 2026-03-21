---
applyTo: "src/**/*.{ts,tsx}"
---
# Promotions And Discounts Rules

Promotions are managed by PromotionService. On frontend you evaluate promotions before checkout, but final calculations are done by backend.

## Promotion Types

```typescript
type PromotionType = 'ProductDiscount' | 'LoyaltyPoints';

interface Promotion {
  id: string;
  type: PromotionType;
  name: string;
  description: string;
  discountPercentage: number; // 0-100
  requiredPoints?: number; // For LoyaltyPoints
  isActive: boolean;
  validFrom: string;
  validTo: string;
}

interface UserPromotionProfile {
  userId: string;
  totalPoints: number;
  earnedAt: string;
}

interface EvaluatePromotionRequest {
  productIds: string[];
  promotionIds: string[];
  userId: string;
}

interface EvaluatePromotionResponse {
  approved: boolean;
  appliedDiscounts: {
    productId: string;
    discountPercentage: number;
  }[];
  loyaltyPointsEarned: number;
  message: string;
}
```

## API Client For Promotions

```typescript
// src/features/promotions/api/promotionClient.ts

export const promotionApiClient = {
  getAllActive: async (): Promise<Promotion[]> => {
    const response = await axios.get(`${API_BASE}/api/promotions`);
    return response.data;
  },

  evaluatePromotions: async (
    productIds: string[],
    promotionIds: string[],
    userId: string,
    token: string
  ): Promise<EvaluatePromotionResponse> => {
    const response = await axios.post(
      `${API_BASE}/api/promotions/evaluate`,
      { productIds, promotionIds, userId },
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
    return response.data;
  },

  getUserProfile: async (token: string): Promise<UserPromotionProfile> => {
    const response = await axios.get(
      `${API_BASE}/api/promotions/user-profile`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
    return response.data;
  },
};
```

## Promotions In Cart

```typescript
// src/features/promotions/hooks/usePromotion.ts

import { useQuery, useMutation } from '@tanstack/react-query';
import { promotionApiClient } from '../api/promotionClient';
import { useAuth } from '@/features/auth/context/AuthContext';

export const useActivePromotions = () => {
  return useQuery({
    queryKey: ['promotions', 'active'],
    queryFn: () => promotionApiClient.getAllActive(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUserPromotionProfile = () => {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['promotions', 'user-profile'],
    queryFn: () => (token ? promotionApiClient.getUserProfile(token) : Promise.resolve(null)),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePromotion = () => {
  const { token, userId } = useAuth();

  const evaluatePromotions = async (productIds: string[], promotionIds: string[]) => {
    if (!token || !userId) throw new Error('Not authenticated');
    
    return promotionApiClient.evaluatePromotions(
      productIds,
      promotionIds,
      userId,
      token
    );
  };

  return { evaluatePromotions };
};
```

## Promotion Selector Component

```typescript
// src/features/promotions/ui/PromotionSelector.tsx

export function PromotionSelector() {
  const { data: activePromotions, isLoading } = useActivePromotions();
  const { cart, applyPromotion, removePromotion } = useCart();
  const { data: userProfile } = useUserPromotionProfile();

  if (isLoading) return <div>Loading promotions...</div>;

  return (
    <div className="promotions">
      <h3>Available Promotions</h3>
      {activePromotions?.map((promo) => {
        const isApplied = cart.appliedPromotions.includes(promo.id);
        
        // Check if user has enough points for LoyaltyPoints
        const canApply = 
          promo.type === 'ProductDiscount' ||
          (promo.type === 'LoyaltyPoints' && userProfile && userProfile.totalPoints >= (promo.requiredPoints || 0));

        return (
          <div key={promo.id} className="promotion-card">
            <h4>{promo.name}</h4>
            <p>{promo.description}</p>
            <p>Discount: {promo.discountPercentage}%</p>
            {promo.type === 'LoyaltyPoints' && (
              <p>Required Points: {promo.requiredPoints}</p>
            )}
            <button
              onClick={() =>
                isApplied ? removePromotion(promo.id) : applyPromotion(promo.id)
              }
              disabled={!canApply && !isApplied}
              className={isApplied ? 'active' : ''}
            >
              {isApplied ? 'Remove' : 'Apply'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

## Promotion Validation

- On frontend: validate if promotion is active (validFrom/validTo dates).
- On frontend: display if user has enough loyalty points.
- On backend: final discount calculation; frontend must accept backend decision.
- Never calculate discount on frontend for financial data; it must be on backend.

## Loyalty Points

- Loyalty points are earned after successful payment authorization.
- Frontend displays earned points in order confirmation.
- Points can be applied to LoyaltyPoints promotions only when `userProfile.totalPoints >= promo.requiredPoints`.
