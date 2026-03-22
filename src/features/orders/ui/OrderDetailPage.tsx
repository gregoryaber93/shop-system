import { useParams } from "react-router-dom";

import { ErrorState } from "@/shared/ui/ErrorState";
import { useOrderPolling } from "../hooks/useOrderPolling";

const formatPrice = (value: number): string => `${value.toFixed(2)} USD`;

export const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading, error, refetch } = useOrderPolling(orderId ?? null, 2000);

  if (isLoading) {
    return <main><p>Loading order...</p></main>;
  }

  if (error) {
    return (
      <main>
        <ErrorState
          error={error}
          title="Order unavailable"
          onRetry={() => {
            void refetch();
          }}
        />
      </main>
    );
  }

  if (!order) {
    return <main><p>Order not found.</p></main>;
  }

  return (
    <main>
      <h1>Order details</h1>
      <p>Order ID: {order.id}</p>
      <p>Status: {order.status}</p>
      <p>Total: {formatPrice(order.totalPrice)}</p>
      <p>Discount: {formatPrice(order.discountApplied)}</p>
      <p>Loyalty points: {order.loyaltyPointsEarned}</p>

      <section aria-labelledby="order-items-title">
        <h2 id="order-items-title">Items</h2>
        {order.items.map((item) => (
          <article key={item.productId}>
            <p>{item.productName}</p>
            <p>{item.quantity} x {formatPrice(item.unitPrice)}</p>
            <p>Line total: {formatPrice(item.lineTotal)}</p>
          </article>
        ))}
      </section>
    </main>
  );
};
