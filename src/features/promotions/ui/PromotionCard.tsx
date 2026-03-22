import { type Promotion } from "../model/promotion.types";

interface PromotionCardProps {
  promotion: Promotion;
  isApplied: boolean;
  canApply: boolean;
  onToggle: (promotionId: string) => void;
}

export const PromotionCard = ({ promotion, isApplied, canApply, onToggle }: PromotionCardProps) => {
  return (
    <article className="promotion-card" data-applied={isApplied}>
      <h4>{promotion.name}</h4>
      <p>{promotion.description}</p>
      <p>Discount: {promotion.discountPercentage}%</p>
      {promotion.type === "LoyaltyPoints" ? <p>Required points: {promotion.requiredPoints ?? 0}</p> : null}

      <button
        type="button"
        onClick={() => onToggle(promotion.id)}
        disabled={!canApply && !isApplied}
      >
        {isApplied ? "Remove" : "Apply"}
      </button>
    </article>
  );
};
