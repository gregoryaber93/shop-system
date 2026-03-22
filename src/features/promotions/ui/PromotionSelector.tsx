import { useCart } from "@/features/cart";

import { useActivePromotions, useUserPromotionProfile } from "../hooks/usePromotion";
import { PromotionCard } from "./PromotionCard";

export const PromotionSelector = () => {
  const { cart, applyPromotion, removePromotion } = useCart();
  const { data: activePromotions = [], isLoading, error, refetch } = useActivePromotions();
  const { data: userProfile } = useUserPromotionProfile();

  const onToggle = (promotionId: string) => {
    if (cart.appliedPromotions.includes(promotionId)) {
      removePromotion(promotionId);
      return;
    }

    applyPromotion(promotionId);
  };

  if (isLoading) {
    return <section className="promotion-selector"><h3>Promotions</h3><p>Loading promotions...</p></section>;
  }

  if (error) {
    return (
      <section className="promotion-selector">
        <h3>Promotions</h3>
        <p role="alert">Failed to load promotions.</p>
        <button type="button" onClick={() => void refetch()}>Retry</button>
      </section>
    );
  }

  if (activePromotions.length === 0) {
    return <section className="promotion-selector"><h3>Promotions</h3><p>No promotions available right now.</p></section>;
  }

  return (
    <section className="promotion-selector" aria-labelledby="promotions-title">
      <h3 id="promotions-title">Available promotions</h3>
      <div className="promotion-grid">
        {activePromotions.map((promotion) => {
        const isApplied = cart.appliedPromotions.includes(promotion.id);
        const canApply =
          promotion.type === "ProductDiscount"
          || (userProfile?.totalPoints ?? 0) >= (promotion.requiredPoints ?? 0);

        return (
          <PromotionCard
            key={promotion.id}
            promotion={promotion}
            isApplied={isApplied}
            canApply={canApply}
            onToggle={onToggle}
          />
        );
      })}
      </div>
    </section>
  );
};
