import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/features/auth";
import { useCart } from "@/features/cart";
import { dispatchUnauthorizedEvent } from "@/shared/lib/auth/authStorage";
import { generateIdempotencyKey } from "@/shared/lib/idempotency/idempotency";
import { withRetry } from "@/shared/lib/retry/withRetry";
import { createOrderApiClient } from "../api/orderClient";

const formatPrice = (value: number): string => `${value.toFixed(2)} USD`;

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, token } = useAuth();
  const { cart, clearCart } = useCart();

  const apiClient = useMemo(
    () => createOrderApiClient(() => token, dispatchUnauthorizedEvent),
    [token],
  );

  const idempotencyKeyRef = useRef(generateIdempotencyKey());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const placeOrder = async () => {
    if (!isLoggedIn) {
      navigate("/login", { replace: true });
      return;
    }

    if (cart.items.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setRetryAttempt(null);

    try {
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
      const message = error instanceof Error ? error.message : "Failed to place order.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <h1>Checkout</h1>
      <p>Review your order and place it safely with idempotency protection.</p>

      {cart.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <section aria-labelledby="checkout-items-title">
          <h2 id="checkout-items-title">Items</h2>
          {cart.items.map((item) => (
            <article key={item.productId}>
              <p>{item.productName}</p>
              <p>{item.quantity} x {formatPrice(item.price)}</p>
            </article>
          ))}
          <p>Total: {formatPrice(cart.totalPrice)}</p>
        </section>
      )}

      {retryAttempt ? <p>Retrying... (attempt {retryAttempt}/3)</p> : null}
      {errorMessage ? <p role="alert">{errorMessage}</p> : null}

      <button type="button" onClick={placeOrder} disabled={isSubmitting || cart.items.length === 0}>
        {isSubmitting ? "Processing..." : "Place order"}
      </button>
    </main>
  );
};
