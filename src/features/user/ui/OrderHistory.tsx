import { Link } from "react-router-dom";

import { type OrderHistoryItem } from "../model/user.types";

interface OrderHistoryProps {
  orderHistory: OrderHistoryItem[];
  isLoading: boolean;
}

const formatPrice = (value: number): string => `${value.toFixed(2)} USD`;

export const OrderHistory = ({ orderHistory, isLoading }: OrderHistoryProps) => {
  if (isLoading) {
    return <section><h2>Order history</h2><p>Loading orders...</p></section>;
  }

  if (orderHistory.length === 0) {
    return (
      <section>
        <h2>Order history</h2>
        <p>You have no orders yet.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="order-history-title">
      <h2 id="order-history-title">Order history</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Total</th>
            <th>Items</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orderHistory.map((order) => (
            <tr key={order.id}>
              <td>{order.id.slice(0, 8)}...</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>{formatPrice(order.totalPrice)}</td>
              <td>{order.itemCount}</td>
              <td>{order.status}</td>
              <td>
                <Link to={`/orders/${order.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
