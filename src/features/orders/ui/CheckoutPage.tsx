import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/features/auth";
import { useCart } from "@/features/cart";
import { usePromotion } from "@/features/promotions/hooks/usePromotion";
import { type EvaluatePromotionResponse } from "@/features/promotions/model/promotion.types";
import { PromotionSelector } from "@/features/promotions/ui/PromotionSelector";
import { dispatchUnauthorizedEvent } from "@/shared/lib/auth/authStorage";
import { generateIdempotencyKey } from "@/shared/lib/idempotency/idempotency";
import { withRetry } from "@/shared/lib/retry/withRetry";
import { ErrorState } from "@/shared/ui/ErrorState";
import { createOrderApiClient } from "../api/orderClient";

const formatPrice = (value: number): string => `${value.toFixed(2)} USD`;

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, token } = useAuth();
  const { cart, clearCart } = useCart();
  const { evaluatePromotions } = usePromotion();

  const apiClient = useMemo(
    () => createOrderApiClient(() => token, dispatchUnauthorizedEvent),
    [token],
  );

  const idempotencyKeyRef = useRef(generateIdempotencyKey());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState<number | null>(null);
  const [submissionError, setSubmissionError] = useState<unknown>(null);
  const [evaluation, setEvaluation] = useState<EvaluatePromotionResponse | null>(null);

  const placeOrder = async () => {
    if (!isLoggedIn) {
      navigate("/login", { replace: true });
      return;
    }

    if (cart.items.length === 0) {
      setSubmissionError(new Error("Your cart is empty."));
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);
    setRetryAttempt(null);

    try {
      let evaluationResult: EvaluatePromotionResponse | null = null;

      if (cart.appliedPromotions.length > 0) {
        evaluationResult = await evaluatePromotions(
          cart.items.map((item) => item.productId),
          cart.appliedPromotions,
        );

        if (!evaluationResult.approved) {
          throw new Error(evaluationResult.message || "Promotions were rejected.");
        }
      }

      setEvaluation(evaluationResult);

      const order = await withRetry(
        () =>
          apiClient.placeOrder({
            items: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
            appliedPromotionIds: cart.appliedPromotions,
            idempotencyKey: idempotencyKeyRef.current,
          }),
        {
          maxRetries: 3,
          baseDelayMs: 300,
          onRetry: (attempt) => {
            setRetryAttempt(attempt);
          },
        },
      );

      clearCart();
      navigate(`/orders/${order.id}`);
    } catch (error) {
      setSubmissionError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="checkout-page">
      <h1>Checkout</h1>
      <p>Review your order and place it safely with idempotency protection.</p>

      {cart.items.length === 0 ? (
        <section className="empty-state"><p>Your cart is empty.</p></section>
      ) : (
        <section className="checkout-items" aria-labelledby="checkout-items-title">
          <h2 id="checkout-items-title">Items</h2>
          <div className="checkout-item-grid">
          {cart.items.map((item) => (
            <article key={item.productId}>
              <p>{item.productName}</p>
              <p>{item.quantity} x {formatPrice(item.price)}</p>
            </article>
          ))}
          </div>
          <p>Total: {formatPrice(cart.totalPrice)}</p>
          <p>Applied promotions: {cart.appliedPromotions.length}</p>
        </section>
      )}

      <PromotionSelector />

      {evaluation ? (
        <section className="promotion-evaluation" aria-labelledby="promotion-evaluation-title">
          <h2 id="promotion-evaluation-title">Promotion evaluation</h2>
          <p>{evaluation.message}</p>
          <p>Loyalty points earned: {evaluation.loyaltyPointsEarned}</p>
          {evaluation.appliedDiscounts.length > 0 ? (
            <ul>
              {evaluation.appliedDiscounts.map((discount) => (
                <li key={discount.productId}>
                  Product {discount.productId}: {discount.discountPercentage}% discount
                </li>
              ))}
            </ul>
          ) : (
            <p>No discounts applied.</p>
          )}
        </section>
      ) : null}

      {retryAttempt ? <p>Retrying... (attempt {retryAttempt}/3)</p> : null}
      {submissionError ? (
        <ErrorState
          error={submissionError}
          title="Checkout failed"
          onRetry={() => {
            void placeOrder();
          }}
        />
      ) : null}

      <button className="primary-action" type="button" onClick={placeOrder} disabled={isSubmitting || cart.items.length === 0}>
        {isSubmitting ? "Processing..." : "Place order"}
      </button>
    </main>
  );
};
